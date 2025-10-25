<template>
  <div class="pdf-viewer">
    <!-- PDF 工具栏 -->
    <div class="pdf-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-icon">
          <Icon icon="mdi:file-pdf-box" />
        </span>
        <div class="toolbar-title">
          <h2 class="doc-title" :title="docTitle">{{ docTitle }}</h2>
          <span class="doc-status">PDF 文档</span>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- 翻页控制 -->
        <div class="control-group">
          <button 
            class="btn-icon" 
            @click="prevPage" 
            :disabled="isFirstPage || rendering" 
            title="上一页"
          >
            <Icon icon="mdi:chevron-left" />
          </button>
          <span class="page-info">
            <input
              v-model.number="pageInput"
              type="number"
              min="1"
              :max="totalPages"
              @keydown.enter="goToPage"
              @blur="resetPageInput"
              class="page-input"
              :disabled="rendering"
            />
            <span class="page-separator">/</span>
            <span class="page-total">{{ totalPages }}</span>
          </span>
          <button 
            class="btn-icon" 
            @click="nextPage" 
            :disabled="isLastPage || rendering" 
            title="下一页"
          >
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>

        <!-- 缩放控制 -->
        <div class="control-group">
          <button 
            class="btn-icon" 
            @click="zoomOut" 
            :disabled="!canZoomOut || rendering" 
            title="缩小"
          >
            <Icon icon="mdi:minus" />
          </button>
          <span class="zoom-info">{{ scalePercent }}%</span>
          <button 
            class="btn-icon" 
            @click="zoomIn" 
            :disabled="!canZoomIn || rendering" 
            title="放大"
          >
            <Icon icon="mdi:plus" />
          </button>
        </div>

        <!-- 下载按钮 -->
        <button class="btn-download" @click="downloadPdf" title="下载 PDF">
          <Icon icon="mdi:download" />
          <span>下载</span>
        </button>
      </div>
    </div>

    <!-- PDF 内容区 -->
    <div class="pdf-content" ref="pdfContainer">
      <div v-if="loading" class="pdf-loading">
        <Icon icon="mdi:loading" class="spin" />
        <span>加载中...</span>
      </div>

      <div v-else-if="error" class="pdf-error">
        <Icon icon="mdi:alert-circle" />
        <span>{{ error }}</span>
      </div>

      <canvas v-show="!loading && !error" ref="pdfCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';
import * as pdfjsLib from 'pdfjs-dist';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';

// PDF 配置常量
const PDF_CONFIG = {
  WORKER_SRC: `${import.meta.env.BASE_URL}pdfjs/build/pdf.worker.mjs`,
  SCALE: {
    DEFAULT: 1.5,
    MIN: 0.5,
    MAX: 3,
    STEP: 0.25,
  },
};

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.WORKER_SRC;

const docStore = useDocStore();
const uiStore = useUiStore();

// DOM 引用
const pdfContainer = ref(null);
const pdfCanvas = ref(null);

// 状态
const loading = ref(true);
const error = ref(null);
const rendering = ref(false);

// PDF 文档状态
let pdfDoc = null;
let renderTask = null;
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(PDF_CONFIG.SCALE.DEFAULT);
const pageInput = ref(1);

// 计算属性
const docTitle = computed(() => docStore.docTitle);
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);
const canZoomIn = computed(() => scale.value < PDF_CONFIG.SCALE.MAX);
const canZoomOut = computed(() => scale.value > PDF_CONFIG.SCALE.MIN);
const scalePercent = computed(() => Math.round(scale.value * 100));

const pdfUrl = computed(() => {
  // 使用新的 filePath 字段
  if (docStore.currentDoc?.filePath) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const filePath = docStore.currentDoc.filePath;
    return filePath.startsWith('http') ? filePath : `${baseURL}${filePath}`;
  }
  return null;
});

// 加载 PDF
async function loadPdf() {
  if (!pdfUrl.value) {
    error.value = 'PDF 文件地址无效';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    // 取消之前的渲染任务
    if (renderTask) {
      renderTask.cancel();
      renderTask = null;
    }

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl.value,
      httpHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    currentPage.value = 1;
    pageInput.value = 1;

    await renderPage(1);
  } catch (err) {
    console.error('Failed to load PDF:', err);
    error.value = '加载 PDF 失败';
  } finally {
    loading.value = false;
  }
}

// 渲染页面
async function renderPage(pageNum) {
  if (!pdfDoc) return;

  try {
    // 取消之前的渲染任务
    if (renderTask) {
      renderTask.cancel();
      renderTask = null;
    }

    rendering.value = true;

    const page = await pdfDoc.getPage(pageNum);
    const canvas = pdfCanvas.value;
    const context = canvas.getContext('2d');

    const viewport = page.getViewport({ scale: scale.value });
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
    };

    // 保存当前渲染任务的引用
    renderTask = page.render(renderContext);
    await renderTask.promise;
    renderTask = null;

    currentPage.value = pageNum;
    pageInput.value = pageNum;
  } catch (err) {
    // 忽略取消操作的错误
    if (err.name === 'RenderingCancelledException') {
      console.log('Rendering was cancelled');
      return;
    }
    console.error('Failed to render page:', err);
    uiStore.showError('渲染页面失败');
  } finally {
    rendering.value = false;
  }
}

// 翻页控制
const prevPage = () => !isFirstPage.value && renderPage(currentPage.value - 1);
const nextPage = () => !isLastPage.value && renderPage(currentPage.value + 1);

function goToPage() {
  const page = pageInput.value;
  const isValidPage = page >= 1 && page <= totalPages.value;
  
  if (isValidPage) {
    renderPage(page);
  } else {
    resetPageInput();
  }
}

const resetPageInput = () => {
  pageInput.value = currentPage.value;
};

// 缩放控制
function zoomIn() {
  if (canZoomIn.value) {
    scale.value = Math.min(scale.value + PDF_CONFIG.SCALE.STEP, PDF_CONFIG.SCALE.MAX);
    renderPage(currentPage.value);
  }
}

function zoomOut() {
  if (canZoomOut.value) {
    scale.value = Math.max(scale.value - PDF_CONFIG.SCALE.STEP, PDF_CONFIG.SCALE.MIN);
    renderPage(currentPage.value);
  }
}

// 下载 PDF
const downloadPdf = () => pdfUrl.value && window.open(pdfUrl.value, '_blank');

// 监听文档变化，自动加载 PDF
watch(
  () => docStore.currentDoc,
  (newDoc) => newDoc?.type === 'pdf' && loadPdf(),
  { immediate: true }
);
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-secondary);
}

/* 工具栏样式 */
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(247, 249, 255, 0.98), rgba(233, 239, 255, 0.95));
  border-bottom: 1px solid rgba(220, 230, 255, 0.7);
  box-shadow: 0 2px 8px rgba(18, 28, 88, 0.1);
  backdrop-filter: blur(18px);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  flex-shrink: 0;
  gap: 12px;
}

.toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 93, 93, 0.22), rgba(255, 136, 28, 0.18));
  color: #842632;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.toolbar-icon :deep(svg) {
  font-size: 20px;
}

.toolbar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.doc-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2664;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(31, 39, 102, 0.65);
}

.control-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(196, 206, 255, 0.5);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #4a5578;
  background-color: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 18px;
  cursor: pointer;
}

.btn-icon:hover:not(:disabled) {
  background-color: rgba(116, 137, 255, 0.15);
  color: #1f2a72;
  border-color: rgba(116, 137, 255, 0.3);
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info,
.zoom-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2a72;
  user-select: none;
}

.page-input {
  width: 45px;
  padding: 4px 6px;
  text-align: center;
  border: 1px solid rgba(196, 206, 255, 0.6);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #1f2a72;
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.2s ease;
}

.page-input:focus {
  outline: none;
  border-color: rgba(108, 126, 255, 0.8);
  background-color: #fff;
}

.page-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-separator {
  color: rgba(31, 39, 102, 0.45);
  font-weight: 400;
}

.page-total {
  min-width: 24px;
}

.zoom-info {
  min-width: 52px;
  justify-content: center;
}

/* 下载按钮使用 btn-action 基础样式 */
.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 14px;
  border: 1px solid rgba(196, 206, 255, 0.78);
  background: rgba(255, 255, 255, 0.92);
  color: #1f2a72;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.btn-download :deep(svg) {
  font-size: 18px;
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px -24px rgba(27, 43, 120, 0.55);
  border-color: rgba(116, 137, 255, 0.6);
}

.pdf-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: var(--spacing-lg);
}

.pdf-loading,
.pdf-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
}

.pdf-loading .spin {
  animation: spin 1s linear infinite;
  font-size: 48px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pdf-error {
  color: var(--color-error);
}

canvas {
  box-shadow: var(--shadow-lg);
  background-color: white;
}
</style>


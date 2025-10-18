<template>
  <div class="pdf-viewer">
    <div class="pdf-toolbar">
      <div class="toolbar-group">
        <button class="btn-icon" @click="prevPage" :disabled="currentPage <= 1">
          <Icon icon="mdi:chevron-left" />
        </button>
        <span class="page-info">
          <input
            v-model.number="pageInput"
            type="number"
            min="1"
            :max="totalPages"
            @keydown.enter="goToPage"
            class="page-input"
          />
          / {{ totalPages }}
        </span>
        <button class="btn-icon" @click="nextPage" :disabled="currentPage >= totalPages">
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>

      <div class="toolbar-group">
        <button class="btn-icon" @click="zoomOut" :disabled="scale <= 0.5">
          <Icon icon="mdi:minus" />
        </button>
        <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
        <button class="btn-icon" @click="zoomIn" :disabled="scale >= 3">
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div class="toolbar-group">
        <button class="btn-icon" @click="downloadPdf" title="下载">
          <Icon icon="mdi:download" />
        </button>
      </div>
    </div>

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
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import * as pdfjsLib from 'pdfjs-dist';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const docStore = useDocStore();
const uiStore = useUiStore();

const pdfContainer = ref(null);
const pdfCanvas = ref(null);

const loading = ref(true);
const error = ref(null);
const pdfDoc = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.5);
const pageInput = ref(1);

const pdfUrl = computed(() => {
  // 假设后端返回的 PDF 文档包含 fileId 或 downloadUrl
  if (docStore.currentDoc?.fileId) {
    return `/api/files/${docStore.currentDoc.fileId}/download`;
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

    const loadingTask = pdfjsLib.getDocument(pdfUrl.value);
    pdfDoc.value = await loadingTask.promise;
    totalPages.value = pdfDoc.value.numPages;
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
  if (!pdfDoc.value) return;

  try {
    const page = await pdfDoc.value.getPage(pageNum);
    const canvas = pdfCanvas.value;
    const context = canvas.getContext('2d');

    const viewport = page.getViewport({ scale: scale.value });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    currentPage.value = pageNum;
    pageInput.value = pageNum;
  } catch (err) {
    console.error('Failed to render page:', err);
    uiStore.showError('渲染页面失败');
  }
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    renderPage(currentPage.value - 1);
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    renderPage(currentPage.value + 1);
  }
}

// 跳转到指定页
function goToPage() {
  const page = pageInput.value;
  if (page >= 1 && page <= totalPages.value) {
    renderPage(page);
  } else {
    pageInput.value = currentPage.value;
  }
}

// 放大
function zoomIn() {
  if (scale.value < 3) {
    scale.value += 0.25;
    renderPage(currentPage.value);
  }
}

// 缩小
function zoomOut() {
  if (scale.value > 0.5) {
    scale.value -= 0.25;
    renderPage(currentPage.value);
  }
}

// 下载 PDF
function downloadPdf() {
  if (pdfUrl.value) {
    window.open(pdfUrl.value, '_blank');
  }
}

// 监听文档变化
watch(
  () => docStore.currentDoc,
  (newDoc) => {
    if (newDoc && newDoc.type === 'pdf') {
      loadPdf();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (docStore.currentDoc?.type === 'pdf') {
    loadPdf();
  }
});
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-secondary);
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
  font-size: 18px;
}

.btn-icon:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info,
.zoom-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.page-input {
  width: 50px;
  padding: var(--spacing-xs);
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.page-input:focus {
  outline: none;
  border-color: var(--color-primary);
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


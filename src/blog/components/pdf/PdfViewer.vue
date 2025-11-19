<template>
  <div class="pdf-viewer">
    <!-- 工具栏 -->
    <PdfToolbar
      :doc-title="docTitle"
      :view-mode="viewMode"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-input="pageInput"
      :scale="scale"
      :is-mobile="isMobile"
      :rendering="rendering"
      :scale-min="PDF_CONFIG.SCALE.MIN"
      :scale-max="PDF_CONFIG.SCALE.MAX"
      @switch-mode="switchViewMode"
      @prev-page="prevPage"
      @next-page="nextPage"
      @go-to-page="goToPage"
      @reset-page-input="resetPageInput"
      @update:page-input="pageInput = $event"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
    />

    <!-- PDF 内容区 -->
    <div class="pdf-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="pdf-loading">
        <Icon icon="mdi:loading" class="spin" />
        <span>加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="pdf-error">
        <Icon icon="mdi:alert-circle" />
        <span>{{ error }}</span>
      </div>

      <!-- 分页模式 -->
      <PagedPdfViewer
        v-if="!loading && !error && viewMode === 'paged'"
        :pdf-doc="pdfDoc"
        :current-page="currentPage"
        :scale="scale"
        @page-rendered="onPageRendered"
        @render-error="onRenderError"
        @update:rendering="rendering = $event"
      />

      <!-- 滚动模式 -->
      <ScrollPdfViewer
        v-if="!loading && !error && viewMode === 'scroll'"
        :pdf-doc="pdfDoc"
        :scale="scale"
        :is-mobile="isMobile"
        :scale-min="PDF_CONFIG.SCALE.MIN"
        :scale-max="PDF_CONFIG.SCALE.MAX"
        @current-page-change="currentPage = $event"
        @render-error="onRenderError"
        @update:scale="scale = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import * as pdfjsLib from 'pdfjs-dist';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';
import { useResponsive } from '@/composables';
import { getAccessToken } from '@/api/request';
import { cleanupMeasureContainer } from './utils/pdfRenderHelpers';
import PdfToolbar from './PdfToolbar.vue';
import PagedPdfViewer from './PagedPdfViewer.vue';
import ScrollPdfViewer from './ScrollPdfViewer.vue';

// ==================== 配置 ====================
const PDF_CONFIG = {
  WORKER_SRC: `${window.location.origin}/pdfjs/build/pdf.worker.mjs`,
  SCALE: {
    DEFAULT: 1.5,
    MIN: 0.5,
    MAX: 3,
    STEP: 0.25,
  },
};

pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.WORKER_SRC;

// ==================== Store & Composables ====================
const docStore = useDocStore();
const uiStore = useUiStore();
const { isMobile } = useResponsive();

// ==================== 状态管理 ====================
const loading = ref(true);
const error = ref(null);
const rendering = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(PDF_CONFIG.SCALE.DEFAULT);
const pageInput = ref(1);
const viewMode = ref('paged');

// PDF 文档实例
const pdfDoc = shallowRef(null);

// ==================== 计算属性 ====================
const docTitle = computed(() => docStore.docTitle);
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);
const canZoomIn = computed(() => scale.value < PDF_CONFIG.SCALE.MAX);
const canZoomOut = computed(() => scale.value > PDF_CONFIG.SCALE.MIN);

const pdfUrl = computed(() => {
  const filePath = docStore.currentDoc?.filePath;
  if (!filePath) return null;
  
  if (filePath.startsWith('http')) return filePath;
  
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseURL}${filePath}`;
});

// ==================== 模式切换 ====================
/**
 * 切换预览模式
 */
async function switchViewMode(mode) {
  if (viewMode.value === mode) return;
  
  viewMode.value = mode;
  
  // 等待 DOM 更新
  await nextTick();
}

// ==================== PDF 加载 ====================
/**
 * 加载 PDF 文档
 */
async function loadPdf() {
  if (!pdfUrl.value) {
    error.value = 'PDF 文件地址无效';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    
    // 清理旧的 PDF 资源
    if (pdfDoc.value?.destroy) {
      await pdfDoc.value.destroy();
      pdfDoc.value = null;
    } else {
      pdfDoc.value = null;
    }

    const accessToken = getAccessToken();
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl.value,
      httpHeaders: accessToken ? {
        'Authorization': `Bearer ${accessToken}`,
      } : {},
    });
    
    pdfDoc.value = await loadingTask.promise;
    totalPages.value = pdfDoc.value.numPages;
    currentPage.value = 1;
    pageInput.value = 1;
    
    // 重置或设置预览模式
    if (isMobile.value) {
      viewMode.value = 'scroll';
    } else {
      viewMode.value = 'paged';
    }
    
    // PDF 加载完成，设置 loading 为 false 以显示 DOM
    loading.value = false;
    
    // 等待 DOM 更新
    await nextTick();
  } catch (err) {
    console.error('Failed to load PDF:', err);
    error.value = err.name === 'MissingPDFException' 
      ? 'PDF 文件不存在' 
      : '加载 PDF 失败，请稍后重试';
    loading.value = false;
  }
}

// ==================== 交互控制 ====================
/**
 * 上一页
 */
function prevPage() {
  if (!isFirstPage.value) {
    currentPage.value--;
    pageInput.value = currentPage.value;
  }
}

/**
 * 下一页
 */
function nextPage() {
  if (!isLastPage.value) {
    currentPage.value++;
    pageInput.value = currentPage.value;
  }
}

/**
 * 跳转到指定页
 */
function goToPage() {
  const page = pageInput.value;
  const isValid = Number.isInteger(page) && page >= 1 && page <= totalPages.value;
  
  if (isValid) {
    currentPage.value = page;
  } else {
    resetPageInput();
  }
}

/**
 * 重置页码输入框
 */
function resetPageInput() {
  pageInput.value = currentPage.value;
}

/**
 * 放大
 */
function zoomIn() {
  if (!canZoomIn.value) return;
  scale.value = Math.min(scale.value + PDF_CONFIG.SCALE.STEP, PDF_CONFIG.SCALE.MAX);
}

/**
 * 缩小
 */
function zoomOut() {
  if (!canZoomOut.value) return;
  scale.value = Math.max(scale.value - PDF_CONFIG.SCALE.STEP, PDF_CONFIG.SCALE.MIN);
}


// ==================== 事件处理 ====================
function onPageRendered(pageNum) {
  console.log(`Page ${pageNum} rendered`);
}

function onRenderError(err) {
  uiStore.showError('渲染页面失败');
}

// ==================== 生命周期 ====================
/**
 * 清理资源
 */
async function cleanup() {
  if (pdfDoc.value?.destroy) {
    await pdfDoc.value.destroy();
    pdfDoc.value = null;
  } else {
    pdfDoc.value = null;
  }
  
  cleanupMeasureContainer();
}

// 监听文档变化
watch(
  () => docStore.currentDoc,
  (newDoc) => {
    if (newDoc?.type === 'pdf') {
      loadPdf();
    }
  },
  { immediate: true }
);

// 组件卸载时清理
onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-secondary);
  position: relative;
}

.pdf-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.pdf-loading,
.pdf-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  flex: 1;
  width: 100%;
  justify-content: center;
  padding: var(--spacing-lg);
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
</style>


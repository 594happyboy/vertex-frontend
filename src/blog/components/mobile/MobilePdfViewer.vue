<template>
  <div class="mobile-pdf-viewer">
    <!-- 顶部头部 -->
    <div class="mobile-viewer-header">
      <button class="header-btn" @click="handleBack">
        <Icon icon="mdi:arrow-left" />
      </button>

      <div class="header-title-area">
        <h1 class="header-title">{{ title }}</h1>
        <span class="page-info">{{ pageInfoText }}</span>
      </div>

      <button class="header-btn" @click="downloadPdf" title="下载">
        <Icon icon="mdi:download" />
      </button>
    </div>

    <!-- PDF 内容区 -->
    <div class="pdf-content">
      <div v-if="loading" class="pdf-status">
        <Icon icon="mdi:loading" class="spin" />
        <span>加载中...</span>
      </div>

      <div v-else-if="error" class="pdf-status error">
        <Icon icon="mdi:alert-circle" />
        <span>{{ error }}</span>
      </div>

      <ScrollPdfViewer
        v-else
        :pdf-doc="pdfDoc"
        :scale="scale"
        :is-mobile="true"
        :scale-min="SCALE_CONFIG.MIN"
        :scale-max="SCALE_CONFIG.MAX"
        @current-page-change="currentPage = $event"
        @render-error="onRenderError"
        @update:scale="scale = $event"
      />
    </div>

    <!-- 缩放提示浮窗 -->
    <Transition name="zoom-indicator">
      <div v-if="showZoomIndicator" class="zoom-indicator">
        {{ zoomPercent }}%
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import * as pdfjsLib from 'pdfjs-dist';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';
import { getAccessToken } from '@/api/request';
import { cleanupMeasureContainer } from '../pdf/utils/pdfRenderHelpers';
import ScrollPdfViewer from '../pdf/ScrollPdfViewer.vue';

// ==================== 配置 ====================
const SCALE_CONFIG = {
  DEFAULT: 1.5,
  MIN: 0.5,
  MAX: 3,
  STEP: 0.25,
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdfjs/build/pdf.worker.mjs`;

// ==================== 初始化 ====================
const router = useRouter();
const docStore = useDocStore();
const uiStore = useUiStore();

// ==================== 响应式状态 ====================
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(SCALE_CONFIG.DEFAULT);
const pageInput = ref(1);
const pdfDoc = shallowRef(null);
const showZoomIndicator = ref(false);

// 缩放提示定时器
let zoomIndicatorTimer = null;

// ==================== 计算属性 ====================
const title = computed(() => docStore.currentDoc?.title || '未命名文档');
const pageInfoText = computed(() => 
  totalPages.value > 0 ? `${currentPage.value} / ${totalPages.value}` : '加载中...'
);
const zoomPercent = computed(() => Math.round(scale.value * 100));

const pdfUrl = computed(() => {
  const filePath = docStore.currentDoc?.filePath;
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseURL}${filePath}`;
});

// ==================== PDF 加载 ====================
async function loadPdf() {
  if (!pdfUrl.value) {
    error.value = 'PDF 文件地址无效';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    
    await cleanup();

    const accessToken = getAccessToken();
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl.value,
      httpHeaders: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
    });
    
    pdfDoc.value = await loadingTask.promise;
    totalPages.value = pdfDoc.value.numPages;
    currentPage.value = 1;
    pageInput.value = 1;
    loading.value = false;
    
    await nextTick();
  } catch (err) {
    console.error('Failed to load PDF:', err);
    error.value = err.name === 'MissingPDFException' ? 'PDF 文件不存在' : '加载 PDF 失败，请稍后重试';
    loading.value = false;
  }
}

// ==================== 导航操作 ====================
const handleBack = () => router.push('/me');

// ==================== 其他操作 ====================
const downloadPdf = () => pdfUrl.value && window.open(pdfUrl.value, '_blank');

const onRenderError = () => uiStore.showError('渲染页面失败');

const cleanup = async () => {
  if (pdfDoc.value?.destroy) {
    await pdfDoc.value.destroy();
  }
  pdfDoc.value = null;
  cleanupMeasureContainer();
};

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

// 监听缩放变化，显示缩放提示
watch(
  () => scale.value,
  () => {
    // 清除之前的定时器
    if (zoomIndicatorTimer) {
      clearTimeout(zoomIndicatorTimer);
    }
    
    // 显示缩放提示
    showZoomIndicator.value = true;
    
    // 1.5秒后自动隐藏
    zoomIndicatorTimer = setTimeout(() => {
      showZoomIndicator.value = false;
      zoomIndicatorTimer = null;
    }, 1500);
  }
);

// 组件卸载时清理
onBeforeUnmount(() => {
  if (zoomIndicatorTimer) {
    clearTimeout(zoomIndicatorTimer);
    zoomIndicatorTimer = null;
  }
  cleanup();
});
</script>

<style scoped>
.mobile-pdf-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  z-index: 100;
  overflow: hidden;
}

/* ========== 头部样式 ========== */
.mobile-viewer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  padding-top: calc(8px + env(safe-area-inset-top));
  background: linear-gradient(140deg, rgba(58, 84, 245, 0.96), rgba(21, 37, 117, 0.88));
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 26, 128, 0.2);
  flex-shrink: 0;
  z-index: 10;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.header-btn:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.header-btn :deep(svg) {
  font-size: 22px;
}

.header-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* ========== 内容区域样式 ========== */
.pdf-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.pdf-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  height: 100%;
  color: var(--color-text-secondary);
}

.pdf-status.error {
  color: var(--color-error);
}

.pdf-status .spin {
  animation: spin 1s linear infinite;
  font-size: 48px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== 缩放提示浮窗样式 ========== */
.zoom-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 32px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 缩放提示浮窗过渡动画 */
.zoom-indicator-enter-active {
  transition: all 0.2s ease;
}

.zoom-indicator-leave-active {
  transition: all 0.3s ease;
}

.zoom-indicator-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.zoom-indicator-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}
</style>


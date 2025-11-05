<template>
  <div 
    class="scroll-pdf-viewer"
    :class="{ 'mobile-mode': isMobile }"
    ref="container"
    @scroll="onScroll"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="pdf-scroll-container" ref="scrollContainer">
      <div
        v-for="pageNum in totalPages"
        :key="pageNum"
        class="pdf-page-item"
        :data-page="pageNum"
      >
        <div 
          v-if="visiblePages.has(pageNum)"
          class="pdf-page-wrapper"
        >
          <canvas :ref="el => setPageCanvas(el, pageNum)"></canvas>
          <div :ref="el => setPageTextLayer(el, pageNum)" class="textLayer"></div>
          <div :ref="el => setPageAnnotationLayer(el, pageNum)" class="annotationLayer"></div>
        </div>
        <div v-else class="pdf-page-placeholder" :style="{ height: pageHeights[pageNum - 1] + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { renderPage } from './composables/usePdfRenderer';

const props = defineProps({
  pdfDoc: {
    type: Object,
    default: null,
  },
  scale: {
    type: Number,
    default: 1.5,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  scaleMin: {
    type: Number,
    default: 0.5,
  },
  scaleMax: {
    type: Number,
    default: 3,
  },
});

const emit = defineEmits(['current-page-change', 'render-error', 'update:scale']);

// DOM 引用
const container = ref(null);
const scrollContainer = ref(null);

// 状态
const visiblePages = ref(new Set());
const pageHeights = ref([]);
const totalPages = ref(0);

// 多页 DOM 引用
const pageCanvasRefs = new Map();
const pageTextLayerRefs = new Map();
const pageAnnotationLayerRefs = new Map();
const canvasContexts = new Map();
const renderTasks = new Map();

// 触摸缩放状态
const touchState = ref({
  isZooming: false,
  initialDistance: 0,
  initialScale: 1,
});

// 定时器
let scrollTimer = null;
let renderTimer = null;

// DOM 引用设置函数
const setPageCanvas = (el, pageNum) => {
  if (el) pageCanvasRefs.set(pageNum, el);
  else pageCanvasRefs.delete(pageNum);
};
const setPageTextLayer = (el, pageNum) => {
  if (el) pageTextLayerRefs.set(pageNum, el);
  else pageTextLayerRefs.delete(pageNum);
};
const setPageAnnotationLayer = (el, pageNum) => {
  if (el) pageAnnotationLayerRefs.set(pageNum, el);
  else pageAnnotationLayerRefs.delete(pageNum);
};

/**
 * 初始化滚动模式
 */
async function init() {
  if (!props.pdfDoc) return;
  
  totalPages.value = props.pdfDoc.numPages;
  
  // 计算所有页面高度
  pageHeights.value = [];
  for (let i = 1; i <= totalPages.value; i++) {
    const page = await props.pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: props.scale });
    pageHeights.value.push(viewport.height);
  }
  
  await nextTick();
  updateVisiblePages();
}

/**
 * 计算当前可见的页面范围
 */
function calculateVisiblePages() {
  if (!container.value) return [];
  
  const scrollTop = container.value.scrollTop;
  const containerHeight = container.value.clientHeight;
  const scrollBottom = scrollTop + containerHeight;
  
  const visible = [];
  let currentTop = 0;
  
  for (let i = 0; i < totalPages.value; i++) {
    const pageHeight = pageHeights.value[i] || 0;
    const pageBottom = currentTop + pageHeight + 20;
    
    // 包括预加载缓冲区
    const buffer = containerHeight;
    if (pageBottom >= scrollTop - buffer && currentTop <= scrollBottom + buffer) {
      visible.push(i + 1);
    }
    
    currentTop = pageBottom;
  }
  
  return visible;
}

/**
 * 更新可见页面并触发渲染
 */
async function updateVisiblePages() {
  const newVisiblePages = calculateVisiblePages();
  const oldVisiblePages = Array.from(visiblePages.value);
  
  visiblePages.value = new Set(newVisiblePages);
  
  const toRender = newVisiblePages.filter(p => !oldVisiblePages.includes(p));
  
  await nextTick();
  
  for (const pageNum of toRender) {
    await renderScrollPage(pageNum);
  }
  
  // 更新当前页码
  if (newVisiblePages.length > 0) {
    const middleIndex = Math.floor(newVisiblePages.length / 2);
    emit('current-page-change', newVisiblePages[middleIndex]);
  }
}

/**
 * 渲染单个页面
 */
async function renderScrollPage(pageNum) {
  if (!props.pdfDoc) return;
  
  try {
    const canvas = pageCanvasRefs.get(pageNum);
    const textLayerDiv = pageTextLayerRefs.get(pageNum);
    const annotationLayerDiv = pageAnnotationLayerRefs.get(pageNum);
    
    if (!canvas) return;
    
    // 取消该页之前的渲染任务
    const oldTask = renderTasks.get(pageNum);
    if (oldTask) {
      try {
        oldTask.cancel();
        await oldTask.promise;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`[ScrollPdfViewer] previous render task promise rejected`, err);
        }
      } finally {
        renderTasks.delete(pageNum);
      }
    }
    
    // 获取页面和视口
    const page = await props.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: props.scale });
    
    // 获取或创建 context（若 canvas 实例已更新则丢弃旧 context）
    let ctx = canvasContexts.get(pageNum);
    if (ctx && ctx.canvas !== canvas) {
      ctx = null;
      canvasContexts.delete(pageNum);
    }
    
    // 渲染页面
    const result = await renderPage({
      canvas,
      textLayer: textLayerDiv,
      annotationLayer: annotationLayerDiv,
      page,
      viewport,
      canvasContext: ctx,
      onRenderTask: (task) => {
        renderTasks.set(pageNum, task);
      },
    });
    
    if (result) {
      canvasContexts.set(pageNum, result.context);
    }
  } catch (err) {
    if (err.name === 'RenderingCancelledException') {
      console.log(`Rendering cancelled for page ${pageNum}`);
      return;
    }
    console.error(`Failed to render page ${pageNum}:`, err);
    emit('render-error', err);
  } finally {
    renderTasks.delete(pageNum);
  }
}

/**
 * 滚动事件处理
 */
function onScroll() {
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  
  scrollTimer = setTimeout(() => {
    updateVisiblePages();
  }, 150);
}

/**
 * 计算两个触摸点之间的距离
 */
function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 触摸开始
 */
function onTouchStart(e) {
  if (!props.isMobile || e.touches.length !== 2) return;
  
  e.preventDefault();
  
  const distance = getTouchDistance(e.touches[0], e.touches[1]);
  touchState.value = {
    isZooming: true,
    initialDistance: distance,
    initialScale: props.scale,
  };
}

/**
 * 触摸移动（双指缩放）
 */
function onTouchMove(e) {
  if (!props.isMobile || !touchState.value.isZooming || e.touches.length !== 2) return;
  
  e.preventDefault();
  
  const distance = getTouchDistance(e.touches[0], e.touches[1]);
  const scaleChange = distance / touchState.value.initialDistance;
  let newScale = touchState.value.initialScale * scaleChange;
  
  // 限制缩放范围
  newScale = Math.max(props.scaleMin, Math.min(props.scaleMax, newScale));
  
  if (Math.abs(newScale - props.scale) > 0.05) {
    emit('update:scale', newScale);
    debouncedRenderScroll();
  }
}

/**
 * 触摸结束
 */
function onTouchEnd(e) {
  if (!props.isMobile) return;
  
  if (e.touches.length < 2) {
    touchState.value.isZooming = false;
  }
}

/**
 * 滚动模式防抖重新渲染
 */
function debouncedRenderScroll() {
  if (renderTimer) {
    clearTimeout(renderTimer);
  }
  
  renderTimer = setTimeout(async () => {
    // 重新计算所有页面高度
    pageHeights.value = [];
    for (let i = 1; i <= totalPages.value; i++) {
      const page = await props.pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: props.scale });
      pageHeights.value.push(viewport.height);
    }
    
    // 清空已渲染的页面
    visiblePages.value.clear();
    
    await nextTick();
    await updateVisiblePages();
    
    renderTimer = null;
  }, 300);
}

/**
 * 取消所有渲染任务
 */
function cancelAllRenderTasks() {
  renderTasks.forEach(task => {
    if (task) task.cancel();
  });
  renderTasks.clear();
}

/**
 * 清理
 */
function cleanup() {
  if (scrollTimer) {
    clearTimeout(scrollTimer);
    scrollTimer = null;
  }
  
  if (renderTimer) {
    clearTimeout(renderTimer);
    renderTimer = null;
  }
  
  cancelAllRenderTasks();
  canvasContexts.clear();
  pageCanvasRefs.clear();
  pageTextLayerRefs.clear();
  pageAnnotationLayerRefs.clear();
  visiblePages.value.clear();
  pageHeights.value = [];
}

// 监听文档和缩放变化
watch(() => props.pdfDoc, (newDoc) => {
  if (newDoc) {
    cleanup();
    init();
  }
}, { immediate: true });

watch(() => props.scale, () => {
  if (props.pdfDoc) {
    debouncedRenderScroll();
  }
});

// 清理
onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
.scroll-pdf-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 8px);
  position: relative;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.scroll-pdf-viewer.mobile-mode {
  padding: var(--spacing-md);
  padding-top: calc(var(--spacing-md) + 8px);
  touch-action: pan-x pan-y pinch-zoom;
}

@media (max-width: 768px) {
  .scroll-pdf-viewer {
    padding: var(--spacing-md);
    padding-top: calc(var(--spacing-md) + 8px);
  }
}

.pdf-scroll-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-bottom: 40px;
}

.pdf-page-item {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.pdf-page-placeholder {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px dashed rgba(196, 206, 255, 0.4);
  border-radius: 4px;
}

.pdf-page-wrapper {
  position: relative;
  display: inline-block;
  box-shadow: var(--shadow-lg);
  will-change: transform;
  transform: translateZ(0);
  contain: layout style paint;
}

canvas {
  display: block;
  background-color: white;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 2;
  user-select: text;
  pointer-events: auto;
  opacity: 1;
  line-height: 1;
  text-size-adjust: none;
  forced-color-adjust: none;
  transform-origin: 0 0;
  caret-color: CanvasText;
  will-change: contents;
  contain: layout style;
}

.textLayer :deep(span),
.textLayer :deep(br) {
  position: absolute;
  display: inline-block;
  color: transparent;
  cursor: text;
  user-select: text;
  pointer-events: auto;
  transform-origin: left bottom;
  white-space: pre;
  overflow: visible;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.textLayer :deep(span)::selection {
  background: rgba(0, 100, 255, 0.3);
  color: transparent;
}

.annotationLayer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
  will-change: contents;
  contain: layout style;
}

.annotationLayer :deep(section) {
  position: absolute;
  text-align: initial;
  pointer-events: auto;
}

.annotationLayer :deep(.linkAnnotation > a) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 1em;
  text-decoration: none;
}

.annotationLayer :deep(.linkAnnotation > a:hover) {
  opacity: 0.2;
  background: rgba(255, 255, 0, 0.3);
  box-shadow: 0 2px 10px rgba(255, 255, 0, 0.5);
}
</style>


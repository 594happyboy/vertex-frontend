<template>
  <div class="paged-pdf-viewer">
    <div class="pdf-page-wrapper">
      <canvas ref="pdfCanvas"></canvas>
      <div ref="textLayer" class="textLayer"></div>
      <div ref="annotationLayer" class="annotationLayer"></div>
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
  currentPage: {
    type: Number,
    default: 1,
  },
  scale: {
    type: Number,
    default: 1.5,
  },
});

const emit = defineEmits(['page-rendered', 'render-error', 'update:rendering']);

// DOM 引用
const pdfCanvas = ref(null);
const textLayer = ref(null);
const annotationLayer = ref(null);

// 渲染状态
let activeRenderTask = null;
let canvasContext = null;
let isRendering = false;
let pendingContext = null;

/**
 * 取消当前的渲染任务
 */
async function cancelRenderTask({ awaitCompletion = false } = {}) {
  if (!activeRenderTask) return;

  const task = activeRenderTask;
  activeRenderTask = null;

  try {
    task.cancel();
  } catch (err) {
    console.warn('[PagedPdfViewer] cancelRenderTask failed to cancel task', err);
  }

  if (awaitCompletion) {
    try {
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[PagedPdfViewer] render task promise rejected during cancel', err);
      }
    }
  }
}

/**
 * 实际执行渲染流程
 */
async function performRender(context) {
  if (!props.pdfDoc) {
    console.debug('[PagedPdfViewer] render skipped - pdfDoc missing', { context, currentPage: props.currentPage });
    return;
  }

  if (!pdfCanvas.value) {
    console.debug('[PagedPdfViewer] canvas not ready, waiting nextTick', { context });
    await nextTick();
  }

  if (!pdfCanvas.value) {
    console.warn('[PagedPdfViewer] render aborted - canvas ref still missing', { context });
    return;
  }

  emit('update:rendering', true);

  const targetPage = props.currentPage;

  try {
    console.debug('[PagedPdfViewer] start render', { page: targetPage, scale: props.scale, context });

    const page = await props.pdfDoc.getPage(targetPage);

    if (pendingContext !== null) {
      console.debug('[PagedPdfViewer] pending render detected before viewport, abort current', { context, page: targetPage });
      return;
    }

    const viewport = page.getViewport({ scale: props.scale });

    // 清理图层
    if (textLayer.value) {
      textLayer.value.innerHTML = '';
    }
    if (annotationLayer.value) {
      annotationLayer.value.innerHTML = '';
    }

    const result = await renderPage({
      canvas: pdfCanvas.value,
      textLayer: textLayer.value,
      annotationLayer: annotationLayer.value,
      page,
      viewport,
      canvasContext,
      onRenderTask: (task) => {
        activeRenderTask = task;
      },
    });

    if (result) {
      canvasContext = result.context;
    }

    if (pendingContext !== null) {
      console.debug('[PagedPdfViewer] render completed but new render queued, skipping emit', { context, page: targetPage });
      return;
    }

    emit('page-rendered', targetPage);
    console.debug('[PagedPdfViewer] render success', { page: targetPage, context });
  } catch (err) {
    if (err?.name === 'RenderingCancelledException') {
      console.debug('[PagedPdfViewer] render cancelled', { context });
      return;
    }
    console.error('Failed to render page:', err);
    emit('render-error', err);
  } finally {
    activeRenderTask = null;
    emit('update:rendering', false);
  }
}

/**
 * 调度渲染
 */
async function render(context = 'watch') {
  pendingContext = context;
  console.debug('[PagedPdfViewer] queue render', { context, page: props.currentPage, scale: props.scale });

  if (isRendering) {
    if (activeRenderTask?.cancel) {
      console.debug('[PagedPdfViewer] cancel active render due to new request', { context });
      cancelRenderTask();
    }
    return;
  }

  isRendering = true;

  try {
    while (pendingContext !== null) {
      const nextContext = pendingContext;
      pendingContext = null;
      await performRender(nextContext);
    }
  } finally {
    isRendering = false;
  }
}

// 监听属性变化
watch(
  [() => props.pdfDoc, () => props.currentPage, () => props.scale],
  () => {
    render('watch-trigger');
  },
  { immediate: true, flush: 'post' }
);

render('setup');

// 清理
onBeforeUnmount(() => {
  cancelRenderTask({ awaitCompletion: false });
  canvasContext = null;
  pendingContext = null;
  isRendering = false;
});
</script>

<style scoped>
.paged-pdf-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 8px);
  position: relative;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .paged-pdf-viewer {
    padding: var(--spacing-md);
    padding-top: calc(var(--spacing-md) + 8px);
  }
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


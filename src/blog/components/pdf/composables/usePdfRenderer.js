/**
 * PDF 渲染 Composable
 * 提供 PDF 页面渲染的核心逻辑
 */

import * as pdfjsLib from 'pdfjs-dist';
import {
  setupLayerDimensions,
  getMeasureContainer,
  clearMeasureContainer,
  createTextSpan,
  createLinkAnnotation,
} from '../utils/pdfRenderHelpers';

/**
 * 渲染 Canvas 层
 * 
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {Object} page - PDF 页面对象
 * @param {Object} viewport - 视口对象
 * @param {Object} context - Canvas context（可选，用于缓存）
 */
export async function renderCanvas(canvas, page, viewport, context = null, onRenderTask) {
  if (!canvas) return null;
  
  // 获取或创建 context
  let ctx = context;
  if (!ctx) {
    ctx = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: false,
    });
  }
  
  const pixelRatio = window.devicePixelRatio || 1;
  
  // 设置 Canvas 尺寸
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  canvas.width = Math.floor(viewport.width * pixelRatio);
  canvas.height = Math.floor(viewport.height * pixelRatio);
  
  // 渲染配置
  const renderContext = {
    canvasContext: ctx,
    viewport,
    transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
  };
  
  // 执行渲染
  const renderTask = page.render(renderContext);

  if (typeof onRenderTask === 'function') {
    try {
      onRenderTask(renderTask);
    } catch (err) {
      console.warn('[usePdfRenderer] onRenderTask callback failed', err);
    }
  }

  await renderTask.promise;
  
  return { task: renderTask, context: ctx };
}

/**
 * 渲染文本层
 * 
 * @param {HTMLElement} textLayerDiv - 文本层容器
 * @param {Object} page - PDF 页面对象
 * @param {Object} viewport - 视口对象
 */
export async function renderTextLayer(textLayerDiv, page, viewport) {
  if (!textLayerDiv) return;
  
  try {
    setupLayerDimensions(textLayerDiv, viewport);
    const textContent = await page.getTextContent();
    const fragment = document.createDocumentFragment();
    const container = getMeasureContainer();
    clearMeasureContainer();
    
    textContent.items.forEach((item) => {
      if (!item.str) return;
      const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const style = textContent.styles[item.fontName];
      const span = createTextSpan(item, transform, style, viewport, container);
      fragment.appendChild(span);
    });
    
    textLayerDiv.appendChild(fragment);
  } catch (err) {
    console.error('Failed to render text layer:', err);
  }
}

/**
 * 渲染注释层
 * 
 * @param {HTMLElement} annotationLayerDiv - 注释层容器
 * @param {Object} page - PDF 页面对象
 * @param {Object} viewport - 视口对象
 */
export async function renderAnnotationLayer(annotationLayerDiv, page, viewport) {
  if (!annotationLayerDiv) return;
  
  try {
    setupLayerDimensions(annotationLayerDiv, viewport);
    const annotations = await page.getAnnotations();
    const fragment = document.createDocumentFragment();
    
    annotations
      .filter(annotation => annotation.subtype === 'Link')
      .forEach(annotation => {
        const linkElement = createLinkAnnotation(annotation, viewport);
        fragment.appendChild(linkElement);
      });
    
    annotationLayerDiv.appendChild(fragment);
  } catch (err) {
    console.error('Failed to render annotation layer:', err);
  }
}

/**
 * 渲染完整的 PDF 页面（Canvas + 文本层 + 注释层）
 * 
 * @param {Object} options - 渲染选项
 * @param {HTMLCanvasElement} options.canvas - Canvas 元素
 * @param {HTMLElement} options.textLayer - 文本层元素
 * @param {HTMLElement} options.annotationLayer - 注释层元素
 * @param {Object} options.page - PDF 页面对象
 * @param {Object} options.viewport - 视口对象
 * @param {Object} options.canvasContext - Canvas context（可选）
 */
export async function renderPage(options) {
  const { canvas, textLayer, annotationLayer, page, viewport, canvasContext, onRenderTask } = options;
  
  try {
    // 渲染 Canvas 层
    const canvasResult = await renderCanvas(canvas, page, viewport, canvasContext, onRenderTask);
    
    // 并行渲染文本层和注释层
    await Promise.all([
      renderTextLayer(textLayer, page, viewport),
      renderAnnotationLayer(annotationLayer, page, viewport),
    ]);
    
    return canvasResult;
  } catch (err) {
    if (err.name === 'RenderingCancelledException') {
      console.log('Rendering was cancelled');
      return null;
    }
    throw err;
  }
}


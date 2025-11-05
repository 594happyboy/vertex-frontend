/**
 * PDF 渲染辅助函数
 * 提供渲染相关的工具函数和DOM操作
 */

// 性能优化：缓存测量容器（跨渲染复用）
let measureContainer = null;

/**
 * 清空并设置图层尺寸
 * 
 * @param {HTMLElement} element - 要设置的图层元素
 * @param {Object} viewport - PDF 视口对象，包含 width 和 height
 */
export function setupLayerDimensions(element, viewport) {
  if (!element) return;
  element.innerHTML = '';
  element.style.width = `${viewport.width}px`;
  element.style.height = `${viewport.height}px`;
}

/**
 * 从 PDF 变换矩阵计算字体大小
 * 
 * transform = [a, b, c, d, e, f]
 * - a, d: X、Y 方向的缩放
 * - b, c: 倾斜/旋转
 * - e, f: 平移（位置）
 * 
 * @param {Array} transform - PDF 变换矩阵 [a, b, c, d, e, f]
 * @returns {number} 字体大小（像素）
 */
export function calculateFontSize(transform) {
  return Math.sqrt(transform[2] ** 2 + transform[3] ** 2);
}

/**
 * 获取或创建共享的测量容器（性能优化）
 * 
 * @returns {HTMLElement} 测量容器
 */
export function getMeasureContainer() {
  if (!measureContainer) {
    measureContainer = document.createElement('div');
    Object.assign(measureContainer.style, {
      position: 'absolute',
      visibility: 'hidden',
      top: '-9999px',
      whiteSpace: 'pre',
    });
    document.body.appendChild(measureContainer);
  }
  return measureContainer;
}

/**
 * 清空测量容器（准备下次使用）
 */
export function clearMeasureContainer() {
  if (measureContainer) {
    measureContainer.innerHTML = '';
  }
}

/**
 * 清理测量容器（组件卸载时调用）
 */
export function cleanupMeasureContainer() {
  if (measureContainer && measureContainer.parentNode) {
    measureContainer.parentNode.removeChild(measureContainer);
    measureContainer = null;
  }
}

/**
 * 创建文本 span 元素（精确定位版本）
 * 
 * @param {Object} item - PDF 文本项
 * @param {Array} transform - PDF 变换矩阵
 * @param {Object} style - PDF 字体样式信息
 * @param {Object} viewport - PDF 视口信息
 * @param {HTMLElement} measureContainer - 共享的测量容器
 */
export function createTextSpan(item, transform, style, viewport, measureContainer) {
  const span = document.createElement('span');
  span.textContent = item.str;
  
  // 从变换矩阵计算字体大小
  const fontSize = calculateFontSize(transform);
  
  // 计算文本旋转角度
  const angle = Math.atan2(transform[1], transform[0]);
  
  // 设置基础样式
  Object.assign(span.style, {
    position: 'absolute',
    left: `${transform[4]}px`,
    top: `${transform[5] - fontSize}px`,
    fontSize: `${fontSize}px`,
    fontFamily: style?.fontFamily || 'sans-serif',
    color: 'transparent',
    userSelect: 'text',
    pointerEvents: 'auto',
    whiteSpace: 'pre',
    transformOrigin: 'left bottom',
    height: `${fontSize}px`,
  });
  
  // 精确宽度控制
  if (item.width && item.str.trim() && measureContainer) {
    const targetWidth = item.width * viewport.scale;
    
    // 测量浏览器实际渲染的宽度
    const measureSpan = document.createElement('span');
    measureSpan.textContent = item.str;
    Object.assign(measureSpan.style, {
      fontSize: `${fontSize}px`,
      fontFamily: style?.fontFamily || 'sans-serif',
      whiteSpace: 'pre',
    });
    
    measureContainer.appendChild(measureSpan);
    const actualWidth = measureSpan.getBoundingClientRect().width;
    measureContainer.removeChild(measureSpan);
    
    if (actualWidth > 0) {
      const scaleX = targetWidth / actualWidth;
      let transformValue = `scaleX(${scaleX})`;
      if (Math.abs(angle) > 0.001) {
        transformValue += ` rotate(${angle}rad)`;
      }
      span.style.transform = transformValue;
      span.style.width = `${actualWidth}px`;
    } else {
      span.style.width = `${targetWidth}px`;
    }
  } else if (Math.abs(angle) > 0.001) {
    span.style.transform = `rotate(${angle}rad)`;
  }
  
  return span;
}

/**
 * 创建链接注释元素
 * 
 * @param {Object} annotation - PDF 注释对象
 * @param {Object} viewport - PDF 视口对象
 */
export function createLinkAnnotation(annotation, viewport) {
  const section = document.createElement('section');
  section.className = 'linkAnnotation';
  
  const rect = viewport.convertToViewportRectangle(annotation.rect);
  const [x1, y1, x2, y2] = rect;
  
  Object.assign(section.style, {
    left: `${Math.min(x1, x2)}px`,
    top: `${Math.min(y1, y2)}px`,
    width: `${Math.abs(x2 - x1)}px`,
    height: `${Math.abs(y2 - y1)}px`,
  });
  
  const link = document.createElement('a');
  link.href = annotation.url || '#';
  
  if (annotation.url) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  
  section.appendChild(link);
  return section;
}


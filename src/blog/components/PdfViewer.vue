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

      <div v-show="!loading && !error" class="pdf-page-wrapper">
        <canvas ref="pdfCanvas"></canvas>
        <div ref="textLayer" class="textLayer"></div>
        <div ref="annotationLayer" class="annotationLayer"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import * as pdfjsLib from 'pdfjs-dist';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';

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

// ==================== Store ====================
const docStore = useDocStore();
const uiStore = useUiStore();

// ==================== DOM 引用 ====================
const pdfContainer = ref(null);
const pdfCanvas = ref(null);
const textLayer = ref(null);
const annotationLayer = ref(null);

// ==================== 状态管理 ====================
const loading = ref(true);
const error = ref(null);
const rendering = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(PDF_CONFIG.SCALE.DEFAULT);
const pageInput = ref(1);

// PDF 文档实例
let pdfDoc = null;
let renderTask = null;

// 性能优化：缓存常用对象
let canvasContext = null;           // 缓存 Canvas context
let measureContainer = null;        // 缓存测量容器（跨渲染复用）
let renderTimer = null;             // 防抖定时器

// ==================== 计算属性 ====================
const docTitle = computed(() => docStore.docTitle);
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);
const canZoomIn = computed(() => scale.value < PDF_CONFIG.SCALE.MAX);
const canZoomOut = computed(() => scale.value > PDF_CONFIG.SCALE.MIN);
const scalePercent = computed(() => Math.round(scale.value * 100));

const pdfUrl = computed(() => {
  const filePath = docStore.currentDoc?.filePath;
  if (!filePath) return null;
  
  if (filePath.startsWith('http')) return filePath;
  
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseURL}${filePath}`;
});

// ==================== 工具函数 ====================
/**
 * 取消当前的渲染任务
 * 
 * 【使用场景】
 * - 用户快速翻页时，取消上一页的渲染
 * - 用户调整缩放时，取消当前渲染重新开始
 * - 组件卸载时，清理未完成的任务
 * 
 * 【避免的问题】
 * - 多个渲染任务同时执行导致的性能问题
 * - 渲染完成顺序错乱（旧任务覆盖新任务）
 */
function cancelRenderTask() {
  if (renderTask) {
    renderTask.cancel();
    renderTask = null;
  }
}

/**
 * 清空并设置图层尺寸
 * 
 * 【作用】
 * 为文本层或注释层准备容器：
 * 1. 清空旧内容（innerHTML = ''）
 * 2. 设置新尺寸（匹配当前视口）
 * 
 * @param {HTMLElement} element - 要设置的图层元素
 * @param {Object} viewport - PDF 视口对象，包含 width 和 height
 */
function setupLayerDimensions(element, viewport) {
  if (!element) return;
  element.innerHTML = '';
  element.style.width = `${viewport.width}px`;
  element.style.height = `${viewport.height}px`;
}

/**
 * 从 PDF 变换矩阵计算字体大小
 * 
 * 【PDF 变换矩阵】
 * transform = [a, b, c, d, e, f]
 * - a, d: X、Y 方向的缩放
 * - b, c: 倾斜/旋转
 * - e, f: 平移（位置）
 * 
 * 【计算公式】
 * fontSize = √(c² + d²)
 * 
 * 这个公式考虑了文本的缩放和旋转，得到实际的字体大小
 * 
 * @param {Array} transform - PDF 变换矩阵 [a, b, c, d, e, f]
 * @returns {number} 字体大小（像素）
 */
function calculateFontSize(transform) {
  return Math.sqrt(transform[2] ** 2 + transform[3] ** 2);
}

/**
 * 获取或创建共享的测量容器（性能优化）
 * 
 * 【优化点】
 * - 在组件级别缓存容器，跨多次渲染复用
 * - 避免频繁创建和销毁 DOM 元素
 * - 减少内存分配和GC压力
 * 
 * @returns {HTMLElement} 测量容器
 */
function getMeasureContainer() {
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
function clearMeasureContainer() {
  if (measureContainer) {
    measureContainer.innerHTML = '';
  }
}

/**
 * 创建文本 span 元素（精确定位版本）
 * 
 * 【核心问题】
 * PDF 中定义的字符宽度与浏览器实际渲染的字符宽度不同，导致：
 * - 复制时选中的文本与实际位置偏移
 * - 字符越多，偏移越明显（累积误差）
 * - 不同字符宽度差异大（如 'i' vs 'w'），加剧问题
 * 
 * 【解决方案】
 * 1. 测量浏览器实际渲染的文本宽度
 * 2. 计算 PDF 期望宽度与实际宽度的比例
 * 3. 使用 CSS transform: scaleX() 来精确缩放文本
 * 4. 这样文本的视觉宽度与 PDF 定义完全一致，复制时完美对齐
 * 
 * @param {Object} item - PDF 文本项，包含文本内容和宽度信息
 * @param {Array} transform - PDF 变换矩阵 [scaleX, skewY, skewX, scaleY, translateX, translateY]
 * @param {Object} style - PDF 字体样式信息
 * @param {Object} viewport - PDF 视口信息
 * @param {HTMLElement} measureContainer - 共享的测量容器（性能优化）
 */
function createTextSpan(item, transform, style, viewport, measureContainer) {
  const span = document.createElement('span');
  span.textContent = item.str;
  
  // 从变换矩阵计算字体大小
  const fontSize = calculateFontSize(transform);
  
  // 计算文本旋转角度（支持任意方向的文本）
  const angle = Math.atan2(transform[1], transform[0]);
  
  // 设置基础样式
  Object.assign(span.style, {
    position: 'absolute',
    left: `${transform[4]}px`,           // X 坐标
    top: `${transform[5] - fontSize}px`, // Y 坐标（需要减去字体高度）
    fontSize: `${fontSize}px`,
    fontFamily: style?.fontFamily || 'sans-serif',
    color: 'transparent',                // 透明文字（叠加在 Canvas 渲染的文字上）
    userSelect: 'text',                  // 允许选择
    pointerEvents: 'auto',               // 接收鼠标事件
    whiteSpace: 'pre',                   // 保留空格和换行
    transformOrigin: 'left bottom',      // 缩放基点：左下角（重要！）
    height: `${fontSize}px`,
  });
  
  // ==================== 精确宽度控制（核心算法） ====================
  if (item.width && item.str.trim() && measureContainer) {
    // PDF 期望的文本宽度
    const targetWidth = item.width * viewport.scale;
    
    // 步骤1：创建临时元素来测量浏览器实际渲染的宽度
    const measureSpan = document.createElement('span');
    measureSpan.textContent = item.str;
    Object.assign(measureSpan.style, {
      fontSize: `${fontSize}px`,
      fontFamily: style?.fontFamily || 'sans-serif',
      whiteSpace: 'pre',
    });
    
    // 步骤2：添加到隐藏容器中并测量
    measureContainer.appendChild(measureSpan);
    const actualWidth = measureSpan.getBoundingClientRect().width;
    measureContainer.removeChild(measureSpan);
    
    // 步骤3：计算缩放比例并应用
    if (actualWidth > 0) {
      // 计算需要的缩放比例
      // 例如：PDF 说要 100px，浏览器渲染是 90px，则 scaleX = 100/90 = 1.111
      const scaleX = targetWidth / actualWidth;
      
      // 组合变换：先缩放宽度，如果有旋转再加上旋转
      let transformValue = `scaleX(${scaleX})`;
      if (Math.abs(angle) > 0.001) {
        transformValue += ` rotate(${angle}rad)`;
      }
      span.style.transform = transformValue;
      
      // 设置宽度为实际宽度，让 scaleX 来调整到目标宽度
      // 这样做的好处：
      // 1. 文本选择区域与实际字符完美对应
      // 2. 支持不同字体的字符宽度差异（'i' vs 'w'）
      // 3. 避免累积误差
      span.style.width = `${actualWidth}px`;
    } else {
      // 如果测量失败，直接使用 PDF 宽度
      span.style.width = `${targetWidth}px`;
    }
  } else if (Math.abs(angle) > 0.001) {
    // 没有宽度信息，只应用旋转
    span.style.transform = `rotate(${angle}rad)`;
  }
  
  return span;
}

/**
 * 创建链接注释元素
 */
function createLinkAnnotation(annotation, viewport) {
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

// ==================== 核心功能 ====================
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
    cancelRenderTask();

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
    error.value = err.name === 'MissingPDFException' 
      ? 'PDF 文件不存在' 
      : '加载 PDF 失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

/**
 * 渲染指定页面（核心渲染流程）
 * 
 * 【渲染流程】
 * 1. 取消之前的渲染任务（如果有）
 * 2. 渲染 Canvas 层（PDF 的视觉内容）
 * 3. 并行渲染交互层（文本层 + 注释层）
 * 4. 更新页码状态
 * 
 * 【三层架构】
 * ┌─────────────────────────┐
 * │  annotationLayer (z:3)  │ ← 链接可点击
 * ├─────────────────────────┤
 * │    textLayer (z:2)      │ ← 文字可选择
 * ├─────────────────────────┤
 * │      Canvas (z:0)       │ ← PDF 图像
 * └─────────────────────────┘
 * 
 * 【性能优化】
 * - 使用 Promise.all 并行渲染文本层和注释层
 * - 取消之前未完成的渲染任务（避免浪费资源）
 * - 使用 try-finally 确保状态正确更新
 */
async function renderPage(pageNum) {
  if (!pdfDoc || !pdfCanvas.value) return;

  try {
    // 取消之前的渲染（避免冲突和资源浪费）
    cancelRenderTask();
    rendering.value = true;

    // 获取指定页面并计算视口（视口包含缩放、旋转等信息）
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale.value });
    
    // 第一步：渲染 Canvas 层（PDF 的基础图像）
    await renderCanvas(page, viewport);
    
    // 第二步：并行渲染交互层（提高性能）
    // - 文本层：让文字可以被选中和复制
    // - 注释层：让链接可以被点击
    await Promise.all([
      renderTextLayer(page, viewport),
      renderAnnotationLayer(page, viewport),
    ]);

    // 更新当前页码
    currentPage.value = pageNum;
    pageInput.value = pageNum;
  } catch (err) {
    // 忽略用户主动取消渲染的错误
    if (err.name === 'RenderingCancelledException') {
      console.log('Rendering was cancelled');
      return;
    }
    console.error('Failed to render page:', err);
    uiStore.showError('渲染页面失败');
  } finally {
    // 无论成功或失败，都要重置渲染状态
    rendering.value = false;
  }
}

/**
 * 渲染 Canvas 层（PDF 的基础图像）
 * 
 * 【技术细节】
 * - 使用 Canvas 2D API 渲染 PDF 页面
 * - 支持高 DPI 屏幕（通过 devicePixelRatio）
 * - Canvas 的物理像素 = CSS 像素 × devicePixelRatio
 * 
 * 【高 DPI 适配】
 * 普通屏幕 (devicePixelRatio = 1):
 *   CSS: 800x600  →  Canvas: 800x600
 * 
 * Retina 屏幕 (devicePixelRatio = 2):
 *   CSS: 800x600  →  Canvas: 1600x1200
 *   (更多像素，更清晰)
 * 
 * 【性能优化】
 * - 缓存 Canvas context（避免重复获取）
 * - 复用同一个 canvas 元素
 */
async function renderCanvas(page, viewport) {
  const canvas = pdfCanvas.value;
  
  // 性能优化：缓存 context（避免每次都调用 getContext）
  if (!canvasContext) {
    canvasContext = canvas.getContext('2d', {
      alpha: false,        // PDF 不需要透明度，禁用可提升性能
      willReadFrequently: false,  // 我们不频繁读取像素
    });
  }
  
  const pixelRatio = window.devicePixelRatio || 1;

  // 设置 Canvas 尺寸
  // CSS 尺寸：用户看到的大小
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  
  // Canvas 内部分辨率：实际像素数（乘以 pixelRatio 以支持高清屏）
  canvas.width = Math.floor(viewport.width * pixelRatio);
  canvas.height = Math.floor(viewport.height * pixelRatio);

  // 渲染上下文配置
  const renderContext = {
    canvasContext,
    viewport,
    // 高 DPI 屏幕需要缩放变换矩阵
    transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
  };

  // 执行渲染并等待完成
  renderTask = page.render(renderContext);
  await renderTask.promise;
  renderTask = null;
}

/**
 * 渲染文本层（用于文字选择和复制）
 * 
 * 【功能说明】
 * 在 PDF Canvas 渲染的图像上方创建一个透明的文本层，使 PDF 内容：
 * 1. 可以被选中（鼠标拖动选择）
 * 2. 可以被复制（Ctrl+C 或右键复制）
 * 3. 可以被搜索（Ctrl+F 页面搜索）
 * 
 * 【技术实现】
 * - 从 PDF 提取文本内容和位置信息
 * - 为每个文本片段创建透明的 span 元素
 * - 精确定位到 Canvas 渲染的文字上方
 * - 使用 scaleX 确保选择区域与视觉完美对齐
 * 
 * 【性能优化】
 * - 使用 DocumentFragment 批量添加元素（减少重排）
 * - 使用共享的测量容器（避免频繁创建/删除 DOM）
 * - 在函数结束时清理测量容器（防止内存泄漏）
 */
async function renderTextLayer(page, viewport) {
  const textLayerDiv = textLayer.value;
  if (!textLayerDiv) return;

  try {
    // 清空之前的内容并设置尺寸
    setupLayerDimensions(textLayerDiv, viewport);
    
    // 从 PDF 页面获取文本内容（包含文本、位置、样式信息）
    const textContent = await page.getTextContent();
    
    // 使用 DocumentFragment 提高性能（避免多次重排）
    const fragment = document.createDocumentFragment();
    
    // 【性能优化】使用组件级缓存的测量容器（跨渲染复用）
    const container = getMeasureContainer();
    clearMeasureContainer(); // 清空之前的内容
    
    // 遍历所有文本项，为每个创建 span 元素
    textContent.items.forEach((item) => {
      if (!item.str) return;  // 跳过空字符串
      
      // 计算变换后的坐标和样式
      const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const style = textContent.styles[item.fontName];
      
      // 创建精确定位的文本 span
      const span = createTextSpan(item, transform, style, viewport, container);
      
      fragment.appendChild(span);
    });

    // 一次性添加所有文本元素
    textLayerDiv.appendChild(fragment);
  } catch (err) {
    console.error('Failed to render text layer:', err);
  }
}

/**
 * 渲染注释层（用于链接点击等交互）
 * 
 * 【功能说明】
 * 在文本层上方创建注释层，使 PDF 中的交互元素可用：
 * 1. 链接可点击（内部链接、外部 URL）
 * 2. 悬停高亮（鼠标悬停时显示黄色提示）
 * 3. 在新标签页打开（外部链接）
 * 
 * 【图层顺序】（从下到上）
 * Canvas (z-index: 0)    ← PDF 渲染的图像
 *   ↓
 * textLayer (z-index: 2)  ← 透明文字（可选择）
 *   ↓
 * annotationLayer (z-index: 3) ← 链接（可点击）
 * 
 * 【实现细节】
 * - 只渲染链接类型的注释（过滤其他类型）
 * - 将 PDF 坐标转换为视口坐标
 * - 为每个链接创建透明的可点击区域
 */
async function renderAnnotationLayer(page, viewport) {
  const annotationLayerDiv = annotationLayer.value;
  if (!annotationLayerDiv) return;

  try {
    // 清空之前的内容并设置尺寸
    setupLayerDimensions(annotationLayerDiv, viewport);
    
    // 获取页面中的所有注释（链接、表单、高亮等）
    const annotations = await page.getAnnotations();
    
    // 使用 DocumentFragment 批量添加
    const fragment = document.createDocumentFragment();

    // 只处理链接类型的注释
    annotations
      .filter(annotation => annotation.subtype === 'Link')
      .forEach(annotation => {
        const linkElement = createLinkAnnotation(annotation, viewport);
        fragment.appendChild(linkElement);
      });

    // 一次性添加所有链接元素
    annotationLayerDiv.appendChild(fragment);
  } catch (err) {
    console.error('Failed to render annotation layer:', err);
  }
}

// ==================== 交互控制 ====================
/**
 * 防抖渲染（性能优化）
 * 
 * 【优化场景】
 * - 用户快速点击缩放按钮
 * - 用户快速翻页
 * 
 * 【工作原理】
 * - 短时间内多次调用，只执行最后一次
 * - 避免大量无效的渲染任务
 * - 减少 CPU 和 GPU 负载
 * 
 * @param {number} pageNum - 要渲染的页码
 * @param {number} delay - 防抖延迟（毫秒）
 */
function debouncedRender(pageNum, delay = 150) {
  // 清除之前的定时器
  if (renderTimer) {
    clearTimeout(renderTimer);
  }
  
  // 设置新的定时器
  renderTimer = setTimeout(() => {
    renderPage(pageNum);
    renderTimer = null;
  }, delay);
}

/**
 * 上一页
 */
const prevPage = () => {
  if (!isFirstPage.value) {
    renderPage(currentPage.value - 1);
  }
};

/**
 * 下一页
 */
const nextPage = () => {
  if (!isLastPage.value) {
    renderPage(currentPage.value + 1);
  }
};

/**
 * 跳转到指定页
 */
function goToPage() {
  const page = pageInput.value;
  const isValid = Number.isInteger(page) && page >= 1 && page <= totalPages.value;
  
  if (isValid) {
    renderPage(page);
  } else {
    resetPageInput();
  }
}

/**
 * 重置页码输入框
 */
const resetPageInput = () => {
  pageInput.value = currentPage.value;
};

/**
 * 放大（使用防抖优化）
 */
function zoomIn() {
  if (!canZoomIn.value) return;
  scale.value = Math.min(scale.value + PDF_CONFIG.SCALE.STEP, PDF_CONFIG.SCALE.MAX);
  debouncedRender(currentPage.value, 100); // 缩放使用更短的延迟
}

/**
 * 缩小（使用防抖优化）
 */
function zoomOut() {
  if (!canZoomOut.value) return;
  scale.value = Math.max(scale.value - PDF_CONFIG.SCALE.STEP, PDF_CONFIG.SCALE.MIN);
  debouncedRender(currentPage.value, 100); // 缩放使用更短的延迟
}

/**
 * 下载 PDF
 */
const downloadPdf = () => {
  if (pdfUrl.value) {
    window.open(pdfUrl.value, '_blank');
  }
};

// ==================== 生命周期 ====================
/**
 * 清理资源（防止内存泄漏）
 * 
 * 【清理项目】
 * - 取消未完成的渲染任务
 * - 销毁 PDF 文档对象
 * - 清理缓存的对象
 * - 清除定时器
 */
function cleanup() {
  // 清除防抖定时器
  if (renderTimer) {
    clearTimeout(renderTimer);
    renderTimer = null;
  }
  
  // 取消渲染任务
  cancelRenderTask();
  
  // 销毁 PDF 文档
  if (pdfDoc) {
    pdfDoc.destroy();
    pdfDoc = null;
  }
  
  // 清理缓存的 Canvas context
  canvasContext = null;
  
  // 清理测量容器
  if (measureContainer && measureContainer.parentNode) {
    measureContainer.parentNode.removeChild(measureContainer);
    measureContainer = null;
  }
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
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 8px);
  position: relative;
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
  padding-top: calc(var(--spacing-lg) + 8px);
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

/* PDF 页面容器 */
.pdf-page-wrapper {
  position: relative;
  display: inline-block;
  box-shadow: var(--shadow-lg);
  
  /* 性能优化：启用 GPU 加速 */
  will-change: transform;
  transform: translateZ(0);
  
  /* 性能优化：限制渲染范围 */
  contain: layout style paint;
}

canvas {
  display: block;
  background-color: white;
  
  /* 性能优化：提示浏览器这是图像内容 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* ==================== 文本层样式（核心：实现文字选择和复制） ==================== */
.textLayer {
  /* 覆盖整个 Canvas */
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  
  /* 图层顺序：在 Canvas 上方，在注释层下方 */
  z-index: 2;
  
  /* 允许用户选择文本 */
  user-select: text;
  pointer-events: auto;  /* 接收鼠标事件 */
  
  /* 文本渲染优化 */
  opacity: 1;
  line-height: 1;
  text-size-adjust: none;         /* 禁止移动端自动调整字体大小 */
  forced-color-adjust: none;      /* 禁止强制颜色调整 */
  transform-origin: 0 0;
  caret-color: CanvasText;
  
  /* 性能优化 */
  will-change: contents;          /* 提示内容会变化 */
  contain: layout style;          /* 限制渲染影响范围 */
}

.textLayer :deep(span),
.textLayer :deep(br) {
  /* 基础定位 */
  position: absolute;
  display: inline-block;
  
  /* 【关键】透明文字：让 Canvas 的文字显示，但 span 依然可以被选中 */
  color: transparent;
  
  /* 文本选择 */
  cursor: text;
  user-select: text;
  pointer-events: auto;
  
  /* 【重要】缩放基点：左下角
   * 确保使用 scaleX 缩放时，文本从左边开始缩放，不会偏移 */
  transform-origin: left bottom;
  
  /* 文本格式 */
  white-space: pre;               /* 保留空格和换行 */
  overflow: visible;              /* 防止缩放后文本被裁剪 */
  
  /* 字体渲染优化 */
  -webkit-font-smoothing: antialiased;      /* 抗锯齿（更清晰） */
  -moz-osx-font-smoothing: grayscale;       /* macOS 优化 */
}

/* 选中文本时的高亮效果 */
.textLayer :deep(span)::selection {
  background: rgba(0, 100, 255, 0.3);  /* 蓝色半透明背景 */
  color: transparent;                  /* 保持文字透明 */
}


/* ==================== 注释层样式（实现链接点击） ==================== */
.annotationLayer {
  position: absolute;
  top: 0;
  left: 0;
  
  /* 【最高图层】在文本层上方，确保链接优先响应点击 */
  z-index: 3;
  
  /* 【关键】默认不接收事件，让下层的文本可以被选择
   * 只有链接区域（section）才接收事件 */
  pointer-events: none;
  
  /* 性能优化 */
  will-change: contents;          /* 提示内容会变化 */
  contain: layout style;          /* 限制渲染影响范围 */
}

.annotationLayer :deep(section) {
  position: absolute;
  text-align: initial;
  
  /* 【重要】只有 section 内部接收点击事件
   * 这样链接区域可点击，其他区域可以选择文字 */
  pointer-events: auto;
}

/* 链接样式 */
.annotationLayer :deep(.linkAnnotation > a) {
  /* 填充整个链接区域 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  font-size: 1em;
  text-decoration: none;  /* 去掉下划线 */
}

/* 链接悬停效果 */
.annotationLayer :deep(.linkAnnotation > a:hover) {
  opacity: 0.2;                           /* 半透明 */
  background: rgba(255, 255, 0, 0.3);     /* 黄色高亮 */
  box-shadow: 0 2px 10px rgba(255, 255, 0, 0.5);  /* 外发光 */
}
</style>


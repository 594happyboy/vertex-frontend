<template>
  <div class="editor-test-view">
    <div class="test-container">
      <div class="test-header">
        <div class="header-top">
          <button @click="goBack" class="btn-back" title="返回">
            ← 返回
          </button>
        </div>
        <h1>富文本编辑器测试页面</h1>
        <p class="subtitle">基于 Tiptap 实现的富文本编辑器 + 移动端优化</p>
      </div>

      <!-- 设备信息 -->
      <div class="device-info">
        <div class="info-card" :class="{ 'is-mobile': isMobile }">
          <div class="info-icon">{{ isMobile ? '📱' : '🖥️' }}</div>
          <div class="info-content">
            <div class="info-label">当前设备</div>
            <div class="info-value">{{ isMobile ? '移动端' : '桌面端' }}</div>
            <div class="info-hint">{{ windowWidth }}px</div>
          </div>
        </div>
        
        <div v-if="isKeyboardVisible" class="info-card keyboard-info">
          <div class="info-icon">⌨️</div>
          <div class="info-content">
            <div class="info-label">虚拟键盘</div>
            <div class="info-value">已弹出</div>
            <div class="info-hint">高度: {{ keyboardHeight }}px</div>
          </div>
        </div>
      </div>

      <div class="test-content">
        <!-- 编辑器区域 -->
        <div class="editor-section">
          <div class="section-header">
            <h2>编辑器</h2>
            <div class="actions">
              <button @click="loadSample" class="btn btn-secondary">加载示例</button>
              <button @click="clearEditor" class="btn btn-secondary">清空</button>
              <button @click="toggleStats" class="btn btn-secondary">
                {{ showStats ? '隐藏' : '显示' }}统计
              </button>
              <button @click="togglePreview" class="btn btn-primary">
                {{ showPreview ? '隐藏' : '显示' }}预览
              </button>
            </div>
          </div>
          
          <RichTextEditor
            ref="editorRef"
            v-model="content"
            :placeholder="placeholder"
            :show-stats="showStats"
            :editable="true"
          />
        </div>

        <!-- 预览区域 -->
        <div v-if="showPreview" class="preview-section">
          <div class="section-header">
            <h2>HTML 预览</h2>
            <button @click="copyHTML" class="btn btn-secondary">复制 HTML</button>
          </div>
          
          <div class="preview-tabs">
            <button
              @click="activeTab = 'rendered'"
              :class="{ active: activeTab === 'rendered' }"
              class="tab-btn"
            >
              渲染结果
            </button>
            <button
              @click="activeTab = 'html'"
              :class="{ active: activeTab === 'html' }"
              class="tab-btn"
            >
              HTML 源码
            </button>
            <button
              @click="activeTab = 'json'"
              :class="{ active: activeTab === 'json' }"
              class="tab-btn"
            >
              JSON 数据
            </button>
          </div>

          <div class="preview-content">
            <!-- 渲染结果 -->
            <div v-if="activeTab === 'rendered'" class="rendered-content" v-html="content"></div>
            
            <!-- HTML 源码 -->
            <pre v-if="activeTab === 'html'" class="code-content"><code>{{ content }}</code></pre>
            
            <!-- JSON 数据 -->
            <pre v-if="activeTab === 'json'" class="code-content"><code>{{ jsonContent }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 功能说明 -->
      <div class="features-section">
        <h2>支持的功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>📝 文本格式</h3>
            <ul>
              <li>加粗（Ctrl+B）</li>
              <li>斜体（Ctrl+I）</li>
              <li>下划线（Ctrl+U）</li>
              <li>删除线</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>📋 段落样式</h3>
            <ul>
              <li>标题（H1-H3）</li>
              <li>段落对齐</li>
              <li>引用块</li>
              <li>代码块</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>📑 列表</h3>
            <ul>
              <li>无序列表</li>
              <li>有序列表</li>
              <li>嵌套列表</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>🖼️ 媒体插入</h3>
            <ul>
              <li>插入链接</li>
              <li>插入图片（URL/本地）</li>
              <li>支持Base64</li>
              <li>图片大小限制5MB</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>🔧 其他功能</h3>
            <ul>
              <li>分隔线</li>
              <li>撤销/重做</li>
              <li>清除格式</li>
              <li>字数统计</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="tips-section">
        <h2>💡 使用提示</h2>
        <div class="tips-content">
          <p><strong>快捷键：</strong></p>
          <ul>
            <li><kbd>Ctrl+B</kbd> / <kbd>Cmd+B</kbd> - 加粗</li>
            <li><kbd>Ctrl+I</kbd> / <kbd>Cmd+I</kbd> - 斜体</li>
            <li><kbd>Ctrl+U</kbd> / <kbd>Cmd+U</kbd> - 下划线</li>
            <li><kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd> - 撤销</li>
            <li><kbd>Ctrl+Y</kbd> / <kbd>Cmd+Shift+Z</kbd> - 重做</li>
          </ul>
          
          <p><strong>特殊功能：</strong></p>
          <ul>
            <li>输入 <code>---</code> 后按回车可插入分隔线</li>
            <li>在列表中按 <kbd>Tab</kbd> 可增加缩进</li>
            <li>选中文本后点击链接按钮可添加超链接</li>
            <li>点击图片按钮可选择输入URL或上传本地图片</li>
            <li>选中图片按 <kbd>Delete</kbd> 可删除图片</li>
            <li>粘贴内容时会自动清理不必要的格式</li>
          </ul>

          <p><strong>移动端优化：</strong></p>
          <ul>
            <li><strong>气泡菜单</strong>：选中文本时自动弹出快捷工具栏</li>
            <li><strong>浮动菜单</strong>：空行时显示 + 按钮快速插入内容</li>
            <li><strong>触摸友好</strong>：按钮最小 48x48px，符合触摸标准</li>
            <li><strong>虚拟键盘适配</strong>：自动调整编辑器位置，避免遮挡</li>
            <li><strong>响应式工具栏</strong>：移动端折叠设计，节省空间</li>
            <li><strong>自定义对话框</strong>：美观的链接和图片插入界面</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import RichTextEditor from '../components/shared/RichTextEditor.vue';
import { useResponsive } from '@/composables';
import { useVirtualKeyboard } from '../composables/useVirtualKeyboard';

// 路由
const router = useRouter();

// 响应式和虚拟键盘检测
const { isMobile, windowWidth } = useResponsive();
const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboard();

// 返回上一页
const goBack = () => {
  router.push('/me');
};

const editorRef = ref(null);
const content = ref('');
const placeholder = ref('开始输入你的内容...');
const showStats = ref(true);
const showPreview = ref(true);
const activeTab = ref('rendered');

// JSON 格式的内容
const jsonContent = computed(() => {
  if (editorRef.value?.editor) {
    return JSON.stringify(editorRef.value.editor.getJSON(), null, 2);
  }
  return '';
});

// 加载示例内容
const loadSample = () => {
  const sampleContent = `
    <h1>欢迎使用富文本编辑器</h1>
    <p>这是一个基于 <strong>Tiptap</strong> 实现的现代化富文本编辑器。</p>
    
    <h2>主要特性</h2>
    <ul>
      <li>完全基于 Vue 3 开发</li>
      <li>支持丰富的文本格式</li>
      <li>优秀的浏览器兼容性</li>
      <li>高度可定制化</li>
    </ul>
    
    <h2>代码示例</h2>
    <pre><code>// 这是一个代码块示例
const greeting = 'Hello, World!';
console.log(greeting);</code></pre>
    
    <h2>引用块</h2>
    <blockquote>
      <p>生活就像一盒巧克力，你永远不知道下一颗是什么味道。</p>
    </blockquote>
    
    <h3>有序列表</h3>
    <ol>
      <li>第一步：安装依赖</li>
      <li>第二步：配置编辑器</li>
      <li>第三步：开始使用</li>
    </ol>
    
    <hr>
    
    <p style="text-align: center;">
      <a href="https://tiptap.dev" target="_blank">访问 Tiptap 官网</a>
    </p>
  `;
  
  content.value = sampleContent;
};

// 清空编辑器
const clearEditor = () => {
  if (confirm('确定要清空编辑器内容吗？')) {
    content.value = '';
    editorRef.value?.clear();
  }
};

// 切换统计显示
const toggleStats = () => {
  showStats.value = !showStats.value;
};

// 切换预览显示
const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

// 复制 HTML
const copyHTML = async () => {
  try {
    await navigator.clipboard.writeText(content.value);
    alert('HTML 已复制到剪贴板！');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  }
};

// 初始化时加载示例
// loadSample();
</script>

<style scoped>
.editor-test-view {
  /* 独立页面容器，可完整滚动 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg, #f9fafb);
  padding: 24px;
}

.test-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 60px; /* 底部留白，确保内容可以完整滚动查看 */
}

.test-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  background: var(--color-bg, #ffffff);
  color: var(--color-text, #374151);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--color-bg-hover, #f3f4f6);
  border-color: var(--color-primary, #3b82f6);
  color: var(--color-primary, #3b82f6);
}

.test-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text, #111827);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary, #6b7280);
}

.device-info {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.info-card.is-mobile {
  border-color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

.info-card.keyboard-info {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.info-icon {
  font-size: 32px;
  line-height: 1;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: var(--color-text-secondary, #9ca3af);
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text, #111827);
}

.info-hint {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 2px;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

@media (min-width: 1024px) {
  .test-content {
    grid-template-columns: 1fr 1fr;
  }
}

.editor-section,
.preview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  margin: 0;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark, #2563eb);
}

.btn-secondary {
  background: var(--color-bg-secondary, #e5e7eb);
  color: var(--color-text, #374151);
}

.btn-secondary:hover {
  background: var(--color-bg-hover, #d1d5db);
}

.preview-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--color-border, #e5e7eb);
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-text, #111827);
}

.tab-btn.active {
  color: var(--color-primary, #3b82f6);
  border-bottom-color: var(--color-primary, #3b82f6);
}

.preview-content {
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}

.rendered-content {
  padding: 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  background: var(--color-bg, #ffffff);
  white-space: pre-wrap; /* 保留空格和换行 */
  word-wrap: break-word; /* 长单词换行 */
}

.rendered-content :deep(h1),
.rendered-content :deep(h2),
.rendered-content :deep(h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.rendered-content :deep(h1) {
  font-size: 2em;
}

.rendered-content :deep(h2) {
  font-size: 1.5em;
}

.rendered-content :deep(h3) {
  font-size: 1.17em;
}

.rendered-content :deep(p) {
  margin: 0.75em 0;
  line-height: 1.6;
  min-height: 1.6em; /* 确保空段落也有高度 */
}

/* 确保空段落显示 */
.rendered-content :deep(p:empty)::before {
  content: '\00a0'; /* 不间断空格，确保空段落有高度 */
  display: inline-block;
}

.rendered-content :deep(ul),
.rendered-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.75em 0;
  list-style-position: outside;
}

.rendered-content :deep(ul) {
  list-style-type: disc;
}

.rendered-content :deep(ol) {
  list-style-type: decimal;
}

.rendered-content :deep(li) {
  display: list-item;
  margin: 0.25em 0;
}

.rendered-content :deep(ul ul) {
  list-style-type: circle;
}

.rendered-content :deep(ul ul ul) {
  list-style-type: square;
}

.rendered-content :deep(code) {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.rendered-content :deep(pre) {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.rendered-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.rendered-content :deep(blockquote) {
  border-left: 3px solid #3b82f6;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
  font-style: italic;
}

.rendered-content :deep(hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2em 0;
}

.rendered-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.rendered-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.5em 0;
  display: block;
}

.code-content {
  padding: 16px;
  background: #1f2937;
  color: #f3f4f6;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
  margin: 0;
}

.code-content code {
  color: inherit;
  background: none;
}

.features-section,
.tips-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.features-section h2,
.tips-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  margin-bottom: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 20px;
  background: var(--color-bg, #f9fafb);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
}

.feature-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  margin-bottom: 12px;
}

.feature-card ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.feature-card li {
  padding: 6px 0;
  color: var(--color-text-secondary, #6b7280);
}

.feature-card li::before {
  content: '✓ ';
  color: var(--color-primary, #3b82f6);
  font-weight: bold;
  margin-right: 8px;
}

.tips-content {
  color: var(--color-text, #374151);
  line-height: 1.6;
}

.tips-content p {
  margin: 16px 0 8px;
}

.tips-content ul {
  margin: 8px 0;
  padding-left: 24px;
  list-style-type: disc;
}

.tips-content li {
  display: list-item;
  margin: 6px 0;
}

.tips-content kbd {
  display: inline-block;
  padding: 2px 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tips-content code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.875em;
  font-family: 'Courier New', monospace;
}

/* 暗色主题支持 */
[data-theme='dark'] .editor-test-view {
  background: #111827;
}

[data-theme='dark'] .test-header h1 {
  color: #f9fafb;
}

[data-theme='dark'] .editor-section,
[data-theme='dark'] .preview-section,
[data-theme='dark'] .features-section,
[data-theme='dark'] .tips-section {
  background: #1f2937;
}

[data-theme='dark'] .section-header h2,
[data-theme='dark'] .features-section h2,
[data-theme='dark'] .tips-section h2,
[data-theme='dark'] .feature-card h3 {
  color: #f9fafb;
}

[data-theme='dark'] .btn-secondary {
  background: #374151;
  color: #d1d5db;
}

[data-theme='dark'] .btn-secondary:hover {
  background: #4b5563;
}

[data-theme='dark'] .rendered-content {
  background: #111827;
  border-color: #374151;
}

[data-theme='dark'] .feature-card {
  background: #111827;
  border-color: #374151;
}

[data-theme='dark'] .tips-content kbd {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

[data-theme='dark'] .tips-content code {
  background: #374151;
  color: #e5e7eb;
}
</style>


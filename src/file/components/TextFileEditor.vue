<template>
  <div v-if="show" class="text-editor-overlay" @click.self="handleClose">
    <div class="text-editor-dialog" :class="{ fullscreen: isFullscreen }">
      <!-- 头部 -->
      <div class="editor-header">
        <div class="header-left">
          <Icon :icon="fileIcon" class="file-type-icon" />
          <div class="file-info">
            <h3 class="file-name">{{ file?.name || '未命名' }}</h3>
            <span class="file-type">{{ fileTypeDisplay }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            class="header-btn" 
            @click="toggleFullscreen" 
            :title="isFullscreen ? '退出全屏' : '全屏'"
          >
            <Icon :icon="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" />
          </button>
          <button class="header-btn" @click="handleClose" title="关闭">
            <Icon icon="mdi:close" />
          </button>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div class="editor-body">
        <!-- 加载状态 -->
        <div v-if="loading" class="editor-loading">
          <Icon icon="mdi:loading" class="spin" />
          <span>加载中...</span>
        </div>

        <!-- 文件过大警告 -->
        <div v-else-if="fileSizeWarning" class="editor-warning">
          <Icon icon="mdi:alert" />
          <span>{{ fileSizeWarning }}</span>
        </div>

        <!-- 编辑器 -->
        <div v-show="!loading" class="editor-container">
          <textarea
            ref="textareaRef"
            v-model="content"
            class="editor-textarea"
            :class="{ 'with-highlight': enableHighlight }"
            @input="handleContentChange"
            @scroll="handleScroll"
            spellcheck="false"
          ></textarea>

          <!-- 语法高亮层 -->
          <pre 
            v-if="enableHighlight" 
            ref="highlightRef"
            class="editor-highlight"
            aria-hidden="true"
          ><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="editor-footer">
        <div class="footer-left">
          <span class="status-text">
            <Icon icon="mdi:text" />
            {{ contentStats }}
          </span>
          <span v-if="hasChanges" class="status-text modified">
            <Icon icon="mdi:circle" />
            未保存
          </span>
        </div>
        <div class="footer-actions">
          <button class="footer-btn" @click="handleClose">
            <Icon icon="mdi:close" />
            取消
          </button>
          <button 
            class="footer-btn primary" 
            @click="handleSave" 
            :disabled="saving || !hasChanges"
          >
            <Icon :icon="saving ? 'mdi:loading' : 'mdi:content-save'" :class="{ spin: saving }" />
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 使用 GitHub 风格主题
import { 
  getFileLanguage, 
  getFileTypeDisplayName, 
  isFileTooLarge,
  getFileSizeWarning,
} from '../utils/fileTypes';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  file: {
    type: Object,
    default: null,
  },
  initialContent: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'save']);

// 状态
const content = ref('');
const originalContent = ref('');
const loading = ref(false);
const saving = ref(false);
const isFullscreen = ref(false);
const enableHighlight = ref(true);

// DOM 引用
const textareaRef = ref(null);
const highlightRef = ref(null);

// 计算属性
const language = computed(() => {
  return getFileLanguage(props.file?.extension || '');
});

const fileTypeDisplay = computed(() => {
  return getFileTypeDisplayName(props.file?.extension || '');
});

const fileIcon = computed(() => {
  const ext = props.file?.extension?.toLowerCase() || '';
  
  if (['json'].includes(ext)) return 'mdi:code-json';
  if (['xml'].includes(ext)) return 'mdi:xml';
  if (['html', 'htm'].includes(ext)) return 'mdi:language-html5';
  if (['css', 'scss', 'sass'].includes(ext)) return 'mdi:language-css3';
  if (['js', 'ts'].includes(ext)) return 'mdi:language-javascript';
  if (['vue'].includes(ext)) return 'mdi:vuejs';
  if (['md', 'markdown'].includes(ext)) return 'mdi:language-markdown';
  if (['py'].includes(ext)) return 'mdi:language-python';
  if (['java'].includes(ext)) return 'mdi:language-java';
  
  return 'mdi:file-document-edit';
});

const hasChanges = computed(() => {
  return content.value !== originalContent.value;
});

const contentStats = computed(() => {
  const lines = content.value.split('\n').length;
  const chars = content.value.length;
  return `${lines} 行，${chars} 个字符`;
});

const fileSizeWarning = computed(() => {
  if (props.file && isFileTooLarge(props.file.size)) {
    return getFileSizeWarning(props.file.size);
  }
  return null;
});

const highlightedCode = computed(() => {
  if (!enableHighlight.value || !content.value) {
    return '';
  }
  
  try {
    if (language.value === 'plaintext') {
      return escapeHtml(content.value);
    }
    const result = hljs.highlight(content.value, { language: language.value });
    return result.value;
  } catch (error) {
    console.warn('语法高亮失败:', error);
    return escapeHtml(content.value);
  }
});

// 监听显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadContent();
  }
});

// 监听初始内容
watch(() => props.initialContent, (newVal) => {
  if (props.show && newVal !== undefined) {
    content.value = newVal;
    originalContent.value = newVal;
  }
});

// 方法
async function loadContent() {
  content.value = props.initialContent || '';
  originalContent.value = props.initialContent || '';
  
  // 聚焦到编辑器
  await nextTick();
  textareaRef.value?.focus();
}

function handleContentChange() {
  // 同步滚动
  syncScroll();
}

function handleScroll() {
  syncScroll();
}

function syncScroll() {
  if (enableHighlight.value && textareaRef.value && highlightRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop;
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft;
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

function handleClose() {
  if (hasChanges.value) {
    if (!confirm('您有未保存的更改，确定要关闭吗？')) {
      return;
    }
  }
  emit('close');
}

async function handleSave() {
  if (saving.value || !hasChanges.value) {
    return;
  }
  
  saving.value = true;
  try {
    await emit('save', {
      id: props.file.id,
      content: content.value,
      fileName: props.file.name,
    });
    
    // 保存成功后更新原始内容
    originalContent.value = content.value;
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    saving.value = false;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
</script>

<style scoped>
.text-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.text-editor-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.text-editor-dialog.fullscreen {
  width: 100%;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 头部 ========== */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.3);
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.05), rgba(33, 181, 255, 0.05));
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.file-type-icon {
  font-size: 32px;
  color: #6076ff;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f256a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-type {
  font-size: 12px;
  color: rgba(47, 59, 128, 0.6);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(47, 59, 128, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: rgba(96, 118, 255, 0.1);
  color: #6076ff;
}

.header-btn :deep(svg) {
  font-size: 20px;
}

/* ========== 主体 ========== */
.editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.editor-loading,
.editor-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  color: rgba(47, 59, 128, 0.6);
  font-size: 14px;
}

.editor-warning {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.editor-warning :deep(svg) {
  font-size: 24px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.editor-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.editor-textarea,
.editor-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  margin: 0;
  border: none;
  outline: none;
  font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow: auto;
  resize: none;
  tab-size: 2;
  white-space: pre;
}

.editor-textarea {
  background: transparent;
  color: #1f256a;
  caret-color: #6076ff;
  z-index: 2;
}

.editor-textarea.with-highlight {
  color: transparent;
  caret-color: #1f256a;
}

.editor-highlight {
  background: white;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.editor-highlight code {
  display: block;
  padding: 0;
  margin: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
}

/* 滚动条样式 */
.editor-textarea::-webkit-scrollbar,
.editor-highlight::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.editor-textarea::-webkit-scrollbar-track,
.editor-highlight::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
}

.editor-textarea::-webkit-scrollbar-thumb,
.editor-highlight::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 6px;
}

.editor-textarea::-webkit-scrollbar-thumb:hover,
.editor-highlight::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}

/* ========== 底部 ========== */
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid rgba(200, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.98);
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(47, 59, 128, 0.6);
}

.status-text :deep(svg) {
  font-size: 16px;
}

.status-text.modified {
  color: #ff9800;
}

.status-text.modified :deep(svg) {
  font-size: 8px;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 8px;
  background: white;
  color: #1f256a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn:hover:not(:disabled) {
  border-color: rgba(96, 118, 255, 0.7);
  background: rgba(96, 118, 255, 0.08);
}

.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.footer-btn.primary {
  background: linear-gradient(135deg, #6076ff 0%, #4c63ff 100%);
  border-color: transparent;
  color: white;
  font-weight: 600;
}

.footer-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4c63ff 0%, #3a54f5 100%);
  box-shadow: 0 4px 12px rgba(96, 118, 255, 0.3);
}

.footer-btn :deep(svg) {
  font-size: 18px;
}

/* 响应式 */
@media (max-width: 768px) {
  .text-editor-dialog {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .editor-textarea,
  .editor-highlight {
    padding: 16px;
    font-size: 13px;
  }

  .footer-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>


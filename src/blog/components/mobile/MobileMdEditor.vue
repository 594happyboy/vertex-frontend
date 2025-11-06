<template>
  <div class="mobile-md-editor">
    <!-- 顶部头部 -->
    <div class="mobile-editor-header">
      <button class="header-btn" @click="handleBack">
        <Icon icon="mdi:arrow-left" />
      </button>

      <div class="header-title-area">
        <h1 class="header-title">{{ title }}</h1>
        <span class="save-status" :class="`status-${saveStatus}`">
          {{ saveStatusText }}
        </span>
      </div>

      <button 
        v-if="canEdit"
        class="header-btn header-btn-mode" 
        @click="toggleMode"
      >
        <Icon :icon="isEditing ? 'mdi:eye' : 'mdi:pencil'" />
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="editor-content-area">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="editor-wrapper">
        <textarea
          ref="textareaRef"
          v-model="localContent"
          class="editor-textarea"
          placeholder="开始编写你的文档..."
          @input="handleInput"
        ></textarea>
      </div>

      <!-- 查看模式 -->
      <div v-else class="viewer-wrapper">
        <div class="viewer-content">
          <div class="markdown-body" v-html="renderedContent"></div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏（仅编辑模式显示） -->
    <div v-if="isEditing" class="mobile-bottom-toolbar">
      <div class="toolbar-scroll">
        <template v-for="(item, index) in toolbarButtons" :key="index">
          <div v-if="item.type === 'divider'" class="toolbar-divider"></div>
          <button 
            v-else
            class="toolbar-btn" 
            @click="insertFormat(item.format)" 
            :title="item.title"
          >
            <Icon v-if="item.icon" :icon="item.icon" />
            <span v-else class="btn-text" :class="item.class">{{ item.text }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../../stores/doc';
import { useMarkdownRenderer } from '../../composables/markdown';

// ==================== 配置 ====================
const SAVE_STATUS_MAP = {
  saving: '保存中...',
  saved: '已保存',
  pending: '未保存',
  error: '保存失败',
};

const FORMAT_CONFIG = {
  bold: { wrap: '**', offset: 2 },
  italic: { wrap: '*', offset: 1 },
  strikethrough: { wrap: '~~', offset: 2 },
  code: { wrap: '`', offset: 1 },
  h1: { prefix: '# ', offset: 2 },
  h2: { prefix: '## ', offset: 3 },
  h3: { prefix: '### ', offset: 4 },
  ul: { prefix: '- ', offset: 2 },
  ol: { prefix: '1. ', offset: 3 },
  task: { prefix: '- [ ] ', offset: 6 },
  quote: { prefix: '> ', offset: 2 },
  codeblock: { text: '```\n\n```', offset: 4 },
  link: { text: '[](url)', selectedText: '[{text}](url)', offsetFromEnd: 4, offsetWithText: 4 },
  image: { text: '![](url)', offset: 4 },
};

const toolbarButtons = [
  { format: 'bold', text: 'B', title: '加粗' },
  { format: 'italic', text: 'I', class: 'italic', title: '斜体' },
  { format: 'strikethrough', text: 'S', class: 'strike', title: '删除线' },
  { format: 'code', icon: 'mdi:code-tags', title: '行内代码' },
  { type: 'divider' },
  { format: 'h1', text: 'H1', title: '一级标题' },
  { format: 'h2', text: 'H2', title: '二级标题' },
  { format: 'h3', text: 'H3', title: '三级标题' },
  { type: 'divider' },
  { format: 'ul', icon: 'mdi:format-list-bulleted', title: '无序列表' },
  { format: 'ol', icon: 'mdi:format-list-numbered', title: '有序列表' },
  { format: 'task', icon: 'mdi:checkbox-marked-outline', title: '任务列表' },
  { type: 'divider' },
  { format: 'quote', icon: 'mdi:format-quote-close', title: '引用' },
  { format: 'codeblock', icon: 'mdi:code-braces-box', title: '代码块' },
  { format: 'link', icon: 'mdi:link-variant', title: '链接' },
  { format: 'image', icon: 'mdi:image-plus', title: '图片' },
];

// ==================== 初始化 ====================
const router = useRouter();
const docStore = useDocStore();
const { render } = useMarkdownRenderer();

// ==================== 响应式状态 ====================
const textareaRef = ref(null);
const localContent = ref('');

// ==================== 计算属性 ====================
const title = computed(() => docStore.currentDoc?.title || '未命名文档');
const saveStatus = computed(() => docStore.syncStatus);
const canEdit = computed(() => docStore.canEdit);
const isEditing = computed(() => docStore.isEditing);
const saveStatusText = computed(() => SAVE_STATUS_MAP[saveStatus.value] || '已保存');
const renderedContent = computed(() => render(localContent.value || ''));

// ==================== 事件处理 ====================
const handleInput = () => docStore.updateContent(localContent.value);

const handleBack = () => {
  if (docStore.dirty && !confirm('有未保存的修改，确定要离开吗？')) {
    return;
  }
  router.push('/me');
};

const toggleMode = () => {
  if (docStore.dirty && !confirm('有未保存的修改，是否继续？')) return;
  docStore.setMode(isEditing.value ? 'view' : 'edit');
};

// ==================== 格式化插入 ====================
const insertFormat = (format) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const config = FORMAT_CONFIG[format];
  if (!config) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const content = localContent.value || '';
  const selectedText = content.substring(start, end);

  const before = content.substring(0, start);
  const after = content.substring(end);
  
  let insertText = '';
  let cursorOffset = 0;

  if (config.wrap) {
    // 包裹类型（加粗、斜体等）
    insertText = selectedText ? `${config.wrap}${selectedText}${config.wrap}` : config.wrap.repeat(2);
    cursorOffset = selectedText ? insertText.length : config.offset;
  } else if (config.prefix) {
    // 前缀类型（标题、列表等）
    insertText = config.prefix;
    cursorOffset = config.offset;
  } else if (config.text) {
    // 自定义文本类型（链接、图片、代码块）
    if (format === 'link' && selectedText) {
      insertText = config.selectedText.replace('{text}', selectedText);
      cursorOffset = insertText.length - config.offsetWithText;
    } else {
      insertText = config.text;
      cursorOffset = config.offset;
    }
  }

  localContent.value = before + insertText + after;
  docStore.updateContent(localContent.value);

  setTimeout(() => {
    const newPosition = start + cursorOffset;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  }, 0);
};

// ==================== 生命周期 ====================
onMounted(() => {
  localContent.value = docStore.content || '';
});

// ==================== 监听器 ====================
watch(
  () => docStore.content,
  (newContent) => {
    if (newContent !== localContent.value) {
      localContent.value = newContent;
    }
  }
);
</script>

<style scoped>
.mobile-md-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  z-index: 100;
  overflow: hidden;
}

/* ========== 头部样式 ========== */
.mobile-editor-header {
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

.header-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
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

.save-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.save-status.status-saving {
  color: rgba(255, 200, 100, 1);
}

.save-status.status-error {
  color: rgba(255, 100, 100, 1);
}

.save-status.status-saved {
  color: rgba(150, 255, 150, 1);
}

.header-btn-mode {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
}

/* ========== 内容区域样式 ========== */
.editor-content-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-wrapper,
.viewer-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  resize: none;
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.viewer-wrapper {
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

.viewer-content {
  padding: 16px;
}

/* ========== 底部工具栏样式 ========== */
.mobile-bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 50;
}

.toolbar-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px 0;
}

.toolbar-scroll::-webkit-scrollbar {
  display: none;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.toolbar-btn:active {
  background: var(--color-bg-hover);
  transform: scale(0.95);
}

.toolbar-btn .btn-text {
  font-size: 16px;
  font-weight: 700;
}

.toolbar-btn .btn-text.italic {
  font-style: italic;
}

.toolbar-btn .btn-text.strike {
  text-decoration: line-through;
}

.toolbar-btn :deep(svg) {
  font-size: 22px;
}

.toolbar-divider {
  width: 1px;
  height: 48px;
  background: var(--color-border);
  flex-shrink: 0;
  margin: 0 4px;
}
</style>


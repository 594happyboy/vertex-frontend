<template>
  <div class="md-editor">
    <!-- 移动端标签页切换 -->
    <div class="editor-tabs">
      <button
        class="editor-tab"
        :class="{ 'is-active': activeTab === 'edit' }"
        @click="activeTab = 'edit'"
      >
        <Icon icon="mdi:pencil" />
        <span>编辑</span>
      </button>
      <button
        class="editor-tab"
        :class="{ 'is-active': activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        <Icon icon="mdi:eye" />
        <span>预览</span>
      </button>
    </div>

    <div class="editor-pane" :class="{ 'is-hidden': activeTab === 'preview' }">
      <!-- 编辑器工具栏 -->
      <MdEditorToolbar 
        :content="localContent"
        :selection-length="selectionLength"
        @insert-text="insertText" 
        @wrap-text="wrapText"
        @format-action="handleFormatAction"
      />
      
      <textarea
        ref="textareaRef"
        v-model="localContent"
        class="editor-textarea"
        placeholder="开始编写你的文档..."
        @input="handleInput"
        @keydown="handleKeydown"
        @select="handleSelection"
      ></textarea>
    </div>

    <div class="preview-pane" :class="{ 'is-hidden': activeTab === 'edit' }">
      <div class="preview-header">
        <span>预览</span>
      </div>
      <div class="preview-content">
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useDocStore } from '../../stores/doc';
import { useMarkdownRenderer } from '../../composables/markdown';
import MdEditorToolbar from '../markdown/MdEditorToolbar.vue';
import { KEYBOARD_SHORTCUTS } from '../../constants';
import { 
  countSelectedWords,
  ensureNewlines,
  isLineStart,
  getLineStart
} from '../../utils/markdownHelpers';

const { isMobile } = useResponsive();
const docStore = useDocStore();

// 使用 Markdown 渲染器 composable（带 shallowRef 优化）
const { render } = useMarkdownRenderer();

const localContent = ref('');
const activeTab = ref('edit'); // 移动端标签页状态：edit 或 preview
const textareaRef = ref(null); // textarea DOM 引用
const selectionLength = ref(0); // 选中文字数量

// 渲染预览内容
const renderedContent = computed(() => {
  return render(localContent.value || '');
});

// 初始化内容
onMounted(() => {
  localContent.value = docStore.content || '';
});

// 监听 store 中的内容变化（同步外部变化到编辑器）
watch(
  () => docStore.content,
  (newContent) => {
    if (newContent !== localContent.value) {
      localContent.value = newContent;
    }
  }
);

// 输入处理（直接调用 store 的 updateContent，防抖由 store 层面统一处理）
function handleInput() {
  docStore.updateContent(localContent.value);
}

// 选择文本处理（更新选中字数）
function handleSelection(event) {
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  if (start !== end) {
    const selectedText = localContent.value.substring(start, end);
    selectionLength.value = countSelectedWords(selectedText);
  } else {
    selectionLength.value = 0;
  }
}

// 在光标位置插入文本
function insertText(text) {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const content = localContent.value || '';

  // 在光标位置插入文本
  const before = content.substring(0, start);
  const after = content.substring(end);
  
  // 确保图片前后有换行
  const insertedText = ensureNewlines(text, content, start, end);
  
  localContent.value = before + insertedText + after;

  // 更新到 store
  docStore.updateContent(localContent.value);

  // 延迟设置光标位置（等待 DOM 更新）
  setTimeout(() => {
    const newPosition = start + insertedText.length;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  }, 0);
}

// 包裹选中文本或插入语法
function wrapText(prefix, suffix = prefix, multiline = false, options = {}) {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const content = localContent.value || '';
  const selectedText = content.substring(start, end);

  let newText;
  let cursorOffset = 0;

  if (selectedText) {
    // 有选中文本，包裹它
    newText = prefix + selectedText + suffix;
    cursorOffset = newText.length;
  } else {
    // 没有选中文本，插入模板
    newText = prefix + suffix;
    // 光标定位到中间
    cursorOffset = prefix.length;
  }

  // 如果有自定义光标偏移
  if (options.moveCursor !== undefined) {
    cursorOffset = newText.length + options.moveCursor;
  }

  // 特殊处理：代码块需要新开一行
  if (multiline && prefix.includes('```')) {
    // 检查当前行是否有内容
    if (!isLineStart(content, start)) {
      newText = '\n' + newText;
      cursorOffset += 1; // 调整光标位置
    }
    
    // 代码块后面也确保有换行
    if (start < content.length && content[start] !== '\n') {
      newText = newText + '\n';
    }
  }

  const before = content.substring(0, start);
  const after = content.substring(end);
  
  localContent.value = before + newText + after;
  docStore.updateContent(localContent.value);

  setTimeout(() => {
    const newPosition = start + cursorOffset;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  }, 0);
}

// 处理格式化操作（标题、列表等）
function handleFormatAction(action) {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const content = localContent.value || '';

  if (action.type === 'heading') {
    handleHeadingAction(textarea, content, start, action);
  } else if (action.type === 'list') {
    handleListAction(textarea, content, start, end, action);
  }
}

// 处理标题格式化
function handleHeadingAction(textarea, content, start, action) {
  const lineStart = getLineStart(content, start);
  const before = content.substring(0, lineStart);
  const after = content.substring(lineStart);
  
  localContent.value = before + action.prefix + after;
  docStore.updateContent(localContent.value);

  setTimeout(() => {
    const newPosition = lineStart + action.prefix.length;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  }, 0);
}

// 处理列表格式化
function handleListAction(textarea, content, start, end, action) {
  const lines = content.split('\n');
  let lineIndex = content.substring(0, start).split('\n').length - 1;
  const selectedLines = [];
  
  if (start === end) {
    selectedLines.push(lineIndex);
  } else {
    const endLineIndex = content.substring(0, end).split('\n').length - 1;
    for (let i = lineIndex; i <= endLineIndex; i++) {
      selectedLines.push(i);
    }
  }

  // 记录第一行添加前缀前的长度
  const firstLineOldLength = lines[selectedLines[0]].length;

  // 添加列表前缀
  selectedLines.forEach((index, arrayIndex) => {
    if (action.ordered) {
      lines[index] = `${arrayIndex + 1}. ${lines[index]}`;
    } else {
      lines[index] = action.prefix + lines[index];
    }
  });

  localContent.value = lines.join('\n');
  docStore.updateContent(localContent.value);

  setTimeout(() => {
    textarea.focus();
    
    if (start === end) {
      const prefixLength = lines[lineIndex].length - firstLineOldLength;
      const newPosition = start + prefixLength;
      textarea.setSelectionRange(newPosition, newPosition);
    } else {
      let totalPrefixLength = 0;
      selectedLines.forEach((index, arrayIndex) => {
        if (action.ordered) {
          totalPrefixLength += `${arrayIndex + 1}. `.length;
        } else {
          totalPrefixLength += action.prefix.length;
        }
      });
      
      const newEnd = end + totalPrefixLength;
      textarea.setSelectionRange(newEnd, newEnd);
    }
  }, 0);
}

// 快捷键处理
function handleKeydown(event) {
  const { ctrlKey, shiftKey, key } = event;

  // 检查快捷键映射
  const shortcut = Object.entries(KEYBOARD_SHORTCUTS).find(([_, config]) => 
    ctrlKey === config.ctrl && 
    shiftKey === config.shift && 
    key.toLowerCase() === config.key.toLowerCase()
  );

  if (!shortcut) return;

  event.preventDefault();
  const [action] = shortcut;

  // 执行对应的操作
  const actions = {
    BOLD: () => wrapText('**', '**'),
    ITALIC: () => wrapText('*', '*'),
    INLINE_CODE: () => wrapText('`', '`'),
    CODE_BLOCK: () => wrapText('```\n', '\n```', true),
    LINK: () => wrapText('[', '](url)', false, { moveCursor: -4 }),
    UNORDERED_LIST: () => handleFormatAction({ type: 'list', prefix: '- ' }),
    ORDERED_LIST: () => handleFormatAction({ type: 'list', prefix: '1. ', ordered: true }),
    QUOTE: () => handleFormatAction({ type: 'list', prefix: '> ' }),
  };

  actions[action]?.();
}
</script>

<style scoped>
.md-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  height: 100%;
  overflow: hidden;
}

/* 移动端标签页 */
.editor-tabs {
  display: none;
  grid-column: 1 / -1;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
}

.editor-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  min-height: var(--touch-target-min);
}

.editor-tab :deep(svg) {
  font-size: var(--icon-size-md);
}

.editor-tab:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-primary);
}

.editor-tab.is-active {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.editor-tab.is-active :deep(svg) {
  color: var(--color-text-inverse);
}

@media (max-width: 1024px) {
  .md-editor {
    grid-template-columns: 1fr;
  }

  .editor-tabs {
    display: flex;
  }

  .editor-pane.is-hidden,
  .preview-pane.is-hidden {
    display: none;
  }
}

.editor-pane {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: var(--spacing-2xl);
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: var(--font-size-base);
  line-height: 1.75;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  resize: none;
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .editor-textarea {
    padding: var(--spacing-mobile-md);
    font-size: var(--font-size-mobile-md);
  }
}

.preview-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.preview-header {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-primary);
}

@media (max-width: 768px) {
  .preview-header {
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-md);
    font-size: var(--font-size-mobile-sm);
  }
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2xl);
  background-color: var(--color-bg-primary);
}

@media (max-width: 768px) {
  .preview-content {
    padding: var(--spacing-mobile-md);
  }
}
</style>


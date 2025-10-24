<template>
  <div class="md-editor">
    <div class="editor-pane">
      <textarea
        v-model="localContent"
        class="editor-textarea"
        placeholder="开始编写你的文档..."
        @input="handleInput"
      ></textarea>
    </div>

    <div class="preview-pane">
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
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { useDocStore } from '../stores/doc';

const docStore = useDocStore();

const localContent = ref('');

// 配置 markdown-it
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`;
      } catch (e) {
        console.error('Highlight error:', e);
      }
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const renderedContent = computed(() => {
  return md.render(localContent.value || '');
});

// 初始化内容
onMounted(() => {
  localContent.value = docStore.content || '';
});

// 监听 store 中的内容变化
watch(
  () => docStore.content,
  (newContent) => {
    if (newContent !== localContent.value) {
      localContent.value = newContent;
    }
  }
);

// 节流更新（减少频繁更新）
let updateTimer = null;
function handleInput() {
  if (updateTimer) {
    clearTimeout(updateTimer);
  }
  
  updateTimer = setTimeout(() => {
    docStore.updateContent(localContent.value);
  }, 300);
}
</script>

<style scoped>
.md-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  overflow: hidden;
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
  font-family: var(--font-mono);
  font-size: var(--text-base);
  line-height: var(--leading-loose);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  resize: none;
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--color-text-tertiary);
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
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-primary);
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2xl);
  background-color: var(--color-bg-primary);
}
</style>


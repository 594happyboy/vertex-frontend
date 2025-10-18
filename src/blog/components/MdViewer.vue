<template>
  <div class="md-viewer">
    <div class="viewer-content">
      <div class="markdown-body" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { useDocStore } from '../stores/doc';

const docStore = useDocStore();

// 配置 markdown-it
const md = new MarkdownIt({
  html: false, // 禁用 HTML 标签（安全考虑）
  linkify: true, // 自动转换链接
  typographer: true, // 启用排版优化
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
  if (!docStore.currentDoc) return '';
  const content = docStore.content || '';
  return md.render(content);
});

// 处理链接点击（新窗口打开外链）
function handleLinkClick(event) {
  const target = event.target;
  if (target.tagName === 'A' && target.href) {
    const href = target.getAttribute('href');
    // 外部链接在新窗口打开
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      event.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }
}

onMounted(() => {
  const viewer = document.querySelector('.md-viewer');
  if (viewer) {
    viewer.addEventListener('click', handleLinkClick);
  }
});

onUnmounted(() => {
  const viewer = document.querySelector('.md-viewer');
  if (viewer) {
    viewer.removeEventListener('click', handleLinkClick);
  }
});
</script>

<style scoped>
.md-viewer {
  height: 100%;
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

.viewer-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}
</style>


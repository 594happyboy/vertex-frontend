<template>
  <div class="md-viewer">
    <div v-if="loading" class="viewer-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    <div v-else class="viewer-content">
      <div class="markdown-body" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { useDocStore } from '../stores/doc';

const docStore = useDocStore();
const loading = ref(false);

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

// 监听文档变化，显示加载状态
watch(
  () => docStore.currentDoc,
  async (newDoc, oldDoc) => {
    if (newDoc && newDoc.id !== oldDoc?.id) {
      if ((newDoc.type === 'md' || newDoc.type === 'txt') && !docStore.content) {
        loading.value = true;
        // 等待内容加载
        await new Promise(resolve => {
          const unwatch = watch(
            () => docStore.content,
            (content) => {
              if (content) {
                loading.value = false;
                unwatch();
                resolve();
              }
            },
            { immediate: true }
          );
        });
      } else {
        loading.value = false;
      }
    }
  },
  { immediate: true }
);

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

.viewer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>


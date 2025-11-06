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
import { useResponsive } from '@/composables';
import { useDocStore } from '../../stores/doc';
import { useMarkdownRenderer } from '../../composables/markdown';

const { isMobile } = useResponsive();
const docStore = useDocStore();
const loading = ref(false);

// 使用 Markdown 渲染器 composable（带 shallowRef 优化）
const { render } = useMarkdownRenderer();

// 渲染内容
const renderedContent = computed(() => {
  if (!docStore.currentDoc) return '';
  return render(docStore.content || '');
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

@media (max-width: 768px) {
  .viewer-content {
    max-width: 100%;
    padding: var(--spacing-mobile-md);
  }
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

@media (max-width: 768px) {
  .viewer-loading {
    gap: var(--spacing-mobile-sm);
  }
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--border-radius-full);
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .loading-spinner {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>


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
      <textarea
        v-model="localContent"
        class="editor-textarea"
        placeholder="开始编写你的文档..."
        @input="handleInput"
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
import { useDocStore } from '../stores/doc';
import { useMarkdownRenderer } from '../composables/markdown';

const { isMobile } = useResponsive();
const docStore = useDocStore();

// 使用 Markdown 渲染器 composable（带 shallowRef 优化）
const { render } = useMarkdownRenderer();

const localContent = ref('');
const activeTab = ref('edit'); // 移动端标签页状态：edit 或 preview

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


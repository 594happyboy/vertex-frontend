<template>
  <div class="title-editor">
    <!-- 可编辑输入框 -->
    <input 
      v-model="editableTitle"
      @input="handleInput"
      class="title-input"
      placeholder="请输入文档标题"
      maxlength="100"
    />
    
    <!-- 状态指示器 -->
    <HtmlStatusBar />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDocStore } from '../../stores/doc';
import HtmlStatusBar from './HtmlStatusBar.vue';

const docStore = useDocStore();

// 本地编辑标题状态
const editableTitle = ref('');

// 当前文档标题
const title = computed(() => docStore.docTitle);

// 监听文档切换，同步标题
watch(
  () => docStore.currentDoc?.id,
  () => {
    editableTitle.value = title.value;
  },
  { immediate: true }
);

// 监听 store 中的标题变化
watch(title, (newTitle) => {
  if (newTitle !== editableTitle.value) {
    editableTitle.value = newTitle;
  }
});

// 处理标题输入
function handleInput() {
  docStore.updateTitle(editableTitle.value);
}
</script>

<style scoped>
.title-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
  flex: 1;
}

.title-input {
  width: 100%;
  margin: 0;
  padding: var(--spacing-2xs) var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.title-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.title-input::placeholder {
  color: var(--color-text-tertiary);
  font-weight: 400;
}

@media (max-width: 768px) {
  .title-input {
    padding: var(--spacing-mobile-2xs) var(--spacing-mobile-xs);
    font-size: var(--font-size-mobile-base);
  }
}
</style>


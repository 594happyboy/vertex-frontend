<template>
  <div class="title-editor">
    <!-- 编辑模式：可编辑输入框 -->
    <input 
      v-if="isEditing"
      v-model="editableTitle"
      @input="handleInput"
      class="title-input"
      placeholder="请输入文档标题"
      maxlength="100"
    />
    
    <!-- 查看模式：只读标题 -->
    <h2 v-else class="title-display" :title="title">{{ title }}</h2>
    
    <!-- 状态指示器 -->
    <MdStatusBar />
  </div>
</template>

<script setup>
import { useDocumentTitle } from '../../composables/markdown';
import MdStatusBar from './MdStatusBar.vue';

const { editableTitle, title, isEditing, handleInput } = useDocumentTitle();
</script>

<style scoped>
.title-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
  min-width: 0;
  flex: 1;
}

.title-input {
  width: 100%;
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
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

.title-display {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .title-display {
    font-size: var(--font-size-mobile-base);
  }
}
</style>


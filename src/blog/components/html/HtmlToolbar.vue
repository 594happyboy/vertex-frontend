<template>
  <div class="html-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-icon">
        <Icon icon="mdi:file-document-edit" />
      </span>
      
      <!-- 标题编辑器 -->
      <HtmlTitleEditor />
    </div>

    <div class="toolbar-right">
      <!-- 已移除立即保存按钮，只保留自动保存功能 -->
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import HtmlTitleEditor from './HtmlTitleEditor.vue';
</script>

<style scoped>
/* 工具栏样式 */
.html-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--gradient-primary);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(18px);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .html-toolbar {
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-sm);
    gap: var(--spacing-mobile-xs);
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
  flex: 1;
}

@media (max-width: 768px) {
  .toolbar-left {
    gap: var(--spacing-mobile-xs);
  }
}

.toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-height-md);
  height: var(--btn-height-md);
  border-radius: var(--border-radius-xl);
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .toolbar-icon {
    width: var(--btn-height-mobile-sm);
    height: var(--btn-height-mobile-sm);
  }
}

.toolbar-icon :deep(svg) {
  font-size: var(--icon-size-lg);
}

@media (max-width: 768px) {
  .toolbar-icon :deep(svg) {
    font-size: var(--icon-size-mobile-lg);
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .toolbar-right {
    gap: var(--spacing-mobile-2xs);
  }
}

/* 按钮样式 */
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  min-height: var(--touch-target-min);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .btn-action {
    padding: var(--spacing-mobile-2xs) var(--spacing-mobile-xs);
    gap: var(--spacing-mobile-2xs);
    font-size: var(--font-size-mobile-sm);
  }
  
  .btn-action span {
    display: none;
  }
}

.btn-action:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-action:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action--primary {
  background: var(--color-primary);
  color: var(--color-text-primary-inverse);
  border-color: var(--color-primary);
}

.btn-action--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.btn-action :deep(svg) {
  font-size: var(--icon-size-md);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .btn-action :deep(svg) {
    font-size: var(--icon-size-mobile-md);
  }
}
</style>


<template>
  <div class="md-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-icon">
        <Icon icon="mdi:notebook-edit-outline" />
      </span>
      
      <!-- 标题编辑器子组件 -->
      <MdTitleEditor />
      
      <span v-if="canEdit" class="doc-badge">可编辑</span>
    </div>

    <div class="toolbar-right">
      <button
        v-if="canEdit"
        class="btn-action"
        @click="$emit('toggleMode')"
      >
        <Icon :icon="isEditing ? 'mdi:eye' : 'mdi:pencil'" />
        <span>{{ isEditing ? '预览模式' : '编辑模式' }}</span>
      </button>

      <button
        v-if="isEditing"
        class="btn-action btn-action--primary"
        @click="$emit('save')"
        :disabled="!canSave"
      >
        <Icon icon="mdi:content-save" />
        <span>立即保存</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../../stores/doc';
import MdTitleEditor from './MdTitleEditor.vue';

defineEmits(['toggleMode', 'save']);

const docStore = useDocStore();

const canEdit = computed(() => docStore.canEdit);
const isEditing = computed(() => docStore.isEditing);
const canSave = computed(() => docStore.dirty && !docStore.saving);
</script>

<style scoped>
/* 工具栏样式 */
.md-toolbar {
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
  .md-toolbar {
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

.doc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .doc-badge {
    display: none;
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

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--btn-padding-sm);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
  min-height: var(--touch-target-min);
}

.btn-action :deep(svg) {
  font-size: var(--icon-size-md);
}

@media (max-width: 768px) {
  .btn-action {
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-sm);
    gap: 0;
  }

  .btn-action span {
    display: none;
  }

  .btn-action :deep(svg) {
    font-size: var(--icon-size-mobile-lg);
  }
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

.btn-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.btn-action--primary {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-action--primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
}
</style>


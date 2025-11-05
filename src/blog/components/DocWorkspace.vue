<template>
  <div class="doc-workspace">
    <div v-if="!currentDoc" class="empty-state">
      <div class="empty-state__decor"></div>
      <div class="empty-state__icon">
        <Icon icon="mdi:file-document-multiple-outline" />
      </div>
      <h3>选择或创建一个文档</h3>
      <p>从左侧知识目录中挑选内容，或点击"新建文档"开始创作。</p>
    </div>

    <div v-else class="workspace-content">
      <div class="viewer-surface">
        <!-- Markdown 文档（包含工具栏） -->
        <MdContainer v-if="currentDoc.type === 'md' || currentDoc.type === 'txt'" />
        
        <!-- PDF 文档（包含工具栏） -->
        <PdfViewer v-else-if="currentDoc.type === 'pdf'" />
        
        <!-- 不支持的文档类型 -->
        <div v-else class="viewer-placeholder">
          <Icon icon="mdi:file-question-outline" />
          <span>不支持的文档类型</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useDocStore } from '../stores/doc';
import MdContainer from './MdContainer.vue';
import PdfViewer from './pdf/PdfViewer.vue';

const { isMobile } = useResponsive();
const docStore = useDocStore();

const currentDoc = computed(() => docStore.currentDoc);
</script>

<style scoped>
.doc-workspace {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  background: transparent;
  overflow: hidden;
}

.empty-state {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl) var(--spacing-xl);
  margin: var(--spacing-lg);
  border-radius: var(--border-radius-2xl);
  border: 1px dashed var(--color-border-hover);
  background: var(--color-bg-secondary);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

@media (max-width: 768px) {
  .empty-state {
    gap: var(--spacing-mobile-md);
    padding: var(--spacing-mobile-xl) var(--spacing-mobile-lg);
    margin: var(--spacing-mobile-md);
  }
}

.empty-state__decor {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(160px 160px at 80% 10%, var(--color-primary-light), transparent 70%),
    radial-gradient(220px 220px at 10% 90%, var(--color-secondary-light), transparent 75%);
  opacity: 0.9;
}

.empty-state__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: var(--border-radius-2xl);
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

@media (max-width: 768px) {
  .empty-state__icon {
    width: 64px;
    height: 64px;
  }
}

.empty-state__icon :deep(svg) {
  font-size: var(--icon-size-3xl);
}

@media (max-width: 768px) {
  .empty-state__icon :deep(svg) {
    font-size: var(--icon-size-2xl);
  }
}

.empty-state h3 {
  position: relative;
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .empty-state h3 {
    font-size: var(--font-size-mobile-lg);
  }
}

.empty-state p {
  position: relative;
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .empty-state p {
    font-size: var(--font-size-mobile-base);
  }
}

.empty-actions {
  position: relative;
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .empty-actions {
    gap: var(--spacing-mobile-xs);
  }
}

.btn-empty {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-2xl);
  border: 1px solid var(--color-primary);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  min-height: var(--touch-target-min);
}

@media (max-width: 768px) {
  .btn-empty {
    gap: var(--spacing-mobile-xs);
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-md);
    font-size: var(--font-size-mobile-base);
  }
}

.btn-empty:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-empty :deep(svg) {
  font-size: var(--icon-size-lg);
}

@media (max-width: 768px) {
  .btn-empty :deep(svg) {
    font-size: var(--icon-size-mobile-lg);
  }
}

.workspace-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.viewer-surface {
  position: relative;
  height: 100%;
  border-radius: 0;
  border: none;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.viewer-placeholder {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .viewer-placeholder {
    gap: var(--spacing-mobile-sm);
    font-size: var(--font-size-mobile-base);
  }
}

.viewer-placeholder :deep(svg) {
  font-size: var(--icon-size-4xl);
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .viewer-placeholder :deep(svg) {
    font-size: var(--icon-size-3xl);
  }
}
</style>



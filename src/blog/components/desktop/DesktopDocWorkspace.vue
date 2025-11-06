<template>
  <div class="desktop-doc-workspace">
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
        <!-- Markdown 文档 -->
        <MdContainer v-if="currentDoc.type === 'md' || currentDoc.type === 'txt'" />
        
        <!-- 富文本文档 -->
        <HtmlContainer v-else-if="currentDoc.type === 'html'" />
        
        <!-- PDF 文档 -->
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
import { useDocStore } from '../../stores/doc';
import MdContainer from '../shared/MdContainer.vue';
import HtmlContainer from '../shared/HtmlContainer.vue';
import PdfViewer from '../pdf/PdfViewer.vue';

const docStore = useDocStore();

const currentDoc = computed(() => docStore.currentDoc);
</script>

<style scoped>
.desktop-doc-workspace {
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

.empty-state__icon :deep(svg) {
  font-size: var(--icon-size-3xl);
}

.empty-state h3 {
  position: relative;
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.empty-state p {
  position: relative;
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
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

.viewer-placeholder :deep(svg) {
  font-size: var(--icon-size-4xl);
  color: var(--color-text-tertiary);
}
</style>


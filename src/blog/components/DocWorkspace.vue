<template>
  <div class="doc-workspace">
    <div v-if="!currentDoc" class="empty-state">
      <div class="empty-state__decor"></div>
      <div class="empty-state__icon">
        <Icon icon="mdi:file-document-multiple-outline" />
      </div>
      <h3>选择或创建一个文档</h3>
      <p>从左侧知识目录中挑选内容，或点击“新建文档”开始创作。</p>
    </div>

    <div v-else class="workspace-content">
      <DocToolbar />
      <div class="doc-viewer-container">
        <div class="viewer-surface">
          <MdEditor v-if="isEditing" />
          <MdViewer v-else-if="currentDoc.type === 'md' || currentDoc.type === 'txt'" />
          <PdfViewer v-else-if="currentDoc.type === 'pdf'" />
          <div v-else class="viewer-placeholder">
            <Icon icon="mdi:file-question-outline" />
            <span>不支持的文档类型</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../stores/doc';
import DocToolbar from './DocToolbar.vue';
import MdViewer from './MdViewer.vue';
import MdEditor from './MdEditor.vue';
import PdfViewer from './PdfViewer.vue';

const docStore = useDocStore();

const currentDoc = computed(() => docStore.currentDoc);
const isEditing = computed(() => docStore.isEditing);
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
  gap: 18px;
  padding: 40px 32px;
  margin: 20px;
  border-radius: 20px;
  border: 1px dashed rgba(150, 168, 232, 0.5);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.empty-state__decor {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(160px 160px at 80% 10%, rgba(96, 118, 255, 0.18), transparent 70%),
    radial-gradient(220px 220px at 10% 90%, rgba(63, 191, 255, 0.16), transparent 75%);
  opacity: 0.9;
}

.empty-state__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.2), rgba(63, 191, 255, 0.18));
  color: #273274;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.empty-state__icon :deep(svg) {
  font-size: 36px;
}

.empty-state h3 {
  position: relative;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #21286a;
}

.empty-state p {
  position: relative;
  margin: 0;
  font-size: 14px;
  color: rgba(31, 39, 102, 0.68);
}

.empty-actions {
  position: relative;
  display: flex;
  gap: 12px;
}

.btn-empty {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(118, 140, 255, 0.7);
  background: rgba(255, 255, 255, 0.95);
  color: #263072;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-empty:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px -24px rgba(27, 43, 120, 0.55);
}

.btn-empty :deep(svg) {
  font-size: 20px;
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

.doc-viewer-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.viewer-surface {
  position: relative;
  height: 100%;
  border-radius: 0;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
}

.viewer-surface::after {
  display: none;
}

.viewer-surface :deep(.md-editor),
.viewer-surface :deep(.markdown-body),
.viewer-surface :deep(canvas),
.viewer-surface :deep(iframe) {
  position: relative;
  z-index: 1;
  height: 100%;
}

.viewer-placeholder {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(26, 34, 92, 0.6);
  font-size: 14px;
}

.viewer-placeholder :deep(svg) {
  font-size: 46px;
  color: rgba(80, 112, 214, 0.5);
}
</style>


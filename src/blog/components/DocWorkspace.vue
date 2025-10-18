<template>
  <div class="doc-workspace">
    <div v-if="!currentDoc" class="empty-state">
      <Icon icon="mdi:file-document-outline" class="empty-icon" />
      <h3>选择或创建一个文档</h3>
      <p>在左侧目录树中选择文档，或创建一个新文档</p>
    </div>

    <div v-else class="workspace-content">
      <DocToolbar />
      
      <div class="doc-viewer-container">
        <MdEditor v-if="isEditing" />
        <MdViewer v-else-if="currentDoc.type === 'md'" />
        <PdfViewer v-else-if="currentDoc.type === 'pdf'" />
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
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.3;
}

.empty-state h3 {
  font-size: var(--text-xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: var(--text-base);
}

.workspace-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.doc-viewer-container {
  flex: 1;
  overflow: hidden;
}
</style>


<template>
  <div class="mobile-doc-editor">
    <!-- Markdown 文档 -->
    <MobileMdEditor v-if="docType === 'md' || docType === 'txt'" />
    
    <!-- 富文本文档 -->
    <MobileHtmlEditor v-else-if="docType === 'html'" />
    
    <!-- PDF 文档 -->
    <MobilePdfViewer v-else-if="docType === 'pdf'" />
    
    <!-- 不支持的文档类型 -->
    <div v-else class="editor-placeholder">
      <Icon icon="mdi:file-question-outline" />
      <span>不支持的文档类型</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';
import MobileMdEditor from '../../components/mobile/MobileMdEditor.vue';
import MobileHtmlEditor from '../../components/mobile/MobileHtmlEditor.vue';
import MobilePdfViewer from '../../components/mobile/MobilePdfViewer.vue';

const props = defineProps({
  docId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const docStore = useDocStore();
const uiStore = useUiStore();

const docType = computed(() => docStore.currentDoc?.type || '');

onMounted(async () => {
  // 隐藏全局导航
  uiStore.hideNavigation();
  
  // 加载文档
  if (props.docId) {
    try {
      await docStore.openDoc(props.docId);
    } catch (error) {
      uiStore.showError(error.message || '加载文档失败');
      router.push('/me');
    }
  }
});

onBeforeUnmount(() => {
  // 恢复导航显示
  uiStore.showNavigation();
  
  // 尝试保存未保存的修改
  if (docStore.dirty) {
    docStore.performAutoSave();
  }
});
</script>

<style scoped>
.mobile-doc-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-primary);
  z-index: 100;
  overflow: hidden;
}

.editor-placeholder {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 15px;
  background: var(--color-bg-primary);
}

.editor-placeholder :deep(svg) {
  font-size: 48px;
  color: var(--color-text-tertiary);
}
</style>


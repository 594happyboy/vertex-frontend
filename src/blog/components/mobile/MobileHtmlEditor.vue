<template>
  <div class="mobile-html-editor">
    <!-- 顶部头部 -->
    <div class="mobile-editor-header">
      <button class="header-btn" @click="handleBack">
        <Icon icon="mdi:arrow-left" />
      </button>

      <div class="header-title-area">
        <h1 class="header-title">{{ title }}</h1>
        <span class="save-status" :class="`status-${saveStatus}`">
          {{ saveStatusText }}
        </span>
      </div>
    </div>

    <!-- 富文本编辑器内容区 -->
    <div class="editor-content-area">
      <RichTextEditor
        ref="editorRef"
        v-model="content"
        :placeholder="'开始编写你的文档...'"
        :show-stats="false"
        :editable="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../../stores/doc';
import RichTextEditor from '../shared/RichTextEditor.vue';

// ==================== 初始化 ====================
const router = useRouter();
const docStore = useDocStore();

// ==================== 响应式状态 ====================
const editorRef = ref(null);
const content = ref('');

// ==================== 计算属性 ====================
const title = computed(() => docStore.currentDoc?.title || '未命名文档');
const saveStatus = computed(() => docStore.syncStatus);

const SAVE_STATUS_MAP = {
  saving: '保存中...',
  saved: '已保存',
  pending: '未保存',
  error: '保存失败',
};

const saveStatusText = computed(() => SAVE_STATUS_MAP[saveStatus.value] || '已保存');

// ==================== 事件处理 ====================
const handleBack = () => {
  if (docStore.dirty && !confirm('有未保存的修改，确定要离开吗？')) {
    return;
  }
  router.push('/me');
};

// ==================== 生命周期 ====================
onMounted(() => {
  content.value = docStore.content || '';
  if (!docStore.isEditing) {
    docStore.setMode('edit');
  }
});

onBeforeUnmount(() => {
  if (docStore.dirty) {
    docStore.performAutoSave();
  }
});

// ==================== 监听器 ====================
watch(
  () => docStore.content,
  (newContent) => {
    if (newContent !== content.value) {
      content.value = newContent;
    }
  },
  { immediate: true }
);

watch(content, (newContent) => {
  docStore.updateContent(newContent);
});
</script>

<style scoped>
.mobile-html-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  z-index: 100;
  overflow: hidden;
}

/* ========== 头部样式 ========== */
.mobile-editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  padding-top: calc(8px + env(safe-area-inset-top));
  background: linear-gradient(140deg, rgba(58, 84, 245, 0.96), rgba(21, 37, 117, 0.88));
  color: #fff;
  box-shadow: 0 2px 8px rgba(10, 26, 128, 0.2);
  flex-shrink: 0;
  z-index: 10;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.header-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.header-btn :deep(svg) {
  font-size: 22px;
}

.header-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.save-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.save-status.status-saving {
  color: rgba(255, 200, 100, 1);
}

.save-status.status-error {
  color: rgba(255, 100, 100, 1);
}

.save-status.status-saved {
  color: rgba(150, 255, 150, 1);
}

/* ========== 内容区域样式 ========== */
.editor-content-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-content-area :deep(.rich-text-editor) {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.editor-content-area :deep(.rich-text-editor .editor-content) {
  flex: 1;
  overflow-y: auto;
  max-height: none;
}

.editor-content-area :deep(.rich-text-editor .editor-toolbar-mobile) {
  flex-shrink: 0;
}
</style>


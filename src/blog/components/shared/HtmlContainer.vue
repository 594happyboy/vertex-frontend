<template>
  <div class="html-container">
    <!-- 富文本工具栏（可选） -->
    <HtmlToolbar v-if="!hideToolbar" />

    <!-- 富文本编辑器内容区 -->
    <div class="html-content">
      <RichTextEditor
      class="rich-text-editor"
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
import { ref, computed, watch, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { useDocStore } from '../../stores/doc';
import HtmlToolbar from '../html/HtmlToolbar.vue';
import RichTextEditor from './RichTextEditor.vue';

const props = defineProps({
  hideToolbar: {
    type: Boolean,
    default: false,
  },
});

const docStore = useDocStore();

const editorRef = ref(null);
const content = ref('');

// 计算属性
const dirty = computed(() => docStore.dirty);

// 监听 store 中的内容变化
watch(
  () => docStore.content,
  (newContent) => {
    if (newContent !== content.value) {
      content.value = newContent;
    }
  },
  { immediate: true }
);

// 监听编辑器内容变化
watch(content, (newContent) => {
  docStore.updateContent(newContent);
});

// 已移除手动保存功能，只保留自动保存

/**
 * 页面关闭前警告
 */
const handleBeforeUnload = (e) => {
  if (docStore.dirty || ['saving', 'pending'].includes(docStore.syncStatus)) {
    e.preventDefault();
    e.returnValue = '您有未保存的修改，确定要离开吗？';
    return e.returnValue;
  }
};

// 生命周期钩子
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  // 组件卸载前尝试立即保存
  if (docStore.dirty) {
    docStore.performAutoSave();
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.html-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
}

.html-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rich-text-editor {
  border: none;
  transition: none;
  border-radius: 0;
}

.rich-text-editor.is-focused {
  border-color: 0;
  box-shadow: none;
}


.html-content :deep(.rich-text-editor) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.html-content :deep(.rich-text-editor .editor-content) {
  flex: 1;
  overflow-y: auto;
  max-height: none;
}
</style>


<template>
  <div class="md-container">
    <!-- Markdown 工具栏（可选） -->
    <MdToolbar v-if="!hideToolbar" @toggleMode="toggleMode" />

    <!-- Markdown 内容区 -->
    <div class="md-content">
      <MdEditor v-if="isEditing" />
      <MdViewer v-else />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { useDocStore } from '../../stores/doc';
import MdToolbar from '../markdown/MdToolbar.vue';
import MdViewer from './MdViewer.vue';
import MdEditor from './MdEditor.vue';

const props = defineProps({
  hideToolbar: {
    type: Boolean,
    default: false,
  },
});

const docStore = useDocStore();

// 计算属性
const isEditing = computed(() => docStore.isEditing);
const dirty = computed(() => docStore.dirty);

/**
 * 切换编辑/查看模式
 */
function toggleMode() {
  if (dirty.value && !confirm('有未保存的修改，是否继续？')) return;
  docStore.setMode(isEditing.value ? 'view' : 'edit');
}

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
.md-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.md-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>


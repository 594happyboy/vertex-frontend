<template>
  <div class="md-container">
    <!-- Markdown 工具栏 -->
    <div class="md-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-icon">
          <Icon icon="mdi:notebook-edit-outline" />
        </span>
        <div class="toolbar-title">
          <h2 class="doc-title" :title="docTitle">{{ docTitle }}</h2>
          <div class="doc-status">
            <span class="status-dot" :class="`status-dot--${statusType}`"></span>
            <span>{{ statusText }}</span>
          </div>
        </div>
        <span v-if="canEdit" class="doc-badge">可编辑</span>
      </div>

      <div class="toolbar-right">
        <button
          v-if="canEdit"
          class="btn-action"
          @click="toggleMode"
        >
          <Icon :icon="isEditing ? 'mdi:eye' : 'mdi:pencil'" />
          <span>{{ isEditing ? '预览模式' : '编辑模式' }}</span>
        </button>

        <button
          v-if="isEditing"
          class="btn-action btn-action--primary"
          @click="handleSave"
          :disabled="saving || !dirty"
        >
          <Icon icon="mdi:content-save" />
          <span>立即保存</span>
        </button>
      </div>
    </div>

    <!-- Markdown 内容区 -->
    <div class="md-content">
      <MdEditor v-if="isEditing" />
      <MdViewer v-else />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../stores/doc';
import { useTreeStore } from '../stores/tree';
import { useUiStore } from '../stores/ui';
import MdViewer from './MdViewer.vue';
import MdEditor from './MdEditor.vue';

const docStore = useDocStore();
const treeStore = useTreeStore();
const uiStore = useUiStore();

// 计算属性
const docTitle = computed(() => docStore.docTitle);
const isEditing = computed(() => docStore.isEditing);
const canEdit = computed(() => docStore.canEdit);
const dirty = computed(() => docStore.dirty);
const saving = computed(() => docStore.saving);

// 状态映射
const STATUS_MAP = {
  saving: { text: '保存中...', type: 'saving' },
  dirty: { text: '未保存的更改', type: 'dirty' },
  synced: { text: '已同步至云端', type: 'synced' },
};

const currentStatus = computed(() => {
  if (saving.value) return STATUS_MAP.saving;
  if (dirty.value) return STATUS_MAP.dirty;
  return STATUS_MAP.synced;
});

const statusText = computed(() => currentStatus.value.text);
const statusType = computed(() => currentStatus.value.type);

// 模式切换
function toggleMode() {
  if (dirty.value && !confirm('有未保存的修改，是否继续？')) {
    return;
  }
  docStore.setMode(isEditing.value ? 'view' : 'edit');
}

// 保存文档
async function handleSave() {
  try {
    await docStore.saveDoc();
    uiStore.showSuccess('保存成功');
  } catch (error) {
    uiStore.showError(error.message || '保存失败');
  }
}

// 快捷键处理
const handleKeyDown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    isEditing.value && handleSave();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.md-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 工具栏样式 */
.md-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(247, 249, 255, 0.98), rgba(233, 239, 255, 0.95));
  border-bottom: 1px solid rgba(220, 230, 255, 0.7);
  box-shadow: 0 2px 8px rgba(18, 28, 88, 0.1);
  backdrop-filter: blur(18px);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(93, 121, 255, 0.22), rgba(28, 181, 255, 0.18));
  color: #263184;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.toolbar-icon :deep(svg) {
  font-size: 20px;
}

.toolbar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.doc-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2664;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(31, 39, 102, 0.65);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(99, 110, 255, 0.35);
  box-shadow: 0 0 0 4px rgba(99, 110, 255, 0.15);
}

.status-dot--dirty {
  background: #ff9f43;
  box-shadow: 0 0 0 4px rgba(255, 159, 67, 0.18);
}

.status-dot--saving {
  background: #3ab0ff;
  box-shadow: 0 0 0 4px rgba(58, 176, 255, 0.18);
  animation: pulse 1.6s ease-in-out infinite;
}

.status-dot--synced {
  background: #2ecc71;
  box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.16);
}

.doc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  color: rgba(33, 42, 116, 0.78);
  border: 1px solid rgba(188, 202, 255, 0.55);
  flex-shrink: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 14px;
  border: 1px solid rgba(196, 206, 255, 0.78);
  background: rgba(255, 255, 255, 0.92);
  color: #1f2a72;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.btn-action :deep(svg) {
  font-size: 18px;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px -24px rgba(27, 43, 120, 0.55);
  border-color: rgba(116, 137, 255, 0.6);
}

.btn-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.btn-action--primary {
  background: linear-gradient(135deg, rgba(108, 126, 255, 0.95), rgba(68, 148, 255, 0.92));
  border-color: rgba(108, 126, 255, 0.8);
  color: #fff;
}

.btn-action--primary:hover:not(:disabled) {
  box-shadow: 0 16px 36px -24px rgba(61, 109, 255, 0.6);
}

.md-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}
</style>


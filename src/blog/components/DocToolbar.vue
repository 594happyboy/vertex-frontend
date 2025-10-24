<template>
  <div class="doc-toolbar">
    <div class="doc-toolbar__main">
      <div class="doc-toolbar__title">
        <span class="doc-toolbar__icon">
          <Icon icon="mdi:notebook-edit-outline" />
        </span>
        <div class="doc-toolbar__title-text">
          <h2 class="doc-title" :title="docTitle">{{ docTitle }}</h2>
          <div class="doc-toolbar__status">
            <span class="status-dot" :class="`status-dot--${statusType}`"></span>
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>
      <div class="doc-toolbar__badges">
        <span v-if="canEdit" class="doc-toolbar__badge doc-toolbar__badge--outline">可编辑</span>
      </div>
    </div>

    <div class="doc-toolbar__actions">
      <div class="action-group">
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

      <div class="action-group">
        <div class="toolbar-dropdown">
          <button class="btn-action btn-action--ghost" @click="toggleMenu">
            <Icon icon="mdi:dots-grid" />
          </button>
          <transition name="fade-scale">
            <div v-if="showMenu" class="dropdown-menu">
              <button class="menu-item" @click="handleExport">
                <Icon icon="mdi:download" />
                <span>导出文档</span>
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item danger" @click="handleDelete">
                <Icon icon="mdi:delete" />
                <span>删除文档</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useDocStore } from '../stores/doc';
import { useTreeStore } from '../stores/tree';
import { useUiStore } from '../stores/ui';

const docStore = useDocStore();
const treeStore = useTreeStore();
const uiStore = useUiStore();

const showMenu = ref(false);

const docTitle = computed(() => docStore.docTitle);
const isEditing = computed(() => docStore.isEditing);
const canEdit = computed(() => docStore.canEdit);
const dirty = computed(() => docStore.dirty);
const saving = computed(() => docStore.saving);
const statusText = computed(() => {
  if (saving.value) return '保存中...';
  if (dirty.value) return '未保存的更改';
  return '已同步至云端';
});
const statusType = computed(() => {
  if (saving.value) return 'saving';
  if (dirty.value) return 'dirty';
  return 'synced';
});

function toggleMode() {
  if (dirty.value) {
    const confirmed = confirm('有未保存的修改，是否继续？');
    if (!confirmed) return;
  }
  
  const newMode = isEditing.value ? 'view' : 'edit';
  docStore.setMode(newMode);
}

async function handleSave() {
  try {
    await docStore.saveDoc();
    uiStore.showSuccess('保存成功');
  } catch (error) {
    uiStore.showError(error.message || '保存失败');
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function handleExport() {
  showMenu.value = false;
  uiStore.showInfo('导出功能正在开发中');
}

async function handleDelete() {
  showMenu.value = false;
  
  const confirmed = confirm(`确定要删除"${docTitle.value}"吗？`);
  if (!confirmed) return;

  try {
    const docId = docStore.currentDoc.id;
    await docStore.deleteDoc(docId);
    await treeStore.fetchTree();
    uiStore.showSuccess('删除成功');
  } catch (error) {
    uiStore.showError(error.message || '删除失败');
  }
}

// 点击外部关闭菜单
function handleClickOutside(event) {
  const dropdown = event.target.closest('.toolbar-dropdown');
  if (!dropdown && showMenu.value) {
    showMenu.value = false;
  }
}

// 快捷键保存
function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (isEditing.value) {
      handleSave();
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.doc-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-radius: 0;
  background: linear-gradient(135deg, rgba(247, 249, 255, 0.98), rgba(233, 239, 255, 0.95));
  border-bottom: 1px solid rgba(220, 230, 255, 0.7);
  box-shadow: 0 2px 8px rgba(18, 28, 88, 0.1);
  backdrop-filter: blur(18px);
  z-index: 2;
  flex-shrink: 0;
}

.doc-toolbar::after {
  display: none;
}

.doc-toolbar__main,
.doc-toolbar__actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
}

.doc-toolbar__main {
  flex: 1;
  justify-content: space-between;
  min-width: 0;
}

.doc-toolbar__title {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.doc-toolbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(93, 121, 255, 0.22), rgba(28, 181, 255, 0.18));
  color: #263184;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.doc-toolbar__icon :deep(svg) {
  font-size: 20px;
}

.doc-toolbar__title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
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

.doc-toolbar__status {
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

.doc-toolbar__badges {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.doc-toolbar__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #2740a2;
  background: rgba(121, 142, 255, 0.18);
  border: 1px solid rgba(121, 142, 255, 0.35);
}

.doc-toolbar__badge--outline {
  background: rgba(255, 255, 255, 0.8);
  color: rgba(33, 42, 116, 0.78);
  border-color: rgba(188, 202, 255, 0.55);
}

.doc-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
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

.btn-action--success {
  background: rgba(65, 199, 135, 0.18);
  border-color: rgba(65, 199, 135, 0.4);
  color: #279d68;
}

.btn-action--success:hover:not(:disabled) {
  background: rgba(65, 199, 135, 0.25);
  border-color: rgba(65, 199, 135, 0.55);
}

.btn-action--warning {
  background: rgba(255, 205, 120, 0.2);
  border-color: rgba(255, 185, 84, 0.5);
  color: #e49334;
}

.btn-action--warning:hover:not(:disabled) {
  background: rgba(255, 205, 120, 0.3);
  border-color: rgba(255, 185, 84, 0.65);
}

.btn-action--outline {
  background: rgba(255, 255, 255, 0.92);
  color: #213174;
}

.btn-action--ghost {
  width: 42px;
  height: 42px;
  padding: 0;
  justify-content: center;
  border-radius: 14px;
}

.toolbar-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 200px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(220, 228, 255, 0.85);
  box-shadow: 0 22px 44px -30px rgba(20, 28, 72, 0.58);
  backdrop-filter: blur(18px);
  z-index: 30;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #1e2764;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item:hover {
  background: rgba(215, 223, 255, 0.5);
  color: #1a2160;
}

.menu-item.danger {
  color: #d64545;
}

.menu-item.danger:hover {
  background: rgba(255, 229, 229, 0.9);
  color: #c13b3b;
}

.menu-divider {
  height: 1px;
  margin: 8px 0;
  background: rgba(207, 217, 255, 0.65);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}
</style>


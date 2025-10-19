<template>
  <div class="doc-toolbar">
    <div class="toolbar-left">
      <h2 class="doc-title">{{ docTitle }}</h2>
      <span v-if="dirty" class="save-indicator">未保存</span>
      <span v-else-if="saving" class="save-indicator">保存中...</span>
    </div>

    <div class="toolbar-right">
      <!-- 编辑/预览切换 -->
      <button
        v-if="canEdit"
        class="btn-toolbar"
        @click="toggleMode"
      >
        <Icon :icon="isEditing ? 'mdi:eye' : 'mdi:pencil'" />
        <span>{{ isEditing ? '预览' : '编辑' }}</span>
      </button>

      <!-- 保存按钮 -->
      <button
        v-if="isEditing"
        class="btn-toolbar btn-primary"
        @click="handleSave"
        :disabled="saving || !dirty"
      >
        <Icon icon="mdi:content-save" />
        <span>保存</span>
      </button>

      <!-- 发布/取消发布 -->
      <button
        class="btn-toolbar"
        :class="{ 'btn-success': !isPublished }"
        @click="togglePublish"
      >
        <Icon :icon="isPublished ? 'mdi:eye-off' : 'mdi:publish'" />
        <span>{{ isPublished ? '取消发布' : '发布' }}</span>
      </button>

      <!-- 更多操作 -->
      <div class="toolbar-dropdown">
        <button class="btn-toolbar" @click="toggleMenu">
          <Icon icon="mdi:dots-vertical" />
        </button>
        <div v-if="showMenu" class="dropdown-menu">
          <button class="menu-item" @click="handleExport">
            <Icon icon="mdi:download" />
            <span>导出</span>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item danger" @click="handleDelete">
            <Icon icon="mdi:delete" />
            <span>删除</span>
          </button>
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
const isPublished = computed(() => docStore.isPublished);

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

async function togglePublish() {
  try {
    if (isPublished.value) {
      await docStore.unpublishDoc();
      uiStore.showSuccess('已取消发布');
    } else {
      await docStore.publishDoc();
      uiStore.showSuccess('发布成功');
    }
    await treeStore.fetchTree();
  } catch (error) {
    uiStore.showError(error.message || '操作失败');
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--spacing-lg);
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.save-indicator {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.btn-toolbar:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
}

.btn-toolbar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-toolbar.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn-toolbar.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-toolbar.btn-success {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.btn-toolbar.btn-success:hover {
  opacity: 0.9;
}

.toolbar-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  min-width: 160px;
  padding: var(--spacing-xs);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  text-align: left;
}

.menu-item:hover {
  background-color: var(--color-bg-hover);
}

.menu-item.danger {
  color: var(--color-error);
}

.menu-item.danger:hover {
  background-color: var(--color-error-light);
}

.menu-divider {
  height: 1px;
  margin: var(--spacing-xs) 0;
  background-color: var(--color-border);
}
</style>


<template>
  <div class="desktop-doc-tree">
    <div class="tree-list-wrapper">
      <!-- 顶部操作区：搜索框 -->
      <div class="tree-actions">
        <div class="search-box">
          <Icon icon="mdi:magnify" class="search-icon" />
          <input v-model="searchKeyword" type="text" placeholder="搜索文档或分组..." />
          <button v-if="searchKeyword" class="search-clear" type="button" @click="clearSearch">
            <Icon icon="mdi:close-circle" />
          </button>
        </div>
      </div>
      
      <!-- 目录树列表（带状态遮罩） -->
      <div class="tree-list-container">
        <!-- Loading 状态 -->
        <div v-if="loading" class="tree-status">
          <div class="status-loader">
            <span class="ring"></span>
            <Icon icon="mdi:loading" class="spin" />
          </div>
          <span>正在加载目录结构...</span>
        </div>

        <!-- Error 状态 -->
        <div v-else-if="error" class="tree-status tree-status--error">
          <Icon icon="mdi:alert-circle-outline" />
          <span>{{ error }}</span>
        </div>

        <!-- 搜索无结果 -->
        <div v-else-if="tree.length === 0 && isSearching" class="tree-status tree-status--no-results">
          <Icon icon="mdi:text-box-search-outline" />
          <p class="tree-status__text">未找到匹配的文档或分组</p>
          <p class="tree-status__hint">试试其他搜索关键词</p>
        </div>

        <!-- 目录树列表 -->
        <div v-else class="tree-list" data-scroll>
          <!-- 固定根目录 -->
          <div class="root-directory">
            <div 
              class="root-item"
              :class="{ 'root-active': !selectedId }"
              @click="handleSelectRoot"
            >
              <div class="root-leading">
                <span class="root-icon">
                  <Icon icon="mdi:folder-open" />
                </span>
                <span class="root-label">全部文档</span>
              </div>
              
              <div class="root-actions" ref="rootMenuRef">
                <button class="tree-action-btn" @click.stop="toggleRootMenu" title="更多操作">
                  <Icon icon="mdi:dots-horizontal" />
                </button>
                <transition name="tree-menu-fade-scale">
                  <div v-if="showRootMenu" class="tree-action-menu">
                    <button class="tree-menu-item" @click="handleRootOpenCreateModal">
                      <Icon icon="mdi:plus-circle" />
                      <span>新建...</span>
                    </button>
                    <button class="tree-menu-item" @click="handleRootOpenImportModal">
                      <Icon icon="mdi:file-import" />
                      <span>导入...</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- 子节点 -->
            <div class="root-children">
              <TreeNode 
                v-for="node in tree" 
                :key="`${node.nodeType}-${node.id}`" 
                :node="node" 
                :depth="1" 
                :selected-id="selectedId"
                :selected-type="selectedType" 
                :expanded-keys="expandedKeys" 
                :is-root-child="true" 
                @select="handleSelect" 
                @toggle="handleToggle"
                @open-create-modal="handleOpenCreateModal"
                @open-import-modal="handleOpenImportModal"
                @rename="handleRename" 
                @delete="handleDelete" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="batchInputRef" type="file" accept=".zip" style="display: none" @change="handleBatchFileSelect" />
    <input ref="importInputRef" type="file" :accept="DOCUMENT_ACCEPT" style="display: none" @change="handleImportFileSelect" />

    <Teleport to="body">
      <transition name="create-modal-fade">
        <div
          v-if="showCreateModal"
          class="create-modal-overlay"
          role="dialog"
          aria-modal="true"
          @click="closeCreateModal"
        >
          <div class="create-modal" @click.stop>
            <div class="create-modal__header">
              <div>
                <p class="create-modal__eyebrow">内容类型</p>
                <h3 class="create-modal__title">{{ createModalTitle }}</h3>
                <p class="create-modal__subtitle">{{ createModalSubtitle }}</p>
              </div>
              <button class="create-modal__close" type="button" @click="closeCreateModal">
                <Icon icon="mdi:close" />
              </button>
            </div>
            <div class="create-modal__list">
              <button
                v-for="option in createOptions"
                :key="option.id"
                type="button"
                class="create-modal__item"
                @click="handleCreateOption(option.action)"
              >
                <div class="create-modal__item-title">{{ option.title }}</div>
                <p class="create-modal__item-desc">{{ option.description }}</p>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition name="create-modal-fade">
        <div
          v-if="showImportModal"
          class="create-modal-overlay"
          role="dialog"
          aria-modal="true"
          @click="closeImportModal"
        >
          <div class="create-modal" @click.stop>
            <div class="create-modal__header">
              <div>
                <p class="create-modal__eyebrow">导入方式</p>
                <h3 class="create-modal__title">{{ importModalTitle }}</h3>
                <p class="create-modal__subtitle">{{ importModalSubtitle }}</p>
              </div>
              <button class="create-modal__close" type="button" @click="closeImportModal">
                <Icon icon="mdi:close" />
              </button>
            </div>
            <div class="create-modal__list">
              <button
                v-for="option in importOptions"
                :key="option.id"
                type="button"
                class="create-modal__item"
                @click="handleImportOption(option.action)"
              >
                <div class="create-modal__item-title">{{ option.title }}</div>
                <p class="create-modal__item-desc">{{ option.description }}</p>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useTreeStore } from '../../stores/tree';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';
import { batchUploadDocuments } from '../../api/document';
import { useTreeMenu } from '../../composables/useTreeMenu';
import TreeNode from '../TreeNode.vue';
import { FILE_SIZE_LIMITS, DOCUMENT_ACCEPT } from '../../constants';
import { createTextFile, extractTitle, validateBatchFile } from '../../utils/fileHelpers';
import { formatBatchUploadResult } from '../../utils/uiHelpers';
import { filterTree } from '../../utils/treeHelpers';

// Stores
const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

// 响应式状态
const batchInputRef = ref(null);
const importInputRef = ref(null);
const currentGroupId = ref(null);
const uploading = ref(false);
const searchKeyword = ref('');
const showCreateModal = ref(false);
const createModalContext = ref({
  parentId: null,
  parentName: '全局文档',
});
const showImportModal = ref(false);
const importModalContext = ref({
  parentId: null,
  parentName: '全局文档',
});

// 使用菜单组合式函数
const { 
  showMenu: showRootMenu, 
  menuRef: rootMenuRef, 
  toggleMenu: toggleRootMenu,
  handleMenuAction: handleRootMenuAction
} = useTreeMenu();

// 计算属性
const normalizedKeyword = computed(() => searchKeyword.value.trim().toLowerCase());
const isSearching = computed(() => normalizedKeyword.value.length > 0);
const createModalTitle = computed(() =>
  createModalContext.value.parentId
    ? `在「${createModalContext.value.parentName}」下创建`
    : '在根目录创建内容'
);
const createModalSubtitle = computed(() =>
  createModalContext.value.parentId
    ? '为当前分组扩充内容，保持结构清晰'
    : '快速创建顶层内容或分组'
);
const createOptions = computed(() => {
  const parentId = createModalContext.value.parentId;
  const parentName = createModalContext.value.parentName;
  const isRoot = !parentId;

  return [
    {
      id: 'group',
      title: isRoot ? '新建分组' : '新建子分组',
      description: isRoot
        ? '建立一级分类，帮助从宏观上梳理知识结构'
        : `在「${parentName}」内部继续细分主题，层级更清晰`,
      action: () => handleCreateGroup(parentId),
    },
    {
      id: 'rich-doc',
      title: '新建文档',
      description: '创建一个图文并茂的富文本文档，记录灵感与故事',
      action: () => handleCreateRichDoc(parentId),
    },
    {
      id: 'markdown-doc',
      title: '新建 Markdown 文档',
      description: '以 Markdown 撰写技术说明或版本记录，简单又高效',
      action: () => handleCreateDoc(parentId),
    },
  ];
});

const importModalTitle = computed(() =>
  importModalContext.value.parentId
    ? `导入到「${importModalContext.value.parentName}」`
    : '导入到根目录'
);
const importModalSubtitle = computed(() =>
  importModalContext.value.parentId
    ? '将现有内容归档到该分组，保持分类有序'
    : '导入为顶层文档，稍后可以再分组'
);
const importOptions = computed(() => {
  const parentId = importModalContext.value.parentId;
  const parentName = importModalContext.value.parentName;
  const target = parentId ? `「${parentName}」` : '根目录';

  return [
    {
      id: 'single-import',
      title: '导入单个文档',
      description: `支持 Markdown/PDF/TXT，文件将直接进入${target}`,
      action: () => handleImportFile(parentId),
    },
    {
      id: 'batch-import',
      title: '批量导入',
      description: '上传zip压缩包一次导入多篇文档，保留原有层级结构',
      action: () => handleBatchImport(parentId),
    },
  ];
});

const tree = computed(() => {
  return isSearching.value 
    ? filterTree(treeStore.tree, normalizedKeyword.value, expandedKeys.value, treeStore.expandNode)
    : treeStore.tree;
});

const loading = computed(() => treeStore.loading);
const error = computed(() => treeStore.error);
const selectedId = computed(() => treeStore.selectedId);
const selectedType = computed(() => treeStore.selectedType);
const expandedKeys = computed(() => treeStore.expandedKeys);

// ===== 根目录菜单操作 =====
const handleRootOpenCreateModal = handleRootMenuAction(() => openCreateModal());
const handleRootOpenImportModal = handleRootMenuAction(() => openImportModal());

// ===== 搜索功能 =====
const clearSearch = () => searchKeyword.value = '';

// ===== 节点操作 =====
function handleSelect(node, type) {
  treeStore.selectNode(node.id, type);
  if (type === 'document') {
    docStore.openDoc(node.id);
  }
}

function handleToggle(nodeId) {
  treeStore.toggleExpand(nodeId);
}

function handleSelectRoot() {
  treeStore.selectNode(null, null);
}

function openCreateModal(context = { parentId: null, parentName: '全局文档' }) {
  createModalContext.value = {
    parentId: context?.parentId ?? null,
    parentName: context?.parentName || '全局文档',
  };
  showCreateModal.value = true;
}

function handleOpenCreateModal(payload) {
  openCreateModal({
    parentId: payload?.parentId ?? null,
    parentName: payload?.parentName || '全局文档',
  });
}

function closeCreateModal() {
  showCreateModal.value = false;
}

function handleCreateOption(action) {
  closeCreateModal();
  action?.();
}

function openImportModal(context = { parentId: null, parentName: '全局文档' }) {
  importModalContext.value = {
    parentId: context?.parentId ?? null,
    parentName: context?.parentName || '全局文档',
  };
  showImportModal.value = true;
}

function handleOpenImportModal(payload) {
  openImportModal({
    parentId: payload?.parentId ?? null,
    parentName: payload?.parentName || '全局文档',
  });
}

function closeImportModal() {
  showImportModal.value = false;
}

function handleImportOption(action) {
  closeImportModal();
  action?.();
}

// ===== CRUD 操作 =====
async function handleCreateGroup(parentId) {
  const name = prompt('请输入分组名称：');
  if (!name?.trim()) return;

  try {
    await treeStore.createGroup(name.trim(), parentId);
    if (parentId) treeStore.expandNode(parentId);
    uiStore.showSuccess('分组创建成功');
  } catch (error) {
    uiStore.showError(error.message || '创建分组失败');
  }
}

async function handleCreateDoc(groupId) {
  const title = prompt('请输入Markdown文档标题：');
  if (!title?.trim()) return;

  try {
    const trimmedTitle = title.trim();
    const file = createTextFile(trimmedTitle, 'md');
    const doc = await docStore.createDoc(trimmedTitle, file, groupId);
    
    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    if (groupId) treeStore.expandNode(groupId);
    
    uiStore.showSuccess('Markdown文档创建成功');
  } catch (error) {
    uiStore.showError(error.message || '创建Markdown文档失败');
  }
}

async function handleCreateRichDoc(groupId) {
  const title = prompt('请输入文档标题：');
  if (!title?.trim()) return;

  try {
    const trimmedTitle = title.trim();
    const file = createTextFile(trimmedTitle, 'html');
    const doc = await docStore.createDoc(trimmedTitle, file, groupId);
    
    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    if (groupId) treeStore.expandNode(groupId);
    
    uiStore.showSuccess('文档创建成功');
  } catch (error) {
    uiStore.showError(error.message || '创建文档失败');
  }
}

async function handleRename(node, type) {
  const newName = prompt('请输入新名称：', node.name);
  if (!newName?.trim() || newName.trim() === node.name) return;

  try {
    if (type === 'group') {
      await treeStore.updateGroup(node.id, { name: newName.trim() });
    } else {
      await docStore.saveDoc({ title: newName.trim() });
      await treeStore.fetchTree();
    }
    uiStore.showSuccess(`${type === 'group' ? '分组' : '文档'}重命名成功`);
  } catch (error) {
    uiStore.showError(error.message || '重命名失败');
  }
}

async function handleDelete(node, type) {
  if (!confirm(`确定要删除"${node.name}"吗？`)) return;

  try {
    if (type === 'group') {
      await treeStore.deleteGroup(node.id);
    } else {
      await docStore.deleteDoc(node.id);
      await treeStore.fetchTree();
    }
    uiStore.showSuccess(`${type === 'group' ? '分组' : '文档'}删除成功`);
  } catch (error) {
    uiStore.showError(error.message || '删除失败');
  }
}

// ===== 导入文档 =====
function handleImportFile(groupId) {
  currentGroupId.value = groupId;
  importInputRef.value?.click();
}

async function handleImportFileSelect(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  
  if (!file) return;

  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const typeMap = { '.md': 'Markdown', '.pdf': 'PDF', '.txt': 'TXT' };
  
  if (!typeMap[fileExt]) {
    uiStore.showError('不支持的文件格式，仅支持 .md、.pdf 和 .txt');
    return;
  }

  await uploadDocument(file, typeMap[fileExt], currentGroupId.value);
}

async function uploadDocument(file, typeName, groupId) {
  if (uploading.value) return;

  try {
    uploading.value = true;
    uiStore.showInfo('文件上传中，请稍候...');

    const title = extractTitle(file.name);
      const doc = await docStore.uploadDoc(title, file, groupId);
    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    
    if (groupId) treeStore.expandNode(groupId);
    
    uiStore.showSuccess(`${typeName} 文档导入成功`);
  } catch (error) {
    console.error('Upload error:', error);
    uiStore.showError(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
    currentGroupId.value = null;
  }
}

// ===== 批量导入 =====
function handleBatchImport(groupId) {
  currentGroupId.value = groupId;
  batchInputRef.value?.click();
}

async function handleBatchFileSelect(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  
  if (!file || uploading.value) return;

  const validationError = validateBatchFile(file, FILE_SIZE_LIMITS.BATCH);
  if (validationError) {
    uiStore.showError(validationError);
    return;
  }

  try {
    uploading.value = true;
    uiStore.showLoading('正在批量导入文档，请稍候...');

    const result = await batchUploadDocuments(file, currentGroupId.value);
    await treeStore.fetchTree();
    
    if (currentGroupId.value) treeStore.expandNode(currentGroupId.value);

    const { type, message } = formatBatchUploadResult(result);
    uiStore[type === 'success' ? 'showSuccess' : 'showError'](message);
  } catch (error) {
    console.error('Batch upload error:', error);
    uiStore.showError(error.message || '批量导入失败');
  } finally {
    uiStore.hideLoading();
    uploading.value = false;
    currentGroupId.value = null;
  }
}
</script>

<style scoped>
@import '../../styles/tree-menu.css';

.desktop-doc-tree {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 直接引用 DocTree 的样式，但只保留桌面端相关 */
/* 这里复制 DocTree.vue 的样式，但去掉所有 @media (max-width: 768px) 的移动端样式 */

.tree-list-wrapper {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-actions {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  box-shadow: inset 0 -1px 0 rgba(15, 23, 42, 0.05);
  flex-shrink: 0;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  min-width: 0;
  padding: 0 10px;
  height: 34px;
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 4px rgba(15, 23, 42, 0.04);
  transition: var(--transition-base);
}

.search-box:focus-within {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-light), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.search-icon {
  font-size: var(--icon-size-md);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 0;
}

.search-box input::placeholder {
  color: var(--color-text-tertiary);
}

.search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.search-clear:hover {
  color: var(--color-text-primary);
}

.search-clear :deep(svg) {
  font-size: var(--icon-size-sm);
}

.tree-list-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tree-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-primary);
  z-index: 10;
}

.tree-status--error {
  color: var(--color-danger);
}

.tree-status--no-results {
  color: var(--color-text-secondary);
}

.tree-status--no-results :deep(svg) {
  font-size: var(--icon-size-4xl);
  color: var(--color-primary);
}

.tree-status__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: calc(var(--spacing-xs) * -1);
}

.status-loader {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-loader .ring {
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: var(--border-radius-full);
  border: 2px solid var(--color-primary-light);
  animation: pulse 1.8s ease-in-out infinite;
}

.status-loader .spin {
  font-size: var(--icon-size-2xl);
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.tree-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
  width: 100%;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.05) 0%, rgba(148, 163, 184, 0) 20%);
}

.root-directory {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.root-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2xs);
  padding: 2px 6px;
  margin-bottom: 3px;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  background: transparent;
  border: 1px solid transparent;
}

.root-item:has(.tree-action-menu) {
  z-index: var(--z-dropdown);
}

.root-item:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.root-item.root-active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.root-leading {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
  flex: 1;
  min-width: 0;
}

.root-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--border-radius-md);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.root-item.root-active .root-icon {
  background: var(--color-primary);
  color: var(--color-bg-primary);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.root-icon :deep(svg) {
  font-size: 14px;
}

.root-label {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.root-actions {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3xs);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}

.root-item:hover .root-actions,
.root-item.root-active .root-actions,
.root-actions:has(.tree-action-menu) {
  opacity: 1;
  pointer-events: auto;
}

.root-children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 12px;
  padding-left: 8px;
  border-left: 1px solid rgba(148, 163, 184, 0.4);
}

.tree-list[data-scroll]::-webkit-scrollbar {
  width: var(--spacing-xs);
}

.tree-list[data-scroll]::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: var(--border-radius-full);
}

.tree-status__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.create-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.create-modal {
  width: min(340px, 100%);
  max-height: calc(100% - 40px);
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.create-modal__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.create-modal__eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.create-modal__title {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.create-modal__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.create-modal__close {
  align-self: flex-start;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-full);
  border: none;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.create-modal__close:hover {
  background: var(--color-bg-hover);
}

.create-modal__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.create-modal__item {
  border: 1px solid rgba(96, 118, 255, 0.2);
  border-radius: 14px;
  padding: 14px 16px;
  background: linear-gradient(180deg, rgba(248, 250, 255, 0.95), #ffffff);
  text-align: left;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border var(--transition-fast);
}

.create-modal__item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.create-modal__item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.create-modal__item-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.create-modal-fade-enter-active,
.create-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.create-modal-fade-enter-from,
.create-modal-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
</style>


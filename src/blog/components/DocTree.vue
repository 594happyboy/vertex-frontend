<template>
  <div class="doc-tree">
    <div class="tree-surface">
      <div class="tree-body">
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
                        <button class="tree-menu-item" @click="handleRootCreateGroup">
                          <Icon icon="mdi:folder-plus" />
                          <span>新建子分组</span>
                        </button>
                        <button class="tree-menu-item" @click="handleRootCreateDoc">
                          <Icon icon="mdi:file-document-plus" />
                          <span>新建文档</span>
                        </button>
                        <button class="tree-menu-item" @click="handleRootImportFile">
                          <Icon icon="mdi:file-import" />
                          <span>导入文档</span>
                        </button>
                        <button class="tree-menu-item" @click="handleRootBatchImport">
                          <Icon icon="mdi:folder-zip" />
                          <span>批量导入</span>
                        </button>
                      </div>
                    </transition>
                  </div>
                </div>
                
                <!-- 子节点 -->
                <div class="root-children">
                  <TreeNode v-for="node in tree" :key="`${node.nodeType}-${node.id}`" :node="node" :depth="1" :selected-id="selectedId"
                    :selected-type="selectedType" :expanded-keys="expandedKeys" :is-root-child="true" @select="handleSelect" @toggle="handleToggle"
                    @create-group="handleCreateGroup" @create-doc="handleCreateDoc" @import-file="handleImportFile"
                    @batch-import="handleBatchImport" @rename="handleRename" @delete="handleDelete" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="batchInputRef" type="file" accept=".zip" style="display: none" @change="handleBatchFileSelect" />
    <input ref="importInputRef" type="file" :accept="DOCUMENT_ACCEPT" style="display: none" @change="handleImportFileSelect" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';
import { batchUploadDocuments } from '../api/document';
import { useTreeMenu } from '../composables/useTreeMenu';
import TreeNode from './TreeNode.vue';
import { FILE_SIZE_LIMITS, DOCUMENT_ACCEPT } from '../constants';
import { createTextFile, extractTitle, validateBatchFile } from '../utils/fileHelpers';
import { formatBatchUploadResult } from '../utils/uiHelpers';
import { filterTree } from '../utils/treeHelpers';

const { isMobile } = useResponsive();

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
const handleRootCreateGroup = handleRootMenuAction(() => handleCreateGroup(null));
const handleRootCreateDoc = handleRootMenuAction(() => handleCreateDoc(null));
const handleRootImportFile = handleRootMenuAction(() => handleImportFile(null));
const handleRootBatchImport = handleRootMenuAction(() => handleBatchImport(null));

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
  const title = prompt('请输入文档标题：');
  if (!title?.trim()) return;

  try {
    const trimmedTitle = title.trim();
    const file = createTextFile(trimmedTitle, 'md');
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
    const doc = await docStore.createDoc(title, file, groupId);
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
    uiStore.showInfo('正在上传压缩包，请稍候...');

    const result = await batchUploadDocuments(file, currentGroupId.value);
    await treeStore.fetchTree();
    
    if (currentGroupId.value) treeStore.expandNode(currentGroupId.value);

    const { type, message } = formatBatchUploadResult(result);
    uiStore[type === 'success' ? 'showSuccess' : 'showError'](message);
  } catch (error) {
    console.error('Batch upload error:', error);
    uiStore.showError(error.message || '批量导入失败');
  } finally {
    uploading.value = false;
    currentGroupId.value = null;
  }
}
</script>

<style scoped>
@import '../styles/tree-menu.css';

.doc-tree {
  position: relative;
  height: 100%;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .doc-tree {
    padding: var(--spacing-mobile-sm);
  }
}

.tree-surface {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
  overflow: hidden;
}

.tree-surface::after {
  display: none;
}

/* 搜索框样式 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  min-width: 0;
  padding: 0 var(--spacing-sm);
  height: 38px;
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 4px rgba(15, 23, 42, 0.04);
  transition: var(--transition-base);
}

@media (max-width: 768px) {
  .search-box {
    padding: 0 var(--spacing-mobile-sm);
    height: 38px;
  }
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

@media (max-width: 768px) {
  .search-icon {
    font-size: var(--icon-size-mobile-md);
  }
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

@media (max-width: 768px) {
  .search-box input {
    font-size: var(--font-size-mobile-base);
  }
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

@media (max-width: 768px) {
  .search-clear {
    width: 22px;
    height: 22px;
  }
}

.search-clear:hover {
  color: var(--color-text-primary);
}

.search-clear :deep(svg) {
  font-size: var(--icon-size-sm);
}

@media (max-width: 768px) {
  .search-clear :deep(svg) {
    font-size: var(--icon-size-mobile-sm);
  }
}

/* 目录树容器 */
.tree-body {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
  display: flex;
  min-height: 0;
}

.tree-list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* 目录树顶部操作区（搜索框） */
.tree-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  backdrop-filter: blur(6px);
  box-shadow: inset 0 -1px 0 rgba(15, 23, 42, 0.05);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tree-actions {
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-md);
    gap: var(--spacing-mobile-xs);
  }
}

/* 目录树列表容器（包含状态和列表） */
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

@media (max-width: 768px) {
  .tree-status {
    gap: var(--spacing-mobile-md);
    padding: var(--spacing-mobile-2xl) var(--spacing-mobile-md);
  }
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

@media (max-width: 768px) {
  .tree-status__hint {
    font-size: var(--font-size-mobile-xs);
  }
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

/* 目录树列表 */
.tree-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) var(--spacing-sm);
  min-height: 0;
  width: 100%;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.05) 0%, rgba(148, 163, 184, 0) 20%);
}

@media (max-width: 768px) {
  .tree-list {
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-sm);
  }
}

/* 固定根目录样式 */
.root-directory {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.root-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-2xs) var(--spacing-xs);
  margin-bottom: var(--spacing-2xs);
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
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0;
}

.root-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--border-radius-lg);
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
  font-size: 16px;
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
  gap: var(--spacing-2xs);
  margin-left: var(--spacing-md);
  padding-left: var(--spacing-sm);
  border-left: 1px solid rgba(148, 163, 184, 0.4);
}

@media (max-width: 768px) {
  .root-item {
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-md);
    margin-bottom: var(--spacing-mobile-xs);
  }

  .root-icon {
    width: var(--icon-size-mobile-xl);
    height: var(--icon-size-mobile-xl);
  }

  .root-icon :deep(svg) {
    font-size: var(--icon-size-mobile-md);
  }

  .root-label {
    font-size: var(--font-size-mobile-sm);
  }

  .root-children {
    margin-left: var(--spacing-mobile-sm);
    padding-left: var(--spacing-mobile-sm);
  }
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

@media (max-width: 768px) {
  .tree-status__text {
    font-size: var(--font-size-mobile-sm);
  }
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

  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.75;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
</style>





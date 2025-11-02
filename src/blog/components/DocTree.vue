<template>
  <div class="doc-tree">
    <div class="tree-surface">
      <div class="tree-body">
        <div class="tree-list-wrapper">
          <!-- 顶部操作区：搜索框 + 操作按钮 -->
          <div class="tree-actions">
            <div class="search-box">
              <Icon icon="mdi:magnify" class="search-icon" />
              <input v-model="searchKeyword" type="text" placeholder="搜索文档或分组..." />
              <button v-if="searchKeyword" class="search-clear" type="button" @click="clearSearch">
                <Icon icon="mdi:close-circle" />
              </button>
            </div>
            <div class="action-buttons">
              <button class="btn-tree-action" @click="$emit('refresh')" title="刷新目录">
                <Icon icon="mdi:refresh" />
              </button>
              <button class="btn-tree-action btn-create-group" @click="handleCreateGroup(null)" title="新建分组">
                <Icon icon="mdi:folder-plus" />
              </button>
              <button class="btn-tree-action btn-create-doc" @click="showCreateDocDialog = true" title="新建文档">
                <Icon icon="mdi:file-document-plus" />
              </button>
              <button class="btn-tree-action btn-import" @click="showImportDialog = true" title="导入文档">
                <Icon icon="mdi:file-import" />
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

            <!-- 真正的空状态 -->
            <div v-else-if="tree.length === 0 && !isSearching" class="tree-status tree-status--empty">
              <Icon icon="mdi:folder-open-outline" />
              <p class="tree-status__text">暂无分组，创建一个新的分组开始组织内容。</p>
              <button class="btn-primary" @click="handleCreateGroup(null)">
                <Icon icon="mdi:plus" />
                <span>创建第一个分组</span>
              </button>
            </div>

            <!-- 目录树列表 -->
            <div v-else class="tree-list" data-scroll>
              <TreeNode v-for="node in tree" :key="`${node.nodeType}-${node.id}`" :node="node" :depth="0" :selected-id="selectedId"
                :selected-type="selectedType" :expanded-keys="expandedKeys" @select="handleSelect" @toggle="handleToggle"
                @create-group="handleCreateGroup" @create-doc="handleCreateDoc" @batch-import="handleBatchImport"
                @rename="handleRename" @delete="handleDelete" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <input ref="batchInputRef" type="file" accept=".zip" style="display: none" @change="handleBatchFileSelect" />
    
    <!-- 新建文档弹窗 -->
    <div v-if="showCreateDocDialog" class="mini-dialog-overlay" @click.self="showCreateDocDialog = false">
      <div class="mini-dialog">
        <div class="mini-dialog-header">
          <h4>新建文档</h4>
          <button class="btn-dialog-close" @click="showCreateDocDialog = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="mini-dialog-body">
          <button class="mini-option" @click="handleCreateNewDoc('md')">
            <Icon icon="mdi:language-markdown" />
            <span>Markdown 文档</span>
          </button>
          <button class="mini-option" @click="handleCreateNewDoc('txt')">
            <Icon icon="mdi:file-document" />
            <span>TXT 文档</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 导入文档弹窗 -->
    <div v-if="showImportDialog" class="mini-dialog-overlay" @click.self="showImportDialog = false">
      <div class="mini-dialog">
        <div class="mini-dialog-header">
          <h4>导入文档</h4>
          <button class="btn-dialog-close" @click="showImportDialog = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="mini-dialog-body">
          <button class="mini-option" @click="handleImportFile">
            <Icon icon="mdi:file-import" />
            <span>导入文件</span>
          </button>
          <button class="mini-option" @click="handleImportBatch">
            <Icon icon="mdi:folder-zip" />
            <span>批量导入</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="importInputRef" type="file" accept=".md,.pdf,.txt" style="display: none" @change="handleImportFileSelect" />
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
import TreeNode from './TreeNode.vue';

const { isMobile } = useResponsive();

// 常量定义
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_FAILED_ITEMS_DISPLAY = 5;

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
const showCreateDocDialog = ref(false);
const showImportDialog = ref(false);

// 计算属性
const normalizedKeyword = computed(() => searchKeyword.value.trim().toLowerCase());
const isSearching = computed(() => normalizedKeyword.value.length > 0);

const tree = computed(() => {
  return isSearching.value 
    ? filterTree(treeStore.tree, normalizedKeyword.value)
    : treeStore.tree;
});

const loading = computed(() => treeStore.loading);
const error = computed(() => treeStore.error);
const selectedId = computed(() => treeStore.selectedId);
const selectedType = computed(() => treeStore.selectedType);
const expandedKeys = computed(() => treeStore.expandedKeys);

const emit = defineEmits(['refresh']);

// ===== 搜索功能 =====
function filterTree(nodes, keyword) {
  if (!nodes?.length) return [];
  
  return nodes.reduce((filtered, node) => {
    const nameMatch = node.name.toLowerCase().includes(keyword);
    const isGroup = node.nodeType?.toUpperCase() === 'GROUP';
    const filteredChildren = isGroup && node.children?.length ? filterTree(node.children, keyword) : [];
    
    if (nameMatch || filteredChildren.length > 0) {
      const filteredNode = { ...node };
      if (filteredChildren.length > 0) {
        filteredNode.children = filteredChildren;
        if (!expandedKeys.value.includes(node.id)) treeStore.expandNode(node.id);
      }
      filtered.push(filteredNode);
    }
    
    return filtered;
  }, []);
}

const clearSearch = () => searchKeyword.value = '';

// ===== 工具函数 =====
function createTextFile(title, type) {
  const config = {
    md: { content: `# ${title}\n\n开始编写你的文档...`, mime: 'text/markdown', ext: '.md' },
    txt: { content: '', mime: 'text/plain', ext: '.txt' }
  }[type];
  
  const blob = new Blob([config.content], { type: config.mime });
  return new File([blob], `${title}${config.ext}`, { type: config.mime });
}

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

// ===== 新建文档 =====
async function handleCreateNewDoc(type) {
  const title = prompt('请输入文档标题：');
  if (!title?.trim()) return;
  
  showCreateDocDialog.value = false;

  try {
    const trimmedTitle = title.trim();
    const file = createTextFile(trimmedTitle, type);
    const doc = await docStore.createDoc(trimmedTitle, file);
    
    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    
    const typeName = type === 'md' ? 'Markdown' : 'TXT';
    uiStore.showSuccess(`${typeName} 文档创建成功`);
  } catch (error) {
    uiStore.showError(error.message || '创建文档失败');
  }
}

// ===== 导入文档 =====
function handleImportFile() {
  showImportDialog.value = false;
  importInputRef.value?.click();
}

function handleImportBatch() {
  showImportDialog.value = false;
  handleBatchImport(null);
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

  await uploadDocument(file, typeMap[fileExt]);
}

async function uploadDocument(file, typeName) {
  if (uploading.value) return;

  try {
    uploading.value = true;
    uiStore.showInfo('文件上传中，请稍候...');

    const fileName = file.name;
    const title = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    const doc = await docStore.createDoc(title, file);
    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    
    uiStore.showSuccess(`${typeName} 文档导入成功`);
  } catch (error) {
    console.error('Upload error:', error);
    uiStore.showError(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
  }
}

// ===== 批量导入 =====
function handleBatchImport(groupId) {
  currentGroupId.value = groupId;
  batchInputRef.value?.click();
}

function validateBatchFile(file) {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return '请选择 ZIP 格式的压缩包';
  }
  if (file.size > MAX_FILE_SIZE) {
    return '文件大小超过限制（最大100MB）';
  }
  return null;
}

function formatBatchResult(result) {
  const { totalFolders, successCount, failedCount, items } = result;
  
  if (failedCount === 0) {
    return {
      type: 'success',
      message: `批量导入成功！共导入 ${totalFolders} 个分组，${successCount} 个文档`
    };
  }
  
  const failedItems = items.filter(item => !item.success);
  const displayItems = failedItems.slice(0, MAX_FAILED_ITEMS_DISPLAY);
  const failedMsg = displayItems.map(item => `${item.name}: ${item.message}`).join('\n');
  const moreMsg = failedItems.length > MAX_FAILED_ITEMS_DISPLAY 
    ? `\n...还有${failedItems.length - MAX_FAILED_ITEMS_DISPLAY}个失败` 
    : '';
  
  return {
    type: 'error',
    message: `部分导入失败！成功：${successCount}，失败：${failedCount}\n${failedMsg}${moreMsg}`
  };
}

async function handleBatchFileSelect(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  
  if (!file || uploading.value) return;

  const validationError = validateBatchFile(file);
  if (validationError) {
    uiStore.showError(validationError);
    return;
  }

  try {
    uploading.value = true;
    uiStore.showInfo('正在上传压缩包，请稍候...');

    const result = await batchUploadDocuments(file, currentGroupId.value);
    emit('refresh');
    
    if (currentGroupId.value) treeStore.expandNode(currentGroupId.value);

    const { type, message } = formatBatchResult(result);
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
  flex: 1;
  min-width: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  transition: var(--transition-base);
}

@media (max-width: 768px) {
  .search-box {
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-sm);
  }
}

.search-box:focus-within {
  border-color: var(--color-border-focus);
  box-shadow: var(--shadow-focus);
}

.search-icon {
  font-size: var(--icon-size-md);
  color: var(--color-text-secondary);
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
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  border-radius: var(--border-radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .search-clear {
    width: var(--icon-size-mobile-lg);
    height: var(--icon-size-mobile-lg);
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
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* 目录树顶部操作区（搜索框 + 操作按钮） */
.tree-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-tertiary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tree-actions {
    padding: var(--spacing-mobile-sm);
    gap: var(--spacing-mobile-xs);
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .action-buttons {
    gap: var(--spacing-mobile-2xs);
  }
}

.btn-tree-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-height-sm);
  height: var(--btn-height-sm);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-tree-action :deep(svg) {
  font-size: var(--icon-size-md);
}

@media (max-width: 768px) {
  .btn-tree-action {
    width: var(--btn-height-mobile-sm);
    height: var(--btn-height-mobile-sm);
    flex: 1;
    min-width: 0;
  }

  .btn-tree-action :deep(svg) {
    font-size: var(--icon-size-mobile-md);
  }
}

.btn-tree-action:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-hover);
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

.btn-tree-action.btn-create-group {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-tree-action.btn-create-group:hover {
  background: var(--color-primary-lighter);
  border-color: var(--color-primary);
}

.btn-tree-action.btn-create-doc {
  background: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.btn-tree-action.btn-create-doc:hover {
  background: var(--color-success-lighter);
  border-color: var(--color-success);
}

.btn-tree-action.btn-import {
  background: var(--color-warning-light);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.btn-tree-action.btn-import:hover {
  background: var(--color-warning-lighter);
  border-color: var(--color-warning);
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

.tree-status--empty {
  color: var(--color-text-secondary);
}

.tree-status--empty :deep(svg) {
  font-size: var(--icon-size-4xl);
  color: var(--color-text-tertiary);
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

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-sm);
  border-radius: var(--border-radius-xl);
  border: none;
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
}

@media (max-width: 768px) {
  .btn-primary {
    padding: var(--btn-padding-mobile-sm);
    font-size: var(--font-size-mobile-sm);
  }
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

.btn-primary:deep(svg) {
  color: var(--color-text-inverse);
  font-size: var(--icon-size-xl);
}

.tree-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xs);
  min-height: 0;
  width: 100%;
}

@media (max-width: 768px) {
  .tree-list {
    padding: var(--spacing-mobile-xs);
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

/* 小弹窗样式 */
.mini-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
}

.mini-dialog {
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-2xl);
  width: 90%;
  max-width: 320px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.mini-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-tertiary);
}

@media (max-width: 768px) {
  .mini-dialog-header {
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-md);
  }
}

.mini-dialog-header h4 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

@media (max-width: 768px) {
  .mini-dialog-header h4 {
    font-size: var(--font-size-mobile-md);
  }
}

.btn-dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-height-xs);
  height: var(--btn-height-xs);
  border-radius: var(--border-radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

@media (max-width: 768px) {
  .btn-dialog-close {
    width: var(--btn-height-mobile-xs);
    height: var(--btn-height-mobile-xs);
  }
}

.btn-dialog-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-dialog-close :deep(svg) {
  font-size: var(--icon-size-md);
}

@media (max-width: 768px) {
  .btn-dialog-close :deep(svg) {
    font-size: var(--icon-size-mobile-md);
  }
}

.mini-dialog-body {
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

@media (max-width: 768px) {
  .mini-dialog-body {
    padding: var(--spacing-mobile-sm);
    gap: var(--spacing-mobile-xs);
  }
}

.mini-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
  min-height: var(--touch-target-min);
}

@media (max-width: 768px) {
  .mini-option {
    gap: var(--spacing-mobile-sm);
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-md);
    font-size: var(--font-size-mobile-base);
  }
}

.mini-option:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.mini-option :deep(svg) {
  font-size: var(--icon-size-lg);
  color: var(--color-primary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .mini-option :deep(svg) {
    font-size: var(--icon-size-mobile-lg);
  }
}

.mini-option span {
  flex: 1;
}
</style>





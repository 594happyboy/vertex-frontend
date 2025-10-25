<template>
  <div class="doc-tree">
    <div class="tree-surface">
      <!-- 工具栏 -->
      <div class="tree-toolbar">
        <div class="search-row">
          <div class="search-box">
            <Icon icon="mdi:magnify" class="search-icon" />
            <input v-model="searchKeyword" type="text" placeholder="搜索文档或分组..." @input="handleSearch" />
            <button v-if="searchKeyword" class="search-clear" type="button" @click="clearSearch">
              <Icon icon="mdi:close-circle" />
            </button>
          </div>
        </div>
      </div>

      <div class="tree-body">
        <div v-if="loading" class="tree-status">
          <div class="status-loader">
            <span class="ring"></span>
            <Icon icon="mdi:loading" class="spin" />
          </div>
          <span>正在加载目录结构...</span>
        </div>

        <div v-else-if="error" class="tree-status tree-status--error">
          <Icon icon="mdi:alert-circle-outline" />
          <span>{{ error }}</span>
        </div>

        <div v-else-if="tree.length === 0" class="tree-status tree-status--empty">
          <Icon icon="mdi:folder-open-outline" />
          <p class="tree-status__text">暂无分组，创建一个新的分组开始组织内容。</p>
          <button class="btn-primary" @click="handleCreateGroup(null)">
            <Icon icon="mdi:plus" />
            <span>创建第一个分组</span>
          </button>
        </div>

        <div v-else class="tree-list-wrapper">
          <!-- 目录树顶部操作按钮 -->
          <div class="tree-actions">
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
          
          <!-- 目录树列表 -->
          <div class="tree-list" data-scroll>
            <TreeNode v-for="node in tree" :key="`${node.nodeType}-${node.id}`" :node="node" :depth="0" :selected-id="selectedId"
              :selected-type="selectedType" :expanded-keys="expandedKeys" @select="handleSelect" @toggle="handleToggle"
              @create-group="handleCreateGroup" @create-doc="handleCreateDoc" @batch-import="handleBatchImport"
              @rename="handleRename" @delete="handleDelete" />
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
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';
import { batchUploadDocuments } from '../api/document';
import TreeNode from './TreeNode.vue';

// 常量定义
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
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
const tree = computed(() => treeStore.tree);
const loading = computed(() => treeStore.loading);
const error = computed(() => treeStore.error);
const selectedId = computed(() => treeStore.selectedId);
const selectedType = computed(() => treeStore.selectedType);
const expandedKeys = computed(() => treeStore.expandedKeys);

const emit = defineEmits(['refresh']);

// ===== 搜索功能 =====
function handleSearch() {
  docStore.setSearchKeyword(searchKeyword.value);
}

function clearSearch() {
  searchKeyword.value = '';
  handleSearch();
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
    const initialContent = `# ${trimmedTitle}\n\n开始编写你的文档...`;
    const file = new File(
      [new Blob([initialContent], { type: 'text/markdown' })], 
      `${trimmedTitle}.md`, 
      { type: 'text/markdown' }
    );

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
    let file;
    
    if (type === 'md') {
      const initialContent = `# ${trimmedTitle}\n\n开始编写你的文档...`;
      file = new File(
        [new Blob([initialContent], { type: 'text/markdown' })],
        `${trimmedTitle}.md`,
        { type: 'text/markdown' }
      );
    } else if (type === 'txt') {
      file = new File(
        [new Blob([''], { type: 'text/plain' })],
        `${trimmedTitle}.txt`,
        { type: 'text/plain' }
      );
    }

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
  if (!['.md', '.pdf', '.txt'].includes(fileExt)) {
    uiStore.showError('不支持的文件格式，仅支持 .md、.pdf 和 .txt');
    return;
  }

  const typeName = fileExt === '.md' ? 'Markdown' : (fileExt === '.pdf' ? 'PDF' : 'TXT');
  await uploadDocument(file, typeName);
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
  event.target.value = ''; // 重置input
  
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
    if (currentGroupId.value) {
      treeStore.expandNode(currentGroupId.value);
    }

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
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

/* 工具栏 */
.tree-toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 233, 255, 0.5);
  flex-shrink: 0;
  margin-bottom: 12px;
}

.btn-create-new {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, rgba(108, 126, 255, 0.96), rgba(68, 148, 255, 0.92));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-create-new :deep(svg) {
  font-size: 20px;
}

.btn-create-new:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -20px rgba(61, 109, 255, 0.7);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(210, 220, 255, 0.6);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:focus-within {
  border-color: rgba(120, 140, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(120, 140, 255, 0.1);
}

.search-icon {
  font-size: 18px;
  color: rgba(41, 51, 116, 0.5);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #1f2664;
  font-size: 13px;
  min-width: 0;
}

.search-box input::placeholder {
  color: rgba(31, 38, 98, 0.45);
}

.search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(41, 51, 116, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.search-clear:hover {
  color: #293374;
}

.search-clear :deep(svg) {
  font-size: 16px;
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
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 233, 255, 0.5);
  overflow: hidden;
}

/* 目录树顶部操作按钮 */
.tree-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid rgba(226, 233, 255, 0.5);
  background: rgba(248, 250, 255, 0.6);
}

.btn-tree-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(196, 206, 255, 0.6);
  background: rgba(255, 255, 255, 0.9);
  color: #293374;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.btn-tree-action :deep(svg) {
  font-size: 18px;
}

.btn-tree-action:hover {
  transform: translateY(-1px);
  border-color: rgba(120, 140, 255, 0.75);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 8px 20px -14px rgba(26, 42, 116, 0.4);
}

.btn-tree-action.btn-create-group {
  background: linear-gradient(135deg, rgba(108, 126, 255, 0.08), rgba(68, 148, 255, 0.06));
  border-color: rgba(108, 126, 255, 0.35);
  color: #4966ff;
}

.btn-tree-action.btn-create-group:hover {
  background: linear-gradient(135deg, rgba(108, 126, 255, 0.15), rgba(68, 148, 255, 0.12));
  border-color: rgba(108, 126, 255, 0.5);
}

.btn-tree-action.btn-create-doc {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(16, 185, 129, 0.06));
  border-color: rgba(16, 185, 129, 0.35);
  color: #059669;
}

.btn-tree-action.btn-create-doc:hover {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.12));
  border-color: rgba(16, 185, 129, 0.5);
}

.btn-tree-action.btn-import {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.08), rgba(249, 115, 22, 0.06));
  border-color: rgba(249, 115, 22, 0.35);
  color: #ea580c;
}

.btn-tree-action.btn-import:hover {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.12));
  border-color: rgba(249, 115, 22, 0.5);
}

.tree-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 48px 24px;
  text-align: center;
  color: rgba(33, 42, 110, 0.6);
}

.tree-status--error {
  color: #d64545;
}

.tree-status--empty {
  color: rgba(33, 42, 110, 0.65);
}

.tree-status--empty :deep(svg) {
  font-size: 46px;
  color: rgba(96, 108, 182, 0.5);
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
  border-radius: 999px;
  border: 2px solid rgba(93, 121, 255, 0.3);
  animation: pulse 1.8s ease-in-out infinite;
}

.status-loader .spin {
  font-size: 26px;
  color: rgba(73, 102, 214, 0.75);
  animation: spin 1s linear infinite;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, rgba(108, 126, 255, 0.96), rgba(68, 148, 255, 0.92));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -20px rgba(61, 109, 255, 0.6);
}

.btn-primary:deep(svg) {
  color: #fff;
  font-size: 25px;
}

.tree-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}

.tree-list[data-scroll]::-webkit-scrollbar {
  width: 8px;
}

.tree-list[data-scroll]::-webkit-scrollbar-thumb {
  background: rgba(177, 190, 255, 0.6);
  border-radius: 999px;
}

.tree-status__text {
  font-size: 13px;
  color: rgba(33, 42, 110, 0.65);
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.mini-dialog {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 320px;
  overflow: hidden;
  border: 1px solid rgba(226, 233, 255, 0.6);
}

.mini-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(226, 233, 255, 0.5);
  background: rgba(248, 250, 255, 0.6);
}

.mini-dialog-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2664;
  margin: 0;
}

.btn-dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-dialog-close:hover {
  background: rgba(226, 233, 255, 0.4);
  color: #293374;
}

.btn-dialog-close :deep(svg) {
  font-size: 18px;
}

.mini-dialog-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(226, 233, 255, 0.6);
  background: rgba(255, 255, 255, 0.9);
  color: #1f2664;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mini-option:hover {
  background: rgba(234, 239, 255, 0.9);
  border-color: rgba(108, 126, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -12px rgba(26, 42, 116, 0.3);
}

.mini-option :deep(svg) {
  font-size: 20px;
  color: #6366f1;
  flex-shrink: 0;
}

.mini-option span {
  flex: 1;
}
</style>

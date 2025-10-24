<template>
  <div class="doc-tree">
    <div class="tree-surface">
      <!-- 工具栏 -->
      <div class="tree-toolbar">
        <button class="btn-create-new" @click="$emit('create-root')" title="新建或导入">
          <Icon icon="mdi:plus-circle" />
          <span>新建或导入</span>
        </button>

        <div class="search-row">
          <div class="search-box">
            <Icon icon="mdi:magnify" class="search-icon" />
            <input v-model="searchKeyword" type="text" placeholder="搜索文档或分组..." @input="handleSearch" />
            <button v-if="searchKeyword" class="search-clear" type="button" @click="clearSearch">
              <Icon icon="mdi:close-circle" />
            </button>
          </div>

          <button class="btn-icon-compact" @click="$emit('refresh')" title="刷新目录">
            <Icon icon="mdi:refresh" />
          </button>
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

        <div v-else class="tree-list" data-scroll>
          <TreeNode v-for="node in tree" :key="node.id" :node="node" :depth="0" :selected-id="selectedId"
            :expanded-keys="expandedKeys" @select="handleSelect" @toggle="handleToggle"
            @create-group="handleCreateGroup" @create-doc="handleCreateDoc" @batch-import="handleBatchImport"
            @rename="handleRename" @delete="handleDelete" />
        </div>
      </div>
    </div>

    <input ref="batchInputRef" type="file" accept=".zip" style="display: none" @change="handleBatchFileSelect" />
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

const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

const batchInputRef = ref(null);
const currentGroupId = ref(null);
const uploading = ref(false);
const searchKeyword = ref('');

const tree = computed(() => treeStore.tree);
const loading = computed(() => treeStore.loading);
const error = computed(() => treeStore.error);
const selectedId = computed(() => treeStore.selectedId);
const expandedKeys = computed(() => treeStore.expandedKeys);

const emit = defineEmits([
  'select',
  'toggle',
  'create-group',
  'create-doc',
  'batch-import',
  'rename',
  'delete',
  'refresh',
  'create-root',
]);

// 搜索功能
function handleSearch() {
  docStore.setSearchKeyword(searchKeyword.value);
}

function clearSearch() {
  searchKeyword.value = '';
  handleSearch();
}

// 选中节点
function handleSelect(node, type) {
  treeStore.selectNode(node.id, type);

  if (type === 'document') {
    docStore.openDoc(node.id);
  }
}

// 切换展开/收起
function handleToggle(nodeId) {
  treeStore.toggleExpand(nodeId);
}

// 创建分组
async function handleCreateGroup(parentId) {
  const name = prompt('请输入分组名称：');
  if (!name || !name.trim()) return;

  try {
    await treeStore.createGroup(name.trim(), parentId);
    uiStore.showSuccess('分组创建成功');

    // 展开父节点
    if (parentId) {
      treeStore.expandNode(parentId);
    }
  } catch (error) {
    uiStore.showError(error.message || '创建分组失败');
  }
}

// 创建文档
async function handleCreateDoc(groupId) {
  const title = prompt('请输入文档标题：');
  if (!title || !title.trim()) return;

  try {
    // 创建空的Markdown文件
    const initialContent = `# ${title.trim()}\n\n开始编写你的文档...`;
    const blob = new Blob([initialContent], { type: 'text/markdown' });
    const file = new File([blob], `${title.trim()}.md`, { type: 'text/markdown' });

    const doc = await docStore.createDoc(title.trim(), file, groupId);
    await treeStore.fetchTree(); // 重新加载树
    uiStore.showSuccess('文档创建成功');

    // 选中新建的文档
    treeStore.selectNode(doc.id, 'document');

    // 展开所属分组
    if (groupId) {
      treeStore.expandNode(groupId);
    }
  } catch (error) {
    uiStore.showError(error.message || '创建文档失败');
  }
}

// 重命名
async function handleRename(node, type) {
  const oldName = node.name;
  const newName = prompt('请输入新名称：', oldName);

  if (!newName || !newName.trim() || newName.trim() === oldName) {
    return;
  }

  try {
    if (type === 'group') {
      await treeStore.updateGroup(node.id, { name: newName.trim() });
      uiStore.showSuccess('分组重命名成功');
    } else {
      await docStore.saveDoc({ title: newName.trim() });
      await treeStore.fetchTree();
      uiStore.showSuccess('文档重命名成功');
    }
  } catch (error) {
    uiStore.showError(error.message || '重命名失败');
  }
}

// 删除
async function handleDelete(node, type) {
  const name = node.name;
  const confirmed = confirm(`确定要删除"${name}"吗？`);

  if (!confirmed) return;

  try {
    if (type === 'group') {
      await treeStore.deleteGroup(node.id);
      uiStore.showSuccess('分组删除成功');
    } else {
      await docStore.deleteDoc(node.id);
      await treeStore.fetchTree(); // 会自动检查并关闭不存在的文档
      uiStore.showSuccess('文档删除成功');
    }
  } catch (error) {
    uiStore.showError(error.message || '删除失败');
  }
}

// 批量导入
function handleBatchImport(groupId) {
  currentGroupId.value = groupId;
  batchInputRef.value?.click();
}

// 处理批量导入文件选择
async function handleBatchFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 重置input
  event.target.value = '';

  if (uploading.value) return;

  // 验证文件类型
  if (!file.name.toLowerCase().endsWith('.zip')) {
    uiStore.showError('请选择 ZIP 格式的压缩包');
    return;
  }

  // 验证文件大小（最大100MB）
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    uiStore.showError('文件大小超过限制（最大100MB）');
    return;
  }

  try {
    uploading.value = true;

    // 显示上传提示
    uiStore.showInfo('正在上传压缩包，请稍候...');

    // 调用批量上传API
    const result = await batchUploadDocuments(file, currentGroupId.value);

    // 刷新文档树
    emit('refresh');

    // 展开目标分组
    if (currentGroupId.value) {
      treeStore.expandNode(currentGroupId.value);
    }

    // 显示结果
    const { totalFiles, totalFolders, successCount, failedCount, items } = result;

    if (failedCount === 0) {
      uiStore.showSuccess(
        `批量导入成功！共导入 ${totalFolders} 个分组，${successCount} 个文档`
      );
    } else {
      // 显示详细的失败信息
      const failedItems = items.filter(item => !item.success);
      const failedMsg = failedItems.slice(0, 5).map(item => `${item.name}: ${item.message}`).join('\n');
      const moreMsg = failedItems.length > 5 ? `\n...还有${failedItems.length - 5}个失败` : '';

      uiStore.showError(
        `部分导入失败！成功：${successCount}，失败：${failedCount}\n${failedMsg}${moreMsg}`
      );
    }

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
  min-width: 0;  /* 关键！允许搜索框缩小到任意大小 */
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


.btn-icon-compact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(196, 206, 255, 0.7);
  background: rgba(255, 255, 255, 0.9);
  color: #293374;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.btn-icon-compact :deep(svg) {
  font-size: 18px;
}

.btn-icon-compact:hover {
  transform: translateY(-1px);
  border-color: rgba(120, 140, 255, 0.75);
  box-shadow: 0 14px 32px -24px rgba(26, 42, 116, 0.5);
}

.tree-body {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
  display: flex;
  min-height: 0;
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
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 233, 255, 0.5);
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
</style>

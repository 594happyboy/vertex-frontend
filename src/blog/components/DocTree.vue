<template>
  <div class="doc-tree">
    <div class="tree-header">
      <h3>目录</h3>
      <button
        class="btn-icon-sm"
        @click="handleCreateGroup(null)"
        title="新建分组"
      >
        <Icon icon="mdi:folder-plus" />
      </button>
    </div>

    <div class="tree-body">
      <div v-if="loading" class="tree-loading">
        <Icon icon="mdi:loading" class="spin" />
        <span>加载中...</span>
      </div>

      <div v-else-if="error" class="tree-error">
        <Icon icon="mdi:alert-circle" />
        <span>{{ error }}</span>
      </div>

      <div v-else-if="tree.length === 0" class="tree-empty">
        <Icon icon="mdi:folder-open-outline" />
        <p>暂无分组</p>
        <button class="btn-sm btn-primary" @click="handleCreateGroup(null)">
          创建第一个分组
        </button>
      </div>

      <div v-else class="tree-list">
        <TreeNode
          v-for="node in tree"
          :key="node.id"
          :node="node"
          :selected-id="selectedId"
          :expanded-keys="expandedKeys"
          @select="handleSelect"
          @toggle="handleToggle"
          @create-group="handleCreateGroup"
          @create-doc="handleCreateDoc"
          @rename="handleRename"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';
import TreeNode from './TreeNode.vue';

const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

const tree = computed(() => treeStore.tree);
const loading = computed(() => treeStore.loading);
const error = computed(() => treeStore.error);
const selectedId = computed(() => treeStore.selectedId);
const expandedKeys = computed(() => treeStore.expandedKeys);

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
    const doc = await docStore.createDoc(title.trim(), 'md', groupId);
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
      await treeStore.fetchTree();
      uiStore.showSuccess('文档删除成功');
    }
  } catch (error) {
    uiStore.showError(error.message || '删除失败');
  }
}
</script>

<style scoped>
.doc-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.tree-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.btn-icon-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  font-size: 18px;
}

.btn-icon-sm:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tree-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.tree-loading,
.tree-error,
.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.tree-loading .spin {
  animation: spin 1s linear infinite;
  font-size: 32px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tree-error {
  color: var(--color-error);
}

.tree-empty p {
  margin: 0;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>


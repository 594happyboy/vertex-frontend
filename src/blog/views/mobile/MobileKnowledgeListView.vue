<template>
  <div class="mobile-knowledge-list">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-box">
        <Icon icon="mdi:magnify" class="search-icon" />
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索文档或分组..." 
        />
        <button 
          v-if="searchKeyword" 
          class="search-clear" 
          @click="clearSearch"
        >
          <Icon icon="mdi:close-circle" />
        </button>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="doc-list-scroll">
      <MobileDocList 
        :tree="tree"
        :selected-id="selectedId"
        :selected-type="selectedType"
        :expanded-keys="expandedKeys"
        :loading="loading"
        :error="error"
        @select="handleSelect"
        @toggle="handleToggle"
        @create-group="handleCreateGroup"
        @create-doc="handleCreateDoc"
        @create-rich-doc="handleCreateRichDoc"
        @import-file="handleImportFile"
        @batch-import="handleBatchImport"
        @rename="handleRename"
        @delete="handleDelete"
      />
    </div>

    <!-- 浮动操作按钮 -->
    <MobileFloatingActions 
      @create-doc="() => handleCreateDoc(null)"
      @create-rich-doc="() => handleCreateRichDoc(null)"
      @create-group="() => handleCreateGroup(null)"
    />

    <!-- 隐藏的文件输入 -->
    <input 
      ref="batchInputRef" 
      type="file" 
      accept=".zip" 
      style="display: none" 
      @change="handleBatchFileSelect" 
    />
    <input 
      ref="importInputRef" 
      type="file" 
      :accept="DOCUMENT_ACCEPT" 
      style="display: none" 
      @change="handleImportFileSelect" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useTreeStore } from '../../stores/tree';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';
import { batchUploadDocuments } from '../../api/document';
import MobileDocList from '../../components/mobile/MobileDocList.vue';
import MobileFloatingActions from '../../components/mobile/MobileFloatingActions.vue';
import { FILE_SIZE_LIMITS, DOCUMENT_ACCEPT } from '../../constants';
import { createTextFile, extractTitle, validateBatchFile } from '../../utils/fileHelpers';
import { formatBatchUploadResult } from '../../utils/uiHelpers';
import { filterTree } from '../../utils/treeHelpers';

const router = useRouter();
const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

const batchInputRef = ref(null);
const importInputRef = ref(null);
const currentGroupId = ref(null);
const uploading = ref(false);
const searchKeyword = ref('');

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

// 搜索功能
const clearSearch = () => searchKeyword.value = '';

// 节点操作
function handleSelect(node, type) {
  treeStore.selectNode(node.id, type);
  if (type === 'document') {
    // 移动端：跳转到独立编辑页
    router.push(`/me/doc/${node.id}`);
  }
}

function handleToggle(nodeId) {
  treeStore.toggleExpand(nodeId);
}

// CRUD 操作
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
    
    // 跳转到编辑页
    router.push(`/me/doc/${doc.id}`);
    
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
    
    // 跳转到编辑页
    router.push(`/me/doc/${doc.id}`);
    
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

// 导入文档
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
    
    // 跳转到编辑页
    router.push(`/me/doc/${doc.id}`);
    
    uiStore.showSuccess(`${typeName} 文档导入成功`);
  } catch (error) {
    console.error('Upload error:', error);
    uiStore.showError(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
    currentGroupId.value = null;
  }
}

// 批量导入
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

onMounted(async () => {
  try {
    await treeStore.fetchTree();
  } catch (error) {
    if (error.code !== 401) {
      uiStore.showError(error.message || '加载数据失败');
    }
  }
});
</script>

<style scoped>
.mobile-knowledge-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  overflow: hidden;
}

.search-section {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-bg-primary);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 12px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  transition: var(--transition-base);
}

.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-icon {
  font-size: 20px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 15px;
  min-width: 0;
}

.search-box input::placeholder {
  color: var(--color-text-tertiary);
}

.search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.search-clear:active {
  background: var(--color-bg-hover);
}

.search-clear :deep(svg) {
  font-size: 18px;
}

.doc-list-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
</style>


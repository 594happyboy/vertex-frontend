<template>
  <div class="tree-explorer">
    <!-- 顶部搜索框(可选) -->
    <div v-if="showSearch" class="tree-search">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索文件夹..."
        class="search-input"
        @input="handleSearch"
      />
      <Icon v-if="searchKeyword" icon="mdi:close-circle" class="clear-icon" @click="clearSearch" />
    </div>

    <!-- 根节点 -->
    <div class="tree-root">
      <TreeExplorerNode
        :node="rootNode"
        :level="0"
        :selected-id="selectedId"
        :expanded="isNodeExpanded('root')"
        :loading="isNodeLoading('root')"
        @toggle="handleToggle('root')"
        @select="handleSelect('root')"
        @load-more="handleLoadMore('root')"
      />
    </div>

    <!-- 树节点列表 -->
    <div v-if="isNodeExpanded('root')" class="tree-children">
      <!-- 虚拟滚动暂时禁用（vue-virtual-scroller 不兼容 Vue 3） -->
      <TreeExplorerNode
        v-for="node in filteredRootChildren"
        :key="node.id"
        :node="node"
        :level="1"
        :selected-id="selectedId"
        :expanded="isNodeExpanded(node.id)"
        :loading="isNodeLoading(node.id)"
        @toggle="handleToggle(node.id)"
        @select="handleSelect(node.id)"
        @load-more="handleLoadMore(node.id)"
        @context-menu="handleContextMenu($event, node)"
      />
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="tree-loading">
      <Icon icon="mdi:loading" class="spin" />
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredRootChildren.length === 0" class="tree-empty">
      <Icon icon="mdi:folder-outline" />
      <span>{{ searchKeyword ? '未找到匹配的文件夹' : '暂无文件夹' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
// import { RecycleScroller } from 'vue-virtual-scroller'; // 暂时移除，Vue 3 不兼容
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import TreeExplorerNode from './TreeExplorerNode.vue';
import { useFileStore } from '../stores/file';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  /** 当前选中的文件夹ID */
  selectedId: {
    type: String,
    default: null,
  },
  /** 是否显示搜索框 */
  showSearch: {
    type: Boolean,
    default: false,
  },
  // useVirtualScroll prop 已移除（虚拟滚动暂时禁用）
});

const emit = defineEmits([
  'select',      // 选中节点
  'toggle',      // 展开/折叠节点
  'context-menu', // 右键菜单
]);

const store = useFileStore();

// 搜索关键词
const searchKeyword = ref('');

// 加载状态
const loading = computed(() => store.folderLoading);

// 根节点
const rootNode = computed(() => ({
  id: 'root',
  name: '我的文件',
  type: 'folder',
  childFolderCount: store.statistics?.totalFiles || 0,
  childFileCount: 0,
}));

// 根节点的子文件夹
const rootChildren = computed(() => {
  const treeState = store.treeState['root'];
  if (treeState && treeState.children) {
    return treeState.children;
  }
  // Fallback: 使用旧版folderTree
  return store.folderTree || [];
});

// 过滤后的根节点子文件夹
const filteredRootChildren = computed(() => {
  if (!searchKeyword.value.trim()) {
    return rootChildren.value;
  }
  
  const keyword = searchKeyword.value.toLowerCase();
  return filterNodes(rootChildren.value, keyword);
});

/**
 * 递归过滤节点
 */
function filterNodes(nodes, keyword) {
  const result = [];
  
  for (const node of nodes) {
    const matchesName = node.name.toLowerCase().includes(keyword);
    const children = node.children || getNodeChildren(node.id);
    const matchingChildren = children.length > 0 ? filterNodes(children, keyword) : [];
    
    if (matchesName || matchingChildren.length > 0) {
      result.push({
        ...node,
        children: matchingChildren,
      });
    }
  }
  
  return result;
}

/**
 * 获取节点的子节点
 */
function getNodeChildren(nodeId) {
  const treeState = store.treeState[nodeId];
  if (treeState && treeState.children) {
    return treeState.children;
  }
  
  // Fallback: 从folderTree中查找
  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) {
        return node.children || [];
      }
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return [];
  };
  
  return findNode(store.folderTree, nodeId);
}

/**
 * 检查节点是否展开
 */
function isNodeExpanded(nodeId) {
  return store.isTreeNodeExpanded(nodeId);
}

/**
 * 检查节点是否正在加载
 */
function isNodeLoading(nodeId) {
  const treeState = store.treeState[nodeId];
  return treeState ? treeState.loading : false;
}

/**
 * 处理节点展开/折叠
 */
async function handleToggle(nodeId) {
  emit('toggle', nodeId);
  await store.toggleTreeNode(nodeId);
}

/**
 * 处理节点选中
 */
function handleSelect(nodeId) {
  emit('select', nodeId === 'root' ? null : nodeId);
}

/**
 * 处理加载更多子节点
 */
async function handleLoadMore(nodeId) {
  await store.fetchTreeChildren(nodeId);
}

/**
 * 处理右键菜单
 */
function handleContextMenu(event, node) {
  emit('context-menu', { event, node });
}

/**
 * 处理搜索
 */
const handleSearch = useDebounceFn(() => {
  // 搜索逻辑已在computed中实现
}, 300);

/**
 * 清除搜索
 */
function clearSearch() {
  searchKeyword.value = '';
}

// 监听选中节点变化,自动展开路径
watch(() => props.selectedId, async (newId) => {
  if (newId && store.folderPath.length > 0) {
    // 展开所有父节点
    for (const folder of store.folderPath) {
      if (folder.id && !isNodeExpanded(folder.id)) {
        await handleToggle(folder.id);
      }
    }
  }
}, { immediate: false });

// 初始化
onMounted(async () => {
  // 如果根节点未加载,加载之
  if (!store.treeState['root']) {
    await store.fetchTreeChildren('root');
  }
});
</script>

<style scoped>
.tree-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 搜索框 */
.tree-search {
  position: relative;
  padding: 8px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.2);
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid rgba(200, 210, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: rgba(96, 118, 255, 0.5);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(96, 118, 255, 0.1);
}

.clear-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: rgba(96, 118, 255, 0.6);
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-icon:hover {
  color: rgba(96, 118, 255, 1);
}

/* 根节点 */
.tree-root {
  padding: 4px 0;
  border-bottom: 1px solid rgba(200, 210, 255, 0.2);
}

/* 树节点列表 */
.tree-children {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
}

.tree-scroller {
  height: 100%;
}

/* 滚动条样式 */
.tree-children::-webkit-scrollbar {
  width: 6px;
}

.tree-children::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 3px;
}

.tree-children::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 3px;
}

.tree-children::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}

/* 加载中 */
.tree-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: rgba(96, 118, 255, 0.8);
  font-size: 13px;
}

.tree-loading .spin {
  font-size: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  color: rgba(96, 118, 255, 0.5);
  font-size: 13px;
}

.tree-empty :deep(svg) {
  font-size: 48px;
  opacity: 0.3;
}

/* 响应式 */
@media (max-width: 768px) {
  .tree-search {
    padding: 6px;
  }
  
  .search-input {
    padding: 6px 28px 6px 10px;
    font-size: 12px;
  }
  
  .tree-empty {
    padding: 32px 16px;
  }
}
</style>


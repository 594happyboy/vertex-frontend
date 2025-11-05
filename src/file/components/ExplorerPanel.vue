<template>
  <div class="explorer-panel">
    <!-- 面包屑导航 -->
    <ExplorerBreadcrumb
      :path="folderPath"
      :loading="loading"
      @navigate="handleNavigate"
    />

    <!-- 工具栏 -->
    <ExplorerToolbar
      :keyword="keyword"
      :sort-by="sortBy"
      :order="order"
      :view-mode="viewMode"
      :has-selection="hasSelection"
      :selection-count="selectionCount"
      @search="handleSearch"
      @sort-change="handleSortChange"
      @toggle-order="handleToggleOrder"
      @set-view-mode="handleSetViewMode"
      @refresh="handleRefresh"
      @upload="handleUpload"
      @create-folder="handleCreateFolder"
      @batch-move="handleBatchMove"
      @batch-delete="handleBatchDelete"
    />

    <!-- 统计信息 -->
    <div v-if="stats.totalFolders > 0 || stats.totalFiles > 0" class="stats-bar">
      <div class="stat-item" v-if="stats.totalFolders > 0">
        <Icon icon="mdi:folder" class="stat-icon folder-icon" />
        <span class="stat-label">{{ stats.totalFolders }} 个文件夹</span>
      </div>
      <div class="stat-item" v-if="stats.totalFiles > 0">
        <Icon icon="mdi:file-document" class="stat-icon file-icon" />
        <span class="stat-label">{{ stats.totalFiles }} 个文件</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="explorer-main">
      <ExplorerContent
        :items="items"
        :selected-ids="selectedIds"
        :view-mode="viewMode"
        :loading="loading"
        :has-more="hasMore"
        @toggle-select="handleToggleSelect"
        @select-all="handleSelectAll"
        @enter-folder="handleEnterFolder"
        @download="handleDownload"
        @copy-url="handleCopyUrl"
        @show-detail="handleShowDetail"
        @delete="handleDelete"
        @load-more="handleLoadMore"
      />

      <!-- 加载更多提示 -->
      <div v-if="hasMore && !loading" class="load-more-hint">
        <button class="load-more-button" @click="handleLoadMore">
          <Icon icon="mdi:refresh" />
          <span>加载更多 (还有 {{ remainingCount }} 项)</span>
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-indicator">
        <Icon icon="mdi:loading" class="spin" />
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && items.length === 0" class="empty-state">
        <Icon icon="mdi:folder-open-outline" />
        <span>{{ emptyMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFileStore } from '../stores/file';
import ExplorerBreadcrumb from './ExplorerBreadcrumb.vue';
import ExplorerToolbar from './ExplorerToolbar.vue';
import ExplorerContent from './ExplorerContent.vue';

const props = defineProps({
  /** 当前文件夹ID */
  folderId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits([
  'navigate',
  'upload',
  'create-folder',
  'download',
  'copy-url',
  'show-detail',
  'delete',
  'batch-move',
  'batch-delete',
]);

const store = useFileStore();

// 当前文件夹路径
const folderPath = computed(() => store.folderPath);

// 搜索和排序
const keyword = ref('');
const sortBy = ref('name');
const order = ref('asc');

// 视图模式
const viewMode = ref('grid');

// 加载状态
const loading = computed(() => store.currentFolderLoading);

// 当前目录的项目列表
const items = computed(() => store.currentFolderItems || []);

// 是否有更多数据
const hasMore = computed(() => store.currentFolderHasMore);

// 统计信息
const stats = computed(() => store.currentFolderStats);

// 剩余项目数
const remainingCount = computed(() => {
  const cache = store.currentFolderCache;
  if (cache && cache.stats) {
    const total = cache.stats.totalFolders + cache.stats.totalFiles;
    return total - cache.items.length;
  }
  return 0;
});

// 选中的项目
const selectedIds = computed(() => store.selectedFiles);

// 是否有选中项
const hasSelection = computed(() => store.hasSelection);

// 选中数量
const selectionCount = computed(() => store.selectionCount);

// 空状态消息
const emptyMessage = computed(() => {
  if (keyword.value) {
    return `未找到包含"${keyword.value}"的文件或文件夹`;
  }
  return '此文件夹为空';
});

/**
 * 处理导航
 */
function handleNavigate(folderId) {
  emit('navigate', folderId);
}

/**
 * 处理搜索
 */
async function handleSearch(searchKeyword) {
  keyword.value = searchKeyword;
  await store.searchInFolder(props.folderId, searchKeyword);
}

/**
 * 处理排序变更
 */
async function handleSortChange(newSortBy) {
  sortBy.value = newSortBy;
  const sort = { field: newSortBy, order: order.value };
  await store.fetchFolderContent(props.folderId, { forceRefresh: true, sort });
}

/**
 * 处理排序方向切换
 */
async function handleToggleOrder() {
  order.value = order.value === 'asc' ? 'desc' : 'asc';
  const sort = { field: sortBy.value, order: order.value };
  await store.fetchFolderContent(props.folderId, { forceRefresh: true, sort });
}

/**
 * 处理视图模式切换
 */
function handleSetViewMode(mode) {
  viewMode.value = mode;
  store.setViewMode(mode);
}

/**
 * 处理刷新
 */
async function handleRefresh() {
  await store.fetchFolderContent(props.folderId, { forceRefresh: true });
}

/**
 * 处理上传
 */
function handleUpload(file) {
  emit('upload', file);
}

/**
 * 处理创建文件夹
 */
function handleCreateFolder() {
  emit('create-folder');
}

/**
 * 处理批量移动
 */
function handleBatchMove() {
  emit('batch-move');
}

/**
 * 处理批量删除
 */
function handleBatchDelete() {
  emit('batch-delete');
}

/**
 * 处理切换选中状态
 */
function handleToggleSelect(itemId) {
  store.toggleFileSelection(itemId);
}

/**
 * 处理全选
 */
function handleSelectAll() {
  store.selectAll();
}

/**
 * 处理进入文件夹
 */
function handleEnterFolder(folderId) {
  emit('navigate', folderId);
}

/**
 * 处理下载
 */
function handleDownload(itemId) {
  emit('download', itemId);
}

/**
 * 处理复制链接
 */
function handleCopyUrl(itemId) {
  emit('copy-url', itemId);
}

/**
 * 处理显示详情
 */
function handleShowDetail(itemId) {
  emit('show-detail', itemId);
}

/**
 * 处理删除
 */
function handleDelete(itemId) {
  emit('delete', itemId);
}

/**
 * 处理加载更多
 */
async function handleLoadMore() {
  await store.loadNextPage(props.folderId);
}

// 监听滚动,自动加载更多
const mainElement = ref(null);
let scrollObserver = null;

function setupScrollObserver() {
  if (!mainElement.value) return;
  
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  mainElement.value.appendChild(sentinel);
  
  scrollObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        handleLoadMore();
      }
    },
    { root: mainElement.value, threshold: 0.1 }
  );
  
  scrollObserver.observe(sentinel);
}

// 监听 folderId 变化,加载内容
watch(() => props.folderId, async (newId) => {
  await store.fetchFolderContent(newId);
}, { immediate: true });

// 初始化
onMounted(() => {
  mainElement.value = document.querySelector('.explorer-main');
  setupScrollObserver();
});

// 清理
onUnmounted(() => {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
});
</script>

<style scoped>
.explorer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
}

/* 主内容区 */
.explorer-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xs) var(--spacing-md);
}

/* 滚动条样式 */
.explorer-main::-webkit-scrollbar {
  width: 8px;
}

.explorer-main::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 4px;
}

.explorer-main::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 4px;
}

.explorer-main::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}

/* 加载更多提示 */
.load-more-hint {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.load-more-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--padding-component-lg);
  border-radius: 12px;
  border: 1px solid rgba(96, 118, 255, 0.3);
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.12), rgba(33, 181, 255, 0.1));
  color: rgba(96, 118, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.load-more-button:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 118, 255, 0.5);
  box-shadow: 0 8px 20px rgba(96, 118, 255, 0.2);
}

.load-more-button :deep(svg) {
  font-size: 18px;
}

/* 加载中指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-2xl);
  color: rgba(96, 118, 255, 0.8);
  font-size: 14px;
}

.loading-indicator .spin {
  font-size: 24px;
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
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: rgba(96, 118, 255, 0.5);
  font-size: 14px;
}

.empty-state :deep(svg) {
  font-size: 64px;
  opacity: 0.3;
}

/* 统计信息栏 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.05), rgba(33, 181, 255, 0.03));
  border-bottom: 1px solid rgba(200, 210, 255, 0.15);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 13px;
  color: rgba(96, 118, 255, 0.85);
  font-weight: 500;
}

.stat-icon {
  font-size: 16px;
}

.folder-icon {
  color: rgba(96, 118, 255, 0.8);
}

.file-icon {
  color: rgba(33, 181, 255, 0.8);
}

/* 响应式 */
@media (max-width: 768px) {
  .explorer-main {
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-md);
  }
  
  .load-more-button {
    padding: var(--padding-mobile-component-md);
    font-size: 13px;
  }
  
  .empty-state {
    padding: var(--spacing-3xl) var(--spacing-lg);
  }
  
  .stats-bar {
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-md);
    gap: var(--spacing-md);
  }
  
  .stat-item {
    font-size: 12px;
  }
  
  .stat-icon {
    font-size: 14px;
  }
}
</style>


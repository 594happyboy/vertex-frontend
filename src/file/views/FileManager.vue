<template>
  <div class="file-manager">
    <!-- 移动端侧边栏遮罩 -->
    <div 
      v-if="store.activeView === 'files' && !sidebarCollapsed" 
      class="sidebar-overlay" 
      @click="uiStore.toggleSidebar()"
    ></div>

    <!-- 左侧边栏 - 只在文件库视图显示 -->
    <aside 
      v-if="store.activeView === 'files'" 
      class="file-sidebar" 
      :class="{ collapsed: sidebarCollapsed }"
    >
      <!-- 紧凑的顶部区域 -->
      <div class="sidebar-header">
        <!-- 上传按钮 -->
        <button class="btn-upload" @click="triggerFileUpload" title="上传文件">
          <Icon icon="mdi:cloud-upload" />
          <span>上传</span>
        </button>
      </div>

      <!-- 文件夹树 -->
      <div class="sidebar-content">
        <FolderTree
          :folders="store.folderTree"
          :current-folder-id="store.currentFolderId"
          :loading="store.folderLoading"
          :total-file-count="store.statistics?.totalFiles || 0"
          @select="handleFolderSelect"
          @create-folder="handleCreateFolderClick"
          @rename-folder="handleRenameFolder"
          @delete-folder="handleDeleteFolderClick"
          @set-folder-color="handleSetFolderColor"
          @drop-files="handleDropFiles"
        />
      </div>

      <!-- 统计信息（底部） -->
      <div class="sidebar-footer">
        <StatisticsPanel
          :statistics="store.statistics"
          :folder-count="countFolders(store.folderTree)"
        />
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="file-content">
      <transition name="fade-view" mode="out-in">
        <!-- 文件库视图 -->
        <div v-if="store.activeView === 'files'" key="files" class="files-view">
          <!-- 面包屑导航 -->
          <BreadcrumbNav
            :path="store.folderPath"
            @navigate="handleFolderSelect"
          />

          <!-- 工具栏 -->
          <FileToolbar
            :keyword="store.keyword"
            :sort-by="store.sortBy"
            :order="store.order"
            :view-mode="store.viewMode"
            :has-selection="store.hasSelection"
            :selection-count="store.selectionCount"
            @search="handleSearch"
            @sort-change="handleSortChange"
            @toggle-order="handleToggleOrder"
            @set-view-mode="handleSetViewMode"
            @refresh="handleRefresh"
            @upload="handleFileUpload"
            @create-folder="handleCreateFolderClick"
            @batch-move="handleBatchMoveClick"
            @batch-delete="handleBatchDelete"
          />

          <!-- 文件网格/列表 -->
          <FileGrid
            :files="store.files"
            :selected-files="store.selectedFiles"
            :loading="store.fileLoading"
            @toggle-select="handleToggleFileSelect"
            @download="handleDownload"
            @copy-url="handleCopyUrl"
            @show-detail="handleShowDetail"
            @delete="handleDelete"
          />

          <!-- 分页 -->
          <div v-if="store.totalPages > 1" class="pagination">
            <button
              class="page-btn"
              :disabled="store.page === 1"
              @click="handlePageChange(store.page - 1)"
            >
              <Icon icon="mdi:chevron-left" />
              上一页
            </button>

            <div class="page-indicator">
              <span class="page-index">第 {{ store.page }}</span>
              <span class="page-divider">/</span>
              <span class="page-total">{{ store.totalPages }}</span>
            </div>

            <button
              class="page-btn"
              :disabled="store.page === store.totalPages"
              @click="handlePageChange(store.page + 1)"
            >
              下一页
              <Icon icon="mdi:chevron-right" />
            </button>
          </div>
        </div>

        <!-- 回收站视图 -->
        <RecycleBinList
          v-else
          key="recycle"
          :items="store.recycleFiles"
          :loading="store.recycleLoading"
          :total="store.recycleTotal"
          :page="store.recyclePage"
          :total-pages="store.recycleTotalPages"
          @refresh="handleRefreshRecycle"
          @restore="handleRestore"
          @remove="handlePermanentDelete"
          @page-change="handleRecyclePageChange"
        />
      </transition>
    </main>

    <!-- 右侧详情面板 -->
    <FileDetailPanel
      :file="store.currentFile"
      :show="store.showDetailPanel"
      @close="store.showDetailPanel = false"
      @update="handleUpdateFile"
      @download="handleDownload"
      @copy-url="handleCopyUrl"
      @move="handleMoveFileClick"
      @delete="handleDelete"
    />

    <!-- 对话框 -->
    <CreateFolderDialog
      :show="dialogs.createFolder"
      :parent-folder-id="dialogs.parentFolderId"
      @close="dialogs.createFolder = false"
      @submit="handleCreateFolder"
    />

    <MoveFileDialog
      :show="dialogs.moveFile"
      :file-count="dialogs.moveFileCount"
      :folders="store.folderTree"
      :current-folder-id="store.currentFolderId"
      @close="dialogs.moveFile = false"
      @submit="handleMoveFile"
    />

    <!-- 悬浮视图切换按钮 -->
    <button 
      class="fab-view-switch"
      :class="{ 'recycle-mode': store.activeView === 'files' }"
      @click="toggleView"
      :title="store.activeView === 'files' ? '回收站' : '文件库'"
    >
      <Icon 
        :icon="store.activeView === 'files' ? 'mdi:delete' : 'mdi:folder-multiple'" 
        class="fab-icon"
      />
    </button>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFileStore } from '../stores/file';
import { useUiStore } from '@/blog/stores/ui';
import { copy } from '@/utils/clipboard';
import FolderTree from '../components/FolderTree.vue';
import BreadcrumbNav from '../components/BreadcrumbNav.vue';
import FileToolbar from '../components/FileToolbar.vue';
import FileGrid from '../components/FileGrid.vue';
import FileDetailPanel from '../components/FileDetailPanel.vue';
import StatisticsPanel from '../components/StatisticsPanel.vue';
import CreateFolderDialog from '../components/CreateFolderDialog.vue';
import MoveFileDialog from '../components/MoveFileDialog.vue';
import RecycleBinList from '../components/RecycleBinList.vue';

const store = useFileStore();
const uiStore = useUiStore();

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

const dialogs = reactive({
  createFolder: false,
  parentFolderId: null,
  moveFile: false,
  moveFileCount: 0,
});

onMounted(async () => {
  // 初始化侧边栏状态（移动端默认关闭）
  uiStore.initSidebar();
  
  try {
    await store.initialize();
  } catch (error) {
    uiStore.toast('初始化失败：' + (error.message || '未知错误'));
  }
});

// ========== 文件夹操作 ==========

async function handleFolderSelect(folderId) {
  try {
    await store.navigateToFolder(folderId);
  } catch (error) {
    uiStore.toast('切换文件夹失败：' + (error.message || '未知错误'));
  }
}

function handleCreateFolderClick(parentId) {
  // 如果没有传入 parentId，使用当前文件夹ID
  // undefined 表示从工具栏触发，null 表示右键菜单明确指定根目录
  if (parentId === undefined) {
    dialogs.parentFolderId = store.currentFolderId;
  } else {
    dialogs.parentFolderId = parentId;
  }
  dialogs.createFolder = true;
}

async function handleCreateFolder(data) {
  try {
    await store.createFolder(data);
    uiStore.toast('文件夹创建成功');
  } catch (error) {
    uiStore.toast('创建失败：' + (error.message || '未知错误'));
  }
}

function handleRenameFolder(folder) {
  const newName = prompt('请输入新的文件夹名称:', folder.name);
  if (newName && newName.trim() && newName !== folder.name) {
    handleUpdateFolder(folder.id, { name: newName.trim() });
  }
}

async function handleUpdateFolder(id, data) {
  try {
    await store.updateFolder(id, data);
    uiStore.toast('文件夹已更新');
  } catch (error) {
    uiStore.toast('更新失败：' + (error.message || '未知错误'));
  }
}

function handleDeleteFolderClick(folder) {
  const hasChildren = folder.subFolderCount > 0 || folder.fileCount > 0;
  const message = hasChildren
    ? `确定要删除文件夹"${folder.name}"及其所有内容吗？`
    : `确定要删除文件夹"${folder.name}"吗？`;
  
  if (confirm(message)) {
    handleDeleteFolder(folder.id, hasChildren);
  }
}

async function handleDeleteFolder(id, recursive = false) {
  try {
    await store.deleteFolder(id, recursive);
    uiStore.toast('文件夹已删除');
  } catch (error) {
    uiStore.toast('删除失败：' + (error.message || '未知错误'));
  }
}

function handleSetFolderColor(folder) {
  // 简化版本：使用 prompt，实际应该用颜色选择器对话框
  const colors = ['#6076FF', '#9C27B0', '#E91E63', '#F44336', '#FF9800', '#FFC107', '#4CAF50', '#00BCD4'];
  const color = prompt('请选择颜色（输入序号1-8）:\n1:蓝 2:紫 3:粉 4:红 5:橙 6:黄 7:绿 8:青', '1');
  const index = parseInt(color) - 1;
  
  if (index >= 0 && index < colors.length) {
    handleUpdateFolder(folder.id, { color: colors[index] });
  }
}

async function handleDropFiles(event) {
  try {
    await store.batchMoveFiles(event.fileIds, event.targetFolderId);
    uiStore.toast('文件已移动');
  } catch (error) {
    uiStore.toast('移动失败：' + (error.message || '未知错误'));
  }
}

// ========== 文件操作 ==========

function triggerFileUpload() {
  // 通过工具栏的上传按钮触发
  const event = new CustomEvent('trigger-upload');
  window.dispatchEvent(event);
}

async function handleFileUpload(file) {
  try {
    await store.uploadFile(file);
    uiStore.toast('文件上传成功');
  } catch (error) {
    uiStore.toast('上传失败：' + (error.message || '未知错误'));
  }
}

async function handleUpdateFile({ id, data }) {
  try {
    await store.updateFile(id, data);
    uiStore.toast('文件信息已更新');
  } catch (error) {
    uiStore.toast('更新失败：' + (error.message || '未知错误'));
  }
}

async function handleDelete(fileId) {
  if (confirm('确定要删除此文件吗？')) {
    try {
      await store.deleteFile(fileId);
      uiStore.toast('文件已移至回收站');
    } catch (error) {
      uiStore.toast('删除失败：' + (error.message || '未知错误'));
    }
  }
}

function handleDownload(fileId) {
  const url = store.getDownloadUrl(fileId);
  window.open(url, '_blank');
}

async function handleCopyUrl(fileId) {
  try {
    const url = store.getDownloadUrl(fileId);
    await copy(url);
    uiStore.toast('下载链接已复制');
  } catch (error) {
    uiStore.toast('复制失败');
  }
}

function handleShowDetail(fileId) {
  store.setCurrentFile(fileId);
}

function handleMoveFileClick(fileId) {
  // 如果传入了具体文件ID，先选中它
  if (fileId && !store.selectedFiles.includes(fileId)) {
    store.clearSelection();
    store.selectFile(fileId);
  }
  
  dialogs.moveFileCount = store.hasSelection ? store.selectionCount : 1;
  dialogs.moveFile = true;
}

async function handleMoveFile(targetFolderId) {
  try {
    if (store.hasSelection) {
      await store.batchMoveFiles(store.selectedFiles, targetFolderId);
      uiStore.toast(`已移动 ${store.selectionCount} 个文件`);
    }
  } catch (error) {
    uiStore.toast('移动失败：' + (error.message || '未知错误'));
  }
}

// ========== 批量操作 ==========

function handleToggleFileSelect(fileId) {
  store.toggleFileSelection(fileId);
}

function handleBatchMoveClick() {
  if (store.hasSelection) {
    dialogs.moveFileCount = store.selectionCount;
    dialogs.moveFile = true;
  }
}

async function handleBatchDelete() {
  if (store.hasSelection && confirm(`确定要删除选中的 ${store.selectionCount} 个文件吗？`)) {
    try {
      await store.batchDeleteFiles(store.selectedFiles);
      uiStore.toast('文件已移至回收站');
    } catch (error) {
      uiStore.toast('删除失败：' + (error.message || '未知错误'));
    }
  }
}

// ========== 搜索与排序 ==========

async function handleSearch(keyword) {
  try {
    await store.updateKeyword(keyword);
  } catch (error) {
    uiStore.toast('搜索失败：' + (error.message || '未知错误'));
  }
}

async function handleSortChange(sortBy) {
  try {
    await store.updateSort(sortBy, store.order);
  } catch (error) {
    uiStore.toast('排序失败：' + (error.message || '未知错误'));
  }
}

async function handleToggleOrder() {
  const newOrder = store.order === 'desc' ? 'asc' : 'desc';
  try {
    await store.updateSort(store.sortBy, newOrder);
  } catch (error) {
    uiStore.toast('排序失败：' + (error.message || '未知错误'));
  }
}

// ========== 视图控制 ==========

function handleSetViewMode(mode) {
  store.setViewMode(mode);
}

async function handleViewChange(view) {
  try {
    await store.setActiveView(view);
  } catch (error) {
    uiStore.toast('切换视图失败：' + (error.message || '未知错误'));
  }
}

function toggleView() {
  const newView = store.activeView === 'files' ? 'recycle' : 'files';
  handleViewChange(newView);
}

async function handleRefresh() {
  try {
    await store.refresh();
    uiStore.toast('已刷新');
  } catch (error) {
    uiStore.toast('刷新失败：' + (error.message || '未知错误'));
  }
}

// ========== 分页 ==========

async function handlePageChange(page) {
  try {
    await store.goToPage(page);
  } catch (error) {
    uiStore.toast('加载失败：' + (error.message || '未知错误'));
  }
}

// ========== 回收站 ==========

async function handleRefreshRecycle() {
  try {
    await store.fetchRecycleFiles();
    uiStore.toast('已刷新');
  } catch (error) {
    uiStore.toast('刷新失败：' + (error.message || '未知错误'));
  }
}

async function handleRestore(fileId) {
  try {
    await store.restoreFile(fileId);
    uiStore.toast('文件已恢复');
  } catch (error) {
    uiStore.toast('恢复失败：' + (error.message || '未知错误'));
  }
}

async function handlePermanentDelete(fileId) {
  try {
    await store.permanentDeleteFile(fileId);
    uiStore.toast('文件已永久删除');
  } catch (error) {
    uiStore.toast('删除失败：' + (error.message || '未知错误'));
  }
}

async function handleRecyclePageChange(page) {
  try {
    await store.goToRecyclePage(page);
  } catch (error) {
    uiStore.toast('加载失败：' + (error.message || '未知错误'));
  }
}

// ========== 工具函数 ==========

function countFolders(folders) {
  if (!folders || folders.length === 0) return 0;
  
  let count = folders.length;
  folders.forEach(folder => {
    if (folder.children) {
      count += countFolders(folder.children);
    }
  });
  
  return count;
}
</script>

<style scoped>
.file-manager {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
}

/* ========== 左侧边栏 ========== */
.file-sidebar {
  position: relative;
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(200, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  overflow: hidden;
  z-index: 10;
}

.file-sidebar.collapsed {
  width: 0;
  opacity: 0;
  border-right-color: transparent;
}

/* 移动端抽屉式侧边栏 */
@media (max-width: 768px) {
  .file-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 85%;
    max-width: 320px;
    z-index: 100;
    transform: translateX(-100%);
    opacity: 1;
    border-right-color: rgba(200, 210, 255, 0.3);
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .file-sidebar.collapsed {
    width: 85%;
    max-width: 320px;
    opacity: 1;
    transform: translateX(-100%);
  }

  .file-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}

/* 移动端侧边栏遮罩 */
.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 99;
    backdrop-filter: blur(2px);
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.3);
  flex-shrink: 0;
}

.btn-upload {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(96, 118, 255, 0.35);
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.18), rgba(33, 181, 255, 0.14));
  color: #1f256a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-upload:hover {
  transform: translateY(-1px);
  border-color: rgba(68, 95, 247, 0.7);
  box-shadow: 0 12px 24px -14px rgba(68, 95, 247, 0.66);
}

.btn-upload :deep(svg) {
  font-size: 16px;
}

.sidebar-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(200, 210, 255, 0.3);
  flex-shrink: 0;
}

/* 侧边栏滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}

/* ========== 主内容区 ========== */
.file-content {
  flex: 1;
  height: 100%;
  overflow: auto;
  background: rgba(255, 255, 255, 0.95);
  position: relative;
}

.files-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px 15px;
  height: 100%;
}

@media (max-width: 768px) {
  .files-view {
    padding: 12px;
    gap: 12px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 24px 0;
  margin-top: auto;
}

@media (max-width: 768px) {
  .pagination {
    gap: 12px;
    padding: 20px 0;
  }
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(96, 114, 255, 0.35);
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.15), rgba(33, 181, 255, 0.12));
  color: #2d3264;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 14px;
  font-weight: 500;
}

.page-btn :deep(svg) {
  font-size: 18px;
}

@media (max-width: 768px) {
  .page-btn {
    padding: 10px 16px;
    gap: 4px;
    font-size: 13px;
  }
  
  .page-btn :deep(svg) {
    font-size: 20px;
  }
}

.page-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(68, 95, 247, 0.7);
  box-shadow: 0 14px 28px -16px rgba(68, 95, 247, 0.66);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2566;
}

.page-index,
.page-total {
  font-variant-numeric: tabular-nums;
}

.page-total {
  opacity: 0.75;
}

.page-divider {
  opacity: 0.5;
}

/* ========== 动画 ========== */
.fade-view-enter-active,
.fade-view-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-view-enter-from,
.fade-view-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ========== 悬浮按钮 ========== */
.fab-view-switch {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #6076ff 0%, #4c63ff 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(96, 118, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .fab-view-switch {
    bottom: 84px;
    right: 20px;
    width: 56px;
    height: 56px;
  }
}

.fab-view-switch:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(96, 118, 255, 0.5);
  background: linear-gradient(135deg, #4c63ff 0%, #3a54f5 100%);
}

.fab-view-switch:active {
  transform: translateY(-2px) scale(1.02);
}

/* 文件库模式 - 红色（表示进入回收站） */
.fab-view-switch.recycle-mode {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  box-shadow: 0 8px 24px rgba(231, 76, 60, 0.4);
}

.fab-view-switch.recycle-mode:hover {
  box-shadow: 0 12px 32px rgba(231, 76, 60, 0.5);
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
}

.fab-icon {
  font-size: 28px;
  transition: transform 0.3s ease;
}

.fab-view-switch:hover .fab-icon {
  transform: scale(1.1) rotate(5deg);
}

@media (max-width: 768px) {
  .fab-icon {
    font-size: 24px;
  }
}
</style>

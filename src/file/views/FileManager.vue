<template>
  <div class="file-manager">
    <!-- 主内容区 -->
    <main class="main-content">

      <!-- 内容面板 -->
      <transition name="fade-view" mode="out-in">
        <!-- 文件库视图 -->
        <ExplorerPanel
          v-if="store.activeView === 'files'"
          key="files"
          :folder-id="store.currentFolderId"
          @navigate="handleFolderSelect"
          @upload="handleFileUpload"
          @create-folder="handleCreateFolderClick"
          @edit="handleEdit"
          @download="handleDownload"
          @copy-url="handleCopyUrl"
          @show-detail="handleShowDetail"
          @delete="handleDelete"
          @batch-move="handleBatchMoveClick"
          @batch-delete="handleBatchDelete"
        />

        <!-- 回收站视图 -->
        <RecycleBinList
          v-else
          key="recycle"
          :items="store.recycleFiles"
          :loading="store.recycleBinLoading"
          :has-more="store.recycleBinHasMore"
          @refresh="handleRefreshRecycle"
          @restore="handleRestore"
          @remove="handlePermanentDelete"
          @load-more="handleLoadMoreRecycle"
        />
      </transition>
    </main>

    <!-- 右侧详情面板 -->
    <FileDetailPanel
      :file="store.currentFile"
      :show="store.showDetailPanel"
      @close="store.showDetailPanel = false"
      @update="handleUpdateFile"
      @edit="handleEdit"
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

    <!-- 文本编辑器 -->
    <TextFileEditor
      :show="editor.show"
      :file="editor.file"
      :initial-content="editor.content"
      @close="handleEditorClose"
      @save="handleEditorSave"
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
import { reactive, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFileStore } from '../stores/file';
import { useUiStore } from '@/blog/stores/ui';
import { copy } from '@/utils/clipboard';
import { fetchFileContentService, updateFileContentService } from '../services/fileService';
import ExplorerPanel from '../components/ExplorerPanel.vue';
import FileDetailPanel from '../components/FileDetailPanel.vue';
import CreateFolderDialog from '../components/CreateFolderDialog.vue';
import MoveFileDialog from '../components/MoveFileDialog.vue';
import RecycleBinList from '../components/RecycleBinList.vue';
import TextFileEditor from '../components/TextFileEditor.vue';

const store = useFileStore();
const uiStore = useUiStore();

const dialogs = reactive({
  createFolder: false,
  parentFolderId: null,
  moveFile: false,
  moveFileCount: 0,
});

const editor = reactive({
  show: false,
  file: null,
  content: '',
});

onMounted(async () => {
  // 初始化
  try {
    await store.initialize();
  } catch (error) {
    uiStore.showToast('初始化失败：' + (error.message || '未知错误'), 'error');
  }
});

// ========== 文件夹操作 ==========

async function handleFolderSelect(folderId) {
  try {
    await store.navigateToFolder(folderId);
  } catch (error) {
    uiStore.showToast('切换文件夹失败：' + (error.message || '未知错误'), 'error');
  }
}

function handleCreateFolderClick(parentId) {
  // 如果没有传入 parentId，使用当前文件夹ID
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
    uiStore.showToast('文件夹创建成功', 'success');
  } catch (error) {
    uiStore.showToast('创建失败：' + (error.message || '未知错误'), 'error');
  }
}

// ========== 文件操作 ==========

async function handleFileUpload(file) {
  try {
    await store.uploadFile(file);
    uiStore.showToast('文件上传成功', 'success');
  } catch (error) {
    uiStore.showToast('上传失败：' + (error.message || '未知错误'), 'error');
  }
}

async function handleEdit(fileId) {
  try {
    // 获取文件信息
    const file = store.currentFolderItems?.find(item => item.id === fileId);
    
    if (!file) {
      uiStore.showToast('未找到文件', 'error');
      return;
    }

    // 检查文件大小（2MB 限制）
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size && file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const confirmed = confirm(
        `文件大小为 ${sizeMB}MB，超过了 2MB 的限制。\n\n` +
        `编辑大文件可能会导致浏览器卡顿或崩溃。\n` +
        `建议下载到本地后使用专业编辑器编辑。\n\n` +
        `确定要继续在线编辑吗？`
      );
      
      if (!confirmed) {
        return;
      }
    }

    // 显示加载对话框
    uiStore.showLoading('正在加载文件内容...');
    
    // 获取文件内容
    const content = await fetchFileContentService(fileId);
    
    // 隐藏加载对话框
    uiStore.hideLoading();
    
    // 打开编辑器
    editor.file = file;
    editor.content = content;
    editor.show = true;
  } catch (error) {
    // 隐藏加载对话框
    uiStore.hideLoading();
    
    console.error('编辑文件时出错:', error);
    uiStore.showToast('加载失败：' + (error.message || '未知错误'), 'error');
  }
}

function handleEditorClose() {
  editor.show = false;
  editor.file = null;
  editor.content = '';
}

async function handleEditorSave({ id, content, fileName }) {
  try {
    // 调用保存服务
    await updateFileContentService(id, content, fileName, store.userId);
    
    // 刷新当前文件夹
    await store.refresh();
    
    uiStore.showToast('保存成功', 'success');
    
    // 关闭编辑器
    handleEditorClose();
  } catch (error) {
    uiStore.showToast('保存失败：' + (error.message || '未知错误'), 'error');
    throw error; // 抛出错误以便编辑器知道保存失败
  }
}

async function handleUpdateFile({ id, data }) {
  try {
    await store.updateFile(id, data);
    uiStore.showToast('文件信息已更新', 'success');
  } catch (error) {
    uiStore.showToast('更新失败：' + (error.message || '未知错误'), 'error');
  }
}

async function handleDelete(itemId) {
  // 查找要删除的项目，判断是文件还是文件夹
  const item = store.currentFolderItems?.find(item => item.id === itemId);
  
  if (!item) {
    uiStore.showToast('未找到要删除的项目', 'error');
    return;
  }
  
  const isFolder = item.type === 'folder';
  const itemName = isFolder ? '文件夹' : '文件';
  
  if (confirm(`确定要删除此${itemName}"${item.name}"吗？${isFolder ? '\n注意：文件夹内的所有内容也将被删除！' : ''}`)) {
    try {
      if (isFolder) {
        await store.deleteFolder(itemId, true); // recursive = true
        uiStore.showToast('文件夹已删除', 'success');
      } else {
        await store.deleteFile(itemId);
        uiStore.showToast('文件已移至回收站', 'success');
      }
    } catch (error) {
      uiStore.showToast('删除失败：' + (error.message || '未知错误'), 'error');
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
    uiStore.showToast('下载链接已复制', 'success');
  } catch (error) {
    uiStore.showToast('复制失败', 'error');
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
      uiStore.showToast(`已移动 ${store.selectionCount} 个文件`, 'success');
    }
  } catch (error) {
    uiStore.showToast('移动失败：' + (error.message || '未知错误'), 'error');
  }
}

// ========== 批量操作 ==========

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
      uiStore.showToast('文件已移至回收站', 'success');
    } catch (error) {
      uiStore.showToast('删除失败：' + (error.message || '未知错误'), 'error');
    }
  }
}

// ========== 视图控制 ==========

async function handleViewChange(view) {
  try {
    await store.setActiveView(view);
  } catch (error) {
    uiStore.showToast('切换视图失败：' + (error.message || '未知错误'), 'error');
  }
}

function toggleView() {
  const newView = store.activeView === 'files' ? 'recycle' : 'files';
  handleViewChange(newView);
}

// ========== 回收站 ==========

async function handleRefreshRecycle() {
  try {
    await store.fetchRecycleBinFiles(true); // 参数 true 表示重置
    uiStore.showToast('已刷新', 'success');
  } catch (error) {
    uiStore.showToast('刷新失败：' + (error.message || '未知错误'), 'error');
  }
}

async function handleLoadMoreRecycle() {
  try {
    await store.loadMoreRecycleBinFiles();
  } catch (error) {
    uiStore.showToast('加载失败：' + (error.message || '未知错误'), 'error');
  }
}

async function handleRestore(fileId) {
  try {
    await store.restoreFile(fileId);
    uiStore.showToast('文件已恢复', 'success');
  } catch (error) {
    uiStore.showToast('恢复失败：' + (error.message || '未知错误'), 'error');
  }
}

async function handlePermanentDelete(fileId) {
  if (confirm('确定要永久删除此文件吗？此操作不可恢复！')) {
    try {
      await store.permanentDeleteFile(fileId);
      uiStore.showToast('文件已永久删除', 'success');
    } catch (error) {
      uiStore.showToast('删除失败：' + (error.message || '未知错误'), 'error');
    }
  }
}

// 旧的页码分页函数已移除
async function handleRecyclePageChange_DEPRECATED(page) {
  // 已弃用，改用游标分页
  try {
    await store.goToRecyclePage_DEPRECATED(page);
  } catch (error) {
    uiStore.showToast('加载失败：' + (error.message || '未知错误'), 'error');
  }
}
</script>

<style scoped>
.file-manager {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  position: relative;
}

/* ========== 主内容 ========== */
.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
}

/* ========== 视图切换动画 ========== */
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
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
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

.fab-view-switch:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(96, 118, 255, 0.5);
  background: linear-gradient(135deg, #4c63ff 0%, #3a54f5 100%);
}

.fab-view-switch:active {
  transform: translateY(-2px) scale(1.02);
}

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
  .fab-view-switch {
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
  }

  .fab-icon {
    font-size: 24px;
  }
}
</style>

import { defineStore } from 'pinia';
import { useAuthStore } from '@/blog/stores/auth';
import {
  // 文件夹服务
  fetchFolderTreeService,
  fetchFolderInfoService,
  fetchFolderPathService,
  createFolderService,
  updateFolderService,
  deleteFolderService,
  batchSortFoldersService,
  // 文件服务
  fetchFilesService,
  fetchFileInfoService,
  uploadFileService,
  updateFileService,
  deleteFileService,
  moveFileService,
  batchMoveFilesService,
  batchDeleteFilesService,
  buildDownloadUrl,
  fetchStatisticsService,
  // 回收站服务
  fetchRecycleBinService,
  restoreFileService,
  permanentDeleteFileService,
  clearCacheService,
} from '../services/fileService';

export const useFileStore = defineStore('file', {
  state: () => ({
    // ========== 文件夹相关 ==========
    folderTree: [],           // 文件夹树结构
    currentFolderId: null,    // 当前选中的文件夹ID (null表示根目录)
    folderPath: [],           // 当前文件夹的面包屑路径
    folderLoading: false,     // 文件夹操作加载状态
    
    // ========== 文件相关 ==========
    files: [],                // 文件列表
    selectedFiles: [],        // 多选的文件ID列表
    currentFileId: null,      // 当前选中的文件ID（用于详情面板）
    fileLoading: false,       // 文件操作加载状态
    
    // ========== 分页相关 ==========
    page: 1,
    size: 20,
    total: 0,
    
    // ========== 搜索与排序 ==========
    keyword: '',
    sortBy: 'uploadTime',
    order: 'desc',
    
    // ========== 视图设置 ==========
    viewMode: 'grid',         // 'grid' | 'list'
    activeView: 'files',      // 'files' | 'recycle'
    showDetailPanel: false,   // 是否显示详情面板
    
    // ========== 统计信息 ==========
    statistics: null,
    
    // ========== 回收站 ==========
    recycleFiles: [],
    recyclePage: 1,
    recycleSize: 20,
    recycleTotal: 0,
    recycleLoading: false,
  }),

  getters: {
    /**
     * 获取当前用户ID
     */
    userId: () => {
      const authStore = useAuthStore();
      return authStore.user?.id || null;
    },

    /**
     * 是否有文件
     */
    hasFiles: (state) => state.files.length > 0,

    /**
     * 总页数
     */
    totalPages: (state) => Math.ceil(state.total / state.size),

    /**
     * 回收站总页数
     */
    recycleTotalPages: (state) => Math.ceil(state.recycleTotal / state.recycleSize),

    /**
     * 是否有选中的文件
     */
    hasSelection: (state) => state.selectedFiles.length > 0,

    /**
     * 选中的文件数量
     */
    selectionCount: (state) => state.selectedFiles.length,

    /**
     * 当前选中文件的详细信息
     */
    currentFile: (state) => {
      if (!state.currentFileId) return null;
      return state.files.find(f => f.id === state.currentFileId) || null;
    },

    /**
     * 文件夹树是否为空
     */
    hasFolders: (state) => state.folderTree.length > 0,

    /**
     * 当前是否在根目录
     */
    isRootFolder: (state) => state.currentFolderId === null,
  },

  actions: {
    // ========== 初始化 ==========
    
    /**
     * 初始化文件管理器
     */
    async initialize() {
      await Promise.all([
        this.fetchFolderTree(),
        this.fetchFiles(),
        this.fetchStatistics(),
      ]);
    },

    // ========== 文件夹操作 ==========
    
    /**
     * 获取文件夹树
     */
    async fetchFolderTree() {
      if (!this.userId) return;
      
      this.folderLoading = true;
      try {
        const data = await fetchFolderTreeService(this.userId, true);
        this.folderTree = data.rootFolders;
        
        // 更新统计信息
        if (!this.statistics) {
          this.statistics = {
            totalFiles: data.totalFiles,
            totalSize: data.totalSize,
            totalSizeFormatted: data.totalSizeFormatted,
          };
        }
      } catch (error) {
        console.error('获取文件夹树失败:', error);
        throw error;
      } finally {
        this.folderLoading = false;
      }
    },

    /**
     * 切换当前文件夹
     */
    async navigateToFolder(folderId) {
      this.currentFolderId = folderId;
      this.page = 1;
      
      // 更新面包屑路径
      if (folderId === null) {
        this.folderPath = [];
      } else {
        await this.fetchFolderPath(folderId);
      }
      
      // 刷新文件列表
      await this.fetchFiles();
    },

    /**
     * 获取文件夹路径
     */
    async fetchFolderPath(folderId) {
      if (!this.userId || !folderId) {
        this.folderPath = [];
        return;
      }
      
      try {
        this.folderPath = await fetchFolderPathService(folderId, this.userId);
      } catch (error) {
        console.error('获取文件夹路径失败:', error);
        this.folderPath = [];
      }
    },

    /**
     * 创建文件夹
     */
    async createFolder(data) {
      if (!this.userId) throw new Error('用户未登录');
      
      this.folderLoading = true;
      try {
        const folder = await createFolderService(data, this.userId);
        await this.fetchFolderTree(); // 刷新文件夹树
        return folder;
      } catch (error) {
        console.error('创建文件夹失败:', error);
        throw error;
      } finally {
        this.folderLoading = false;
      }
    },

    /**
     * 更新文件夹
     */
    async updateFolder(id, data) {
      if (!this.userId) throw new Error('用户未登录');
      
      this.folderLoading = true;
      try {
        const folder = await updateFolderService(id, data, this.userId);
        await this.fetchFolderTree(); // 刷新文件夹树
        return folder;
      } catch (error) {
        console.error('更新文件夹失败:', error);
        throw error;
      } finally {
        this.folderLoading = false;
      }
    },

    /**
     * 删除文件夹
     */
    async deleteFolder(id, recursive = false) {
      if (!this.userId) throw new Error('用户未登录');
      
      this.folderLoading = true;
      try {
        await deleteFolderService(id, this.userId, recursive);
        
        // 如果删除的是当前文件夹，返回上级
        if (id === this.currentFolderId) {
          const parentId = this.folderPath.length > 1 
            ? this.folderPath[this.folderPath.length - 2].id 
            : null;
          await this.navigateToFolder(parentId);
        }
        
        await this.fetchFolderTree(); // 刷新文件夹树
        return true;
      } catch (error) {
        console.error('删除文件夹失败:', error);
        throw error;
      } finally {
        this.folderLoading = false;
      }
    },

    /**
     * 批量排序文件夹
     */
    async sortFolders(items) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await batchSortFoldersService(items, this.userId);
        await this.fetchFolderTree(); // 刷新文件夹树
        return true;
      } catch (error) {
        console.error('排序文件夹失败:', error);
        throw error;
      }
    },

    // ========== 文件操作 ==========
    
    /**
     * 获取文件列表
     */
    async fetchFiles() {
      if (!this.userId) return;
      
      this.fileLoading = true;
      try {
        const params = {
          userId: this.userId,
          folderId: this.currentFolderId,
          page: this.page,
          size: this.size,
          keyword: this.keyword,
          sortBy: this.sortBy,
          order: this.order,
        };
        
        const data = await fetchFilesService(params);
        this.files = data.items;
        this.total = data.total;
      } catch (error) {
        console.error('获取文件列表失败:', error);
        throw error;
      } finally {
        this.fileLoading = false;
      }
    },

    /**
     * 上传文件
     */
    async uploadFile(file, options = {}) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        const uploadOptions = {
          userId: this.userId,
          folderId: this.currentFolderId,
          ...options,
        };
        
        await uploadFileService(file, uploadOptions);
        await Promise.all([
          this.fetchFiles(),
          this.fetchFolderTree(),
          this.fetchStatistics(),
        ]);
      } catch (error) {
        console.error('上传文件失败:', error);
        throw error;
      }
    },

    /**
     * 更新文件信息
     */
    async updateFile(id, data) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        const file = await updateFileService(id, data, this.userId);
        await this.fetchFiles();
        return file;
      } catch (error) {
        console.error('更新文件失败:', error);
        throw error;
      }
    },

    /**
     * 删除文件
     */
    async deleteFile(id) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await deleteFileService(id, this.userId);
        
        // 如果删除的是当前选中的文件，清除选中状态
        if (id === this.currentFileId) {
          this.currentFileId = null;
        }
        
        this.selectedFiles = this.selectedFiles.filter(fid => fid !== id);
        
        await Promise.all([
          this.fetchFiles(),
          this.fetchFolderTree(),
          this.fetchStatistics(),
        ]);
      } catch (error) {
        console.error('删除文件失败:', error);
        throw error;
      }
    },

    /**
     * 移动文件
     */
    async moveFile(fileId, targetFolderId) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await moveFileService(fileId, targetFolderId, this.userId);
        await Promise.all([
          this.fetchFiles(),
          this.fetchFolderTree(),
        ]);
      } catch (error) {
        console.error('移动文件失败:', error);
        throw error;
      }
    },

    /**
     * 批量移动文件
     */
    async batchMoveFiles(fileIds, targetFolderId) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await batchMoveFilesService(fileIds, targetFolderId, this.userId);
        this.clearSelection();
        await Promise.all([
          this.fetchFiles(),
          this.fetchFolderTree(),
        ]);
      } catch (error) {
        console.error('批量移动文件失败:', error);
        throw error;
      }
    },

    /**
     * 批量删除文件
     */
    async batchDeleteFiles(fileIds) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await batchDeleteFilesService(fileIds, this.userId);
        this.clearSelection();
        await Promise.all([
          this.fetchFiles(),
          this.fetchFolderTree(),
          this.fetchStatistics(),
        ]);
      } catch (error) {
        console.error('批量删除文件失败:', error);
        throw error;
      }
    },

    /**
     * 获取文件下载链接
     */
    getDownloadUrl(id) {
      return buildDownloadUrl(id);
    },

    // ========== 文件选择 ==========
    
    /**
     * 切换文件选中状态
     */
    toggleFileSelection(fileId) {
      const index = this.selectedFiles.indexOf(fileId);
      if (index === -1) {
        this.selectedFiles.push(fileId);
      } else {
        this.selectedFiles.splice(index, 1);
      }
    },

    /**
     * 选中文件
     */
    selectFile(fileId) {
      if (!this.selectedFiles.includes(fileId)) {
        this.selectedFiles.push(fileId);
      }
    },

    /**
     * 取消选中文件
     */
    deselectFile(fileId) {
      this.selectedFiles = this.selectedFiles.filter(id => id !== fileId);
    },

    /**
     * 全选
     */
    selectAll() {
      this.selectedFiles = this.files.map(f => f.id);
    },

    /**
     * 清除选择
     */
    clearSelection() {
      this.selectedFiles = [];
    },

    /**
     * 设置当前文件（用于详情面板）
     */
    setCurrentFile(fileId) {
      this.currentFileId = fileId;
      this.showDetailPanel = !!fileId;
    },

    // ========== 统计信息 ==========
    
    /**
     * 获取统计信息
     */
    async fetchStatistics() {
      if (!this.userId) return;
      
      try {
        this.statistics = await fetchStatisticsService(this.userId);
      } catch (error) {
        console.error('获取统计信息失败:', error);
      }
    },

    // ========== 搜索与筛选 ==========
    
    /**
     * 更新搜索关键词
     */
    async updateKeyword(keyword) {
      this.keyword = keyword;
      this.page = 1;
      await this.fetchFiles();
    },

    /**
     * 更新排序
     */
    async updateSort(sortBy, order) {
      this.sortBy = sortBy;
      this.order = order;
      this.page = 1;
      await this.fetchFiles();
    },

    // ========== 视图控制 ==========
    
    /**
     * 切换视图模式
     */
    setViewMode(mode) {
      this.viewMode = mode;
    },

    /**
     * 切换主视图（文件/回收站）
     */
    async setActiveView(view) {
      if (this.activeView === view) return;
      
      this.activeView = view;
      
      if (view === 'recycle') {
        await this.fetchRecycleFiles();
      } else {
        await this.fetchFiles();
      }
    },

    /**
     * 切换详情面板显示
     */
    toggleDetailPanel() {
      this.showDetailPanel = !this.showDetailPanel;
      if (!this.showDetailPanel) {
        this.currentFileId = null;
      }
    },

    // ========== 分页 ==========
    
    /**
     * 跳转到指定页
     */
    async goToPage(page) {
      this.page = page;
      await this.fetchFiles();
    },

    /**
     * 刷新当前列表
     */
    async refresh() {
      if (this.activeView === 'recycle') {
        await this.fetchRecycleFiles();
      } else {
        await this.fetchFiles();
      }
    },

    // ========== 回收站 ==========
    
    /**
     * 获取回收站文件列表
     */
    async fetchRecycleFiles() {
      if (!this.userId) return;
      
      this.recycleLoading = true;
      try {
        const params = {
          userId: this.userId,
          page: this.recyclePage,
          size: this.recycleSize,
        };
        
        const data = await fetchRecycleBinService(params);
        this.recycleFiles = data.items;
        this.recycleTotal = data.total;
      } catch (error) {
        console.error('获取回收站列表失败:', error);
        throw error;
      } finally {
        this.recycleLoading = false;
      }
    },

    /**
     * 恢复文件
     */
    async restoreFile(id) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await restoreFileService(id, this.userId);
        await Promise.all([
          this.fetchRecycleFiles(),
          this.fetchFolderTree(),
          this.fetchStatistics(),
        ]);
      } catch (error) {
        console.error('恢复文件失败:', error);
        throw error;
      }
    },

    /**
     * 永久删除文件
     */
    async permanentDeleteFile(id) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await permanentDeleteFileService(id, this.userId);
        await Promise.all([
          this.fetchRecycleFiles(),
          this.fetchStatistics(),
        ]);
      } catch (error) {
        console.error('永久删除文件失败:', error);
        throw error;
      }
    },

    /**
     * 跳转到回收站指定页
     */
    async goToRecyclePage(page) {
      this.recyclePage = page;
      await this.fetchRecycleFiles();
    },

    // ========== 其他 ==========
    
    /**
     * 清除缓存
     */
    async clearCache() {
      try {
        return await clearCacheService();
      } catch (error) {
        console.error('清除缓存失败:', error);
        throw error;
      }
    },
  },
});

import { defineStore } from 'pinia';
import { useAuthStore } from '@/blog/stores/auth';
import {
  // 文件夹服务
  fetchFolderInfoService,
  fetchFolderPathService,
  createFolderService,
  updateFolderService,
  deleteFolderService,
  batchSortFoldersService,
  // 文件服务
  fetchFileInfoService,
  uploadFileService,
  updateFileService,
  deleteFileService,
  moveFileService,
  batchMoveFilesService,
  batchDeleteFilesService,
  buildDownloadUrl,
  // 回收站服务
  fetchRecycleBinService,
  restoreFileService,
  permanentDeleteFileService,
  clearCacheService,
  // 游标分页服务
  fetchRootFolderService,
  fetchFolderChildrenService,
  fetchFolderSubfoldersService,
  searchInFolderService,
} from '../services/fileService';

export const useFileStore = defineStore('file', {
  state: () => ({
    // ========== 数据结构 ==========
    
    /**
     * 文件夹内容缓存
     * foldersMap[folderId] = {
     *   meta: { id, name, type, childFolderCount, childFileCount, ... },
     *   items: [],           // 文件夹+文件混合列表
     *   cursor: null,        // 当前游标
     *   hasMore: true,       // 是否有更多数据
     *   sort: { field: 'name', order: 'asc' },
     *   keyword: '',
     *   loading: false,
     *   lastFetchedAt: Date.now(),
     * }
     */
    foldersMap: {},
    
    // ========== 文件夹相关 ==========
    currentFolderId: null,    // 当前选中的文件夹ID (null表示根目录)
    folderPath: [],           // 当前文件夹的面包屑路径
    folderLoading: false,     // 文件夹操作加载状态
    
    // ========== 文件相关 ==========
    files: [],                // 文件列表(用于兼容旧组件)
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
    currentViewMode: 'grid',  // 当前内容区视图模式
    activeView: 'files',      // 'files' | 'recycle'
    showDetailPanel: false,   // 是否显示详情面板
    
    // ========== 回收站 (游标分页) ==========
    recycleFiles: [],
    recycleBinCursor: null,      // 回收站分页游标
    recycleBinHasMore: false,    // 是否有更多
    recycleBinLimit: 50,         // 每页数量
    recycleBinLoading: false,    // 加载状态
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
      
      // 从当前目录缓存中查找
      const key = state.currentFolderId || 'root';
      const cache = state.foldersMap[key];
      if (cache) {
        const file = cache.items.find(item => item.id === state.currentFileId && item.type === 'file');
        if (file) return file;
      }
      
      // 从files列表中查找
      return state.files.find(f => f.id === state.currentFileId) || null;
    },

    /**
     * 当前是否在根目录
     */
    isRootFolder: (state) => state.currentFolderId === null,
    
    /**
     * 获取当前目录缓存
     */
    currentFolderCache: (state) => {
      const key = state.currentFolderId || 'root';
      return state.foldersMap[key] || null;
    },
    
    /**
     * 获取当前目录的项目列表
     */
    currentFolderItems: (state) => {
      const key = state.currentFolderId || 'root';
      const cache = state.foldersMap[key];
      return cache ? cache.items : [];
    },
    
    /**
     * 当前目录是否正在加载
     */
    currentFolderLoading: (state) => {
      const key = state.currentFolderId || 'root';
      const cache = state.foldersMap[key];
      return cache ? cache.loading : state.fileLoading;
    },
    
    /**
     * 当前目录是否有更多数据
     */
    currentFolderHasMore: (state) => {
      const key = state.currentFolderId || 'root';
      const cache = state.foldersMap[key];
      return cache ? cache.hasMore : false;
    },
  },

  actions: {
    // ========== 初始化 ==========
    
    /**
     * 初始化文件管理器
     */
    async initialize() {
      if (!this.userId) return;
      
      try {
        // 1. 获取根目录信息
        const rootFolder = await fetchRootFolderService(this.userId);
        
        if (rootFolder) {
          // 初始化根目录缓存
          this.foldersMap['root'] = {
            meta: {
              id: 'root',
              name: rootFolder.name,
              type: 'folder',
              childFolderCount: rootFolder.childFolderCount,
              childFileCount: rootFolder.childFileCount,
            },
            items: [],
            cursor: null,
            hasMore: true,
            sort: { field: 'name', order: 'asc' },
            keyword: '',
            loading: false,
            lastFetchedAt: Date.now(),
          };
          
          // 加载根目录内容
          await this.fetchFolderContent('root');
        }
        
      } catch (error) {
        console.error('初始化失败:', error);
        throw error;
      }
    },

    // ========== 目录内容获取 (游标分页) ==========
    
    /**
     * 获取目录内容(第一页或刷新)
     * @param {string|null} folderId
     * @param {Object} options - { forceRefresh, keyword, sort }
     */
    async fetchFolderContent(folderId, options = {}) {
      const key = folderId || 'root';
      const { forceRefresh = false, keyword = '', sort = null } = options;
      
      // 初始化缓存
      if (!this.foldersMap[key]) {
        this.foldersMap[key] = {
          meta: {},
          items: [],
          cursor: null,
          hasMore: true,
          sort: sort || { field: 'name', order: 'asc' },
          keyword: keyword,
          loading: false,
          lastFetchedAt: 0,
        };
      }
      
      const cache = this.foldersMap[key];
      
      // 如果已有缓存且不强制刷新,直接返回
      if (!forceRefresh && cache.items.length > 0 && 
          cache.keyword === keyword && 
          JSON.stringify(cache.sort) === JSON.stringify(sort || cache.sort)) {
        return cache.items;
      }
      
      // 重置缓存
      cache.items = [];
      cache.cursor = null;
      cache.hasMore = true;
      cache.loading = true;
      cache.keyword = keyword;
      if (sort) cache.sort = sort;
      
      try {
        const params = {
          userId: this.userId,
          limit: 50,
          keyword: cache.keyword,
          orderBy: cache.sort.field,
          order: cache.sort.order,
        };
        
        const result = await fetchFolderChildrenService(folderId, params);
        
        // 根据OpenAPI规范，result包含items和pagination
        cache.items = result.items;
        cache.cursor = result.pagination?.nextCursor;
        cache.hasMore = result.pagination?.hasMore || false;
        cache.total = result.pagination?.total;
        cache.lastFetchedAt = Date.now();
        
        // 同步到旧版files (兼容)
        if (key === (this.currentFolderId || 'root')) {
          this.files = result.items.filter(item => item.type === 'file');
          this.total = result.pagination?.total;
        }
        
        return result.items;
      } catch (error) {
        console.error('获取目录内容失败:', error);
        cache.hasMore = false;
        throw error;
      } finally {
        cache.loading = false;
      }
    },
    
    /**
     * 加载目录的下一页
     * @param {string|null} folderId
     */
    async loadNextPage(folderId) {
      const key = folderId || 'root';
      const cache = this.foldersMap[key];
      
      if (!cache || !cache.hasMore || cache.loading) {
        return;
      }
      
      cache.loading = true;
      
      try {
        const params = {
          userId: this.userId,
          cursor: cache.cursor,
          limit: 50,
          keyword: cache.keyword,
          orderBy: cache.sort.field,
          order: cache.sort.order,
        };
        
        const result = await fetchFolderChildrenService(folderId, params);
        
        // 根据OpenAPI规范，result包含items和pagination
        cache.items.push(...result.items);
        cache.cursor = result.pagination?.nextCursor;
        cache.hasMore = result.pagination?.hasMore || false;
        cache.lastFetchedAt = Date.now();
        
        // 同步到旧版files (兼容)
        if (key === (this.currentFolderId || 'root')) {
          this.files = cache.items.filter(item => item.type === 'file');
        }
      } catch (error) {
        console.error('加载下一页失败:', error);
        throw error;
      } finally {
        cache.loading = false;
      }
    },
    
    /**
     * 在目录中搜索
     * @param {string|null} folderId
     * @param {string} keyword
     */
    async searchInFolder(folderId, keyword) {
      const key = folderId || 'root';
      
      if (!keyword || !keyword.trim()) {
        // 清空搜索,重新加载
        return await this.fetchFolderContent(folderId, { forceRefresh: true, keyword: '' });
      }
      
      // 使用搜索API
      const cache = this.foldersMap[key] || {};
      cache.loading = true;
      
      try {
        const params = {
          userId: this.userId,
          keyword: keyword.trim(),
          limit: 50,
          orderBy: cache.sort?.field || 'name',
          order: cache.sort?.order || 'asc',
        };
        
        const result = await searchInFolderService(folderId, params);
        
        // 根据OpenAPI规范，result包含items和pagination
        // 更新缓存
        this.foldersMap[key] = {
          ...cache,
          items: result.items,
          cursor: result.pagination?.nextCursor,
          hasMore: result.pagination?.hasMore || false,
          total: result.pagination?.total,
          keyword: keyword.trim(),
          loading: false,
          lastFetchedAt: Date.now(),
        };
        
        // 同步到旧版files (兼容)
        if (key === (this.currentFolderId || 'root')) {
          this.files = result.items.filter(item => item.type === 'file');
        }
        
        return result.items;
      } catch (error) {
        console.error('搜索失败:', error);
        cache.loading = false;
        throw error;
      }
    },

    // ========== 文件夹操作 ==========
    
    /**
     * 切换当前文件夹
     */
    async navigateToFolder(folderId, options = {}) {
      this.currentFolderId = folderId;
      this.page = 1;
      
      // 更新面包屑路径
      if (folderId === null) {
        this.folderPath = [];
      } else {
        await this.fetchFolderPath(folderId);
      }
      
      // 使用新版API或旧版API刷新内容
      await this.fetchFolderContent(folderId, options);
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
        
        // 清除父目录缓存
        const parentKey = data.parentId || 'root';
        if (this.foldersMap[parentKey]) {
          delete this.foldersMap[parentKey];
        }
        
        
        // 如果在父目录,刷新内容
        if (this.currentFolderId === data.parentId || (!this.currentFolderId && !data.parentId)) {
          await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
        }
        
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
        
        // 清除相关缓存
        Object.keys(this.foldersMap).forEach(key => {
          const cache = this.foldersMap[key];
          const item = cache.items.find(item => item.id === id);
          if (item) {
            Object.assign(item, folder);
          }
        });
        
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
        
        // 清除被删除文件夹的缓存
        delete this.foldersMap[id];
        
        // 如果删除的是当前文件夹，返回上级
        if (id === this.currentFolderId) {
          const parentId = this.folderPath.length > 1 
            ? this.folderPath[this.folderPath.length - 2].id 
            : null;
          await this.navigateToFolder(parentId);
        } else {
          // 如果删除的不是当前文件夹，需要刷新当前文件夹的内容
          // 清除当前目录缓存
          const currentKey = this.currentFolderId || 'root';
          if (this.foldersMap[currentKey]) {
            delete this.foldersMap[currentKey];
          }
          
          // 刷新当前文件夹内容
          await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
        }
        
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
        return true;
      } catch (error) {
        console.error('排序文件夹失败:', error);
        throw error;
      }
    },

    // ========== 文件操作 ==========
    
// fetchFiles已移除 - 统一使用fetchFolderContent

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
        
        // 清除当前目录缓存
        const key = this.currentFolderId || 'root';
        if (this.foldersMap[key]) {
          delete this.foldersMap[key];
        }
        
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
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
        
        // 更新缓存中的文件信息
        Object.values(this.foldersMap).forEach(cache => {
          const item = cache.items.find(item => item.id === id);
          if (item) {
            Object.assign(item, file);
          }
        });
        
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
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
        
        // 清除当前目录缓存
        const key = this.currentFolderId || 'root';
        if (this.foldersMap[key]) {
          delete this.foldersMap[key];
        }
        
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
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
        
        // 清除源和目标目录缓存
        const sourceKey = this.currentFolderId || 'root';
        const targetKey = targetFolderId || 'root';
        delete this.foldersMap[sourceKey];
        delete this.foldersMap[targetKey];
        
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
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
        
        // 清除源和目标目录缓存
        const sourceKey = this.currentFolderId || 'root';
        const targetKey = targetFolderId || 'root';
        delete this.foldersMap[sourceKey];
        delete this.foldersMap[targetKey];
        
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
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
        
        // 清除当前目录缓存
        const key = this.currentFolderId || 'root';
        if (this.foldersMap[key]) {
          delete this.foldersMap[key];
        }
        
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
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
      const key = this.currentFolderId || 'root';
      const cache = this.foldersMap[key];
      if (cache) {
        this.selectedFiles = cache.items
          .filter(item => item.type === 'file')
          .map(item => item.id);
      } else if (this.files.length > 0) {
        // Fallback到files列表(兼容性)
        this.selectedFiles = this.files.map(f => f.id);
      }
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

    // ========== 搜索与筛选 ==========
    
    /**
     * 更新搜索关键词
     */
    async updateKeyword(keyword) {
      this.keyword = keyword;
      this.page = 1;
      
      await this.searchInFolder(this.currentFolderId, keyword);
    },

    /**
     * 更新排序
     */
    async updateSort(sortBy, order) {
      this.sortBy = sortBy;
      this.order = order;
      this.page = 1;
      
      const sort = { field: sortBy, order };
      await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true, sort });
    },

    // ========== 视图控制 ==========
    
    /**
     * 切换视图模式
     */
    setViewMode(mode) {
      this.viewMode = mode;
      this.currentViewMode = mode;
    },

    /**
     * 切换主视图（文件/回收站）
     */
    async setActiveView(view) {
      if (this.activeView === view) return;
      
      this.activeView = view;
      
      if (view === 'recycle') {
        await this.fetchRecycleBinFiles(true);
      } else {
        await this.fetchFolderContent(this.currentFolderId);
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
    
    // goToPage已移除 - 使用游标分页，通过loadNextPage加载更多

    /**
     * 刷新当前列表
     */
    async refresh() {
      if (this.activeView === 'recycle') {
        await this.fetchRecycleBinFiles(true);
      } else {
        await this.fetchFolderContent(this.currentFolderId, { forceRefresh: true });
      }
    },

    // ========== 回收站 (游标分页) ==========
    
    /**
     * 获取回收站文件列表（游标分页）
     * @param {boolean} reset - 是否重置列表（清空游标）
     */
    async fetchRecycleBinFiles(reset = false) {
      if (!this.userId) return;
      
      // 重置时清空游标
      if (reset) {
        this.recycleFiles = [];
        this.recycleBinCursor = null;
      }
      
      // 没有更多数据时不再请求
      if (!reset && !this.recycleBinHasMore && this.recycleBinCursor !== null) {
        return;
      }
      
      try {
        this.recycleBinLoading = true;
        
        const params = {
          userId: this.userId,
          cursor: this.recycleBinCursor,
          limit: this.recycleBinLimit,
        };
        
        const res = await fetchRecycleBinService(params);
        
        if (reset) {
          this.recycleFiles = res.items;
        } else {
          this.recycleFiles.push(...res.items);
        }
        
        this.recycleBinCursor = res.pagination.nextCursor;
        this.recycleBinHasMore = res.pagination.hasMore;
      } catch (error) {
        console.error('获取回收站列表失败:', error);
        throw error;
      } finally {
        this.recycleBinLoading = false;
      }
    },

    /**
     * 加载更多回收站文件
     */
    async loadMoreRecycleBinFiles() {
      if (!this.recycleBinHasMore || this.recycleBinLoading) return;
      await this.fetchRecycleBinFiles(false);
    },

    /**
     * 恢复文件
     */
    async restoreFile(id) {
      if (!this.userId) throw new Error('用户未登录');
      
      try {
        await restoreFileService(id, this.userId);
        await this.fetchRecycleBinFiles(true); // 重置刷新
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
        await this.fetchRecycleBinFiles(true); // 重置刷新
      } catch (error) {
        console.error('永久删除文件失败:', error);
        throw error;
      }
    },

    // ========== 其他 ==========
    
    /**
     * 清除缓存
     */
    async clearCache() {
      try {
        // 清除前端缓存
        this.foldersMap = {};
        
        // 清除后端缓存
        return await clearCacheService();
      } catch (error) {
        console.error('清除缓存失败:', error);
        throw error;
      }
    },
  },
});

import { defineStore } from 'pinia';
import { fetchDocumentsService } from '../services/documentService';

/**
 * 文档列表Store（游标分页）
 * 用于独立的文档列表页面或文档浏览界面
 */
export const useDocumentListStore = defineStore('documentList', {
  state: () => ({
    // 文档列表数据
    documents: [],
    
    // 游标分页状态
    nextCursor: null,
    hasMore: false,
    total: null,
    
    // 查询条件
    query: {
      q: '', // 搜索关键词
      groupId: null, // 分组筛选
      sortBy: 'default', // 排序字段：default, title, createdAt, updatedAt
      order: 'asc', // 排序方向：asc, desc
    },
    
    // 加载状态
    loading: false,
    error: null,
    
    // 每页数量
    limit: 20,
  }),

  getters: {
    /**
     * 是否为空列表
     */
    isEmpty: (state) => state.documents.length === 0,

    /**
     * 是否可以加载更多
     */
    canLoadMore: (state) => state.hasMore && !state.loading && state.nextCursor !== null,
  },

  actions: {
    /**
     * 加载第一页
     */
    async loadFirstPage() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          q: this.query.q || undefined,
          groupId: this.query.groupId || undefined,
          sortBy: this.query.sortBy,
          order: this.query.order,
          limit: this.limit,
        };

        const result = await fetchDocumentsService(params);

        this.documents = result.items;
        this.nextCursor = result.pagination.nextCursor;
        this.hasMore = result.pagination.hasMore;
        this.total = result.pagination.total;
      } catch (error) {
        this.error = error;
        console.error('加载文档列表失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 加载下一页
     */
    async loadMore() {
      if (!this.hasMore || !this.nextCursor || this.loading) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const params = {
          cursor: this.nextCursor,
          limit: this.limit,
        };

        const result = await fetchDocumentsService(params);

        this.documents.push(...result.items);
        this.nextCursor = result.pagination.nextCursor;
        this.hasMore = result.pagination.hasMore;
        this.total = result.pagination.total;
      } catch (error) {
        this.error = error;

        // 游标失效处理
        if (error.code === 410) {
          console.warn('游标已失效，需要刷新列表');
          this.hasMore = false;
          this.nextCursor = null;
        }

        console.error('加载更多文档失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刷新列表
     */
    async refresh() {
      this.documents = [];
      this.nextCursor = null;
      this.hasMore = true;
      this.total = null;
      await this.loadFirstPage();
    },

    /**
     * 更新搜索关键词
     */
    async updateSearch(keyword) {
      this.query.q = keyword;
      await this.refresh();
    },

    /**
     * 更新分组筛选
     */
    async updateGroupFilter(groupId) {
      this.query.groupId = groupId;
      await this.refresh();
    },

    /**
     * 更新排序
     */
    async updateSort(sortBy, order) {
      this.query.sortBy = sortBy;
      this.query.order = order;
      await this.refresh();
    },

    /**
     * 添加文档到列表开头
     */
    prependDocument(doc) {
      this.documents.unshift(doc);
      if (this.total !== null) {
        this.total++;
      }
    },

    /**
     * 更新列表中的文档
     */
    updateDocument(id, updater) {
      const index = this.documents.findIndex(doc => doc.id === id);
      if (index !== -1) {
        if (typeof updater === 'function') {
          this.documents[index] = updater(this.documents[index]);
        } else {
          this.documents[index] = { ...this.documents[index], ...updater };
        }
      }
    },

    /**
     * 从列表中移除文档
     */
    removeDocument(id) {
      const index = this.documents.findIndex(doc => doc.id === id);
      if (index !== -1) {
        this.documents.splice(index, 1);
        if (this.total !== null) {
          this.total--;
        }
      }
    },

    /**
     * 查找文档
     */
    findDocument(id) {
      return this.documents.find(doc => doc.id === id);
    },

    /**
     * 重置状态
     */
    reset() {
      this.documents = [];
      this.nextCursor = null;
      this.hasMore = true;
      this.total = null;
      this.query = {
        q: '',
        groupId: null,
        sortBy: 'default',
        order: 'asc',
      };
      this.loading = false;
      this.error = null;
    },
  },
});


import { defineStore } from 'pinia'
import { getArticles, getArticleBySlug } from '@/api/article'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    currentArticle: null,
    pagination: {
      page: 1,
      size: 10,
      total: 0
    },
    filters: {
      keyword: '',
      groupId: null,
      tags: [],
      status: 'published'
    },
    loading: false,
    error: null
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.pagination.total / state.pagination.size),
    hasMore: (state) => state.pagination.page < Math.ceil(state.pagination.total / state.pagination.size)
  },

  actions: {
    async fetchArticles(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const queryParams = {
          page: this.pagination.page,
          size: this.pagination.size,
          ...this.filters,
          ...params
        }
        
        const res = await getArticles(queryParams)
        this.articles = res.data.items
        this.pagination.total = res.data.total
        this.pagination.page = res.data.page
        
        return res
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchArticleBySlug(slug) {
      this.loading = true
      this.error = null
      
      try {
        const res = await getArticleBySlug(slug)
        this.currentArticle = res.data
        return res
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.pagination.page = 1 // 重置到第一页
    },

    setPage(page) {
      this.pagination.page = page
      this.fetchArticles()
    },

    resetFilters() {
      this.filters = {
        keyword: '',
        groupId: null,
        tags: [],
        status: 'published'
      }
      this.pagination.page = 1
    },

    clearCurrentArticle() {
      this.currentArticle = null
    }
  }
})


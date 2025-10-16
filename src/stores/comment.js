import { defineStore } from 'pinia'
import { getComments, createComment, deleteComment } from '@/api/comment'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    commentsByArticle: {}, // 按文章ID缓存评论
    loading: false,
    error: null
  }),

  getters: {
    getArticleComments: (state) => (articleId) => {
      return state.commentsByArticle[articleId] || []
    }
  },

  actions: {
    async fetchComments(articleId) {
      this.loading = true
      this.error = null
      
      try {
        const res = await getComments(articleId)
        this.commentsByArticle[articleId] = res.data
        this.comments = res.data
        return res
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addComment(articleId, commentData) {
      this.loading = true
      this.error = null
      
      try {
        const res = await createComment(articleId, commentData)
        
        // 添加到对应文章的评论列表
        if (!this.commentsByArticle[articleId]) {
          this.commentsByArticle[articleId] = []
        }
        this.commentsByArticle[articleId].unshift(res.data)
        
        return res
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeComment(commentId, articleId) {
      try {
        await deleteComment(commentId)
        
        // 从缓存中移除
        if (this.commentsByArticle[articleId]) {
          this.commentsByArticle[articleId] = this.commentsByArticle[articleId].filter(
            c => c.id !== commentId
          )
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})


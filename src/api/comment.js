import request from './request'

/**
 * 获取文章评论列表
 */
export const getComments = (articleId) => {
  return request.get(`/api/articles/${articleId}/comments`)
}

/**
 * 提交评论
 */
export const createComment = (articleId, data) => {
  return request.post(`/api/articles/${articleId}/comments`, data)
}

/**
 * 获取所有评论（后台）
 */
export const getAdminComments = (params) => {
  return request.get('/api/admin/comments', { params })
}

/**
 * 删除评论（后台）
 */
export const deleteComment = (id) => {
  return request.delete(`/api/admin/comments/${id}`)
}


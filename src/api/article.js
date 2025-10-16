import request from './request'

/**
 * 获取文章列表（公共）
 */
export const getArticles = (params) => {
  return request.get('/api/articles', { params })
}

/**
 * 获取文章详情（公共）
 */
export const getArticleBySlug = (slug) => {
  return request.get(`/api/articles/${slug}`)
}

/**
 * 获取文章列表（后台）
 */
export const getAdminArticles = (params) => {
  return request.get('/api/admin/articles', { params })
}

/**
 * 创建文章
 */
export const createArticle = (data) => {
  return request.post('/api/admin/articles', data)
}

/**
 * 更新文章
 */
export const updateArticle = (id, data) => {
  return request.put(`/api/admin/articles/${id}`, data)
}

/**
 * 删除文章
 */
export const deleteArticle = (id) => {
  return request.delete(`/api/admin/articles/${id}`)
}

/**
 * 批量删除文章
 */
export const batchDeleteArticles = (ids) => {
  return request.post('/api/admin/articles/batch-delete', { ids })
}

/**
 * 批量发布文章
 */
export const batchPublishArticles = (ids) => {
  return request.post('/api/admin/articles/batch-publish', { ids })
}


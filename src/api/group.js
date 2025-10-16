import request from './request'

/**
 * 获取分组列表（公共）
 */
export const getGroups = () => {
  return request.get('/api/groups')
}

/**
 * 获取分组列表（后台）
 */
export const getAdminGroups = () => {
  return request.get('/api/admin/groups')
}

/**
 * 创建分组
 */
export const createGroup = (data) => {
  return request.post('/api/admin/groups', data)
}

/**
 * 更新分组
 */
export const updateGroup = (id, data) => {
  return request.put(`/api/admin/groups/${id}`, data)
}

/**
 * 删除分组
 */
export const deleteGroup = (id) => {
  return request.delete(`/api/admin/groups/${id}`)
}

/**
 * 更新分组排序
 */
export const updateGroupOrder = (data) => {
  return request.post('/api/admin/groups/order', data)
}


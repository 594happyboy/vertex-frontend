import request from './request';

/**
 * 查询文档列表
 * @param {Object} params - { q?, status?, groupId?, page?, size? }
 * @returns {Promise<{ items: Array, total: number }>}
 */
export function getDocuments(params = {}) {
  return request.get('/api/documents', { params });
}

/**
 * 获取文档详情
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function getDocument(id) {
  return request.get(`/api/documents/${id}`);
}

/**
 * 创建文档
 * @param {Object} data - { title, type, groupId?, contentMd? }
 * @returns {Promise<Object>}
 */
export function createDocument(data) {
  return request.post('/api/documents', data);
}

/**
 * 更新文档
 * @param {number} id
 * @param {Object} data - { title?, groupId?, contentMd?, status?, sortIndex? }
 * @returns {Promise<Object>}
 */
export function updateDocument(id, data) {
  return request.patch(`/api/documents/${id}`, data);
}

/**
 * 删除文档
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteDocument(id) {
  return request.delete(`/api/documents/${id}`);
}

/**
 * 批量更新文档排序
 * @param {Array} items - [{ id, groupId?, sortIndex }]
 * @returns {Promise<void>}
 */
export function sortDocuments(items) {
  return request.post('/api/sort/documents', { items });
}


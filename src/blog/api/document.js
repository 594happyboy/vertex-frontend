import request from '@/api/request';

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
 * 创建文档（新版API，使用FormData）
 * @param {string} title - 文档标题
 * @param {File} file - 文件对象（MD/PDF/TXT）
 * @param {number} groupId - 可选，分组ID
 * @returns {Promise<Object>}
 */
export function createDocument(title, file, groupId = null) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  if (groupId !== null && groupId !== undefined) {
    formData.append('groupId', groupId.toString());
  }
  
  return request.post('/api/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 更新文档元数据
 * @param {number} id
 * @param {Object} data - { title?, groupId?, sortIndex? }
 * @returns {Promise<Object>}
 */
export function updateDocument(id, data) {
  return request.patch(`/api/documents/${id}`, data);
}

/**
 * 更新文档文件（新版API）
 * @param {number} id - 文档ID
 * @param {File} file - 新的文件对象
 * @returns {Promise<Object>}
 */
export function updateDocumentFile(id, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request.patch(`/api/documents/${id}/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 获取文档下载URL
 * @param {number} id - 文档ID
 * @returns {Promise<string>}
 */
export function getDocumentDownloadUrl(id) {
  return request.get(`/api/documents/${id}/download`);
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

/**
 * 批量上传文档（ZIP压缩包）
 * @param {File} file - ZIP文件
 * @param {number} parentGroupId - 父分组ID，可选
 * @returns {Promise<Object>}
 */
export function batchUploadDocuments(file, parentGroupId = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (parentGroupId !== null) {
    formData.append('parentGroupId', parentGroupId);
  }
  
  return request.post('/api/documents/batch-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 超时时间设置为5分钟，因为批量上传可能需要较长时间
    timeout: 300000,
  });
}


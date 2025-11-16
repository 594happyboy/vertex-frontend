import request from '@/api/request';

/**
 * 查询文档列表（游标分页）
 * @param {Object} params - { q?, groupId?, cursor?, limit?, sortBy?, order? }
 * @returns {Promise<PaginatedResponse<DocumentItem>>}
 */
export function getDocuments(params = {}) {
  return request.get('/api/documents/query', { params });
}

/**
 * 获取文档详情
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function getDocument(id) {
  return request.get(`/api/documents/details/${id}`);
}

/**
 * 创建文档（新版API，使用 FormData）
 * @param {string} title - 文档标题
 * @param {File} file - 文件内容（MD/PDF/TXT 等）
 * @param {number|null} groupId - 可选：分组ID
 * @returns {Promise<Object>}
 */
export function createDocument(title, file, groupId = null) {
  const formData = new FormData();
  formData.append('file', file);
  const params = { title };
  if (groupId !== null && groupId !== undefined) {
    params.groupId = groupId;
  }

  return request.post('/api/documents/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params,
  });
}

/**
 * 上传单个文档内容（uploadSingle 接口）
 * 对应 api-docs.json 中的 /api/documents/upload（operationId: uploadSingle）
 * @param {File} file - 文档文件（二进制）
 * @param {number|null} groupId - 可选：分组ID
 * @param {string|null} title - 可选：文档标题，未传时后端将使用文件名
 * @returns {Promise<Object>}
 */
export function uploadSingleDocument(file, groupId = null, title = null) {
  const formData = new FormData();
  formData.append('file', file);

  const params = {};
  if (groupId !== null && groupId !== undefined) {
    params.groupId = groupId;
  }
  if (title !== null && title !== undefined && title !== '') {
    params.title = title;
  }

  return request.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params,
  });
}

/**
 * 更新文档元数据
 * @param {number} id
 * @param {Object} data - { title?, groupId?, sortIndex? }
 * @returns {Promise<Object>}
 */
export function updateDocument(id, data) {
  return request.patch(`/api/documents/update/${id}`, data);
}

/**
 * 更新文档文件（新版API）
 * @param {number} id - 文档ID
 * @param {File} file - 新的文件内容
 * @returns {Promise<Object>}
 */
export function updateDocumentFile(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  return request.patch(`/api/documents/replace-file/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 获取文档下载 URL
 * @param {number} id - 文档ID
 * @returns {Promise<string>}
 */
export function getDocumentDownloadUrl(id) {
  return request.get(`/api/documents/download/${id}`);
}

/**
 * 删除文档
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteDocument(id) {
  return request.delete(`/api/documents/remove/${id}`);
}

/**
 * 批量更新文档排序
 * @param {Array} items - [{ id, groupId?, sortIndex }]
 * @returns {Promise<void>}
 */
export function sortDocuments(items) {
  return request.post('/api/sort/documents/reorder', { items });
}

/**
 * 批量上传文档（ZIP 压缩包）
 * @param {File} file - ZIP 文件
 * @param {number|null} parentGroupId - 父分组ID，可选
 * @returns {Promise<Object>}
 */
export function batchUploadDocuments(file, parentGroupId = null) {
  const formData = new FormData();
  formData.append('file', file);

  // 按 OpenAPI 规范，parentGroupId 作为 form-data 字段传递
  if (parentGroupId !== null && parentGroupId !== undefined) {
    formData.append('parentGroupId', parentGroupId.toString());
  }

  return request.post('/api/documents/batch-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 批量上传可能耗时较长，单独加长超时时间
    timeout: 300000,
  });
}


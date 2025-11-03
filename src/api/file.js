import request from '@/api/request';

// ==================== 文件夹管理 API ====================

/**
 * 获取文件夹树
 * @param {Object} params - { userId, includeStats }
 * @returns {Promise<Object>}
 */
export function getFolderTree(params = {}) {
  return request.get('/api/folders/tree', { params });
}

/**
 * 获取文件夹详情
 * @param {number} id
 * @param {number} userId
 * @param {boolean} includeAncestors - 是否包含祖先路径信息，默认false
 * @returns {Promise<Object>}
 */
export function getFolderInfo(id, userId, includeAncestors = false) {
  return request.get(`/api/folders/${id}`, { params: { userId, includeAncestors } });
}

/**
 * 获取文件夹路径（面包屑）
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function getFolderPath(id, userId) {
  return request.get(`/api/folders/${id}/path`, { params: { userId } });
}

/**
 * 创建文件夹
 * @param {Object} data - { name, parentId?, color?, description? }
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function createFolder(data, userId) {
  return request.post('/api/folders', data, { params: { userId } });
}

/**
 * 更新文件夹
 * @param {number} id
 * @param {Object} data - { name?, parentId?, color?, description?, sortIndex? }
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function updateFolder(id, data, userId) {
  return request.put(`/api/folders/${id}`, data, { params: { userId } });
}

/**
 * 删除文件夹
 * @param {number} id
 * @param {number} userId
 * @param {boolean} recursive - 是否递归删除
 * @returns {Promise<boolean>}
 */
export function deleteFolder(id, userId, recursive = false) {
  return request.delete(`/api/folders/${id}`, { 
    params: { userId, recursive } 
  });
}

/**
 * 批量排序文件夹
 * @param {Array<{id: number, sortIndex: number}>} items
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export function batchSortFolders(items, userId) {
  return request.post('/api/folders/batch-sort', { items }, { params: { userId } });
}

// ==================== 文件管理 API ====================

/**
 * 上传文件
 * @param {File} file
 * @param {Object} options - { userId?, folderId?, tags?, description? }
 * @returns {Promise<Object>}
 */
export function uploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  const params = {};
  if (options.userId) params.userId = options.userId;
  if (options.folderId !== undefined) params.folderId = options.folderId;
  if (options.tags) params.tags = options.tags;
  if (options.description) params.description = options.description;
  
  return request.post('/api/files/upload', formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 已移除getFileList - 不再支持旧版API，请使用getFolderChildren

/**
 * 获取文件详情
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function getFileInfo(id, userId) {
  return request.get(`/api/files/${id}`, { params: { userId } });
}

/**
 * 更新文件信息
 * @param {number} id
 * @param {Object} data - { fileName?, folderId?, tags?, description? }
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function updateFile(id, data, userId) {
  return request.put(`/api/files/${id}`, data, { params: { userId } });
}

/**
 * 删除文件（移入回收站）
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export function deleteFile(id, userId) {
  return request.delete(`/api/files/${id}`, { params: { userId } });
}

/**
 * 移动文件到指定文件夹
 * @param {number} id
 * @param {number|null} targetFolderId
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function moveFile(id, targetFolderId, userId) {
  return request.put(`/api/files/${id}/move`, { targetFolderId }, { params: { userId } });
}

/**
 * 批量移动文件
 * @param {Array<number>} fileIds
 * @param {number|null} targetFolderId
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function batchMoveFiles(fileIds, targetFolderId, userId) {
  return request.post('/api/files/batch-move', { fileIds, targetFolderId }, { params: { userId } });
}

/**
 * 批量删除文件
 * @param {Array<number>} fileIds
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function batchDeleteFiles(fileIds, userId) {
  return request.post('/api/files/batch-delete', { fileIds }, { params: { userId } });
}

/**
 * 获取文件下载 URL
 * @param {number} id
 * @returns {string}
 */
export function getFileDownloadUrl(id) {
  const baseURL = request.defaults.baseURL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
  return `${baseURL}/api/files/${id}/download`;
}

/**
 * 获取文件统计信息
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export function getFileStatistics(userId) {
  return request.get('/api/files/statistics', { params: { userId } });
}

// ==================== 回收站 API ====================

/**
 * 获取回收站文件列表（游标分页）
 * @param {Object} params - { userId, cursor?, limit? }
 * @returns {Promise<Object>}
 */
export function getRecycleBinList(params = {}) {
  return request.get('/api/files/recycle-bin', { params });
}

/**
 * 恢复文件
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export function restoreFile(id, userId) {
  return request.post(`/api/files/${id}/restore`, {}, { params: { userId } });
}

/**
 * 永久删除文件
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export function permanentDeleteFile(id, userId) {
  return request.delete(`/api/files/${id}/permanent`, { params: { userId } });
}

/**
 * 清除所有缓存
 * @returns {Promise<string>}
 */
export function clearCache() {
  return request.post('/api/files/cache/clear');
}

// ==================== 游标分页 API (新版) ====================

/**
 * 获取根目录信息(含第一批子文件夹)
 * @param {number} userId
 * @param {number} limit - 返回的子文件夹数量，默认50
 * @returns {Promise<Object>}
 */
export function getRootFolder(userId, limit = 50) {
  return request.get('/api/folders/root', { params: { userId, limit } });
}

/**
 * 获取目录内容(文件夹+文件,游标分页)
 * @param {string|null} folderId - 文件夹ID,null表示根目录
 * @param {Object} params - { userId, cursor?, limit?, keyword?, orderBy?, order?, type? }
 * @returns {Promise<Object>}
 */
export function getFolderChildren(folderId, params = {}) {
  const id = folderId || 'root';
  return request.get(`/api/folders/${id}/children`, { params });
}

/**
 * 获取子文件夹列表(仅文件夹,用于树节点懒加载)
 * @param {string|null} folderId
 * @param {Object} params - { userId, cursor?, limit? }
 * @returns {Promise<Object>}
 */
export function getFolderSubfolders(folderId, params = {}) {
  const id = folderId || 'root';
  return request.get(`/api/folders/${id}/subfolders`, { params });
}

/**
 * 在指定目录搜索
 * @param {string|null} folderId - 搜索范围
 * @param {Object} params - { userId, keyword, cursor?, limit?, type?, orderBy?, order? }
 * @returns {Promise<Object>}
 */
export function searchInFolder(folderId, params = {}) {
  const id = folderId || 'root';
  return request.get(`/api/folders/${id}/search`, { params });
}

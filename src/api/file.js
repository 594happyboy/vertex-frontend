import request from '@/api/request';

// ==================== 文件夹管理 API ====================

/**
 * 获取文件夹树
 * @param {Object} params - { includeStats }
 * @returns {Promise<Object>}
 */
export function getFolderTree(params = {}) {
  return request.get('/api/folders/tree', { params });
}

/**
 * 获取文件夹详情
 * @param {string} id - 文件夹公开ID
 * @returns {Promise<Object>}
 */
export function getFolderInfo(id) {
  return request.get(`/api/folders/${id}`);
}

/**
 * 获取文件夹路径（面包屑）
 * @param {string} id - 文件夹公开ID
 * @returns {Promise<Object>}
 */
export function getFolderPath(id) {
  return request.get(`/api/folders/path/${id}`);
}

/**
 * 创建文件夹
 * @param {Object} data - { name, parentId?, color?, description? } - parentId为string类型的公开ID
 * @returns {Promise<Object>}
 */
export function createFolder(data) {
  return request.post('/api/folders', data);
}

/**
 * 更新文件夹
 * @param {string} id - 文件夹公开ID
 * @param {Object} data - { name?, parentId?, color?, description?, sortIndex? } - parentId为string类型的公开ID
 * @returns {Promise<Object>}
 */
export function updateFolder(id, data) {
  return request.put(`/api/folders/${id}`, data);
}

/**
 * 删除文件夹
 * @param {string} id - 文件夹公开ID
 * @param {boolean} recursive - 是否递归删除
 * @returns {Promise<boolean>}
 */
export function deleteFolder(id, recursive = false) {
  return request.delete(`/api/folders/${id}`, { 
    params: { recursive } 
  });
}

/**
 * 批量排序文件夹
 * @param {Array<{id: string, sortIndex: number}>} items - id为文件夹公开ID
 * @returns {Promise<boolean>}
 */
export function batchSortFolders(items) {
  return request.post('/api/folders/batch-sort', { items });
}

// ==================== 文件管理 API ====================

/**
 * 上传文件
 * @param {File} file
 * @param {Object} options - { folderId?, tags?, description?, replaceFileId? } - folderId为string类型的公开ID
 * @returns {Promise<Object>}
 */
export function uploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  const params = {};
  if (options.folderId !== undefined) params.folderId = options.folderId;
  if (options.tags) params.tags = options.tags;
  if (options.description) params.description = options.description;
  if (options.replaceFileId) params.replaceFileId = options.replaceFileId;
  
  return request.post('/api/files/upload', formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 上传附件（自动存储到系统/附件文件夹）
 * @param {File} file
 * @param {Object} options - { description? }
 * @returns {Promise<Object>}
 */
export function uploadAttachment(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  const params = {};
  if (options.description) params.description = options.description;
  
  return request.post('/api/files/upload/attachment', formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 已移除getFileList - 不再支持旧版API，请使用getFolderChildren

/**
 * 获取文件详情
 * @param {string} id - 文件公开ID
 * @returns {Promise<Object>}
 */
export function getFileInfo(id) {
  return request.get(`/api/files/${id}`);
}

/**
 * 更新文件信息
 * @param {string} id - 文件公开ID
 * @param {Object} data - { fileName?, folderId?, tags?, description? } - folderId为string类型的公开ID
 * @returns {Promise<Object>}
 */
export function updateFile(id, data) {
  return request.put(`/api/files/${id}`, data);
}

/**
 * 删除文件（移入回收站）
 * @param {string} id - 文件公开ID
 * @returns {Promise<boolean>}
 */
export function deleteFile(id) {
  return request.delete(`/api/files/delete/${id}`);
}

/**
 * 移动文件到指定文件夹
 * @param {string} id - 文件公开ID
 * @param {string|null} targetFolderId - 目标文件夹公开ID
 * @returns {Promise<Object>}
 */
export function moveFile(id, targetFolderId) {
  return request.put(`/api/files/move/${id}`, { targetFolderId });
}

/**
 * 批量移动文件
 * @param {Array<string>} fileIds - 文件公开ID数组
 * @param {string|null} targetFolderId - 目标文件夹公开ID
 * @returns {Promise<Object>}
 */
export function batchMoveFiles(fileIds, targetFolderId) {
  return request.post('/api/files/batch-move', { fileIds, targetFolderId });
}

/**
 * 批量删除文件
 * @param {Array<string>} fileIds - 文件公开ID数组
 * @returns {Promise<Object>}
 */
export function batchDeleteFiles(fileIds) {
  return request.post('/api/files/batch-delete', { fileIds });
}

/**
 * 获取文件下载 URL
 * @param {string} id - 文件公开ID
 * @returns {string}
 */
export function getFileDownloadUrl(id) {
  const baseURL = request.defaults.baseURL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
  return `${baseURL}/api/files/download/${id}`;
}

/**
 * 获取文件统计信息
 * @returns {Promise<Object>}
 */
export function getFileStatistics() {
  return request.get('/api/files/statistics');
}

// ==================== 回收站 API ====================

/**
 * 获取回收站文件列表（游标分页）
 * @param {Object} params - { cursor?, limit? }
 * @returns {Promise<Object>}
 */
export function getRecycleBinList(params = {}) {
  return request.get('/api/files/recycle-bin', { params });
}

/**
 * 恢复文件
 * @param {string} id - 文件公开ID
 * @returns {Promise<boolean>}
 */
export function restoreFile(id) {
  return request.post(`/api/files/restore/${id}`);
}

/**
 * 永久删除文件
 * @param {string} id - 文件公开ID
 * @returns {Promise<boolean>}
 */
export function permanentDeleteFile(id) {
  return request.delete(`/api/files/permanent/${id}`);
}

/**
 * 清除所有缓存
 * @returns {Promise<string>}
 */
export function clearCache() {
  return request.post('/api/files/cache/clear');
}

/**
 * 查看文件引用详情
 * @param {string} publicId - 文件公开ID
 * @returns {Promise<Object>}
 */
export function getFileReferences(publicId) {
  return request.get(`/api/files/references/${publicId}`);
}

/**
 * 查询孤儿文件列表（无引用的文件）
 * @param {number} gracePeriodDays - 宽限期（天），默认7天
 * @param {number} limit - 限制数量，默认100
 * @returns {Promise<Object>}
 */
export function getOrphanedFiles(gracePeriodDays = 7, limit = 100) {
  return request.get('/api/files/orphaned', { 
    params: { gracePeriodDays, limit } 
  });
}

/**
 * 手动清理无引用文件（管理员功能）
 * @param {number} gracePeriodDays - 宽限期（天），默认7天
 * @returns {Promise<Object>}
 */
export function cleanupUnreferencedFiles(gracePeriodDays = 7) {
  return request.post('/api/files/cleanup/unreferenced', {}, {
    params: { gracePeriodDays }
  });
}

/**
 * 通用批量操作文件
 * @param {string} action - 操作类型：move, delete, restore, tag
 * @param {Array<string>} fileIds - 文件公开ID数组
 * @param {Object} options - { targetFolderId?, tags? }
 * @returns {Promise<Object>}
 */
export function batchOperation(action, fileIds, options = {}) {
  const data = {
    action,
    fileIds,
  };
  
  if (options.targetFolderId !== undefined) {
    data.targetFolderId = options.targetFolderId;
  }
  if (options.tags) {
    data.tags = options.tags;
  }
  
  return request.post('/api/files/batch', data);
}

// ==================== 游标分页 API (新版) ====================

/**
 * 获取根目录信息(含第一批子文件夹)
 * @param {number} limit - 返回的子文件夹数量，默认50
 * @returns {Promise<Object>}
 */
export function getRootFolder(limit = 50) {
  return request.get('/api/folders/root', { params: { limit } });
}

/**
 * 获取目录内容(文件夹+文件,游标分页)
 * @param {string|null} folderId - 文件夹公开ID,null表示根目录
 * @param {Object} params - { cursor?, limit?, keyword?, orderBy?, order?, type? }
 * @returns {Promise<Object>}
 */
export function getFolderChildren(folderId, params = {}) {
  const id = folderId || 'root';
  return request.get(`/api/folders/children/${id}`, { params });
}

/**
 * 获取子文件夹列表(仅文件夹,用于树节点懒加载)
 * @param {string|null} folderId - 文件夹公开ID
 * @param {Object} params - { cursor?, limit? }
 * @returns {Promise<Object>}
 */
export function getFolderSubfolders(folderId, params = {}) {
  const id = folderId || 'root';
  return request.get(`/api/folders/subfolders/${id}`, { params });
}

/**
 * 在指定目录搜索
 * @param {string|null} folderId - 文件夹公开ID，搜索范围
 * @param {Object} params - { keyword, cursor?, limit?, type?, orderBy?, order? }
 * @returns {Promise<Object>}
 */
export function searchInFolder(folderId, params = {}) {
  const id = folderId || 'root';
  return request.get(`/api/folders/search/${id}`, { params });
}

// ==================== 文件内容管理 API ====================

/**
 * 获取文件内容（文本）
 * @param {string} id - 文件公开ID
 * @returns {Promise<string>} - 文件文本内容
 */
export async function getFileContent(id) {
  return await request.get(`/api/files/download/${id}`, {
    responseType: 'text',
    // 标记：跳过标准的 JSON 响应处理，直接返回原始文本内容
    __skipStandardResponse: true,
  });
}

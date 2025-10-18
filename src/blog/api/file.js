import request from './request';

/**
 * 上传文件
 * @param {File} file
 * @param {number} userId - 可选
 * @returns {Promise<Object>}
 */
export function uploadFile(file, userId) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request.post('/api/files/upload', formData, {
    params: { userId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 获取文件列表
 * @param {Object} params - { page?, size?, keyword?, sortBy?, order? }
 * @returns {Promise<Object>}
 */
export function getFileList(params = {}) {
  return request.get('/api/files', { params });
}

/**
 * 获取文件详情
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function getFileInfo(id) {
  return request.get(`/api/files/${id}`);
}

/**
 * 删除文件
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export function deleteFile(id) {
  return request.delete(`/api/files/${id}`);
}

/**
 * 批量删除文件
 * @param {Array<number>} ids
 * @returns {Promise<Object>}
 */
export function batchDeleteFiles(ids) {
  return request.delete('/api/files/batch', {
    data: ids,
  });
}

/**
 * 获取文件下载 URL
 * @param {number} id
 * @returns {string}
 */
export function getFileDownloadUrl(id) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseURL}/api/files/${id}/download`;
}


/**
 * 文件处理相关工具函数
 */

import { FILE_TYPE_CONFIG, FILE_ICON_MAP, FILE_ICON_DEFAULT } from '../constants';

/**
 * 创建文本文件
 * @param {string} title - 文件标题
 * @param {string} type - 文件类型 ('md' | 'txt')
 * @returns {File}
 */
export function createTextFile(title, type) {
  const config = FILE_TYPE_CONFIG[type];
  if (!config) {
    throw new Error(`不支持的文件类型: ${type}`);
  }

  const blob = new Blob([config.defaultContent], { type: config.mime });
  return new File([blob], `${title}${config.ext}`, { type: config.mime });
}

/**
 * 根据文件扩展名获取图标
 * @param {string} fileName - 文件名
 * @returns {string} emoji 图标
 */
export function getFileIcon(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return FILE_ICON_MAP[ext] || FILE_ICON_DEFAULT;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @param {string[]} validTypes - 有效的MIME类型列表
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, validTypes, maxSize) {
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '只支持上传 JPG、PNG、GIF、WebP、SVG 格式的图片',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `图片大小不能超过 ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

/**
 * 验证附件文件
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAttachmentFile(file, maxSize) {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `附件大小不能超过 ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

/**
 * 验证批量上传文件
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {string|null} 错误信息，无错误返回 null
 */
export function validateBatchFile(file, maxSize) {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return '请选择 ZIP 格式的压缩包';
  }
  if (file.size > maxSize) {
    return '文件大小超过限制（最大100MB）';
  }
  return null;
}

/**
 * 从文件名中提取标题（去除扩展名）
 * @param {string} fileName - 文件名
 * @returns {string} 标题
 */
export function extractTitle(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
}

/**
 * 构建完整的文件URL
 * @param {string} filePath - 文件路径
 * @param {string} baseURL - 基础URL
 * @returns {string} 完整URL
 */
export function buildFileUrl(filePath, baseURL) {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return `${baseURL}${filePath}`;
}


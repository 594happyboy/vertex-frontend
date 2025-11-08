import {
  // 文件夹相关
  getFolderTree,
  getFolderInfo,
  getFolderPath,
  createFolder,
  updateFolder,
  deleteFolder,
  batchSortFolders,
  // 文件相关
  uploadFile,
  uploadAttachment,
  getFileInfo,
  updateFile,
  deleteFile,
  moveFile,
  batchMoveFiles,
  batchDeleteFiles,
  getFileDownloadUrl,
  getFileStatistics,
  // 回收站
  getRecycleBinList,
  restoreFile,
  permanentDeleteFile,
  clearCache,
  // 游标分页 API
  getRootFolder,
  getFolderChildren,
  getFolderSubfolders,
  searchInFolder,
  // 文件内容
  getFileContent,
  // 新增接口
  getFileReferences,
  getOrphanedFiles,
  cleanupUnreferencedFiles,
  batchOperation,
} from '@/api/file';

// ==================== 数据映射函数 ====================

/**
 * 映射文件夹响应数据
 * @param {Object} dto - 服务器返回的文件夹数据
 * @returns {Object} 映射后的文件夹对象
 * @property {string} id - 文件夹公开ID（String类型，21位随机字符串）
 * @property {string|null} parentId - 父文件夹公开ID（通常为null，使用文件夹树接口获取层级关系）
 */
function mapFolder(dto) {
  return {
    id: dto.id,  // string 类型的公开ID
    name: dto.name,
    parentId: dto.parentId || null,  // 通常为null
    sortIndex: dto.sortIndex || 0,
    color: dto.color || null,
    description: dto.description || null,
    fileCount: dto.fileCount || 0,
    subFolderCount: dto.subFolderCount || 0,
    totalSize: dto.totalSize || 0,
    totalSizeFormatted: dto.totalSizeFormatted || '0 B',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    // 只在children存在时映射（向后兼容）
    ...(dto.children ? { children: dto.children.map(mapFolder) } : {}),
  };
}

/**
 * 映射文件响应数据
 * @param {Object} dto - 服务器返回的文件数据
 * @returns {Object} 映射后的文件对象
 * @property {string} id - 文件公开ID（String类型，21位随机字符串）
 * @property {string|null} folderId - ⚠️ 已废弃：FileResponse不再包含此字段，请使用文件夹树接口获取文件所属文件夹信息
 */
function mapFile(dto) {
  return {
    id: dto.id,  // string 类型的公开ID
    type: 'file',
    name: dto.fileName || dto.name,
    size: dto.fileSize || dto.size,
    sizeFormatted: dto.fileSizeFormatted || dto.sizeFormatted,
    mimeType: dto.fileType || dto.mimeType,
    extension: dto.fileExtension || dto.extension,
    // ⚠️ 已废弃：后端API已移除此字段，保留仅为兼容性，值通常为null
    folderId: dto.folderId || null,
    folderName: dto.folderName || null,
    description: dto.description || null,
    createdAt: dto.uploadTime || dto.createdAt,
    updatedAt: dto.updateTime || dto.updatedAt,
    owner: dto.owner || null,
    metadata: dto.metadata || {
      downloadCount: dto.downloadCount || 0,
    },
    downloadUrl: dto.downloadUrl,
    previewUrl: dto.previewUrl || null,
    thumbnailUrl: dto.thumbnailUrl || null,
    tags: dto.tags || [],
    deletedAt: dto.deletedAt || null,
    daysUntilPermanentDeletion: dto.daysUntilPermanentDeletion || null,
  };
}

// ==================== 文件夹服务 ====================

/**
 * 获取文件夹树
 */
export async function fetchFolderTreeService(includeStats = true) {
  const res = await getFolderTree({ includeStats });
  
  if (!res || !res.rootFolders) {
    return {
      rootFolders: [],
      totalFolders: 0,
      totalFiles: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B',
    };
  }
  
  return {
    rootFolders: res.rootFolders.map(mapFolder),
    totalFolders: res.totalFolders || 0,
    totalFiles: res.totalFiles || 0,
    totalSize: res.totalSize || 0,
    totalSizeFormatted: res.totalSizeFormatted || '0 B',
  };
}

/**
 * 获取文件夹详情
 */
export async function fetchFolderInfoService(id) {
  const res = await getFolderInfo(id);
  return mapFolder(res);
}

/**
 * 获取文件夹路径（面包屑）
 */
export async function fetchFolderPathService(id) {
  const res = await getFolderPath(id);
  return res.path || [];
}

/**
 * 创建文件夹
 */
export async function createFolderService(data) {
  const res = await createFolder(data);
  return mapFolder(res);
}

/**
 * 更新文件夹
 */
export async function updateFolderService(id, data) {
  const res = await updateFolder(id, data);
  return mapFolder(res);
}

/**
 * 删除文件夹
 */
export async function deleteFolderService(id, recursive = false) {
  await deleteFolder(id, recursive);
  return true;
}

/**
 * 批量排序文件夹
 */
export async function batchSortFoldersService(items) {
  await batchSortFolders(items);
  return true;
}

// ==================== 文件服务 ====================

// 已移除fetchFilesService - 请使用fetchFolderChildrenService代替

/**
 * 获取文件详情
 */
export async function fetchFileInfoService(id) {
  const res = await getFileInfo(id);
  return mapFile(res);
}

/**
 * 上传文件
 */
export async function uploadFileService(file, options = {}) {
  const res = await uploadFile(file, options);
  return mapFile(res);
}

/**
 * 上传附件（自动存储到系统/附件文件夹）
 */
export async function uploadAttachmentService(file, options = {}) {
  const res = await uploadAttachment(file, options);
  return mapFile(res);
}

/**
 * 更新文件信息
 */
export async function updateFileService(id, data) {
  const res = await updateFile(id, data);
  return mapFile(res);
}

/**
 * 删除文件
 */
export async function deleteFileService(id) {
  await deleteFile(id);
  return true;
}

/**
 * 移动文件
 */
export async function moveFileService(id, targetFolderId) {
  const res = await moveFile(id, targetFolderId);
  return mapFile(res);
}

/**
 * 批量移动文件
 */
export async function batchMoveFilesService(fileIds, targetFolderId) {
  const res = await batchMoveFiles(fileIds, targetFolderId);
  return res;
}

/**
 * 批量删除文件
 */
export async function batchDeleteFilesService(fileIds) {
  const res = await batchDeleteFiles(fileIds);
  return res;
}

/**
 * 构建文件下载链接
 */
export function buildDownloadUrl(id) {
  return getFileDownloadUrl(id);
}

/**
 * 获取文件统计信息
 */
export async function fetchStatisticsService() {
  const res = await getFileStatistics();
  
  if (!res) {
    return {
      totalFiles: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B',
      fileTypeDistribution: {},
      recentUploads: [],
    };
  }
  
  return {
    totalFiles: res.totalFiles || 0,
    totalSize: res.totalSize || 0,
    totalSizeFormatted: res.totalSizeFormatted || '0 B',
    fileTypeDistribution: res.fileTypeDistribution || {},
    recentUploads: (res.recentUploads || []).map(mapFile),
  };
}

// ==================== 回收站服务 ====================

/**
 * 获取回收站文件列表（游标分页）
 */
export async function fetchRecycleBinService(params) {
  const res = await getRecycleBinList(params);
  
  if (!res || !res.items) {
    return { 
      items: [], 
      pagination: {
        limit: params.limit || 50,
        nextCursor: null,
        hasMore: false,
        total: 0,
      }
    };
  }
  
  return {
    items: res.items.map(mapResource),  // 使用 mapResource 统一映射
    pagination: res.pagination || {
      limit: params.limit || 50,
      nextCursor: null,
      hasMore: false,
      total: res.items.length,
    },
  };
}

/**
 * 恢复文件
 */
export async function restoreFileService(id) {
  await restoreFile(id);
  return true;
}

/**
 * 永久删除文件
 */
export async function permanentDeleteFileService(id) {
  await permanentDeleteFile(id);
  return true;
}

/**
 * 清除所有缓存
 */
export async function clearCacheService() {
  return await clearCache();
}

// ==================== 游标分页服务 (新版) ====================

/**
 * 映射资源数据(统一文件夹和文件)
 * @param {Object} dto - 服务器返回的资源数据（文件夹或文件）
 * @returns {Object} 映射后的资源对象
 * @property {string} id - 资源公开ID（String类型，21位随机字符串）
 */
function mapResource(dto) {
  // 公共字段
  const base = {
    id: dto.id,  // string 类型的公开ID
    type: dto.type,
    name: dto.name,
    parentId: dto.parentId || null,  // string 类型或 null
    owner: dto.owner || null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    metadata: dto.metadata || {},
  };
  
  if (dto.type === 'folder') {
    return {
      ...base,
      childFolderCount: dto.childFolderCount || 0,
      childFileCount: dto.childFileCount || 0,
      color: dto.color || null,
      icon: dto.icon || null,
      description: dto.description || null,
    };
  } else {
    return {
      ...base,
      size: dto.size,
      sizeFormatted: dto.sizeFormatted,
      mimeType: dto.mimeType,
      extension: dto.extension,
      thumbnailUrl: dto.thumbnailUrl || null,
      downloadUrl: dto.downloadUrl,
      previewUrl: dto.previewUrl || null,
      // ⚠️ 已废弃：后端API已移除此字段，保留仅为兼容性，值通常为null
      folderId: dto.folderId || null,
      tags: dto.tags || [],
      description: dto.description || null,
    };
  }
}

/**
 * 获取根目录信息
 */
export async function fetchRootFolderService(limit = 50) {
  const res = await getRootFolder(limit);
  return {
    id: res.id || 'root',
    type: res.type || 'folder',
    name: res.name || '我的文件',
    childFolderCount: res.childFolderCount || 0,
    childFileCount: res.childFileCount || 0,
    // 根据OpenAPI规范，children是PaginatedResponseFolderResource类型
    children: res.children ? {
      items: res.children.items?.map(mapResource) || [],
      pagination: res.children.pagination ? {
        limit: res.children.pagination.limit || limit,
        nextCursor: res.children.pagination.nextCursor || null,
        hasMore: res.children.pagination.hasMore || false,
        total: res.children.pagination.total,
      } : {
        limit,
        nextCursor: null,
        hasMore: false,
        total: 0,
      },
    } : null,
  };
}

/**
 * 获取目录内容(游标分页)
 * @param {string|null} folderId - 文件夹公开ID（String类型）
 * @param {Object} params - { cursor, limit, keyword, orderBy, order }
 * @returns {Promise<{folders: Array, files: Array, pagination: Object}>}
 */
export async function fetchFolderChildrenService(folderId, params) {
  const res = await getFolderChildren(folderId, params);
  
  // 新API规范：folders和files分别返回
  return {
    folders: (res.folders || []).map(mapResource),
    files: (res.files || []).map(mapResource),
    pagination: {
      limit: res.pagination?.limit || params.limit || 50,
      nextCursor: res.pagination?.nextCursor || null,
      hasMore: res.pagination?.hasMore || false,
      stats: res.pagination?.stats || {
        totalFolders: res.folders?.length || 0,
        totalFiles: res.files?.length || 0,
        totalItems: (res.folders?.length || 0) + (res.files?.length || 0),
      },
    },
  };
}

/**
 * 获取子文件夹列表(树节点懒加载)
 * @param {string|null} folderId - 文件夹公开ID（String类型）
 * @param {Object} params - { cursor, limit }
 * @returns {Promise<{items: Array, pagination: Object}>}
 */
export async function fetchFolderSubfoldersService(folderId, params) {
  const res = await getFolderSubfolders(folderId, params);
  // 根据OpenAPI规范，返回的是PaginatedResponseFolderResource
  return {
    items: (res.items || []).map(mapResource),
    pagination: {
      limit: res.pagination?.limit || params.limit || 100,
      nextCursor: res.pagination?.nextCursor || null,
      hasMore: res.pagination?.hasMore || false,
      stats: res.pagination?.stats,  // 直接传递stats对象（如果有）
    },
  };
}

/**
 * 在目录中搜索
 * @param {string|null} folderId - 文件夹公开ID（String类型）
 * @param {Object} params - { keyword, cursor, limit, orderBy, order }
 * @returns {Promise<{folders: Array, files: Array, pagination: Object}>}
 */
export async function searchInFolderService(folderId, params) {
  const res = await searchInFolder(folderId, params);
  
  // 新API规范：folders和files分别返回
  return {
    folders: (res.folders || []).map(mapResource),
    files: (res.files || []).map(mapResource),
    pagination: {
      limit: res.pagination?.limit || params.limit || 50,
      nextCursor: res.pagination?.nextCursor || null,
      hasMore: res.pagination?.hasMore || false,
      stats: res.pagination?.stats || {
        totalFolders: res.folders?.length || 0,
        totalFiles: res.files?.length || 0,
        totalItems: (res.folders?.length || 0) + (res.files?.length || 0),
      },
    },
  };
}

// ==================== 文件内容服务 ====================

/**
 * 获取文件文本内容
 * @param {string} id - 文件公开ID（String类型）
 * @returns {Promise<string>} - 文件文本内容
 */
export async function fetchFileContentService(id) {
  return await getFileContent(id);
}

/**
 * 更新文件文本内容
 * @param {string} id - 文件公开ID（String类型）
 * @param {string} content - 新的文本内容
 * @param {string} fileName - 文件名
 * @returns {Promise<Object>} - 更新后的文件对象
 */
export async function updateFileContentService(id, content, fileName) {
  // 动态导入 getMimeTypeByFileName 工具函数
  const { getMimeTypeByFileName } = await import('@/file/utils/fileTypes.js');
  
  // 根据文件名确定 MIME 类型
  const mimeType = getMimeTypeByFileName(fileName);
  
  // 将文本内容转换为 File 对象
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });
  
  // 调用上传接口，传入 replaceFileId 参数以覆盖原文件
  const res = await uploadFile(file, {
    replaceFileId: id,
  });
  
  return mapFile(res);
}

// ==================== 管理员功能服务 ====================

/**
 * 查看文件引用详情
 * @param {string} publicId - 文件公开ID
 * @returns {Promise<Object>} - 引用详情信息
 */
export async function fetchFileReferencesService(publicId) {
  return await getFileReferences(publicId);
}

/**
 * 查询孤儿文件列表（无引用的文件）
 * @param {number} gracePeriodDays - 宽限期（天），默认7天
 * @param {number} limit - 限制数量，默认100
 * @returns {Promise<Object>} - 孤儿文件列表
 */
export async function fetchOrphanedFilesService(gracePeriodDays = 7, limit = 100) {
  return await getOrphanedFiles(gracePeriodDays, limit);
}

/**
 * 手动清理无引用文件（管理员功能）
 * @param {number} gracePeriodDays - 宽限期（天），默认7天
 * @returns {Promise<Object>} - 清理结果统计
 */
export async function cleanupUnreferencedFilesService(gracePeriodDays = 7) {
  return await cleanupUnreferencedFiles(gracePeriodDays);
}

/**
 * 通用批量操作文件
 * @param {string} action - 操作类型：move, delete, restore, tag
 * @param {Array<string>} fileIds - 文件公开ID数组
 * @param {Object} options - { targetFolderId?, tags? }
 * @returns {Promise<Object>} - 批量操作结果
 */
export async function batchOperationService(action, fileIds, options = {}) {
  const res = await batchOperation(action, fileIds, options);
  
  if (!res) {
    return {
      success: [],
      failed: [],
    };
  }
  
  return {
    success: res.success || [],
    failed: res.failed || [],
  };
}

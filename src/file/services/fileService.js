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
} from '@/api/file';

// ==================== 数据映射函数 ====================

/**
 * 映射文件夹响应数据
 */
function mapFolder(dto) {
  return {
    id: dto.id,
    name: dto.name,
    parentId: dto.parentId || null,
    sortIndex: dto.sortIndex || 0,
    color: dto.color || null,
    description: dto.description || null,
    fileCount: dto.fileCount || 0,
    subFolderCount: dto.subFolderCount || 0,
    totalSize: dto.totalSize || 0,
    totalSizeFormatted: dto.totalSizeFormatted || '0 B',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    children: dto.children ? dto.children.map(mapFolder) : [],
  };
}

/**
 * 映射文件响应数据
 */
function mapFile(dto) {
  return {
    id: dto.id,
    type: 'file',
    name: dto.fileName || dto.name,
    size: dto.fileSize || dto.size,
    sizeFormatted: dto.fileSizeFormatted || dto.sizeFormatted,
    mimeType: dto.fileType || dto.mimeType,
    extension: dto.fileExtension || dto.extension,
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
export async function fetchFolderTreeService(userId, includeStats = true) {
  const res = await getFolderTree({ userId, includeStats });
  
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
export async function fetchFolderInfoService(id, userId) {
  const res = await getFolderInfo(id, userId);
  return mapFolder(res);
}

/**
 * 获取文件夹路径（面包屑）
 */
export async function fetchFolderPathService(id, userId) {
  const res = await getFolderPath(id, userId);
  return res.path || [];
}

/**
 * 创建文件夹
 */
export async function createFolderService(data, userId) {
  const res = await createFolder(data, userId);
  return mapFolder(res);
}

/**
 * 更新文件夹
 */
export async function updateFolderService(id, data, userId) {
  const res = await updateFolder(id, data, userId);
  return mapFolder(res);
}

/**
 * 删除文件夹
 */
export async function deleteFolderService(id, userId, recursive = false) {
  await deleteFolder(id, userId, recursive);
  return true;
}

/**
 * 批量排序文件夹
 */
export async function batchSortFoldersService(items, userId) {
  await batchSortFolders(items, userId);
  return true;
}

// ==================== 文件服务 ====================

// 已移除fetchFilesService - 请使用fetchFolderChildrenService代替

/**
 * 获取文件详情
 */
export async function fetchFileInfoService(id, userId) {
  const res = await getFileInfo(id, userId);
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
export async function updateFileService(id, data, userId) {
  const res = await updateFile(id, data, userId);
  return mapFile(res);
}

/**
 * 删除文件
 */
export async function deleteFileService(id, userId) {
  await deleteFile(id, userId);
  return true;
}

/**
 * 移动文件
 */
export async function moveFileService(id, targetFolderId, userId) {
  const res = await moveFile(id, targetFolderId, userId);
  return mapFile(res);
}

/**
 * 批量移动文件
 */
export async function batchMoveFilesService(fileIds, targetFolderId, userId) {
  const res = await batchMoveFiles(fileIds, targetFolderId, userId);
  return res;
}

/**
 * 批量删除文件
 */
export async function batchDeleteFilesService(fileIds, userId) {
  const res = await batchDeleteFiles(fileIds, userId);
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
export async function fetchStatisticsService(userId) {
  const res = await getFileStatistics(userId);
  
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
export async function restoreFileService(id, userId) {
  await restoreFile(id, userId);
  return true;
}

/**
 * 永久删除文件
 */
export async function permanentDeleteFileService(id, userId) {
  await permanentDeleteFile(id, userId);
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
 */
function mapResource(dto) {
  // 公共字段
  const base = {
    id: dto.id,
    type: dto.type,
    name: dto.name,
    parentId: dto.parentId || null,
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
      folderId: dto.folderId || null,
      tags: dto.tags || [],
      description: dto.description || null,
    };
  }
}

/**
 * 获取根目录信息
 */
export async function fetchRootFolderService(userId, limit = 50) {
  const res = await getRootFolder(userId, limit);
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
 * @param {string|null} folderId
 * @param {Object} params - { userId, cursor, limit, keyword, orderBy, order }
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
      },
    },
  };
}

/**
 * 获取子文件夹列表(树节点懒加载)
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
      total: res.pagination?.total,
    },
  };
}

/**
 * 在目录中搜索
 * @param {string|null} folderId
 * @param {Object} params - { userId, keyword, cursor, limit, orderBy, order }
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
      },
    },
  };
}

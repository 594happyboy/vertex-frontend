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
  getFileList,
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
    name: dto.fileName,
    size: dto.fileSize,
    sizeFormatted: dto.fileSizeFormatted,
    mimeType: dto.fileType,
    extension: dto.fileExtension,
    folderId: dto.folderId || null,
    folderName: dto.folderName || null,
    description: dto.description || null,
    uploadTime: dto.uploadTime,
    updateTime: dto.updateTime,
    downloadCount: dto.downloadCount || 0,
    downloadUrl: dto.downloadUrl,
    previewUrl: dto.previewUrl || null,
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

/**
 * 获取文件列表
 */
export async function fetchFilesService(params) {
  const res = await getFileList(params);
  
  if (!res || !Array.isArray(res.files)) {
    return { items: [], total: 0, currentFolder: null };
  }
  
  return {
    items: res.files.map(mapFile),
    total: res.total || 0,
    currentFolder: res.currentFolder || null,
  };
}

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
 * 获取回收站文件列表
 */
export async function fetchRecycleBinService(params) {
  const res = await getRecycleBinList(params);
  
  if (!res || !Array.isArray(res.files)) {
    return { items: [], total: 0 };
  }
  
  return {
    items: res.files.map(mapFile),
    total: res.total || 0,
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

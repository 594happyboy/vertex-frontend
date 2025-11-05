import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  updateDocumentFile,
  getDocumentDownloadUrl,
  deleteDocument,
  sortDocuments,
  batchUploadDocuments,
} from '../api/document';

/**
 * 映射文档数据
 */
function mapDocument(dto) {
  return {
    id: dto.id,
    title: dto.title,
    type: dto.type || 'md', // 'md' | 'pdf' | 'txt'
    groupId: dto.groupId || null,
    sortIndex: dto.sortIndex || 0,
    fileUrl: dto.fileUrl || null,
    filePath: dto.filePath || null,
    fileSize: dto.fileSize || 0,
    fileSizeFormatted: dto.fileSizeFormatted || '0 B',
    content: dto.content || null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    metadata: dto.metadata || {},
  };
}

/**
 * 获取文档列表（游标分页）
 * @param {Object} params - { q?, groupId?, cursor?, limit?, sortBy?, order? }
 * @returns {Promise<{items: Array, pagination: Object}>}
 */
export async function fetchDocumentsService(params = {}) {
  const res = await getDocuments(params);

  if (!res || !res.items) {
    return {
      items: [],
      pagination: {
        limit: params.limit || 20,
        nextCursor: null,
        hasMore: false,
        total: 0,
      },
    };
  }

  return {
    items: res.items.map(mapDocument),
    pagination: res.pagination || {
      limit: params.limit || 20,
      nextCursor: null,
      hasMore: false,
      total: res.items.length,
    },
  };
}

/**
 * 获取文档详情
 */
export async function fetchDocumentService(id) {
  const res = await getDocument(id);
  return mapDocument(res);
}

/**
 * 创建文档
 */
export async function createDocumentService(title, file, groupId = null) {
  const res = await createDocument(title, file, groupId);
  return mapDocument(res);
}

/**
 * 更新文档元数据
 */
export async function updateDocumentService(id, data) {
  const res = await updateDocument(id, data);
  return mapDocument(res);
}

/**
 * 更新文档文件
 */
export async function updateDocumentFileService(id, file) {
  const res = await updateDocumentFile(id, file);
  return mapDocument(res);
}

/**
 * 删除文档
 */
export async function deleteDocumentService(id) {
  await deleteDocument(id);
  return true;
}

/**
 * 批量排序文档
 */
export async function sortDocumentsService(items) {
  await sortDocuments(items);
  return true;
}

/**
 * 批量上传文档
 */
export async function batchUploadDocumentsService(file, parentGroupId = null) {
  const res = await batchUploadDocuments(file, parentGroupId);
  return res;
}

/**
 * 获取文档下载URL
 */
export async function getDocumentDownloadUrlService(id) {
  const url = await getDocumentDownloadUrl(id);
  return url;
}


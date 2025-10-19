import { defineStore } from 'pinia';
import {
  getDocument,
  createDocument as apiCreateDocument,
  updateDocument as apiUpdateDocument,
  deleteDocument as apiDeleteDocument,
} from '../api/document';

export const useDocStore = defineStore('doc', {
  state: () => ({
    currentDoc: null, // 当前打开的文档
    content: '', // 编辑器内容
    mode: 'view', // 'view' | 'edit'
    saving: false,
    dirty: false, // 是否有未保存的修改
    searchKeyword: '',
    error: null,
  }),

  getters: {
    isEditing: (state) => state.mode === 'edit',
    canEdit: (state) => state.currentDoc && state.currentDoc.type === 'md',
    docTitle: (state) => state.currentDoc?.title || '未命名文档',
    docStatus: (state) => state.currentDoc?.status || 'draft',
    isPublished: (state) => state.currentDoc?.status === 'published',
  },

  actions: {
    // 打开文档
    async openDoc(id) {
      try {
        const data = await getDocument(id);
        this.currentDoc = data;
        this.content = data.contentMd || '';
        this.mode = 'view';
        this.dirty = false;
        this.error = null;
        return data;
      } catch (error) {
        this.error = error.message;
        console.error('Failed to open document:', error);
        throw error;
      }
    },

    // 创建文档
    async createDoc(title, type = 'md', groupId = null, contentMd = '') {
      try {
        const data = await apiCreateDocument({
          title,
          type,
          groupId,
          contentMd,
        });
        this.currentDoc = data;
        this.content = data.contentMd || '';
        this.mode = 'edit'; // 新建文档默认进入编辑模式
        this.dirty = false;
        return data;
      } catch (error) {
        console.error('Failed to create document:', error);
        throw error;
      }
    },

    // 创建带文件关联的文档
    async createDocWithFile(title, type, fileId, contentMd = '', groupId = null) {
      try {
        const data = await apiCreateDocument({
          title,
          type,
          groupId,
          contentMd,
          fileId, // 关联上传的文件
        });
        this.currentDoc = data;
        this.content = data.contentMd || '';
        // 如果是PDF，查看模式；如果是Markdown，编辑模式
        this.mode = type === 'pdf' ? 'view' : 'edit';
        this.dirty = false;
        return data;
      } catch (error) {
        console.error('Failed to create document with file:', error);
        throw error;
      }
    },

    // 保存文档
    async saveDoc(updates = {}) {
      if (!this.currentDoc) return;

      this.saving = true;
      try {
        const data = await apiUpdateDocument(this.currentDoc.id, {
          contentMd: this.content,
          ...updates,
        });
        this.currentDoc = data;
        this.content = data.contentMd || '';
        this.dirty = false;
        return data;
      } catch (error) {
        console.error('Failed to save document:', error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    // 更新文档内容（编辑器输入时调用）
    updateContent(newContent) {
      this.content = newContent;
      this.dirty = true;
    },

    // 切换编辑/查看模式
    setMode(mode) {
      if (mode === 'edit' && !this.canEdit) {
        console.warn('Cannot edit non-markdown documents');
        return;
      }
      this.mode = mode;
    },

    // 发布文档
    async publishDoc() {
      if (!this.currentDoc) return;
      
      try {
        const data = await apiUpdateDocument(this.currentDoc.id, {
          status: 'published',
        });
        this.currentDoc = data;
        return data;
      } catch (error) {
        console.error('Failed to publish document:', error);
        throw error;
      }
    },

    // 取消发布
    async unpublishDoc() {
      if (!this.currentDoc) return;
      
      try {
        const data = await apiUpdateDocument(this.currentDoc.id, {
          status: 'draft',
        });
        this.currentDoc = data;
        return data;
      } catch (error) {
        console.error('Failed to unpublish document:', error);
        throw error;
      }
    },

    // 删除文档
    async deleteDoc(id) {
      try {
        await apiDeleteDocument(id);
        if (this.currentDoc && this.currentDoc.id === id) {
          this.currentDoc = null;
          this.content = '';
          this.mode = 'view';
          this.dirty = false;
        }
      } catch (error) {
        console.error('Failed to delete document:', error);
        throw error;
      }
    },

    // 更新搜索关键词
    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    // 关闭当前文档
    closeDoc() {
      this.currentDoc = null;
      this.content = '';
      this.mode = 'view';
      this.dirty = false;
      this.error = null;
    },
  },
});


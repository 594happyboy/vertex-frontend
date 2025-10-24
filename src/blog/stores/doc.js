import { defineStore } from 'pinia';
import {
  getDocument,
  createDocument as apiCreateDocument,
  updateDocument as apiUpdateDocument,
  updateDocumentFile as apiUpdateDocumentFile,
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
    canEdit: (state) => state.currentDoc && (state.currentDoc.type === 'md' || state.currentDoc.type === 'txt'),
    docTitle: (state) => state.currentDoc?.title || '未命名文档',
  },

  actions: {
    // 从文件路径加载文档内容
    async loadDocumentContent(filePath) {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const url = filePath.startsWith('http') ? filePath : `${baseURL}${filePath}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('加载文档内容失败');
        }
        return await response.text();
      } catch (error) {
        console.error('Failed to load document content:', error);
        throw error;
      }
    },

    // 打开文档
    async openDoc(id) {
      try {
        const data = await getDocument(id);
        this.currentDoc = data;
        
        // 如果是MD或TXT文档，从filePath加载内容
        if ((data.type === 'md' || data.type === 'txt') && data.filePath) {
          this.content = await this.loadDocumentContent(data.filePath);
        } else {
          this.content = '';
        }
        
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

    // 创建文档（新版API，统一使用文件上传）
    async createDoc(title, file, groupId = null) {
      try {
        const data = await apiCreateDocument(title, file, groupId);
        this.currentDoc = data;
        
        // 如果是MD或TXT文档，从filePath加载内容
        if ((data.type === 'md' || data.type === 'txt') && data.filePath) {
          this.content = await this.loadDocumentContent(data.filePath);
          this.mode = 'edit'; // 新建文本文档默认进入编辑模式
        } else {
          this.content = '';
          this.mode = 'view'; // PDF文档查看模式
        }
        
        this.dirty = false;
        return data;
      } catch (error) {
        console.error('Failed to create document:', error);
        throw error;
      }
    },

    // 保存文档（新版API，将内容转为文件上传）
    async saveDoc(updates = {}) {
      if (!this.currentDoc) return;

      this.saving = true;
      try {
        // 如果是MD或TXT文档且内容有变化，需要更新文件
        if ((this.currentDoc.type === 'md' || this.currentDoc.type === 'txt') && this.dirty) {
          const fileExtension = this.currentDoc.type === 'md' ? '.md' : '.txt';
          const mimeType = this.currentDoc.type === 'md' ? 'text/markdown' : 'text/plain';
          
          // 将内容转为文件
          const blob = new Blob([this.content], { type: mimeType });
          const file = new File([blob], `${this.currentDoc.title}${fileExtension}`, { type: mimeType });
          
          // 更新文档文件
          const fileUpdateData = await apiUpdateDocumentFile(this.currentDoc.id, file);
          this.currentDoc = fileUpdateData;
        }
        
        // 如果有其他元数据更新，调用更新接口
        if (Object.keys(updates).length > 0) {
          const data = await apiUpdateDocument(this.currentDoc.id, updates);
          this.currentDoc = data;
        }
        
        this.dirty = false;
        return this.currentDoc;
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


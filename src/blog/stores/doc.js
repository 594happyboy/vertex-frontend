import { defineStore } from 'pinia';
import {
  getDocument,
  createDocument as apiCreateDocument,
  updateDocument as apiUpdateDocument,
  updateDocumentFile as apiUpdateDocumentFile,
  deleteDocument as apiDeleteDocument,
} from '../api/document';
import { getAccessToken } from '@/api/request';
import { FILE_TYPE_CONFIG, AUTO_SAVE_DEBOUNCE, SYNC_STATUS } from '../constants';

export const useDocStore = defineStore('doc', {
  state: () => ({
    currentDoc: null, // 当前打开的文档
    content: '', // 编辑器内容
    mode: 'view', // 'view' | 'edit'
    saving: false,
    dirty: false, // 是否有未保存的修改
    error: null,
    // 自动保存相关状态
    syncStatus: SYNC_STATUS.SYNCED,
    lastSavedAt: null, // 最后保存时间
    saveError: null, // 保存错误信息
    autoSaveTimer: null, // 自动保存定时器
  }),

  getters: {
    isEditing: (state) => state.mode === 'edit',
    canEdit: (state) => state.currentDoc && ['md', 'txt', 'html'].includes(state.currentDoc.type),
    docTitle: (state) => state.currentDoc?.title || '未命名文档',
    isTextDoc: (state) => state.currentDoc && ['md', 'txt', 'html'].includes(state.currentDoc.type),
  },

  actions: {
    // 从文件路径加载文档内容
    async loadDocumentContent(filePath) {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const url = filePath.startsWith('http') ? filePath : `${baseURL}${filePath}`;
        const accessToken = getAccessToken();
        const response = await fetch(url, {
          headers: accessToken ? {
            'Authorization': `Bearer ${accessToken}`,
          } : {},
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
        // 清除之前的自动保存定时器
        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer);
          this.autoSaveTimer = null;
        }
        
        const data = await getDocument(id);
        this.currentDoc = data;
        
        // 保存原始标题用于比较
        this.currentDoc._originalTitle = data.title;
        
        // 如果是文本文档，从filePath加载内容
        this.content = (['md', 'txt', 'html'].includes(data.type) && data.filePath) 
          ? await this.loadDocumentContent(data.filePath)
          : '';
        
        this.mode = 'view';
        this.dirty = false;
        this.error = null;
        this.syncStatus = SYNC_STATUS.SYNCED;
        this.saveError = null;
        this.lastSavedAt = null;
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
        // 清除之前的自动保存定时器
        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer);
          this.autoSaveTimer = null;
        }
        
        const data = await apiCreateDocument(title, file, groupId);
        this.currentDoc = data;
        
        // 保存原始标题用于比较
        this.currentDoc._originalTitle = data.title;
        
        const isTextDoc = ['md', 'txt', 'html'].includes(data.type);
        this.content = (isTextDoc && data.filePath) 
          ? await this.loadDocumentContent(data.filePath)
          : '';
        this.mode = isTextDoc ? 'edit' : 'view';
        this.dirty = false;
        this.syncStatus = SYNC_STATUS.SYNCED;
        this.saveError = null;
        this.lastSavedAt = null;
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
        // 如果是文本文档且内容有变化，需要更新文件
        if (this.isTextDoc && this.dirty) {
          const config = FILE_TYPE_CONFIG[this.currentDoc.type];
          if (!config) {
            throw new Error(`不支持的文档类型: ${this.currentDoc.type}`);
          }

          const blob = new Blob([this.content], { type: config.mime });
          const file = new File([blob], `${this.currentDoc.title}${config.ext}`, { type: config.mime });
          
          this.currentDoc = await apiUpdateDocumentFile(this.currentDoc.id, file);
        }
        
        // 如果有元数据更新
        if (Object.keys(updates).length > 0) {
          this.currentDoc = await apiUpdateDocument(this.currentDoc.id, updates);
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

    // 更新文档标题（带自动保存）
    updateTitle(newTitle) {
      if (!this.currentDoc || this.currentDoc.title === newTitle) return;
      
      this.currentDoc.title = newTitle;
      this.dirty = true;
      this.syncStatus = SYNC_STATUS.EDITING;
      this.scheduleAutoSave();
    },

    // 更新文档内容（编辑器输入时调用）
    updateContent(newContent) {
      if (this.content === newContent) return;
      
      this.content = newContent;
      this.dirty = true;
      this.syncStatus = SYNC_STATUS.EDITING;
      this.scheduleAutoSave();
    },

    // 调度自动保存（防抖）
    scheduleAutoSave() {
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
      }
      
      this.syncStatus = SYNC_STATUS.PENDING;
      
      this.autoSaveTimer = setTimeout(async () => {
        await this.performAutoSave();
      }, AUTO_SAVE_DEBOUNCE);
    },

    // 执行自动保存
    async performAutoSave() {
      if (!this.currentDoc || !this.dirty) {
        this.syncStatus = SYNC_STATUS.SYNCED;
        return;
      }
      
      this.syncStatus = SYNC_STATUS.SAVING;
      this.saving = true;
      this.saveError = null;
      
      try {
        // 检查标题是否变化
        const titleChanged = this.currentDoc.title !== this.currentDoc._originalTitle;
        const contentChanged = this.dirty;
        
        // 如果标题变了，需要更新元数据
        if (titleChanged) {
          const updatedDoc = await apiUpdateDocument(this.currentDoc.id, { 
            title: this.currentDoc.title 
          });
          this.currentDoc = { ...updatedDoc, _originalTitle: updatedDoc.title };
        }
        
        // 如果内容变了，需要更新文件
        if (contentChanged && this.isTextDoc) {
          const config = FILE_TYPE_CONFIG[this.currentDoc.type];
          if (!config) {
            throw new Error(`不支持的文档类型: ${this.currentDoc.type}`);
          }
          
          const blob = new Blob([this.content], { type: config.mime });
          const file = new File([blob], `${this.currentDoc.title}${config.ext}`, { 
            type: config.mime 
          });
          
          await apiUpdateDocumentFile(this.currentDoc.id, file);
        }
        
        // 保存成功
        this.dirty = false;
        this.syncStatus = SYNC_STATUS.SYNCED;
        this.lastSavedAt = new Date();
        
        // 更新左侧树（如果标题变了）
        if (titleChanged) {
          // 动态导入避免循环依赖
          const { useTreeStore } = await import('./tree');
          const treeStore = useTreeStore();
          await treeStore.fetchTree();
        }
        
      } catch (error) {
        console.error('Auto save failed:', error);
        this.syncStatus = SYNC_STATUS.ERROR;
        this.saveError = error.message || '保存失败';
        // 保持 dirty 状态，允许重试
      } finally {
        this.saving = false;
      }
    },

    // 手动重试保存
    async retrySave() {
      await this.performAutoSave();
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

    // 关闭当前文档
    closeDoc() {
      // 清除自动保存定时器
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
      
      this.currentDoc = null;
      this.content = '';
      this.mode = 'view';
      this.dirty = false;
      this.error = null;
      this.syncStatus = SYNC_STATUS.SYNCED;
      this.saveError = null;
      this.lastSavedAt = null;
    },
  },
});


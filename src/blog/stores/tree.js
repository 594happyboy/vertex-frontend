import { defineStore } from 'pinia';
import {
  getDirectoryTree,
  createGroup as apiCreateGroup,
  updateGroup as apiUpdateGroup,
  deleteGroup as apiDeleteGroup,
  sortGroups as apiSortGroups,
} from '../api/group';
import { sortDocuments as apiSortDocuments } from '../api/document';

export const useTreeStore = defineStore('tree', {
  state: () => ({
    tree: [], // 完整目录树（包含分组和文档）
    cached: false, // 数据是否来自缓存
    expandedKeys: [], // 展开的节点 ID
    selectedId: null, // 当前选中的节点 ID
    selectedType: null, // 'group' | 'document'
    loading: false,
    error: null,
  }),

  getters: {
    // 扁平化的所有节点列表（用于快速查找）
    flatNodes: (state) => {
      const result = [];
      const traverse = (nodes) => {
        nodes.forEach((node) => {
          result.push(node);
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };
      traverse(state.tree);
      return result;
    },

    // 根据 ID 和类型查找节点
    findNodeById: (state) => (id, type = null) => {
      const traverse = (nodes) => {
        for (const node of nodes) {
          const matchType = !type || node.nodeType?.toUpperCase() === type.toUpperCase();
          if (node.id === id && matchType) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = traverse(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return traverse(state.tree);
    },

    // 获取当前选中的节点
    selectedNode: (state) => {
      if (!state.selectedId) return null;
      const traverse = (nodes) => {
        for (const node of nodes) {
          if (node.id === state.selectedId) return node;
          if (node.children && node.children.length > 0) {
            const found = traverse(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return traverse(state.tree);
    },
  },

  actions: {
    // 加载完整目录树
    async fetchTree() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getDirectoryTree();
        // 后端返回格式：{ data: { tree: [...], cached: false } }
        const data = response.data || response;
        this.tree = data.tree || [];
        this.cached = data.cached || false;
      } catch (error) {
        this.error = error.message;
        console.error('Failed to fetch directory tree:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 创建分组
    async createGroup(name, parentId = null) {
      try {
        const data = await apiCreateGroup({ name, parentId });
        await this.fetchTree(); // 重新加载树
        return data;
      } catch (error) {
        console.error('Failed to create group:', error);
        throw error;
      }
    },

    // 更新分组
    async updateGroup(id, updates) {
      try {
        const data = await apiUpdateGroup(id, updates);
        await this.fetchTree(); // 重新加载树
        return data;
      } catch (error) {
        console.error('Failed to update group:', error);
        throw error;
      }
    },

    // 删除分组
    async deleteGroup(id) {
      try {
        await apiDeleteGroup(id);
        await this.fetchTree(); // 重新加载树
      } catch (error) {
        console.error('Failed to delete group:', error);
        throw error;
      }
    },

    // 批量更新分组排序
    async sortGroups(items) {
      try {
        await apiSortGroups(items);
        await this.fetchTree(); // 重新加载树
      } catch (error) {
        console.error('Failed to sort groups:', error);
        throw error;
      }
    },

    // 批量更新文档排序
    async sortDocuments(items) {
      try {
        await apiSortDocuments(items);
        await this.fetchTree(); // 重新加载树
      } catch (error) {
        console.error('Failed to sort documents:', error);
        throw error;
      }
    },

    // 选中节点
    selectNode(id, type) {
      this.selectedId = id;
      this.selectedType = type;
    },

    // 展开/收起节点
    toggleExpand(id) {
      const index = this.expandedKeys.indexOf(id);
      if (index > -1) {
        this.expandedKeys.splice(index, 1);
      } else {
        this.expandedKeys.push(id);
      }
    },

    // 展开节点
    expandNode(id) {
      if (!this.expandedKeys.includes(id)) {
        this.expandedKeys.push(id);
      }
    },

    // 收起节点
    collapseNode(id) {
      const index = this.expandedKeys.indexOf(id);
      if (index > -1) {
        this.expandedKeys.splice(index, 1);
      }
    },
  },
});


/**
 * 文档模块逻辑
 * 管理文档树的加载和交互
 */

import { computed } from 'vue';
import { useTreeStore } from '../../../../stores/tree';
import { useDocStore } from '../../../../stores/doc';
import { useUiStore } from '../../../../stores/ui';

export function useDocumentModule() {
  const treeStore = useTreeStore();
  const docStore = useDocStore();
  const uiStore = useUiStore();

  // 计算属性
  const tree = computed(() => treeStore.tree);
  const loading = computed(() => treeStore.loading);
  const error = computed(() => treeStore.error);
  const selectedId = computed(() => treeStore.selectedId);
  const selectedType = computed(() => treeStore.selectedType);
  const expandedKeys = computed(() => treeStore.expandedKeys);

  /**
   * 选择节点（文档或分组）
   */
  async function handleSelect(node, type) {
    treeStore.selectNode(node.id, type);
    if (type === 'document') {
      try {
        await docStore.openDoc(node.id);
      } catch (error) {
        uiStore.showError(error.message || '打开文档失败');
      }
    }
  }

  /**
   * 刷新文档树
   */
  async function refreshTree() {
    try {
      await treeStore.fetchTree();
    } catch (error) {
      // 401错误在request拦截器中已处理
      if (error.code !== 401) {
        uiStore.showError(error.message || '加载数据失败');
      }
    }
  }

  return {
    // 状态
    tree,
    loading,
    error,
    selectedId,
    selectedType,
    expandedKeys,

    // 方法
    handleSelect,
    refreshTree,
  };
}

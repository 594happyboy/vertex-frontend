/**
 * 模块状态管理
 * 维护每个模块的文档打开状态，实现模块切换时的状态保持
 */

import { reactive, toRefs } from 'vue';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';

const state = reactive({
  // 记录每个模块当前打开的文档ID
  moduleDocState: {},
});

export function useModuleState() {
  const docStore = useDocStore();
  const uiStore = useUiStore();

  /**
   * 保存当前模块的文档状态
   */
  const saveModuleDoc = (moduleId, docId = null) => {
    if (!moduleId) return;
    state.moduleDocState[moduleId] = docId ?? docStore.currentDoc?.id ?? null;
  };

  /**
   * 恢复模块的文档状态
   */
  const restoreModuleDoc = async (moduleId) => {
    if (!moduleId) return;

    const targetDocId = state.moduleDocState[moduleId];
    
    // 如果目标文档ID与当前文档ID相同，无需操作
    if (targetDocId && docStore.currentDoc?.id === targetDocId) {
      return;
    }

    // 如果有目标文档ID，尝试打开
    if (targetDocId) {
      try {
        await docStore.openDoc(targetDocId);
      } catch (error) {
        console.error(`Failed to restore doc ${targetDocId} for module ${moduleId}:`, error);
        uiStore.showError(error.message || '打开文档失败');
        // 清除无效的文档ID
        state.moduleDocState[moduleId] = null;
        docStore.closeDoc();
      }
    } else {
      // 没有目标文档，关闭当前文档
      docStore.closeDoc();
    }
  };

  /**
   * 清除模块的文档状态
   */
  const clearModuleDoc = (moduleId) => {
    if (moduleId) {
      state.moduleDocState[moduleId] = null;
    }
  };

  /**
   * 获取模块的文档ID
   */
  const getModuleDoc = (moduleId) => {
    return state.moduleDocState[moduleId] ?? null;
  };

  /**
   * 初始化模块状态（为指定模块列表创建初始状态）
   */
  const initModuleStates = (moduleIds = []) => {
    moduleIds.forEach((id) => {
      if (!(id in state.moduleDocState)) {
        state.moduleDocState[id] = null;
      }
    });
  };

  return {
    ...toRefs(state),
    saveModuleDoc,
    restoreModuleDoc,
    clearModuleDoc,
    getModuleDoc,
    initModuleStates,
  };
}

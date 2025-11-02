import { ref, computed, watch } from 'vue';
import { useDocStore } from '../../stores/doc';

/**
 * 文档标题管理 Composable
 * 
 * 提供标题编辑功能和状态同步
 * 
 * @returns {Object} { editableTitle, title, isEditing, handleInput }
 */
export function useDocumentTitle() {
  const docStore = useDocStore();
  
  // 可编辑的标题（本地状态）
  const editableTitle = ref('');

  // 文档标题（只读）
  const title = computed(() => docStore.docTitle);
  
  // 是否处于编辑模式
  const isEditing = computed(() => docStore.isEditing);

  /**
   * 监听文档标题变化，同步到本地编辑状态
   * 当切换文档或外部更新标题时，自动同步
   */
  watch(
    () => docStore.currentDoc?.title,
    (newTitle) => {
      if (newTitle) {
        editableTitle.value = newTitle;
      }
    },
    { immediate: true }
  );

  /**
   * 处理标题输入
   * 触发 store 的自动保存机制
   */
  const handleInput = () => {
    docStore.updateTitle(editableTitle.value);
  };

  return {
    editableTitle,
    title,
    isEditing,
    handleInput,
  };
}


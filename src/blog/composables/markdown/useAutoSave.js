import { computed } from 'vue';
import { useDocStore } from '../../stores/doc';
import { SYNC_STATUS, STATUS_TEXT_MAP } from '../../constants';
import { formatTimeAgo } from '../../utils/uiHelpers';

// 状态类型映射
const STATUS_TYPE_MAP = {
  [SYNC_STATUS.SAVING]: 'saving',
  [SYNC_STATUS.PENDING]: 'pending',
  [SYNC_STATUS.EDITING]: 'editing',
  [SYNC_STATUS.ERROR]: 'error',
  [SYNC_STATUS.SYNCED]: 'synced',
};

/**
 * 自动保存状态 Composable
 * 
 * 提供自动保存的状态文本、类型和时间信息
 * 
 * @returns {Object} { statusText, statusType, lastSavedText }
 */
export function useAutoSaveStatus() {
  const docStore = useDocStore();

  /**
   * 计算最后保存时间的友好显示
   */
  const lastSavedText = computed(() => {
    return docStore.lastSavedAt ? formatTimeAgo(docStore.lastSavedAt) : '';
  });

  /**
   * 当前状态文本
   */
  const currentStatusText = computed(() => {
    return STATUS_TEXT_MAP[docStore.syncStatus] || STATUS_TEXT_MAP[SYNC_STATUS.SYNCED];
  });

  /**
   * 状态文本（带时间和错误信息）
   */
  const statusText = computed(() => {
    const text = currentStatusText.value;
    const type = docStore.syncStatus;
    
    // 同步状态时显示最后保存时间
    if (type === SYNC_STATUS.SYNCED && lastSavedText.value) {
      return `${text} · ${lastSavedText.value}`;
    }
    
    // 错误状态时显示错误信息
    if (type === SYNC_STATUS.ERROR && docStore.saveError) {
      return `${text}：${docStore.saveError}`;
    }
    
    return text;
  });

  /**
   * 状态类型（用于样式）
   */
  const statusType = computed(() => {
    return STATUS_TYPE_MAP[docStore.syncStatus] || 'synced';
  });

  return {
    statusText,
    statusType,
    lastSavedText,
  };
}


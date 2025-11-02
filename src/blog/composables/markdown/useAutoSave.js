import { computed } from 'vue';
import { useDocStore } from '../../stores/doc';

// 状态映射配置
const STATUS_MAP = {
  saving: { text: '正在保存中...', type: 'saving' },
  pending: { text: '等待保存...', type: 'pending' },
  editing: { text: '正在编辑', type: 'editing' },
  error: { text: '保存失败', type: 'error' },
  synced: { text: '已同步到云端', type: 'synced' },
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
    if (!docStore.lastSavedAt) return '';
    
    const now = Date.now();
    const diff = now - docStore.lastSavedAt.getTime();
    
    if (diff < 60000) return '刚刚保存';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return docStore.lastSavedAt.toLocaleDateString();
  });

  /**
   * 当前状态配置
   */
  const currentStatus = computed(() => {
    return STATUS_MAP[docStore.syncStatus] || STATUS_MAP.synced;
  });

  /**
   * 状态文本（带时间和错误信息）
   */
  const statusText = computed(() => {
    const status = currentStatus.value;
    
    // 同步状态时显示最后保存时间
    if (status.type === 'synced' && lastSavedText.value) {
      return `${status.text} · ${lastSavedText.value}`;
    }
    
    // 错误状态时显示错误信息
    if (status.type === 'error' && docStore.saveError) {
      return `${status.text}：${docStore.saveError}`;
    }
    
    return status.text;
  });

  /**
   * 状态类型（用于样式）
   */
  const statusType = computed(() => currentStatus.value.type);

  return {
    statusText,
    statusType,
    lastSavedText,
  };
}


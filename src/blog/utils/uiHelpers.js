/**
 * UI 相关工具函数
 */

import { UI_CONSTANTS } from '../constants';

/**
 * 计算下拉菜单位置
 * @param {HTMLElement} triggerElement - 触发元素
 * @param {number} menuWidth - 菜单宽度
 * @returns {{ top: string, left: string, maxHeight: string }}
 */
export function calculateDropdownPosition(triggerElement, menuWidth) {
  if (!triggerElement) return {};

  const rect = triggerElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // 计算下方可用空间
  const spaceBelow = viewportHeight - rect.bottom - UI_CONSTANTS.DROPDOWN_SPACING;
  const maxHeight = Math.max(
    UI_CONSTANTS.DROPDOWN_MIN_HEIGHT,
    spaceBelow - UI_CONSTANTS.DROPDOWN_BOTTOM_MARGIN
  );
  
  // 检查右侧是否会超出视口
  let leftPosition = rect.left;
  if (leftPosition + menuWidth > viewportWidth - UI_CONSTANTS.DROPDOWN_BOTTOM_MARGIN) {
    leftPosition = viewportWidth - menuWidth - UI_CONSTANTS.DROPDOWN_BOTTOM_MARGIN;
  }
  
  return {
    top: `${rect.bottom + UI_CONSTANTS.DROPDOWN_SPACING}px`,
    left: `${leftPosition}px`,
    maxHeight: `${maxHeight}px`,
  };
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
export function throttle(func, wait) {
  let timeout;
  let previous = 0;
  
  return function executedFunction(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * 格式化批量上传结果
 * @param {Object} result - 上传结果
 * @returns {{ type: string, message: string }}
 */
export function formatBatchUploadResult(result) {
  const { totalFolders, successCount, failedCount, items } = result;
  
  if (failedCount === 0) {
    return {
      type: 'success',
      message: `批量导入成功！共导入 ${totalFolders} 个分组，${successCount} 个文档`,
    };
  }
  
  const failedItems = items.filter(item => !item.success);
  const displayItems = failedItems.slice(0, UI_CONSTANTS.MAX_FAILED_ITEMS_DISPLAY);
  const failedMsg = displayItems.map(item => `${item.name}: ${item.message}`).join('\n');
  const moreMsg = failedItems.length > UI_CONSTANTS.MAX_FAILED_ITEMS_DISPLAY
    ? `\n...还有${failedItems.length - UI_CONSTANTS.MAX_FAILED_ITEMS_DISPLAY}个失败`
    : '';
  
  return {
    type: 'error',
    message: `部分导入失败！成功：${successCount}，失败：${failedCount}\n${failedMsg}${moreMsg}`,
  };
}

/**
 * 计算友好的时间差
 * @param {Date} date - 时间
 * @returns {string}
 */
export function formatTimeAgo(date) {
  if (!date) return '';
  
  const now = Date.now();
  const diff = now - date.getTime();
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  
  return date.toLocaleDateString();
}


/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的大小字符串
 */
export function formatSize(bytes = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化日期时间
 * @param {string|number|Date} value - 日期值
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(value) {
  if (!value) return '-';
  
  try {
    // 处理后端返回的 "2025-10-19 09:51:04" 格式
    // 将空格替换为 T 以符合 ISO 标准
    let dateValue = value;
    if (typeof value === 'string' && value.includes(' ')) {
      dateValue = value.replace(' ', 'T');
    }
    
    const date = new Date(dateValue);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * 根据剩余天数生成提示标签
 * @param {number|null|undefined} days - 距永久删除剩余天数
 * @returns {{ label: string, tone: 'safe'|'warn'|'alert' }}
 */
export function getRecycleBadge(days) {
  if (typeof days !== 'number' || Number.isNaN(days)) {
    return { label: '保留中', tone: 'safe' };
  }

  if (days <= 0) {
    return { label: '即将清除', tone: 'alert' };
  }

  if (days <= 3) {
    return { label: `剩余 ${days} 天`, tone: 'alert' };
  }

  if (days <= 7) {
    return { label: `剩余 ${days} 天`, tone: 'warn' };
  }

  return { label: `剩余 ${days} 天`, tone: 'safe' };
}


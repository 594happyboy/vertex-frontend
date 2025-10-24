/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<void>}
 */
export async function copy(text) {
  // 优先使用现代 Clipboard API
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // 降级方案：使用 textarea + execCommand
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}


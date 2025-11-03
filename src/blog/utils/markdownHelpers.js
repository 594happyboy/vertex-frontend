/**
 * Markdown 编辑器相关工具函数
 */

/**
 * 计算文本字数（中文字符 + 英文单词）
 * @param {string} text - 文本内容
 * @returns {number} 字数
 */
export function countWords(text) {
  if (!text) return 0;
  
  // 移除Markdown语法符号后统计字数
  const cleanText = text
    .replace(/[#*`~\[\]()]/g, '') // 移除常见Markdown符号
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
    .trim();
  
  // 中文字符 + 英文单词
  const chineseCount = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = cleanText.match(/[a-zA-Z]+/g) || [];
  
  return chineseCount + englishWords.length;
}

/**
 * 计算选中文本的字数
 * @param {string} selectedText - 选中的文本
 * @returns {number} 字数
 */
export function countSelectedWords(selectedText) {
  if (!selectedText) return 0;
  
  const chineseCount = (selectedText.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = selectedText.match(/[a-zA-Z]+/g) || [];
  
  return chineseCount + englishWords.length;
}

/**
 * 在文本前后添加换行符（如果需要）
 * @param {string} text - 要插入的文本
 * @param {string} content - 完整内容
 * @param {number} start - 插入位置
 * @param {number} end - 结束位置
 * @returns {string} 处理后的文本
 */
export function ensureNewlines(text, content, start, end) {
  let result = text;
  
  // 确保前面有换行
  if (start > 0 && content[start - 1] !== '\n') {
    result = '\n' + result;
  }
  
  // 确保后面有换行
  if (end < content.length && content[end] !== '\n') {
    result = result + '\n';
  }
  
  return result;
}

/**
 * 检查当前位置是否在行首
 * @param {string} content - 完整内容
 * @param {number} position - 当前位置
 * @returns {boolean}
 */
export function isLineStart(content, position) {
  const lineStart = content.lastIndexOf('\n', position - 1) + 1;
  const lineContent = content.substring(lineStart, position);
  return lineContent.trim() === '';
}

/**
 * 获取当前行的起始位置
 * @param {string} content - 完整内容
 * @param {number} position - 当前位置
 * @returns {number}
 */
export function getLineStart(content, position) {
  return content.lastIndexOf('\n', position - 1) + 1;
}

/**
 * 获取当前行的内容
 * @param {string} content - 完整内容
 * @param {number} position - 当前位置
 * @returns {string}
 */
export function getCurrentLine(content, position) {
  const lineStart = getLineStart(content, position);
  const lineEnd = content.indexOf('\n', position);
  return content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
}

/**
 * 创建 Markdown 图片语法
 * @param {string} fileName - 文件名
 * @param {string} url - 图片URL
 * @returns {string}
 */
export function createImageMarkdown(fileName, url) {
  const imageName = fileName.replace(/\.[^/.]+$/, ''); // 移除扩展名
  return `![${imageName}](${url})`;
}

/**
 * 创建 Markdown 链接语法（带文件图标和大小）
 * @param {string} fileName - 文件名
 * @param {string} url - 文件URL
 * @param {string} icon - 文件图标
 * @param {string} fileSize - 文件大小
 * @returns {string}
 */
export function createAttachmentMarkdown(fileName, url, icon, fileSize) {
  return `${icon} [${fileName}](${url}) (${fileSize})`;
}


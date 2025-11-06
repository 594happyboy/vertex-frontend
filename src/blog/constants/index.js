/**
 * 博客模块统一常量配置
 */

// ==================== 文件类型配置 ====================
export const FILE_TYPE_CONFIG = {
  md: {
    ext: '.md',
    mime: 'text/markdown',
    defaultContent: '开始编写你的文档...',
    icon: 'mdi:file-document-outline',
    color: 'success',
  },
  txt: {
    ext: '.txt',
    mime: 'text/plain',
    defaultContent: '',
    icon: 'mdi:file-document',
    color: 'info',
  },
  html: {
    ext: '.html',
    mime: 'text/html',
    defaultContent: '',
    icon: 'mdi:file-code',
    color: 'warning',
  },
  pdf: {
    ext: '.pdf',
    mime: 'application/pdf',
    icon: 'mdi:file-pdf-box',
    color: 'danger',
  },
};

// ==================== 文件大小限制 ====================
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,   // 10MB
  ATTACHMENT: 50 * 1024 * 1024,  // 50MB
  BATCH: 100 * 1024 * 1024,  // 100MB
};

// ==================== 图片类型 ====================
export const IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.svg';

// ==================== 文档类型 ====================
export const DOCUMENT_TYPES = {
  MD: 'md',
  TXT: 'txt',
  HTML: 'html',
  PDF: 'pdf',
};

export const DOCUMENT_ACCEPT = '.md,.pdf,.txt,.html';

// ==================== 文件图标映射 ====================
export const FILE_ICON_MAP = {
  // 文档
  pdf: '📕',
  doc: '📘', docx: '📘',
  xls: '📗', xlsx: '📗',
  ppt: '📙', pptx: '📙',
  txt: '📄',
  md: '📝',
  html: '📰',
  // 压缩包
  zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
  // 音频
  mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵',
  // 视频
  mp4: '🎬', avi: '🎬', mkv: '🎬', mov: '🎬',
  // 代码
  js: '📜', ts: '📜', py: '📜', java: '📜', cpp: '📜', c: '📜',
  html: '📜', css: '📜', json: '📜',
};

export const FILE_ICON_DEFAULT = '📎';

// ==================== 自动保存配置 ====================
export const AUTO_SAVE_DEBOUNCE = 1000; // 1秒防抖

// ==================== 状态映射 ====================
export const SYNC_STATUS = {
  SYNCED: 'synced',
  EDITING: 'editing',
  PENDING: 'pending',
  SAVING: 'saving',
  ERROR: 'error',
};

export const STATUS_TEXT_MAP = {
  [SYNC_STATUS.SYNCED]: '已同步到云端',
  [SYNC_STATUS.EDITING]: '正在编辑',
  [SYNC_STATUS.PENDING]: '等待保存...',
  [SYNC_STATUS.SAVING]: '正在保存中...',
  [SYNC_STATUS.ERROR]: '保存失败',
};

// ==================== UI 常量 ====================
export const UI_CONSTANTS = {
  // 工具栏按钮尺寸
  BUTTON_WIDTH: 40,
  DIVIDER_WIDTH: 9,
  MORE_BUTTON_WIDTH: 40,
  STATS_WIDTH: 200,
  
  // 下拉菜单
  DROPDOWN_MIN_WIDTH: 120,
  MORE_MENU_MIN_WIDTH: 180,
  DROPDOWN_SPACING: 4,
  DROPDOWN_MIN_HEIGHT: 200,
  DROPDOWN_BOTTOM_MARGIN: 20,
  
  // 树节点
  MAX_INDENT_DEPTH: 3,
  MAX_FAILED_ITEMS_DISPLAY: 5,
};

// ==================== 快捷键配置 ====================
export const KEYBOARD_SHORTCUTS = {
  BOLD: { ctrl: true, shift: false, key: 'b' },
  ITALIC: { ctrl: true, shift: false, key: 'i' },
  INLINE_CODE: { ctrl: true, shift: false, key: '`' },
  CODE_BLOCK: { ctrl: true, shift: true, key: 'c' },
  LINK: { ctrl: true, shift: false, key: 'k' },
  UNORDERED_LIST: { ctrl: true, shift: true, key: '8' },
  ORDERED_LIST: { ctrl: true, shift: true, key: '7' },
  QUOTE: { ctrl: true, shift: true, key: 'q' },
  SAVE: { ctrl: true, shift: false, key: 's' },
};


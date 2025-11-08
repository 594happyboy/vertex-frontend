/**
 * 文件类型判断和处理工具
 */

// 支持在线编辑的文本文件扩展名
export const EDITABLE_TEXT_EXTENSIONS = [
  // 纯文本
  'txt', 'text', 'log', 'md', 'markdown', 'rst',
  // 数据格式
  'json', 'jsonl', 'xml', 'csv', 'tsv', 'yaml', 'yml',
  // 代码文件 - JavaScript/TypeScript
  'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx',
  // 代码文件 - Web框架
  'vue', 'svelte',
  // 代码文件 - 后端语言
  'java', 'kt', 'scala', 'groovy',
  'py', 'pyw', 'pyc',
  'go', 'mod', 'sum',
  'rb', 'rake', 'gemspec',
  'php', 'phtml',
  'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx',
  'cs', 'vb',
  'swift',
  'rs', 'toml',
  // 代码文件 - 其他
  'dart', 'lua', 'pl', 'r',
  // Web 文件
  'html', 'htm', 'xhtml',
  'css', 'scss', 'sass', 'less', 'styl',
  // 配置文件
  'properties', 'env', 'conf', 'config', 'ini', 'toml', 'cfg',
  'editorconfig', 'gitignore', 'gitattributes', 'dockerignore',
  'eslintrc', 'prettierrc', 'babelrc',
  // 构建工具
  'gradle', 'gradlew', 'maven', 'pom',
  'makefile', 'mk', 'cmake',
  'dockerfile',
  // Shell 脚本
  'sh', 'bash', 'zsh', 'fish',
  'bat', 'cmd', 'ps1', 'psm1',
  // 数据库
  'sql', 'ddl', 'dml',
  // 标记语言
  'xml', 'svg', 'rss', 'atom',
  // 其他
  'graphql', 'proto', 'thrift',
];

// 文件大小限制（2MB）
export const MAX_EDITABLE_FILE_SIZE = 2 * 1024 * 1024;

/**
 * 判断文件是否为可编辑的文本类型（不检查大小）
 * @param {Object} file - 文件对象
 * @returns {boolean}
 */
export function isEditableTextFile(file) {
  if (!file || file.type === 'folder') {
    return false;
  }

  const ext = (file.extension || '').toLowerCase();
  
  // 只检查扩展名，不检查文件大小
  // 文件大小的检查在点击编辑时进行
  return EDITABLE_TEXT_EXTENSIONS.includes(ext);
}

/**
 * 根据文件扩展名获取语言类型（用于语法高亮）
 * @param {string} extension - 文件扩展名
 * @returns {string} - highlight.js 支持的语言名称
 */
export function getFileLanguage(extension) {
  if (!extension) return 'plaintext';

  const ext = extension.toLowerCase();
  
  // 语言映射表
  const languageMap = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'vue': 'xml',
    'svelte': 'xml',
    
    // Web
    'html': 'xml',
    'htm': 'xml',
    'xhtml': 'xml',
    'xml': 'xml',
    'svg': 'xml',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'less': 'less',
    'styl': 'stylus',
    
    // 数据格式
    'json': 'json',
    'jsonl': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'csv': 'plaintext',
    'tsv': 'plaintext',
    
    // 编程语言 - JVM
    'java': 'java',
    'kt': 'kotlin',
    'scala': 'scala',
    'groovy': 'groovy',
    
    // 编程语言 - Python
    'py': 'python',
    'pyw': 'python',
    
    // 编程语言 - Go
    'go': 'go',
    'mod': 'go',
    
    // 编程语言 - Ruby
    'rb': 'ruby',
    'rake': 'ruby',
    
    // 编程语言 - PHP
    'php': 'php',
    'phtml': 'php',
    
    // 编程语言 - C/C++
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'hxx': 'cpp',
    
    // 编程语言 - .NET
    'cs': 'csharp',
    'vb': 'vbnet',
    
    // 编程语言 - 其他
    'swift': 'swift',
    'rs': 'rust',
    'dart': 'dart',
    'lua': 'lua',
    'pl': 'perl',
    'r': 'r',
    
    // Shell
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'bat': 'batch',
    'cmd': 'batch',
    'ps1': 'powershell',
    'psm1': 'powershell',
    
    // 配置文件
    'properties': 'properties',
    'env': 'properties',
    'conf': 'nginx',
    'config': 'nginx',
    'ini': 'ini',
    'toml': 'toml',
    'cfg': 'ini',
    'editorconfig': 'properties',
    'gitignore': 'plaintext',
    'gitattributes': 'plaintext',
    'dockerignore': 'plaintext',
    'eslintrc': 'json',
    'prettierrc': 'json',
    'babelrc': 'json',
    
    // 构建工具
    'gradle': 'gradle',
    'gradlew': 'bash',
    'pom': 'xml',
    'makefile': 'makefile',
    'mk': 'makefile',
    'cmake': 'cmake',
    'dockerfile': 'dockerfile',
    
    // SQL
    'sql': 'sql',
    'ddl': 'sql',
    'dml': 'sql',
    
    // Markdown
    'md': 'markdown',
    'markdown': 'markdown',
    'rst': 'rst',
    
    // 其他
    'txt': 'plaintext',
    'text': 'plaintext',
    'log': 'plaintext',
    'graphql': 'graphql',
    'proto': 'protobuf',
  };

  return languageMap[ext] || 'plaintext';
}

/**
 * 获取文件类型的显示名称
 * @param {string} extension - 文件扩展名
 * @returns {string} - 显示名称
 */
export function getFileTypeDisplayName(extension) {
  if (!extension) return '文本文件';

  const ext = extension.toLowerCase();
  
  const displayMap = {
    'txt': '文本文件',
    'json': 'JSON 文件',
    'xml': 'XML 文件',
    'html': 'HTML 文件',
    'css': 'CSS 文件',
    'js': 'JavaScript 文件',
    'ts': 'TypeScript 文件',
    'vue': 'Vue 组件',
    'java': 'Java 文件',
    'py': 'Python 文件',
    'md': 'Markdown 文件',
    'yaml': 'YAML 文件',
    'yml': 'YAML 文件',
    'sql': 'SQL 文件',
    'log': '日志文件',
  };

  return displayMap[ext] || `${ext.toUpperCase()} 文件`;
}

/**
 * 检查文件大小是否过大
 * @param {number} size - 文件大小（字节）
 * @returns {boolean}
 */
export function isFileTooLarge(size) {
  return size > MAX_EDITABLE_FILE_SIZE;
}

/**
 * 格式化文件大小警告信息
 * @param {number} size - 文件大小（字节）
 * @returns {string}
 */
export function getFileSizeWarning(size) {
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  return `文件较大 (${sizeMB}MB)，编辑可能会影响性能。建议使用本地编辑器。`;
}

/**
 * 根据文件名获取 MIME 类型
 * @param {string} fileName - 文件名（包含扩展名）
 * @returns {string} - MIME 类型
 */
export function getMimeTypeByFileName(fileName) {
  if (!fileName) return 'application/octet-stream';

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  // MIME 类型映射表
  const mimeMap = {
    // 文本文件
    'txt': 'text/plain',
    'text': 'text/plain',
    'log': 'text/plain',
    
    // Markdown
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    
    // HTML/XML
    'html': 'text/html',
    'htm': 'text/html',
    'xhtml': 'application/xhtml+xml',
    'xml': 'application/xml',
    'svg': 'image/svg+xml',
    'rss': 'application/rss+xml',
    'atom': 'application/atom+xml',
    
    // CSS
    'css': 'text/css',
    'scss': 'text/x-scss',
    'sass': 'text/x-sass',
    'less': 'text/x-less',
    
    // JavaScript/TypeScript
    'js': 'application/javascript',
    'mjs': 'application/javascript',
    'cjs': 'application/javascript',
    'jsx': 'text/jsx',
    'ts': 'text/typescript',
    'tsx': 'text/tsx',
    
    // JSON
    'json': 'application/json',
    'jsonl': 'application/jsonl',
    
    // YAML
    'yaml': 'application/yaml',
    'yml': 'application/yaml',
    
    // 数据格式
    'csv': 'text/csv',
    'tsv': 'text/tab-separated-values',
    
    // 编程语言
    'java': 'text/x-java-source',
    'kt': 'text/x-kotlin',
    'py': 'text/x-python',
    'rb': 'text/x-ruby',
    'php': 'application/x-httpd-php',
    'c': 'text/x-c',
    'cpp': 'text/x-c++',
    'cc': 'text/x-c++',
    'cxx': 'text/x-c++',
    'h': 'text/x-c',
    'hpp': 'text/x-c++',
    'cs': 'text/x-csharp',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'swift': 'text/x-swift',
    
    // Shell
    'sh': 'application/x-sh',
    'bash': 'application/x-sh',
    'zsh': 'application/x-sh',
    'bat': 'application/x-bat',
    'cmd': 'application/x-bat',
    'ps1': 'application/x-powershell',
    
    // 配置文件
    'properties': 'text/x-properties',
    'env': 'text/plain',
    'conf': 'text/plain',
    'config': 'text/plain',
    'ini': 'text/plain',
    'toml': 'application/toml',
    'cfg': 'text/plain',
    
    // SQL
    'sql': 'application/sql',
    'ddl': 'application/sql',
    'dml': 'application/sql',
    
    // 其他
    'dockerfile': 'text/x-dockerfile',
    'makefile': 'text/x-makefile',
    'vue': 'text/x-vue',
    'graphql': 'application/graphql',
    
    // PDF
    'pdf': 'application/pdf',
    
    // 图片
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // 压缩文件
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // 办公文档
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // 音频
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    
    // 视频
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
  };

  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * 根据扩展名判断是否为文本文件
 * @param {string} extension - 文件扩展名
 * @returns {boolean}
 */
export function isTextFileExtension(extension) {
  if (!extension) return false;
  const ext = extension.toLowerCase();
  return EDITABLE_TEXT_EXTENSIONS.includes(ext);
}


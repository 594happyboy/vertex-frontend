<template>
  <div class="md-editor-toolbar" ref="toolbarRef">
    <!-- 动态渲染可见按钮 -->
    <template v-for="button in visibleButtons" :key="button.id">
      <!-- 分隔线 -->
      <div v-if="button.type === 'divider'" class="toolbar-divider"></div>
      
      <!-- 功能按钮 -->
      <button
        v-else
        class="toolbar-btn"
        :title="button.title"
        :disabled="isButtonDisabled(button)"
        @click="executeButtonAction(button)"
        :ref="button.id === 'heading' ? 'headingBtnRef' : undefined"
      >
        <Icon :icon="getButtonIcon(button)" :class="{ spin: button.dynamic && uploading }" />
      </button>
    </template>
    
    <!-- 标题下拉菜单 -->
    <div 
      v-if="showHeadingMenu" 
      class="dropdown-menu" 
      ref="headingMenuRef"
      :style="dropdownStyle"
    >
      <button v-for="level in 6" :key="level" @click="insertHeading(level)" class="dropdown-item">
        <Icon icon="mdi:format-header-pound" />
        <span>标题 {{ level }}</span>
      </button>
    </div>
    
    <!-- 更多按钮 -->
    <button
      v-if="hiddenButtons.length > 0"
      class="toolbar-btn toolbar-more-btn"
      title="更多功能"
      @click="toggleMoreMenu"
      ref="moreButtonRef"
    >
      <Icon icon="mdi:chevron-down" />
    </button>
    
    <!-- 更多菜单下拉 -->
    <div 
      v-if="showMoreMenu && hiddenButtons.length > 0" 
      class="dropdown-menu more-menu" 
      ref="moreMenuRef"
      :style="dropdownStyle"
    >
      <button 
        v-for="button in hiddenButtons" 
        :key="button.id"
        @click="executeFromMoreMenu(button)" 
        class="dropdown-item"
        :disabled="isButtonDisabled(button)"
      >
        <Icon :icon="getButtonIcon(button)" />
        <span>{{ button.title.split(' (')[0] }}</span>
      </button>
    </div>

    <!-- 字数统计 -->
    <div class="toolbar-stats">
      <span class="stat-item" title="字数">
        <Icon icon="mdi:text" />
        <span class="stat-value">{{ wordCount }}</span>
      </span>
      <span v-if="selectionLength > 0" class="stat-item" title="选中字数">
        <Icon icon="mdi:selection" />
        <span class="stat-value">{{ selectionLength }}</span>
      </span>
      <span class="stat-item" title="行数">
        <Icon icon="mdi:format-line-spacing" />
        <span class="stat-value">{{ lineCount }}</span>
      </span>
    </div>
    
    <!-- 图片文件选择器 -->
    <input
      ref="imageInputRef"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
      @change="handleImageSelect"
      style="display: none;"
    />
    
    <!-- 通用附件选择器 -->
    <input
      ref="fileInputRef"
      type="file"
      @change="handleAttachmentSelect"
      style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { uploadFileService, uploadAttachmentService } from '@/file/services/fileService';
import { useUiStore } from '../../stores/ui';
import { useAuthStore } from '../../stores/auth';
import { 
  FILE_SIZE_LIMITS, 
  IMAGE_TYPES, 
  UI_CONSTANTS 
} from '../../constants';
import { 
  getFileIcon, 
  formatFileSize, 
  validateImageFile, 
  validateAttachmentFile,
  buildFileUrl
} from '../../utils/fileHelpers';
import { 
  countWords,
  createImageMarkdown,
  createAttachmentMarkdown
} from '../../utils/markdownHelpers';
import { calculateDropdownPosition, debounce } from '../../utils/uiHelpers';

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  selectionLength: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['insert-text', 'wrap-text', 'format-action']);

const uiStore = useUiStore();
const authStore = useAuthStore();

const imageInputRef = ref(null);
const fileInputRef = ref(null);
const uploading = ref(false);
const showHeadingMenu = ref(false);
const headingBtnRef = ref(null);
const headingMenuRef = ref(null);
const dropdownStyle = ref({});

// 响应式工具栏相关
const toolbarRef = ref(null);
const moreButtonRef = ref(null);
const moreMenuRef = ref(null);
const showMoreMenu = ref(false);
const visibleButtons = ref([]);
const hiddenButtons = ref([]);
const resizeObserver = ref(null);

// 按钮配置数组
const toolbarButtons = [
  // 文本格式化工具组
  { id: 'bold', icon: 'mdi:format-bold', title: '加粗 (Ctrl+B)', action: 'formatBold', group: 'format' },
  { id: 'italic', icon: 'mdi:format-italic', title: '斜体 (Ctrl+I)', action: 'formatItalic', group: 'format' },
  { id: 'strikethrough', icon: 'mdi:format-strikethrough', title: '删除线', action: 'formatStrikethrough', group: 'format' },
  { id: 'inline-code', icon: 'mdi:code-tags', title: '行内代码 (Ctrl+`)', action: 'formatInlineCode', group: 'format' },
  { id: 'code-block', icon: 'mdi:code-braces-box', title: '代码块 (Ctrl+Shift+C)', action: 'formatCodeBlock', group: 'format' },
  { id: 'divider-1', type: 'divider', group: 'format' },
  
  // 标题工具
  { id: 'heading', icon: 'mdi:format-header-pound', title: '标题', action: 'toggleHeadingMenu', group: 'heading', hasSubmenu: true },
  { id: 'divider-2', type: 'divider', group: 'heading' },
  
  // 列表工具
  { id: 'unordered-list', icon: 'mdi:format-list-bulleted', title: '无序列表 (Ctrl+Shift+8)', action: 'formatUnorderedList', group: 'list' },
  { id: 'ordered-list', icon: 'mdi:format-list-numbered', title: '有序列表 (Ctrl+Shift+7)', action: 'formatOrderedList', group: 'list' },
  { id: 'task-list', icon: 'mdi:checkbox-marked-outline', title: '任务列表', action: 'formatTaskList', group: 'list' },
  { id: 'divider-3', type: 'divider', group: 'list' },
  
  // 引用和分隔线
  { id: 'quote', icon: 'mdi:format-quote-close', title: '引用 (Ctrl+Shift+Q)', action: 'formatQuote', group: 'quote' },
  { id: 'horizontal-rule', icon: 'mdi:minus', title: '分隔线', action: 'insertHorizontalRule', group: 'quote' },
  { id: 'divider-4', type: 'divider', group: 'quote' },
  
  // 链接和媒体
  { id: 'link', icon: 'mdi:link-variant', title: '插入链接 (Ctrl+K)', action: 'insertLink', group: 'media' },
  { id: 'image', icon: 'mdi:image-plus', title: '插入图片', action: 'triggerImageUpload', group: 'media', dynamic: true },
  { id: 'file', icon: 'mdi:paperclip', title: '上传附件', action: 'triggerFileUpload', group: 'media', dynamic: true },
];

// 字数统计
const wordCount = computed(() => countWords(props.content));

const lineCount = computed(() => {
  if (!props.content) return 0;
  return props.content.split('\n').length;
});


// ==================== 格式化工具函数 ====================

// 加粗
function formatBold() {
  emit('wrap-text', '**', '**');
}

// 斜体
function formatItalic() {
  emit('wrap-text', '*', '*');
}

// 删除线
function formatStrikethrough() {
  emit('wrap-text', '~~', '~~');
}

// 行内代码
function formatInlineCode() {
  emit('wrap-text', '`', '`');
}

// 代码块
function formatCodeBlock() {
  emit('wrap-text', '```\n', '\n```', true);
}

// 切换标题菜单
function toggleHeadingMenu() {
  showHeadingMenu.value = !showHeadingMenu.value;
  
  if (showHeadingMenu.value && headingBtnRef.value) {
    dropdownStyle.value = calculateDropdownPosition(
      headingBtnRef.value, 
      UI_CONSTANTS.DROPDOWN_MIN_WIDTH
    );
  }
}

// 插入标题
function insertHeading(level) {
  const prefix = '#'.repeat(level) + ' ';
  emit('format-action', { type: 'heading', prefix });
  showHeadingMenu.value = false;
}

// 无序列表
function formatUnorderedList() {
  emit('format-action', { type: 'list', prefix: '- ' });
}

// 有序列表
function formatOrderedList() {
  emit('format-action', { type: 'list', prefix: '1. ', ordered: true });
}

// 任务列表
function formatTaskList() {
  emit('format-action', { type: 'list', prefix: '- [ ] ' });
}

// 引用
function formatQuote() {
  emit('format-action', { type: 'list', prefix: '> ' });
}

// 分隔线
function insertHorizontalRule() {
  emit('insert-text', '\n---\n');
}

// 插入链接
function insertLink() {
  emit('wrap-text', '[', '](url)', false, { moveCursor: -4 });
}

// 点击外部关闭下拉菜单
function handleClickOutside(event) {
  if (showHeadingMenu.value && 
      headingBtnRef.value && 
      headingMenuRef.value &&
      !headingBtnRef.value.contains(event.target) &&
      !headingMenuRef.value.contains(event.target)) {
    showHeadingMenu.value = false;
  }
  
  if (showMoreMenu.value && 
      moreButtonRef.value && 
      moreMenuRef.value &&
      !moreButtonRef.value.contains(event.target) &&
      !moreMenuRef.value.contains(event.target)) {
    showMoreMenu.value = false;
  }
}

// 窗口大小变化时关闭所有下拉菜单
function handleWindowResize() {
  showHeadingMenu.value = false;
  showMoreMenu.value = false;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleWindowResize);
  
  // 初始化 ResizeObserver
  if (toolbarRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      debouncedCalculate();
    });
    resizeObserver.value.observe(toolbarRef.value);
    
    // 初始计算
    nextTick(() => {
      calculateButtonVisibility();
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleWindowResize);
  
  // 清理 ResizeObserver
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
});

// 触发图片选择
function triggerImageUpload() {
  if (uploading.value) return;
  imageInputRef.value?.click();
}

// 触发附件选择
function triggerFileUpload() {
  if (uploading.value) return;
  fileInputRef.value?.click();
}

// 处理图片选择
async function handleImageSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件
  const validation = validateImageFile(file, IMAGE_TYPES, FILE_SIZE_LIMITS.IMAGE);
  if (!validation.valid) {
    uiStore.showError(validation.error);
    return;
  }

  // 开始上传
  uploading.value = true;
  uiStore.showInfo('正在上传图片...');

  try {
    const userId = authStore.user?.id;
    // 使用上传附件接口，自动存储到系统/附件文件夹
    const uploadedFile = await uploadAttachmentService(file, {
      userId,
      description: '从Markdown编辑器上传的图片',
    });

    // 构建图片URL
    const imageUrl = buildFileUrl(
      uploadedFile.downloadUrl || uploadedFile.previewUrl,
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    );
    
    if (!imageUrl) {
      throw new Error('上传成功但未获取到图片URL');
    }

    // 生成Markdown图片语法
    const markdownText = createImageMarkdown(file.name, imageUrl);

    // 通知父组件插入文本
    emit('insert-text', markdownText);

    uiStore.showSuccess('图片上传成功');
  } catch (error) {
    console.error('图片上传失败:', error);
    uiStore.showError(error.message || '图片上传失败，请重试');
  } finally {
    uploading.value = false;
    // 清空文件选择器，允许重复上传同一个文件
    event.target.value = '';
  }
}

// 处理附件选择
async function handleAttachmentSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件
  const validation = validateAttachmentFile(file, FILE_SIZE_LIMITS.ATTACHMENT);
  if (!validation.valid) {
    uiStore.showError(validation.error);
    return;
  }

  // 开始上传
  uploading.value = true;
  uiStore.showInfo('正在上传附件...');

  try {
    const userId = authStore.user?.id;
    // 使用上传附件接口，自动存储到系统/附件文件夹
    const uploadedFile = await uploadAttachmentService(file, {
      userId,
      description: '从Markdown编辑器上传的附件',
    });

    // 构建附件URL
    const fileUrl = buildFileUrl(
      uploadedFile.downloadUrl || uploadedFile.previewUrl,
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    );
    
    if (!fileUrl) {
      throw new Error('上传成功但未获取到文件URL');
    }

    // 获取文件图标和格式化大小
    const icon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);

    // 生成Markdown链接语法（带图标和文件大小）
    const markdownText = createAttachmentMarkdown(file.name, fileUrl, icon, fileSize);

    // 通知父组件插入文本
    emit('insert-text', markdownText);

    uiStore.showSuccess('附件上传成功');
  } catch (error) {
    console.error('附件上传失败:', error);
    uiStore.showError(error.message || '附件上传失败，请重试');
  } finally {
    uploading.value = false;
    // 清空文件选择器，允许重复上传同一个文件
    event.target.value = '';
  }
}

// ==================== 响应式工具栏逻辑 ====================

// 获取按钮图标（处理动态图标）
function getButtonIcon(button) {
  if (button.id === 'image' || button.id === 'file') {
    return uploading.value ? 'mdi:loading' : button.icon;
  }
  return button.icon;
}

// 获取按钮是否禁用
function isButtonDisabled(button) {
  if (button.id === 'image' || button.id === 'file') {
    return uploading.value;
  }
  return false;
}

// 执行按钮操作
function executeButtonAction(button) {
  const actions = {
    formatBold,
    formatItalic,
    formatStrikethrough,
    formatInlineCode,
    formatCodeBlock,
    toggleHeadingMenu,
    formatUnorderedList,
    formatOrderedList,
    formatTaskList,
    formatQuote,
    insertHorizontalRule,
    insertLink,
    triggerImageUpload,
    triggerFileUpload,
  };
  
  const action = actions[button.action];
  if (action) {
    action();
  }
}

// 切换更多菜单
function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value;
  
  if (showMoreMenu.value && moreButtonRef.value) {
    dropdownStyle.value = calculateDropdownPosition(
      moreButtonRef.value,
      UI_CONSTANTS.MORE_MENU_MIN_WIDTH
    );
  }
}

// 从更多菜单执行操作
function executeFromMoreMenu(button) {
  executeButtonAction(button);
  showMoreMenu.value = false;
}

// 计算按钮可见性
function calculateButtonVisibility() {
  if (!toolbarRef.value) return;
  
  const toolbarWidth = toolbarRef.value.clientWidth;
  
  // 可用宽度 = 工具栏宽度 - 字数统计宽度 - 左右padding
  const availableWidth = toolbarWidth - UI_CONSTANTS.STATS_WIDTH - 32; // 32 = padding
  
  let currentWidth = 0;
  const visible = [];
  const hidden = [];
  
  for (const button of toolbarButtons) {
    const itemWidth = button.type === 'divider' 
      ? UI_CONSTANTS.DIVIDER_WIDTH 
      : UI_CONSTANTS.BUTTON_WIDTH;
    
    // 如果有隐藏按钮，需要预留更多按钮的空间
    const requiredWidth = hidden.length > 0 
      ? currentWidth + itemWidth + UI_CONSTANTS.MORE_BUTTON_WIDTH 
      : currentWidth + itemWidth;
    
    if (requiredWidth <= availableWidth) {
      visible.push(button);
      currentWidth += itemWidth;
    } else if (button.type !== 'divider') {
      // 跳过分隔线，不放入隐藏菜单
      hidden.push(button);
    }
  }
  
  // 移除可见按钮末尾的分隔线
  while (visible.length > 0 && visible[visible.length - 1].type === 'divider') {
    visible.pop();
  }
  
  visibleButtons.value = visible;
  hiddenButtons.value = hidden;
}

const debouncedCalculate = debounce(calculateButtonVisibility, 100);
</script>

<style scoped>
.md-editor-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

@media (max-width: 768px) {
  .md-editor-toolbar {
    padding: var(--spacing-xs) var(--spacing-mobile-sm);
    gap: var(--spacing-xs);
  }
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  margin: 0 var(--spacing-2xs);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .toolbar-divider {
    display: none;
  }
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  min-width: 32px;
  min-height: 32px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-base);
  flex-shrink: 0;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.toolbar-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toolbar-btn :deep(svg) {
  font-size: 18px;
  flex-shrink: 0;
}

/* 隐藏按钮文字，只显示图标 */
.toolbar-btn span {
  display: none;
}

/* 下拉菜单 */
.dropdown-menu {
  position: fixed;
  min-width: 120px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 下拉菜单滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--font-size-sm);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.dropdown-item :deep(svg) {
  font-size: 16px;
  opacity: 0.7;
}

.dropdown-item span {
  display: inline !important;
}

/* 更多按钮 */
.toolbar-more-btn {
  flex-shrink: 0;
  margin-right: var(--spacing-xs);
}

/* 更多菜单 */
.more-menu {
  min-width: 180px;
  /* max-height 由 JavaScript 动态设置 */
}

/* 字数统计 */
.toolbar-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
  padding-left: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .toolbar-stats {
    display: none;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
}

.stat-item :deep(svg) {
  font-size: 14px;
  opacity: 0.6;
}

.stat-value {
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 20px;
  text-align: right;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>


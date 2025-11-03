<template>
  <div
    class="explorer-card"
    :class="{
      'selected': selected,
      'is-folder': item.type === 'folder',
      'is-file': item.type === 'file',
    }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- 选择复选框 -->
    <div v-if="item.type === 'file'" class="card-checkbox" @click.stop>
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('toggle-select')"
      />
    </div>

    <!-- 图标/缩略图 -->
    <div class="card-icon">
      <Icon
        v-if="item.type === 'folder'"
        icon="mdi:folder"
        :style="{ color: item.color || '#6076FF' }"
      />
      <img
        v-else-if="shouldShowThumbnail && !thumbnailError"
        :src="item.thumbnailUrl"
        :alt="item.name"
        class="thumbnail"
        @error="handleThumbnailError"
      />
      <Icon
        v-else
        :icon="getFileIcon(item)"
        class="file-icon"
      />
    </div>

    <!-- 名称 -->
    <div class="card-name" :title="item.name">
      {{ item.name }}
    </div>

    <!-- 元信息 -->
    <div class="card-meta">
      <span v-if="item.type === 'folder'" class="meta-count">
        {{ item.childFolderCount + item.childFileCount }} 项
      </span>
      <span v-else class="meta-size">
        {{ item.sizeFormatted || formatSize(item.size) }}
      </span>
    </div>

    <!-- 快捷操作 (悬浮显示) -->
    <div class="card-actions">
      <button
        v-if="item.type === 'file'"
        class="action-btn"
        title="下载"
        @click.stop="$emit('download')"
      >
        <Icon icon="mdi:download" />
      </button>
      <button
        v-if="item.type === 'file'"
        class="action-btn"
        title="详情"
        @click.stop="$emit('show-detail')"
      >
        <Icon icon="mdi:information" />
      </button>
      <button
        class="action-btn danger"
        title="删除"
        @click.stop="$emit('delete')"
      >
        <Icon icon="mdi:delete" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  /** 项目数据 */
  item: {
    type: Object,
    required: true,
  },
  /** 是否选中 */
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'toggle-select',
  'enter-folder',
  'download',
  'copy-url',
  'show-detail',
  'delete',
]);

// 缩略图错误状态
const thumbnailError = ref(false);

/**
 * 判断是否应该显示缩略图（仅图片类型）
 */
const shouldShowThumbnail = computed(() => {
  if (!props.item.thumbnailUrl) return false;
  
  const mime = props.item.mimeType?.toLowerCase() || '';
  const ext = props.item.extension?.toLowerCase() || '';
  
  // 只有图片类型才显示缩略图
  return mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
});

/**
 * 处理缩略图加载错误
 */
function handleThumbnailError() {
  thumbnailError.value = true;
}

/**
 * 获取文件图标
 */
function getFileIcon(item) {
  if (!item.mimeType && !item.extension) {
    return 'mdi:file-outline';
  }
  
  const ext = item.extension?.toLowerCase() || '';
  const mime = item.mimeType?.toLowerCase() || '';
  
  // 图片
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return 'mdi:file-image-outline';
  }
  
  // 视频
  if (mime.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
    return 'mdi:file-video-outline';
  }
  
  // 音频
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return 'mdi:file-music-outline';
  }
  
  // PDF
  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'mdi:file-pdf-box';
  }
  
  // 文档
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return 'mdi:file-document-outline';
  }
  
  // 表格
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'mdi:file-excel-outline';
  }
  
  // 演示文稿
  if (['ppt', 'pptx'].includes(ext)) {
    return 'mdi:file-powerpoint-outline';
  }
  
  // 压缩包
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'mdi:folder-zip-outline';
  }
  
  // 代码
  if (['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'php'].includes(ext)) {
    return 'mdi:file-code-outline';
  }
  
  return 'mdi:file-outline';
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 处理单击
 */
function handleClick(event) {
  if (props.item.type === 'folder') {
    // 点击文件夹直接进入
    emit('enter-folder');
  } else {
    // 点击文件切换选中状态
    emit('toggle-select');
  }
}

/**
 * 处理双击
 */
function handleDoubleClick(event) {
  if (props.item.type === 'folder') {
    emit('enter-folder');
  }
  // 文件双击不再触发详情
}

/**
 * 处理右键菜单
 */
function handleContextMenu(event) {
  // TODO: 显示右键菜单
  console.log('Context menu', props.item);
}
</script>

<style scoped>
.explorer-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
}

.explorer-card:hover {
  border-color: rgba(96, 118, 255, 0.3);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 16px rgba(96, 118, 255, 0.15);
  transform: translateY(-2px);
}

.explorer-card.selected {
  border-color: rgba(96, 118, 255, 0.6);
  background: rgba(96, 118, 255, 0.08);
}

.explorer-card.is-folder:hover {
  border-color: rgba(96, 118, 255, 0.4);
}

/* 选择复选框 */
.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.card-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 图标/缩略图 */
.card-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon :deep(svg) {
  font-size: 64px;
}

.card-icon .file-icon {
  color: rgba(96, 118, 255, 0.7);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* 名称 */
.card-name {
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: #1f256a;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* 元信息 */
.card-meta {
  font-size: 11px;
  color: rgba(96, 118, 255, 0.6);
  font-weight: 500;
}

/* 快捷操作 */
.card-actions {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 3;
}

.explorer-card:hover .card-actions {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: rgba(96, 118, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(96, 118, 255, 1);
  color: white;
  transform: scale(1.1);
}

.action-btn.danger:hover {
  background: rgba(231, 76, 60, 1);
}

.action-btn :deep(svg) {
  font-size: 18px;
}

/* 响应式 */
@media (max-width: 768px) {
  .explorer-card {
    padding: 12px 8px;
    gap: 6px;
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
  }
  
  .card-icon :deep(svg) {
    font-size: 48px;
  }
  
  .card-name {
    font-size: 12px;
  }
  
  .card-meta {
    font-size: 10px;
  }
  
  .card-actions {
    /* 移动端始终显示操作按钮 */
    opacity: 1;
    pointer-events: auto;
    bottom: 8px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
  
  .action-btn :deep(svg) {
    font-size: 16px;
  }
}
</style>


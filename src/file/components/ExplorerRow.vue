<template>
  <div
    class="explorer-row"
    :class="{
      'is-folder': item.type === 'folder',
      'is-file': item.type === 'file',
    }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- 名称列 -->
    <div class="row-name">
      <Icon
        v-if="item.type === 'folder'"
        icon="mdi:folder"
        :style="{ color: item.color || '#6076FF' }"
        class="row-icon"
      />
      <Icon
        v-else
        :icon="getFileIcon(item)"
        class="row-icon file-icon"
      />
      <span class="name-text" :title="item.name">{{ item.name }}</span>
    </div>

    <!-- 大小列 -->
    <div class="row-size">
      <span v-if="item.type === 'folder'">—</span>
      <span v-else>{{ item.sizeFormatted || formatSize(item.size) }}</span>
    </div>

    <!-- 类型列 -->
    <div class="row-type">
      <span v-if="item.type === 'folder'">文件夹</span>
      <span v-else>{{ item.extension || getTypeName(item.mimeType) }}</span>
    </div>

    <!-- 修改时间列 -->
    <div class="row-date">
      {{ formatDate(item.updatedAt) }}
    </div>

    <!-- 操作列 -->
    <div class="row-actions">
      <button
        v-if="item.type === 'file' && isEditableTextFile(item)"
        class="action-btn"
        title="编辑"
        @click.stop="$emit('edit')"
      >
        <Icon icon="mdi:file-edit-outline" />
      </button>
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
import { Icon } from '@iconify/vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { isEditableTextFile } from '../utils/fileTypes';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const props = defineProps({
  /** 项目数据 */
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  'enter-folder',
  'edit',
  'download',
  'copy-url',
  'show-detail',
  'delete',
]);

/**
 * 获取文件图标
 */
function getFileIcon(item) {
  if (!item.mimeType && !item.extension) {
    return 'mdi:file-outline';
  }
  
  const ext = item.extension?.toLowerCase() || '';
  const mime = item.mimeType?.toLowerCase() || '';
  
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return 'mdi:file-image-outline';
  }
  if (mime.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
    return 'mdi:file-video-outline';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return 'mdi:file-music-outline';
  }
  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'mdi:file-pdf-box';
  }
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return 'mdi:file-document-outline';
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'mdi:file-excel-outline';
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return 'mdi:file-powerpoint-outline';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'mdi:folder-zip-outline';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'php'].includes(ext)) {
    return 'mdi:file-code-outline';
  }
  
  return 'mdi:file-outline';
}

/**
 * 获取类型名称
 */
function getTypeName(mimeType) {
  if (!mimeType) return '文件';
  
  const type = mimeType.split('/')[0];
  const typeMap = {
    'image': '图片',
    'video': '视频',
    'audio': '音频',
    'text': '文本',
    'application': '应用',
  };
  
  return typeMap[type] || '文件';
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
 * 格式化日期
 */
function formatDate(date) {
  if (!date) return '—';
  
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = now.diff(target, 'day');
  
  if (diffDays === 0) {
    return target.format('HH:mm');
  } else if (diffDays < 7) {
    return target.fromNow();
  } else if (diffDays < 365) {
    return target.format('MM-DD HH:mm');
  } else {
    return target.format('YYYY-MM-DD');
  }
}

/**
 * 处理单击
 */
function handleClick(event) {
  if (props.item.type === 'folder') {
    // 点击文件夹直接进入
    emit('enter-folder');
  }
  // 点击文件不再触发详情
}

/**
 * 处理双击
 */
function handleDoubleClick(event) {
  if (props.item.type === 'folder') {
    emit('enter-folder');
  }
  // 双击文件不再触发详情
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
.explorer-row {
  display: grid;
  grid-template-columns: 1fr 100px 100px 160px 120px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.explorer-row:hover {
  background: rgba(96, 118, 255, 0.05);
}

.explorer-row:last-child {
  border-bottom: none;
}

/* 名称列 */
.row-name {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.row-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.row-icon.file-icon {
  color: rgba(96, 118, 255, 0.7);
}

.name-text {
  font-size: 14px;
  font-weight: 500;
  color: #1f256a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 大小列 */
.row-size {
  font-size: 13px;
  color: rgba(96, 118, 255, 0.7);
  font-weight: 500;
  text-align: right;
}

/* 类型列 */
.row-type {
  font-size: 13px;
  color: rgba(96, 118, 255, 0.6);
  text-transform: uppercase;
}

/* 日期列 */
.row-date {
  font-size: 13px;
  color: rgba(96, 118, 255, 0.6);
}

/* 操作列 */
.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.explorer-row:hover .row-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(96, 118, 255, 0.1);
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
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .explorer-row {
    grid-template-columns: 1fr 80px 80px 140px 100px;
    gap: 10px;
    padding: 10px 12px;
  }
  
  .row-name {
    gap: 10px;
  }
  
  .row-icon {
    font-size: 22px;
  }
  
  .name-text {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .explorer-row {
    grid-template-columns: 1fr 60px 80px;
    gap: 8px;
    padding: 10px 12px;
  }
  
  .row-type,
  .row-actions {
    display: none;
  }
  
  .row-name {
    gap: 8px;
  }
  
  .row-icon {
    font-size: 20px;
  }
  
  .name-text {
    font-size: 13px;
  }
  
  .row-size,
  .row-date {
    font-size: 11px;
  }
}
</style>


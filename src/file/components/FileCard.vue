<template>
  <div 
    class="file-card"
    :class="{ selected: isSelected, dragging: isDragging }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu.prevent="handleContextMenu"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- 选择框 -->
    <div class="select-checkbox" @click.stop="handleToggleSelect">
      <input type="checkbox" :checked="isSelected" readonly />
    </div>

    <!-- 文件图标/预览 -->
    <div class="file-preview">
      <Icon :icon="fileIcon" class="file-icon" :style="{ color: iconColor }" />
      <div v-if="file.extension" class="file-extension">{{ file.extension }}</div>
    </div>

    <!-- 文件信息 -->
    <div class="file-info">
      <h4 class="file-name" :title="file.name">{{ file.name }}</h4>
      <div class="file-meta">
        <span class="file-size">{{ file.sizeFormatted }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="file-actions">
      <button class="action-btn" @click.stop="handleDownload" title="下载">
        <Icon icon="mdi:download" />
      </button>
      <button class="action-btn" @click.stop="handleCopyUrl" title="复制链接">
        <Icon icon="mdi:link" />
      </button>
      <button class="action-btn" @click.stop="handleShowDetail" title="查看详情">
        <Icon icon="mdi:information" />
      </button>
      <button class="action-btn danger" @click.stop="handleDelete" title="删除">
        <Icon icon="mdi:delete" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'click',
  'double-click',
  'toggle-select',
  'download',
  'copy-url',
  'show-detail',
  'delete',
  'context-menu',
  'drag-start',
  'drag-end',
]);

const isDragging = ref(false);

// 根据文件类型获取图标和颜色
const fileIcon = computed(() => {
  const ext = props.file.extension?.toLowerCase() || '';
  const mimeType = props.file.mimeType?.toLowerCase() || '';
  
  // 图片
  if (mimeType.startsWith('image/')) {
    return 'mdi:file-image';
  }
  
  // 文档
  if (['pdf'].includes(ext)) return 'mdi:file-pdf-box';
  if (['doc', 'docx'].includes(ext)) return 'mdi:file-word';
  if (['xls', 'xlsx'].includes(ext)) return 'mdi:file-excel';
  if (['ppt', 'pptx'].includes(ext)) return 'mdi:file-powerpoint';
  if (['txt', 'md'].includes(ext)) return 'mdi:file-document';
  
  // 压缩包
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'mdi:folder-zip';
  
  // 视频
  if (mimeType.startsWith('video/')) return 'mdi:file-video';
  
  // 音频
  if (mimeType.startsWith('audio/')) return 'mdi:file-music';
  
  // 代码
  if (['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'cpp', 'c', 'go'].includes(ext)) {
    return 'mdi:file-code';
  }
  
  return 'mdi:file';
});

const iconColor = computed(() => {
  const ext = props.file.extension?.toLowerCase() || '';
  const mimeType = props.file.mimeType?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/')) return '#e91e63';
  if (['pdf'].includes(ext)) return '#f44336';
  if (['doc', 'docx'].includes(ext)) return '#2196f3';
  if (['xls', 'xlsx'].includes(ext)) return '#4caf50';
  if (['ppt', 'pptx'].includes(ext)) return '#ff9800';
  if (['zip', 'rar', '7z'].includes(ext)) return '#9c27b0';
  if (mimeType.startsWith('video/')) return '#ff5722';
  if (mimeType.startsWith('audio/')) return '#00bcd4';
  if (['js', 'ts', 'vue'].includes(ext)) return '#ffc107';
  
  return '#6076ff';
});

function handleClick(event) {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
    emit('click', props.file.id);
  }
}

function handleDoubleClick() {
  emit('double-click', props.file.id);
}

function handleToggleSelect() {
  emit('toggle-select', props.file.id);
}

function handleDownload() {
  emit('download', props.file.id);
}

function handleCopyUrl() {
  emit('copy-url', props.file.id);
}

function handleShowDetail() {
  emit('show-detail', props.file.id);
}

function handleDelete() {
  emit('delete', props.file.id);
}

function handleContextMenu(event) {
  emit('context-menu', {
    file: props.file,
    x: event.clientX,
    y: event.clientY,
  });
}

function handleDragStart(event) {
  isDragging.value = true;
  
  // 如果当前文件未被选中，清除其他选择并只选中当前文件
  if (!props.isSelected) {
    emit('toggle-select', props.file.id);
  }
  
  // 设置拖拽数据
  const selectedIds = props.isSelected ? 'multiple' : [props.file.id];
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('file-ids', JSON.stringify(
    selectedIds === 'multiple' ? selectedIds : [props.file.id]
  ));
  
  emit('drag-start', props.file.id);
}

function handleDragEnd() {
  isDragging.value = false;
  emit('drag-end', props.file.id);
}
</script>

<style scoped>
.file-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 210, 255, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.file-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(96, 118, 255, 0.5);
  box-shadow: 0 8px 20px -12px rgba(96, 118, 255, 0.3);
  transform: translateY(-2px);
}

.file-card.selected {
  background: rgba(96, 118, 255, 0.1);
  border-color: rgba(96, 118, 255, 0.6);
}

.file-card.dragging {
  opacity: 0.5;
}

.select-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.select-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6076ff;
}

.file-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(96, 118, 255, 0.05);
}

.file-icon {
  font-size: 64px;
  opacity: 0.9;
}

.file-extension {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid rgba(200, 210, 255, 0.4);
}

.file-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

.file-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f256a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: rgba(47, 59, 128, 0.6);
}

.file-size {
  font-variant-numeric: tabular-nums;
}

.file-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-card:hover .file-actions {
  opacity: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: rgba(96, 118, 255, 0.1);
  color: #1f256a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(96, 118, 255, 0.2);
  transform: scale(1.05);
}

.action-btn.danger {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.action-btn.danger:hover {
  background: rgba(231, 76, 60, 0.2);
}

.action-btn :deep(svg) {
  font-size: 18px;
}
</style>


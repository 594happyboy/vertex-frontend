<template>
  <aside class="file-detail-panel" :class="{ visible: show }">
    <div class="panel-header">
      <h3>文件详情</h3>
      <button class="btn-close" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>
    </div>

    <div v-if="file" class="panel-content">
      <!-- 文件预览 -->
      <div class="file-preview-large">
        <Icon :icon="fileIcon" class="preview-icon" :style="{ color: iconColor }" />
      </div>

      <!-- 文件名 -->
      <div class="detail-section">
        <label class="detail-label">文件名</label>
        <input 
          v-if="isEditing"
          v-model="editData.fileName"
          type="text"
          class="detail-input"
          @blur="handleSave"
          @keyup.enter="handleSave"
          @keyup.esc="handleCancelEdit"
        />
        <div v-else class="detail-value editable" @click="startEdit">
          {{ file.name }}
          <Icon icon="mdi:pencil" class="edit-icon" />
        </div>
      </div>

      <!-- 文件信息 -->
      <div class="detail-section">
        <label class="detail-label">文件大小</label>
        <div class="detail-value">{{ file.sizeFormatted }}</div>
      </div>

      <div class="detail-section">
        <label class="detail-label">文件类型</label>
        <div class="detail-value">
          {{ file.mimeType || '未知' }}
          <span v-if="file.extension" class="extension-badge">{{ file.extension }}</span>
        </div>
      </div>

      <div class="detail-section">
        <label class="detail-label">上传时间</label>
        <div class="detail-value">{{ formatDateTime(file.createdAt) }}</div>
      </div>

      <div class="detail-section">
        <label class="detail-label">更新时间</label>
        <div class="detail-value">{{ formatDateTime(file.updatedAt) }}</div>
      </div>

      <div class="detail-section">
        <label class="detail-label">下载次数</label>
        <div class="detail-value">{{ file.metadata?.downloadCount || 0 }} 次</div>
      </div>

      <div v-if="file.owner" class="detail-section">
        <label class="detail-label">所有者</label>
        <div class="detail-value">
          <div class="owner-info">
            <div v-if="file.owner.avatar" class="owner-avatar">
              <img :src="file.owner.avatar" :alt="file.owner.name" />
            </div>
            <div v-else class="owner-avatar-placeholder">
              <Icon icon="mdi:account" />
            </div>
            <span>{{ file.owner.name }}</span>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <div class="detail-section">
        <label class="detail-label">描述</label>
        <textarea
          v-model="editData.description"
          class="detail-textarea"
          placeholder="添加文件描述..."
          @blur="handleSave"
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="detail-actions">
        <button class="detail-btn primary" @click="handleDownload">
          <Icon icon="mdi:download" />
          下载文件
        </button>
        <button 
          v-if="isEditableTextFile(file)" 
          class="detail-btn" 
          @click="handleEdit"
        >
          <Icon icon="mdi:file-edit-outline" />
          编辑文件
        </button>
        <button class="detail-btn" @click="handleCopyUrl">
          <Icon icon="mdi:link" />
          复制链接
        </button>
        <button class="detail-btn" @click="handleMove">
          <Icon icon="mdi:folder-move" />
          移动到...
        </button>
        <button class="detail-btn danger" @click="handleDelete">
          <Icon icon="mdi:delete" />
          删除文件
        </button>
      </div>
    </div>

    <div v-else class="panel-empty">
      <Icon icon="mdi:file-question-outline" class="empty-icon" />
      <p>请选择一个文件查看详情</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { isEditableTextFile } from '../utils/fileTypes';

const props = defineProps({
  file: {
    type: Object,
    default: null,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'close',
  'update',
  'edit',
  'download',
  'copy-url',
  'move',
  'delete',
]);

const isEditing = ref(false);
const editData = ref({
  fileName: '',
  description: '',
});

// 监听文件变化，重置编辑数据
watch(() => props.file, (file) => {
  if (file) {
    editData.value = {
      fileName: file.name,
      description: file.description || '',
    };
  }
  isEditing.value = false;
}, { immediate: true });

// 文件图标
const fileIcon = computed(() => {
  if (!props.file) return 'mdi:file';
  
  const ext = props.file.extension?.toLowerCase() || '';
  const mimeType = props.file.mimeType?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/')) return 'mdi:file-image';
  if (['pdf'].includes(ext)) return 'mdi:file-pdf-box';
  if (['doc', 'docx'].includes(ext)) return 'mdi:file-word';
  if (['xls', 'xlsx'].includes(ext)) return 'mdi:file-excel';
  if (['ppt', 'pptx'].includes(ext)) return 'mdi:file-powerpoint';
  if (['zip', 'rar', '7z'].includes(ext)) return 'mdi:folder-zip';
  if (mimeType.startsWith('video/')) return 'mdi:file-video';
  if (mimeType.startsWith('audio/')) return 'mdi:file-music';
  
  return 'mdi:file';
});

const iconColor = computed(() => {
  if (!props.file) return '#6076ff';
  
  const ext = props.file.extension?.toLowerCase() || '';
  const mimeType = props.file.mimeType?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/')) return '#e91e63';
  if (['pdf'].includes(ext)) return '#f44336';
  if (['doc', 'docx'].includes(ext)) return '#2196f3';
  if (['xls', 'xlsx'].includes(ext)) return '#4caf50';
  if (['zip', 'rar', '7z'].includes(ext)) return '#9c27b0';
  
  return '#6076ff';
});

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function startEdit() {
  isEditing.value = true;
}

function handleCancelEdit() {
  isEditing.value = false;
  if (props.file) {
    editData.value.fileName = props.file.name;
  }
}

function handleSave() {
  if (!props.file) return;
  
  const updates = {};
  if (editData.value.fileName !== props.file.name) {
    updates.fileName = editData.value.fileName;
  }
  if (editData.value.description !== (props.file.description || '')) {
    updates.description = editData.value.description;
  }
  
  if (Object.keys(updates).length > 0) {
    emit('update', { id: props.file.id, data: updates });
  }
  
  isEditing.value = false;
}

function handleDownload() {
  emit('download', props.file.id);
}

function handleEdit() {
  emit('edit', props.file.id);
}

function handleCopyUrl() {
  emit('copy-url', props.file.id);
}

function handleMove() {
  emit('move', props.file.id);
}

function handleDelete() {
  emit('delete', props.file.id);
}
</script>

<style scoped>
.file-detail-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(200, 210, 255, 0.3);
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-detail-panel.visible {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.3);
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f256a;
}

.btn-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(96, 118, 255, 0.1);
  color: #1f256a;
}

.btn-close :deep(svg) {
  font-size: 20px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: rgba(47, 59, 128, 0.5);
}

.empty-icon {
  font-size: 64px;
  color: rgba(96, 118, 255, 0.3);
}

.panel-empty p {
  margin: 0;
  font-size: 14px;
}

.file-preview-large {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  border-radius: 12px;
  background: rgba(96, 118, 255, 0.08);
}

.preview-icon {
  font-size: 96px;
  opacity: 0.9;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(47, 59, 128, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #1f256a;
  line-height: 1.5;
}

.detail-value.editable {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-value.editable:hover {
  background: rgba(96, 118, 255, 0.08);
}

.edit-icon {
  font-size: 14px;
  color: rgba(96, 118, 255, 0.6);
}

.detail-input,
.detail-textarea {
  padding: 10px 12px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.detail-input:focus,
.detail-textarea:focus {
  outline: none;
  border-color: rgba(96, 118, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(96, 118, 255, 0.1);
}

.detail-textarea {
  min-height: 100px;
  resize: vertical;
}

.extension-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  margin-left: 8px;
  border-radius: 6px;
  background: rgba(96, 118, 255, 0.12);
  color: #3a54f5;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.owner-avatar,
.owner-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.owner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.owner-avatar-placeholder {
  background: rgba(96, 118, 255, 0.15);
  color: rgba(96, 118, 255, 0.7);
}

.owner-avatar-placeholder :deep(svg) {
  font-size: 18px;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  border-color: rgba(96, 118, 255, 0.7);
  background: rgba(96, 118, 255, 0.08);
}

.detail-btn.primary {
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.18), rgba(33, 181, 255, 0.14));
  border-color: rgba(96, 118, 255, 0.35);
  font-weight: 600;
}

.detail-btn.primary:hover {
  border-color: rgba(96, 118, 255, 0.6);
  box-shadow: 0 8px 16px -10px rgba(96, 118, 255, 0.4);
}

.detail-btn.danger {
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.detail-btn.danger:hover {
  background: rgba(231, 76, 60, 0.08);
  border-color: rgba(231, 76, 60, 0.5);
}

.detail-btn :deep(svg) {
  font-size: 18px;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}
</style>


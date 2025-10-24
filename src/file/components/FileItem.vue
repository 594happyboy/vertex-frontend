<template>
  <div class="file-item">
    <div class="file-item__header">
      <div class="file-avatar">
        <span class="file-avatar__glow"></span>
        <Icon :icon="fileIcon" class="file-icon" />
      </div>
      <div class="file-info">
        <div class="file-name" :title="item.name">{{ item.name }}</div>
        <div class="file-meta">
          <span>{{ formatSize(item.size) }}</span>
          <span class="dot"></span>
          <span>{{ item.extension }}</span>
          <span class="dot"></span>
          <span>{{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="file-item__actions">
      <button class="btn-action" @click="$emit('copy-url')" title="复制下载链接">
        <Icon icon="mdi:link-variant" />
        <span>复制链接</span>
      </button>
      <button class="btn-danger" @click="handleDelete" title="删除文件">
        <Icon icon="mdi:delete-outline" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { formatSize, formatDate } from '@/utils/formatters';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['remove', 'copy-url']);

// 根据文件扩展名选择图标
const fileIcon = computed(() => {
  const ext = props.item.extension?.toLowerCase() || '';
  
  // 图片
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return 'mdi:file-image-outline';
  }
  // 视频
  if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'].includes(ext)) {
    return 'mdi:file-video-outline';
  }
  // 音频
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
    return 'mdi:file-music-outline';
  }
  // 文档
  if (ext === 'pdf') return 'mdi:file-pdf-box';
  if (['doc', 'docx'].includes(ext)) return 'mdi:file-word-outline';
  if (['xls', 'xlsx'].includes(ext)) return 'mdi:file-excel-outline';
  if (['ppt', 'pptx'].includes(ext)) return 'mdi:file-powerpoint-outline';
  if (['md', 'txt'].includes(ext)) return 'mdi:file-document-outline';
  // 压缩包
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'mdi:folder-zip-outline';
  }
  
  return 'mdi:file-outline';
});

function handleDelete() {
  if (confirm(`确定要删除文件 "${props.item.name}" 吗？`)) {
    emit('remove');
  }
}
</script>

<style scoped>
.file-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(225, 233, 255, 0.75);
  box-shadow: 0 12px 24px -18px rgba(30, 46, 110, 0.35);
  transition: transform 0.23s ease, box-shadow 0.23s ease, border-color 0.23s ease;
}

.file-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px -22px rgba(40, 66, 165, 0.5);
  border-color: rgba(120, 142, 255, 0.6);
}

.file-item__header {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.file-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(95, 118, 255, 0.15);
  color: #3c4ab2;
}

.file-icon {
  font-size: 22px;
}

.file-info {
  overflow: hidden;
  flex: 1;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1f4d;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(26, 32, 92, 0.6);
  font-size: 11px;
  margin-top: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(36, 44, 122, 0.28);
}

.file-item__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.file-item:hover .file-item__actions {
  opacity: 1;
  transform: translateY(0);
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(196, 206, 255, 0.75);
  background: rgba(255, 255, 255, 0.9);
  color: #26306e;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action :deep(svg) {
  font-size: 16px;
}

.btn-action:hover {
  border-color: rgba(76, 108, 255, 0.55);
  color: #192661;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(255, 108, 108, 0.45);
  background: rgba(255, 85, 85, 0.1);
  color: #d03f3f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger :deep(svg) {
  font-size: 16px;
}

.btn-danger:hover {
  background: #e5484d;
  color: #fff;
  border-color: #e5484d;
}
</style>


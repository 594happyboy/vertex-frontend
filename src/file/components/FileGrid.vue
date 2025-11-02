<template>
  <div class="file-grid-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-ring">
        <Icon icon="mdi:loading" class="loading-icon" />
      </div>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!hasFiles" class="empty-state">
      <div class="empty-illustration">
        <Icon icon="mdi:folder-open-outline" class="empty-icon" />
      </div>
      <div class="empty-text">
        <strong>此文件夹为空</strong>
        <p>上传文件或将文件拖拽到此处</p>
      </div>
    </div>

    <!-- 文件网格 -->
    <div v-else class="file-grid">
      <transition-group name="grid-item" tag="div" class="file-grid-inner">
        <FileCard
          v-for="file in files"
          :key="file.id"
          :file="file"
          :is-selected="isSelected(file.id)"
          @toggle-select="handleToggleSelect"
          @download="handleDownload"
          @copy-url="handleCopyUrl"
          @show-detail="handleShowDetail"
          @delete="handleDelete"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import FileCard from './FileCard.vue';

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  selectedFiles: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'toggle-select',
  'download',
  'copy-url',
  'show-detail',
  'delete',
  'drag-start',
  'drag-end',
]);

const hasFiles = computed(() => props.files.length > 0);

function isSelected(fileId) {
  return props.selectedFiles.includes(fileId);
}

function handleToggleSelect(fileId) {
  emit('toggle-select', fileId);
}

function handleDownload(fileId) {
  emit('download', fileId);
}

function handleCopyUrl(fileId) {
  emit('copy-url', fileId);
}

function handleShowDetail(fileId) {
  emit('show-detail', fileId);
}

function handleDelete(fileId) {
  emit('delete', fileId);
}

function handleDragStart(fileId) {
  emit('drag-start', fileId);
}

function handleDragEnd(fileId) {
  emit('drag-end', fileId);
}
</script>

<style scoped>
.file-grid-container {
  height: 100%;
  overflow: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 64px 32px;
  color: rgba(43, 49, 96, 0.65);
  border-radius: 20px;
  border: 1px dashed rgba(150, 162, 218, 0.5);
  background: rgba(255, 255, 255, 0.82);
}

.loading-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(91, 117, 245, 0.08), rgba(28, 185, 255, 0.08));
  border: 1px solid rgba(102, 126, 255, 0.25);
}

.loading-icon {
  font-size: 32px;
  color: rgba(96, 118, 255, 0.8);
  animation: spin 1s linear infinite;
}

.empty-illustration {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(115, 139, 255, 0.11), rgba(185, 218, 255, 0.08));
  border: 1px solid rgba(130, 158, 255, 0.15);
}

.empty-icon {
  font-size: 52px;
  color: rgba(96, 118, 255, 0.42);
}

.empty-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-text strong {
  font-size: 16px;
  font-weight: 600;
  color: #1f2664;
}

.empty-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(31, 38, 98, 0.55);
}

.file-grid {
  width: 100%;
}

.file-grid-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .file-grid-inner {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}

/* 网格项动画 */
.grid-item-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.grid-item-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.grid-item-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.grid-item-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.grid-item-move {
  transition: transform 0.4s ease;
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


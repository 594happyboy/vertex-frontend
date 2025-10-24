<template>
  <div class="recycle-bin-container">
    <div class="recycle-header">
      <div class="header-content">
        <h2 class="header-title">
          <Icon icon="mdi:delete-clock-outline" />
          <span>回收站</span>
        </h2>
        <p class="header-subtitle">文件将在30天后永久删除</p>
      </div>
      <button class="btn-refresh" @click="$emit('refresh')">
        <Icon icon="mdi:refresh" />
        刷新
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <!-- 加载状态 -->
      <div v-if="loading" key="loading" class="list-status">
        <div class="loading-ring">
          <Icon icon="mdi:loading" class="loading-icon" />
        </div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!hasFiles" key="empty" class="list-status empty">
        <div class="empty-illustration">
          <Icon icon="mdi:delete-empty-outline" class="empty-icon" />
        </div>
        <div class="empty-text">
          <strong>回收站为空</strong>
          <p>删除的文件会在这里保留30天</p>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-else key="list" class="recycle-list">
        <transition-group name="list-item" tag="div" class="file-items">
          <div
            v-for="file in items"
            :key="file.id"
            class="recycle-file-item"
          >
            <!-- 文件图标 -->
            <div class="file-icon">
              <Icon :icon="getFileIcon(file)" :style="{ color: getFileIconColor(file) }" />
            </div>

            <!-- 文件信息 -->
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ file.sizeFormatted }}</span>
                <span class="file-delete-time">
                  删除于 {{ formatDateTime(file.deletedAt) }}
                </span>
                <span v-if="file.daysUntilPermanentDeletion" class="file-expiry">
                  {{ file.daysUntilPermanentDeletion }} 天后永久删除
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="file-actions">
              <button class="action-btn restore" @click="$emit('restore', file.id)">
                <Icon icon="mdi:restore" />
                恢复
              </button>
              <button class="action-btn delete" @click="handlePermanentDelete(file)">
                <Icon icon="mdi:delete-forever" />
                永久删除
              </button>
            </div>
          </div>
        </transition-group>
      </div>
    </transition>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="page === 1"
        @click="$emit('page-change', page - 1)"
      >
        <Icon icon="mdi:chevron-left" />
        上一页
      </button>

      <div class="page-indicator">
        <span class="page-index">第 {{ page }}</span>
        <span class="page-divider">/</span>
        <span class="page-total">{{ totalPages }}</span>
      </div>

      <button
        class="page-btn"
        :disabled="page === totalPages"
        @click="$emit('page-change', page + 1)"
      >
        下一页
        <Icon icon="mdi:chevron-right" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  page: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['refresh', 'restore', 'remove', 'page-change']);

const hasFiles = computed(() => props.items.length > 0);

function getFileIcon(file) {
  const ext = file.extension?.toLowerCase() || '';
  const mimeType = file.mimeType?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/')) return 'mdi:file-image';
  if (['pdf'].includes(ext)) return 'mdi:file-pdf-box';
  if (['doc', 'docx'].includes(ext)) return 'mdi:file-word';
  if (['xls', 'xlsx'].includes(ext)) return 'mdi:file-excel';
  if (['zip', 'rar', '7z'].includes(ext)) return 'mdi:folder-zip';
  
  return 'mdi:file';
}

function getFileIconColor(file) {
  const ext = file.extension?.toLowerCase() || '';
  const mimeType = file.mimeType?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/')) return '#e91e63';
  if (['pdf'].includes(ext)) return '#f44336';
  if (['doc', 'docx'].includes(ext)) return '#2196f3';
  if (['xls', 'xlsx'].includes(ext)) return '#4caf50';
  if (['zip', 'rar', '7z'].includes(ext)) return '#9c27b0';
  
  return '#6076ff';
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  
  return date.toLocaleDateString('zh-CN');
}

function handlePermanentDelete(file) {
  if (confirm(`确定要永久删除 "${file.name}" 吗？此操作不可恢复！`)) {
    emit('remove', file.id);
  }
}
</script>

<style scoped>
.recycle-bin-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 36px;
  min-height: 100%;
}

.recycle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.25);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f256a;
}

.header-title :deep(svg) {
  font-size: 32px;
  color: rgba(231, 76, 60, 0.8);
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(47, 59, 128, 0.7);
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover {
  background: rgba(96, 118, 255, 0.08);
  border-color: rgba(96, 118, 255, 0.6);
}

.btn-refresh :deep(svg) {
  font-size: 18px;
}

.list-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 400px;
  padding: 64px 32px;
  color: rgba(43, 49, 96, 0.65);
  border-radius: 20px;
  border: 1px dashed rgba(150, 162, 218, 0.5);
  background: rgba(255, 255, 255, 0.82);
}

.loading-ring {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.08), rgba(231, 76, 60, 0.05));
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.loading-icon {
  font-size: 32px;
  color: rgba(231, 76, 60, 0.8);
  animation: spin 1s linear infinite;
}

.empty-illustration {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(231, 76, 60, 0.11), rgba(231, 76, 60, 0.06));
  border: 1px solid rgba(231, 76, 60, 0.15);
}

.empty-icon {
  font-size: 52px;
  color: rgba(231, 76, 60, 0.42);
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

.recycle-list {
  display: flex;
  flex-direction: column;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recycle-file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 210, 255, 0.3);
  transition: all 0.25s ease;
}

.recycle-file-item:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(231, 76, 60, 0.4);
  box-shadow: 0 8px 20px -12px rgba(231, 76, 60, 0.3);
}

.file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(96, 118, 255, 0.08);
  flex-shrink: 0;
}

.file-icon :deep(svg) {
  font-size: 28px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.file-name {
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
  flex-wrap: wrap;
}

.file-meta > span:not(:last-child)::after {
  content: '•';
  margin-left: 12px;
  color: rgba(47, 59, 128, 0.3);
}

.file-expiry {
  color: #e74c3c;
  font-weight: 500;
}

.file-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn :deep(svg) {
  font-size: 16px;
}

.action-btn.restore {
  border-color: rgba(76, 175, 80, 0.4);
  color: #4CAF50;
}

.action-btn.restore:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.6);
  box-shadow: 0 6px 16px -10px rgba(76, 175, 80, 0.4);
}

.action-btn.delete {
  border-color: rgba(231, 76, 60, 0.4);
  color: #e74c3c;
}

.action-btn.delete:hover {
  background: rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.6);
  box-shadow: 0 6px 16px -10px rgba(231, 76, 60, 0.4);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  margin-top: auto;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(96, 114, 255, 0.35);
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.15), rgba(33, 181, 255, 0.12));
  color: #2d3264;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 14px;
  font-weight: 500;
}

.page-btn :deep(svg) {
  font-size: 18px;
}

.page-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(68, 95, 247, 0.7);
  box-shadow: 0 14px 28px -16px rgba(68, 95, 247, 0.66);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2566;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-item-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-item-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.list-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-item-move {
  transition: transform 0.4s ease;
}
</style>

<template>
  <div class="statistics-panel">
    <div class="stat-item">
      <Icon icon="mdi:file-multiple" class="stat-icon" />
      <div class="stat-info">
        <div class="stat-value">{{ statistics?.totalFiles || 0 }}</div>
        <div class="stat-label">文件</div>
      </div>
    </div>

    <div class="stat-item">
      <Icon icon="mdi:database" class="stat-icon" />
      <div class="stat-info">
        <div class="stat-value">{{ statistics?.totalSizeFormatted || '0 B' }}</div>
        <div class="stat-label">空间</div>
      </div>
    </div>

    <div class="stat-item">
      <Icon icon="mdi:folder-multiple" class="stat-icon" />
      <div class="stat-info">
        <div class="stat-value">{{ folderCount }}</div>
        <div class="stat-label">文件夹</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  statistics: {
    type: Object,
    default: null,
  },
  folderCount: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.statistics-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(200, 210, 255, 0.25);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(96, 118, 255, 0.4);
}

.stat-icon {
  font-size: 18px;
  color: rgba(96, 118, 255, 0.7);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #1f256a;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 11px;
  color: rgba(47, 59, 128, 0.6);
  white-space: nowrap;
}
</style>


<template>
  <div class="statistics-panel">
    <div class="panel-header">
      <Icon icon="mdi:chart-box-outline" class="header-icon" />
      <span class="header-title">存储统计</span>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item">
        <Icon icon="mdi:file-multiple" class="stat-icon" />
        <div class="stat-content">
          <div class="stat-value">{{ statistics?.totalFiles || 0 }}</div>
          <div class="stat-label">文件</div>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-item">
        <Icon icon="mdi:folder-multiple" class="stat-icon" />
        <div class="stat-content">
          <div class="stat-value">{{ folderCount }}</div>
          <div class="stat-label">文件夹</div>
        </div>
      </div>
    </div>

    <div class="storage-info">
      <Icon icon="mdi:harddisk" class="storage-icon" />
      <div class="storage-content">
        <div class="storage-label">已用空间</div>
        <div class="storage-value">{{ statistics?.totalSizeFormatted || '0 B' }}</div>
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
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.08), rgba(147, 197, 253, 0.12));
  border: 1px solid rgba(96, 118, 255, 0.2);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(96, 118, 255, 0.15);
}

.header-icon {
  font-size: 14px;
  color: rgba(96, 118, 255, 0.8);
}

.header-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(31, 37, 106, 0.75);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 16px;
  color: rgba(96, 118, 255, 0.7);
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: #1f256a;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 10px;
  color: rgba(47, 59, 128, 0.6);
  white-space: nowrap;
  line-height: 1;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(96, 118, 255, 0.3) 20%,
    rgba(96, 118, 255, 0.3) 80%,
    transparent
  );
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(96, 118, 255, 0.2);
  transition: all 0.2s ease;
}

.storage-info:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(96, 118, 255, 0.35);
}

.storage-icon {
  font-size: 18px;
  color: rgba(96, 118, 255, 0.8);
  flex-shrink: 0;
}

.storage-content {
  flex: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.storage-label {
  font-size: 11px;
  color: rgba(47, 59, 128, 0.7);
  white-space: nowrap;
}

.storage-value {
  font-size: 12px;
  font-weight: 700;
  color: #1f256a;
  font-variant-numeric: tabular-nums;
}
</style>


<template>
  <div class="status-bar">
    <span class="status-dot" :class="`status-dot--${statusType}`"></span>
    <span class="status-text">{{ statusText }}</span>
    
    <!-- 重试按钮 -->
    <button 
      v-if="statusType === 'error'" 
      @click="handleRetry"
      class="btn-retry"
      title="点击重试保存"
    >
      <Icon icon="mdi:refresh" />
      <span>重试</span>
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useDocStore } from '../../stores/doc';
import { useUiStore } from '../../stores/ui';
import { useAutoSaveStatus } from '../../composables/markdown';

const docStore = useDocStore();
const uiStore = useUiStore();
const { statusText, statusType } = useAutoSaveStatus();

/**
 * 处理重试保存
 */
const handleRetry = async () => {
  try {
    await docStore.retrySave();
    uiStore.showSuccess('重试成功');
  } catch (error) {
    uiStore.showError('重试失败：' + (error.message || '未知错误'));
  }
};
</script>

<style scoped>
.status-bar {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .status-bar {
    font-size: var(--font-size-mobile-xs);
  }
}

.status-dot {
  width: var(--spacing-xs);
  height: var(--spacing-xs);
  border-radius: var(--border-radius-full);
  background: var(--color-primary-light);
  box-shadow: 0 0 0 4px var(--color-primary-lighter);
  flex-shrink: 0;
}

.status-dot--editing {
  background: var(--color-warning);
  box-shadow: 0 0 0 4px var(--color-warning-light);
}

.status-dot--pending {
  background: var(--color-info);
  box-shadow: 0 0 0 4px var(--color-info-light);
  animation: pulse 1.6s ease-in-out infinite;
}

.status-dot--saving {
  background: var(--color-info);
  box-shadow: 0 0 0 4px var(--color-info-light);
  animation: pulse 1.6s ease-in-out infinite;
}

.status-dot--error {
  background: var(--color-error);
  box-shadow: 0 0 0 4px var(--color-error-light);
}

.status-dot--synced {
  background: var(--color-success);
  box-shadow: 0 0 0 4px var(--color-success-light);
}

.status-dot--dirty {
  background: var(--color-warning);
  box-shadow: 0 0 0 4px var(--color-warning-light);
}

.status-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 重试按钮 */
.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-2xs) var(--spacing-xs);
  margin-left: var(--spacing-xs);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-error);
  background: var(--color-error-light);
  color: var(--color-error);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.btn-retry:hover {
  background: var(--color-error);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-retry :deep(svg) {
  font-size: var(--icon-size-sm);
}

@media (max-width: 768px) {
  .btn-retry {
    padding: var(--spacing-mobile-2xs) var(--spacing-mobile-2xs);
    font-size: var(--font-size-mobile-xs);
  }
  
  .btn-retry span {
    display: none;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}
</style>


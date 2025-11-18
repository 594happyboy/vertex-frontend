<template>
  <div class="infinite-footer">
    <div v-if="state === 'loading'" class="footer-content">
      <Icon icon="mdi:loading" class="spin" />
      <span>{{ loadingText }}</span>
    </div>
    <button
      v-else-if="state === 'error'"
      type="button"
      class="footer-content error"
      @click="$emit('retry')"
    >
      <Icon icon="mdi:alert" />
      <span>{{ errorText }}</span>
    </button>
    <div v-else-if="state === 'done'" class="footer-content done">
      <Icon icon="mdi:check-circle-outline" />
      <span>{{ doneText }}</span>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  state: {
    type: String,
    default: 'idle', // idle | loading | error | done
  },
  loadingText: {
    type: String,
    default: '加载中...'
  },
  errorText: {
    type: String,
    default: '加载失败，请点击重试'
  },
  doneText: {
    type: String,
    default: '已全部加载完毕'
  },
});
</script>

<style scoped>
.infinite-footer {
  padding: 12px 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 44px;
  color: var(--color-text-tertiary);
}

.footer-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.footer-content :deep(svg) {
  font-size: 18px;
}

.footer-content.error {
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(239, 68, 68, 0.9);
  cursor: pointer;
}

.footer-content.done {
  color: var(--color-text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

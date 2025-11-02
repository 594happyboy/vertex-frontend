<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="'toast-' + toast.type"
      >
        <Icon :icon="getIcon(toast.type)" class="toast-icon" />
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">
          <Icon icon="mdi:close" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useUiStore } from '../stores/ui';

const { isMobile } = useResponsive();
const uiStore = useUiStore();

const toasts = computed(() => uiStore.toasts);

function getIcon(type) {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information',
  };
  return icons[type] || icons.info;
}

function removeToast(id) {
  uiStore.removeToast(id);
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-tooltip);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 300px;
  max-width: 500px;
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

@media (max-width: 768px) {
  .toast {
    min-width: 280px;
    max-width: calc(100vw - var(--spacing-mobile-lg) * 2);
    padding: var(--spacing-mobile-sm);
  }
}

.toast-icon {
  flex-shrink: 0;
  font-size: var(--icon-size-lg);
}

@media (max-width: 768px) {
  .toast-icon {
    font-size: var(--icon-size-mobile-lg);
  }
}

.toast-message {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .toast-message {
    font-size: var(--font-size-mobile-sm);
  }
}

.toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
}

.toast-close:hover {
  color: var(--color-text-primary);
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-error {
  border-left: 4px solid var(--color-danger);
}

.toast-error .toast-icon {
  color: var(--color-danger);
}

.toast-warning {
  border-left: 4px solid var(--color-warning);
}

.toast-warning .toast-icon {
  color: var(--color-warning);
}

.toast-info {
  border-left: 4px solid var(--color-info);
}

.toast-info .toast-icon {
  color: var(--color-info);
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-base);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>


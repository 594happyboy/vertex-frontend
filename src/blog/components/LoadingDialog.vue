<template>
  <Teleport to="body">
    <transition name="loading-dialog">
      <div v-if="uiStore.loading.show" class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <Icon icon="mdi:loading" class="spinner-icon" />
          </div>
          <p class="loading-message">{{ uiStore.loading.message }}</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 38, 106, 0.6);
  backdrop-filter: blur(12px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px 60px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 72px rgba(47, 59, 128, 0.4);
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: rgba(96, 118, 255, 0.8);
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  border-top-color: rgba(96, 118, 255, 0.5);
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  border-top-color: rgba(96, 118, 255, 0.2);
  animation-delay: -0.15s;
}

.spinner-icon {
  font-size: 32px;
  color: #6076ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f256a;
  text-align: center;
  white-space: nowrap;
}

/* 动画 */
.loading-dialog-enter-active,
.loading-dialog-leave-active {
  transition: opacity 0.3s ease;
}

.loading-dialog-enter-active .loading-container,
.loading-dialog-leave-active .loading-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.loading-dialog-enter-from,
.loading-dialog-leave-to {
  opacity: 0;
}

.loading-dialog-enter-from .loading-container,
.loading-dialog-leave-to .loading-container {
  transform: scale(0.9);
  opacity: 0;
}

/* 暗色主题支持 */
:global([data-theme='dark']) .loading-overlay {
  background: rgba(0, 0, 0, 0.7);
}

:global([data-theme='dark']) .loading-container {
  background: rgba(30, 30, 40, 0.98);
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.6);
}

:global([data-theme='dark']) .loading-message {
  color: rgba(255, 255, 255, 0.9);
}

:global([data-theme='dark']) .spinner-icon {
  color: #8098ff;
}
</style>


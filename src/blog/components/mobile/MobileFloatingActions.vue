<template>
  <div class="mobile-floating-actions">
    <transition name="fab-menu">
      <div v-if="menuOpen" class="fab-menu">
        <button class="fab-menu-item" @click="handleAction('create-doc')">
          <Icon icon="mdi:language-markdown" />
          <span>Markdown</span>
        </button>
        <button class="fab-menu-item" @click="handleAction('create-rich-doc')">
          <Icon icon="mdi:file-document-edit" />
          <span>富文本</span>
        </button>
        <button class="fab-menu-item" @click="handleAction('create-group')">
          <Icon icon="mdi:folder-plus" />
          <span>分组</span>
        </button>
      </div>
    </transition>

    <button class="fab-main" :class="{ 'is-open': menuOpen }" @click="toggleMenu">
      <Icon :icon="menuOpen ? 'mdi:close' : 'mdi:plus'" />
    </button>

    <transition name="fab-overlay">
      <div v-if="menuOpen" class="fab-overlay" @click="menuOpen = false"></div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const emit = defineEmits(['create-doc', 'create-rich-doc', 'create-group']);

const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function handleAction(action) {
  menuOpen.value = false;
  emit(action);
}
</script>

<style scoped>
.mobile-floating-actions {
  position: fixed;
  right: 16px;
  bottom: calc(80px + env(safe-area-inset-bottom));
  z-index: 100;
}

.fab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: -1;
}

.fab-main {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, rgba(58, 84, 245, 0.95), rgba(21, 37, 117, 0.92));
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(10, 26, 128, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-main:active {
  transform: scale(0.9);
}

.fab-main.is-open {
  transform: rotate(45deg);
}

.fab-main :deep(svg) {
  font-size: 28px;
  transition: transform 0.3s ease;
}

.fab-menu {
  position: absolute;
  right: 0;
  bottom: 72px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab-menu-item {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 28px;
  border: none;
  background: #ffffff;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.fab-menu-item:active {
  transform: scale(0.95);
}

.fab-menu-item :deep(svg) {
  font-size: 22px;
  color: var(--color-primary);
}

/* 动画 */
.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: all 0.3s ease;
}

.fab-menu-enter-from,
.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fab-overlay-enter-active,
.fab-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.fab-overlay-enter-from,
.fab-overlay-leave-to {
  opacity: 0;
}

/* 暗色主题 */
[data-theme='dark'] .fab-menu-item {
  background: #374151;
  color: #e5e7eb;
}
</style>


<template>
  <button 
    class="sidebar-handle"
    :class="{ 'collapsed': collapsed }"
    :style="{ left: handlePosition }"
    @click="$emit('toggle')"
    :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
  >
    <Icon :icon="collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 280,
  },
});

const handlePosition = computed(() => {
  if (props.collapsed) {
    return '0px';
  }
  return `${props.width}px`;
});
</script>

<style scoped>
.sidebar-handle {
  position: absolute;
  left: 280px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: none;
  border-radius: 0 12px 12px 0;
  box-shadow: 
    inset 2px 0 4px -2px rgba(0, 0, 0, 0.03),
    4px 0 16px -2px rgba(0, 0, 0, 0.08), 
    6px 0 24px -2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-secondary);
  opacity: 1;
}

.sidebar-handle.collapsed {
  left: 0;
  border-radius: 0 12px 12px 0;
  width: 28px;
  height: 100px;
  box-shadow: 
    4px 0 20px -2px rgba(0, 0, 0, 0.12), 
    6px 0 32px -2px rgba(0, 0, 0, 0.08);
}

.sidebar-handle:hover {
  background: #f8f9fa;
  color: var(--color-text-primary);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 
    inset 2px 0 4px -2px rgba(0, 0, 0, 0.03),
    5px 0 20px -2px rgba(0, 0, 0, 0.12), 
    8px 0 36px -2px rgba(0, 0, 0, 0.1);
}

.sidebar-handle :deep(svg) {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.sidebar-handle:hover :deep(svg) {
  transform: translateX(2px);
}

.sidebar-handle:active {
  transform: translateY(-50%) scale(0.95);
}

/* 暗色主题 */
[data-theme='dark'] .sidebar-handle {
  background: #374151;
  color: #9ca3af;
}

[data-theme='dark'] .sidebar-handle:hover {
  background: #4b5563;
  color: #e5e7eb;
}
</style>


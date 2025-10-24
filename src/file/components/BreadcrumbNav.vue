<template>
  <nav class="breadcrumb-nav">
    <div class="breadcrumb-items">
      <!-- 根目录 -->
      <button 
        class="breadcrumb-item"
        :class="{ active: !path || path.length === 0 }"
        @click="handleNavigate(null)"
      >
        <Icon icon="mdi:home" />
        <span>全部文件</span>
      </button>

      <!-- 路径项 -->
      <template v-if="path && path.length > 0">
        <template v-for="(item, index) in path" :key="item.id">
          <Icon icon="mdi:chevron-right" class="breadcrumb-separator" />
          <button 
            class="breadcrumb-item"
            :class="{ active: index === path.length - 1 }"
            @click="handleNavigate(item.id)"
          >
            <Icon icon="mdi:folder" />
            <span>{{ item.name }}</span>
          </button>
        </template>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  path: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['navigate']);

function handleNavigate(folderId) {
  emit('navigate', folderId);
}
</script>

<style scoped>
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0px;
  overflow-x: auto;
  overflow-y: hidden;
}

.breadcrumb-items {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  color: rgba(47, 59, 128, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.breadcrumb-item:hover:not(.active) {
  background: rgba(96, 118, 255, 0.1);
  color: #1f256a;
}

.breadcrumb-item.active {
  background: rgba(96, 118, 255, 0.15);
  color: #1f256a;
  font-weight: 600;
  cursor: default;
}

.breadcrumb-item :deep(svg) {
  font-size: 16px;
}

.breadcrumb-separator {
  font-size: 18px;
  color: rgba(47, 59, 128, 0.3);
  flex-shrink: 0;
}

/* 滚动条样式 */
.breadcrumb-nav::-webkit-scrollbar {
  height: 4px;
}

.breadcrumb-nav::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 2px;
}

.breadcrumb-nav::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 2px;
}

.breadcrumb-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}
</style>


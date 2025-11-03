<template>
  <div class="explorer-breadcrumb">
    <div class="breadcrumb-content">
      <!-- 主页图标 -->
      <div
        class="breadcrumb-item home"
        :class="{ active: path.length === 0 }"
        @click="handleNavigate(null)"
      >
        <Icon icon="mdi:home" />
        <span class="item-text">我的文件</span>
      </div>

      <!-- 面包屑路径 -->
      <template v-for="(folder, index) in path" :key="folder.id">
        <div class="breadcrumb-separator">
          <Icon icon="mdi:chevron-right" />
        </div>
        
        <div
          class="breadcrumb-item"
          :class="{ active: index === path.length - 1 }"
          @click="handleNavigate(folder.id)"
        >
          <span class="item-text">{{ folder.name }}</span>
        </div>
      </template>

      <!-- 加载中 -->
      <Icon
        v-if="loading"
        icon="mdi:loading"
        class="loading-icon spin"
      />
    </div>

    <!-- 快捷操作 (可选) -->
    <div class="breadcrumb-actions">
      <button
        v-if="showRefresh"
        class="action-button"
        title="刷新"
        @click="$emit('refresh')"
      >
        <Icon icon="mdi:refresh" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
  /** 文件夹路径 */
  path: {
    type: Array,
    default: () => [],
  },
  /** 是否正在加载 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 是否显示刷新按钮 */
  showRefresh: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate', 'refresh']);

/**
 * 处理导航
 */
function handleNavigate(folderId) {
  emit('navigate', folderId);
}
</script>

<style scoped>
.explorer-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-2xs) var(--spacing-md);
  border-bottom: 1px solid rgba(200, 210, 255, 0.2);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.breadcrumb-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.breadcrumb-content::-webkit-scrollbar {
  display: none;
}

/* 面包屑项 */
.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-mobile-xs);
  padding: var(--padding-component-sm);
  border-radius: 8px;
  background: transparent;
  color: rgba(96, 118, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.breadcrumb-item:hover {
  background: rgba(96, 118, 255, 0.1);
  color: rgba(96, 118, 255, 1);
}

.breadcrumb-item.active {
  color: #1f256a;
  font-weight: 600;
  cursor: default;
  pointer-events: none;
}

.breadcrumb-item.home {
  color: rgba(96, 118, 255, 0.8);
}

.breadcrumb-item.home:hover {
  color: rgba(96, 118, 255, 1);
}

.breadcrumb-item :deep(svg) {
  font-size: 18px;
}

.item-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分隔符 */
.breadcrumb-separator {
  display: flex;
  align-items: center;
  color: rgba(96, 118, 255, 0.3);
  font-size: 16px;
  flex-shrink: 0;
}

/* 加载中图标 */
.loading-icon {
  margin-left: 8px;
  font-size: 16px;
  color: rgba(96, 118, 255, 0.6);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 快捷操作 */
.breadcrumb-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(96, 118, 255, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: rgba(96, 118, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  border-color: rgba(96, 118, 255, 0.5);
  background: rgba(96, 118, 255, 0.1);
  color: rgba(96, 118, 255, 1);
  transform: scale(1.05);
}

.action-button :deep(svg) {
  font-size: 18px;
}

/* 响应式 */
@media (max-width: 768px) {
  .explorer-breadcrumb {
    padding: var(--spacing-mobile-2xs) var(--spacing-mobile-md);
    gap: var(--spacing-sm);
  }
  
  .breadcrumb-content {
    gap: var(--spacing-mobile-xs);
  }
  
  .breadcrumb-item {
    padding: var(--padding-mobile-component-sm);
    font-size: 12px;
  }
  
  .breadcrumb-item :deep(svg) {
    font-size: 16px;
  }
  
  .item-text {
    max-width: 120px;
  }
  
  .breadcrumb-separator {
    font-size: 14px;
  }
  
  .action-button {
    width: 28px;
    height: 28px;
  }
  
  .action-button :deep(svg) {
    font-size: 16px;
  }
}
</style>


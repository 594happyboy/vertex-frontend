<template>
  <div class="explorer-content" :class="`view-${viewMode}`">
    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <ExplorerCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :selected="selectedIds.includes(item.id)"
        @toggle-select="$emit('toggle-select', item.id)"
        @enter-folder="$emit('enter-folder', item.id)"
        @edit="$emit('edit', item.id)"
        @download="$emit('download', item.id)"
        @copy-url="$emit('copy-url', item.id)"
        @show-detail="$emit('show-detail', item.id)"
        @delete="$emit('delete', item.id)"
        @dblclick="handleDoubleClick(item)"
      />
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <div class="list-header">
        <div class="list-name">名称</div>
        <div class="list-size">大小</div>
        <div class="list-type">类型</div>
        <div class="list-date">修改时间</div>
        <div class="list-actions">操作</div>
      </div>

      <div class="list-body">
        <ExplorerRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          @enter-folder="$emit('enter-folder', item.id)"
          @edit="$emit('edit', item.id)"
          @download="$emit('download', item.id)"
          @copy-url="$emit('copy-url', item.id)"
          @show-detail="$emit('show-detail', item.id)"
          @delete="$emit('delete', item.id)"
          @dblclick="handleDoubleClick(item)"
        />
      </div>
    </div>

    <!-- 骨架屏 (加载中) -->
    <div v-if="loading" class="skeleton-wrapper">
      <div v-for="i in 8" :key="i" class="skeleton-item" :class="`skeleton-${viewMode}`">
        <div class="skeleton-icon"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import ExplorerCard from './ExplorerCard.vue';
import ExplorerRow from './ExplorerRow.vue';

const props = defineProps({
  /** 项目列表 (文件夹+文件) */
  items: {
    type: Array,
    default: () => [],
  },
  /** 选中的项目ID列表 */
  selectedIds: {
    type: Array,
    default: () => [],
  },
  /** 视图模式 */
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value),
  },
  /** 是否正在加载 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 是否有更多数据 */
  hasMore: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'enter-folder',
  'edit',
  'download',
  'copy-url',
  'show-detail',
  'delete',
  'load-more',
]);

/**
 * 处理双击
 */
function handleDoubleClick(item) {
  if (item.type === 'folder') {
    emit('enter-folder', item.id);
  }
  // 双击文件不再触发详情
}
</script>

<style scoped>
.explorer-content {
  min-height: 200px;
}

/* ========== 网格视图 ========== */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

@media (max-width: 1400px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}

/* ========== 列表视图 ========== */
.list-view {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(200, 210, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

/* 列表头部 */
.list-header {
  display: grid;
  grid-template-columns: 1fr 100px 100px 160px 120px;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(96, 118, 255, 0.05);
  border-bottom: 1px solid rgba(200, 210, 255, 0.2);
  font-size: 12px;
  font-weight: 600;
  color: rgba(96, 118, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-header > div {
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}

/* 列表主体 */
.list-body {
  display: flex;
  flex-direction: column;
}

/* 响应式列表 */
@media (max-width: 1024px) {
  .list-header {
    grid-template-columns: 1fr 80px 80px 140px 100px;
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .list-header {
    grid-template-columns: 1fr 60px 80px;
    gap: 8px;
    padding: 10px 12px;
  }
  
  .list-type,
  .list-actions {
    display: none;
  }
}

/* ========== 骨架屏 ========== */
.skeleton-wrapper {
  display: grid;
  gap: 16px;
  padding: 8px 0;
}

.skeleton-wrapper.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.skeleton-item {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-item.skeleton-grid {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.skeleton-item.skeleton-list {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(200, 210, 255, 0.2);
}

.skeleton-text {
  flex: 1;
  height: 16px;
  border-radius: 4px;
  background: rgba(200, 210, 255, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>


<template>
  <div
    class="tree-node"
    :class="{
      'selected': isSelected,
      'has-children': hasChildren,
      'expanded': expanded,
    }"
    :style="{ paddingLeft: `${level * 16 + 8}px` }"
  >
    <!-- 节点内容 -->
    <div
      class="node-content"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
    >
      <!-- 展开/折叠图标 -->
      <div class="node-toggle" @click.stop="handleToggle">
        <Icon
          v-if="hasChildren"
          :icon="expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'"
          class="toggle-icon"
        />
        <div v-else class="toggle-placeholder"></div>
      </div>

      <!-- 文件夹图标 -->
      <div class="node-icon">
        <Icon
          v-if="node.icon"
          :icon="node.icon"
          :style="{ color: node.color || '#6076FF' }"
        />
        <Icon
          v-else
          icon="mdi:folder"
          :style="{ color: node.color || '#6076FF' }"
        />
      </div>

      <!-- 文件夹名称 -->
      <div class="node-label" :title="node.name">
        {{ node.name }}
      </div>

      <!-- 子项数量徽章 -->
      <div v-if="showCount" class="node-badge">
        {{ node.childFolderCount || 0 }}
      </div>

      <!-- 加载中图标 -->
      <Icon
        v-if="loading"
        icon="mdi:loading"
        class="loading-icon spin"
      />
    </div>

    <!-- 子节点 -->
    <div v-if="expanded && hasChildren" class="node-children">
      <TreeExplorerNode
        v-for="child in children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        :expanded="childExpanded(child.id)"
        :loading="childLoading(child.id)"
        @toggle="$emit('toggle', child.id)"
        @select="$emit('select', child.id)"
        @load-more="$emit('load-more', child.id)"
        @context-menu="$emit('context-menu', $event)"
      />

      <!-- 加载更多按钮 -->
      <div
        v-if="hasMore"
        class="load-more-btn"
        :style="{ paddingLeft: `${(level + 1) * 16 + 8}px` }"
        @click="handleLoadMore"
      >
        <Icon icon="mdi:dots-horizontal" />
        <span>加载更多</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useFileStore } from '../stores/file';

const props = defineProps({
  /** 节点数据 */
  node: {
    type: Object,
    required: true,
  },
  /** 层级(从0开始) */
  level: {
    type: Number,
    default: 0,
  },
  /** 当前选中的节点ID */
  selectedId: {
    type: String,
    default: null,
  },
  /** 是否展开 */
  expanded: {
    type: Boolean,
    default: false,
  },
  /** 是否正在加载 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 是否显示子项数量 */
  showCount: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'toggle',      // 展开/折叠
  'select',      // 选中
  'load-more',   // 加载更多
  'context-menu', // 右键菜单
]);

const store = useFileStore();

// 是否选中
const isSelected = computed(() => {
  if (props.node.id === 'root') {
    return props.selectedId === null;
  }
  return props.selectedId === props.node.id;
});

// 是否有子节点
const hasChildren = computed(() => {
  return (props.node.childFolderCount || 0) > 0;
});

// 子节点列表
const children = computed(() => {
  const treeState = store.treeState[props.node.id];
  if (treeState && treeState.children) {
    return treeState.children;
  }
  // Fallback: 使用节点自带的children
  return props.node.children || [];
});

// 是否有更多子节点
const hasMore = computed(() => {
  const treeState = store.treeState[props.node.id];
  return treeState ? treeState.hasMore : false;
});

/**
 * 检查子节点是否展开
 */
function childExpanded(childId) {
  return store.isTreeNodeExpanded ? store.isTreeNodeExpanded(childId) : store.isFolderExpanded(childId);
}

/**
 * 检查子节点是否正在加载
 */
function childLoading(childId) {
  const treeState = store.treeState[childId];
  return treeState ? treeState.loading : false;
}

/**
 * 处理点击
 */
function handleClick() {
  emit('select', props.node.id);
}

/**
 * 处理展开/折叠
 */
function handleToggle() {
  if (hasChildren.value) {
    emit('toggle', props.node.id);
  }
}

/**
 * 处理右键菜单
 */
function handleContextMenu(event) {
  emit('context-menu', { event, node: props.node });
}

/**
 * 处理加载更多
 */
function handleLoadMore() {
  emit('load-more', props.node.id);
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

/* 节点内容 */
.node-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.node-content:hover {
  background: rgba(96, 118, 255, 0.08);
}

.tree-node.selected .node-content {
  background: rgba(96, 118, 255, 0.15);
  font-weight: 600;
}

.tree-node.selected .node-content:hover {
  background: rgba(96, 118, 255, 0.2);
}

/* 展开/折叠图标 */
.node-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.node-toggle:hover {
  background: rgba(96, 118, 255, 0.15);
}

.toggle-icon {
  font-size: 18px;
  color: rgba(96, 118, 255, 0.7);
  transition: transform 0.2s ease;
}

.tree-node.expanded .toggle-icon {
  transform: rotate(0deg);
}

.toggle-placeholder {
  width: 18px;
  height: 18px;
}

/* 文件夹图标 */
.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.node-icon :deep(svg) {
  font-size: 20px;
}

/* 文件夹名称 */
.node-label {
  flex: 1;
  font-size: 13px;
  color: #1f256a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* 子项数量徽章 */
.node-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: rgba(96, 118, 255, 0.12);
  color: rgba(96, 118, 255, 0.9);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.tree-node.selected .node-badge {
  background: rgba(96, 118, 255, 0.25);
  color: rgba(96, 118, 255, 1);
}

/* 加载中图标 */
.loading-icon {
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

/* 子节点容器 */
.node-children {
  /* 子节点缩进由各自的 paddingLeft 控制 */
}

/* 加载更多按钮 */
.load-more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 6px;
  color: rgba(96, 118, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: rgba(96, 118, 255, 0.1);
  color: rgba(96, 118, 255, 1);
}

.load-more-btn :deep(svg) {
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .node-content {
    padding: 8px 8px 8px 0;
    gap: 8px;
  }
  
  .node-label {
    font-size: 14px;
  }
  
  .node-icon :deep(svg) {
    font-size: 22px;
  }
  
  .node-badge {
    min-width: 22px;
    height: 20px;
    padding: 0 7px;
    font-size: 12px;
  }
}
</style>


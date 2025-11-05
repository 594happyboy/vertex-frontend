<template>
  <div class="folder-tree-node">
    <div 
      class="folder-node-item"
      :class="{ 
        active: isActive, 
        'has-children': hasChildren,
        dragging: isDragging 
      }"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 展开/折叠图标 -->
      <button 
        v-if="hasChildren"
        class="expand-btn"
        @click.stop="toggleExpand"
      >
        <Icon :icon="expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
      </button>
      <span v-else class="expand-placeholder"></span>

      <!-- 文件夹图标 -->
      <div 
        class="folder-icon" 
        :style="{ color: folder.color || '#6076FF' }"
      >
        <Icon :icon="expanded ? 'mdi:folder-open' : 'mdi:folder'" />
      </div>

      <!-- 文件夹名称 -->
      <span class="folder-name">{{ folder.name }}</span>

      <!-- 文件数量 -->
      <span v-if="folder.fileCount > 0" class="file-count">{{ folder.fileCount }}</span>
    </div>

    <!-- 子文件夹 -->
    <transition name="expand">
      <div v-if="hasChildren && expanded" class="folder-children">
        <FolderTreeNode
          v-for="child in folder.children"
          :key="child.id"
          :folder="child"
          :current-folder-id="currentFolderId"
          :level="level + 1"
          @select="$emit('select', $event)"
          @context-menu="$emit('context-menu', $event)"
          @drop-files="$emit('drop-files', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useFileStore } from '../stores/file';

const props = defineProps({
  folder: {
    type: Object,
    required: true,
  },
  currentFolderId: {
    type: [Number, String],
    default: null,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['select', 'context-menu', 'drop-files']);

const store = useFileStore();
const isDragging = ref(false);
const isDragOver = ref(false);

const hasChildren = computed(() => {
  return props.folder.children && props.folder.children.length > 0;
});

const isActive = computed(() => {
  return props.folder.id === props.currentFolderId;
});

// 使用 store 中的展开状态
const expanded = computed(() => {
  return store.isFolderExpanded(props.folder.id);
});

function toggleExpand() {
  store.toggleFolderExpand(props.folder.id);
}

function handleClick() {
  emit('select', props.folder.id);
}

function handleContextMenu(event) {
  emit('context-menu', {
    folder: props.folder,
    x: event.clientX,
    y: event.clientY,
  });
}

// 拖拽相关
function handleDragStart(event) {
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('folder-id', props.folder.id.toString());
}

function handleDragEnd() {
  isDragging.value = false;
}

function handleDragOver(event) {
  isDragOver.value = true;
  event.dataTransfer.dropEffect = 'move';
}

function handleDragLeave() {
  isDragOver.value = false;
}

function handleDrop(event) {
  isDragOver.value = false;
  
  // 检查是否是文件拖拽
  const fileIds = event.dataTransfer.getData('file-ids');
  if (fileIds) {
    const ids = JSON.parse(fileIds);
    emit('drop-files', {
      fileIds: ids,
      targetFolderId: props.folder.id,
    });
  }
}
</script>

<style scoped>
.folder-tree-node {
  user-select: none;
}

.folder-node-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-mobile-xs);
  padding: var(--spacing-mobile-xs) var(--spacing-xs);
  padding-left: calc(var(--spacing-xs) + v-bind('(level - 1) * 18') * 1px);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
}

.folder-node-item:hover {
  background: rgba(96, 118, 255, 0.08);
}

.folder-node-item.active {
  background: rgba(96, 118, 255, 0.15);
  color: #1f256a;
  font-weight: 600;
}

.folder-node-item.dragging {
  opacity: 0.5;
}

.expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size-md);
  height: var(--icon-size-md);
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: var(--transition-base);
  flex-shrink: 0;
}

.expand-btn:hover {
  background: rgba(96, 118, 255, 0.12);
  color: #1f256a;
}

.expand-btn :deep(svg) {
  font-size: var(--icon-size-md);
}

.expand-placeholder {
  width: var(--icon-size-md);
  height: var(--icon-size-md);
  flex-shrink: 0;
}

.folder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--icon-size-md);
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: var(--icon-size-md);
  padding: 0 5px;
  border-radius: var(--border-radius-full);
  background: rgba(96, 118, 255, 0.12);
  color: #3a54f5;
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.folder-children {
  overflow: hidden;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: var(--transition-slow);
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* 拖拽悬停效果 */
.folder-node-item.drag-over {
  background: rgba(96, 118, 255, 0.2);
  border: 1px dashed rgba(96, 118, 255, 0.5);
}
</style>


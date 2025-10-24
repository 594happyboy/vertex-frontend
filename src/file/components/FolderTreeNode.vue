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

const props = defineProps({
  folder: {
    type: Object,
    required: true,
  },
  currentFolderId: {
    type: Number,
    default: null,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['select', 'context-menu', 'drop-files']);

const expanded = ref(props.level === 0); // 第一层默认展开
const isDragging = ref(false);
const isDragOver = ref(false);

const hasChildren = computed(() => {
  return props.folder.children && props.folder.children.length > 0;
});

const isActive = computed(() => {
  return props.folder.id === props.currentFolderId;
});

function toggleExpand() {
  expanded.value = !expanded.value;
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
  gap: 8px;
  padding: 7px 10px;
  padding-left: calc(10px + v-bind('level * 20') * 1px);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
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
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: rgba(96, 118, 255, 0.12);
  color: #1f256a;
}

.expand-btn :deep(svg) {
  font-size: 18px;
}

.expand-placeholder {
  width: 18px;
  height: 18px;
}

.folder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(96, 118, 255, 0.12);
  color: #3a54f5;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.folder-children {
  overflow: hidden;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
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


<template>
  <div class="folder-tree">
    <!-- 根目录 - 永久展开，不可折叠 -->
    <div 
      class="folder-node-item root-folder"
      :class="{ active: isRootActive }"
      @click="handleSelectRoot"
      @dragover.prevent="handleRootDragOver"
      @drop.prevent="handleRootDrop"
    >
      <span class="expand-placeholder"></span>
      <div class="folder-icon">
        <Icon icon="mdi:folder-open" />
      </div>
      <span class="folder-name">全部文件</span>
      <span v-if="totalFileCount > 0" class="file-count">{{ totalFileCount }}</span>
    </div>

    <!-- 根目录的子内容区域（永久展开） -->
    <div class="root-content">
      <!-- 文件夹树 -->
      <div v-if="!loading && hasFolders" class="folder-list">
        <FolderTreeNode
          v-for="folder in folders"
          :key="folder.id"
          :folder="folder"
          :current-folder-id="currentFolderId"
          :level="1"
          @select="handleSelect"
          @context-menu="handleContextMenu"
          @drop-files="handleDropFiles"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <Icon icon="mdi:loading" class="loading-icon" />
      <span>加载中...</span>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click="hideContextMenu"
      >
        <button class="menu-item" @click="handleRename">
          <Icon icon="mdi:pencil" />
          重命名
        </button>
        <button class="menu-item" @click="handleSetColor">
          <Icon icon="mdi:palette" />
          设置颜色
        </button>
        <button class="menu-item" @click="handleCreateSubfolder">
          <Icon icon="mdi:folder-plus" />
          新建子文件夹
        </button>
        <div class="menu-divider"></div>
        <button class="menu-item danger" @click="handleDelete">
          <Icon icon="mdi:delete" />
          删除文件夹
        </button>
      </div>
    </Teleport>

    <!-- 点击外部关闭右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu-overlay"
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import FolderTreeNode from './FolderTreeNode.vue';

const props = defineProps({
  folders: {
    type: Array,
    default: () => [],
  },
  currentFolderId: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  totalFileCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'select',
  'create-folder',
  'rename-folder',
  'delete-folder',
  'set-folder-color',
  'drop-files',
]);

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  folder: null,
});

const hasFolders = computed(() => {
  return props.folders && props.folders.length > 0;
});

const isRootActive = computed(() => {
  return props.currentFolderId === null;
});

function handleSelectRoot() {
  emit('select', null);
}

function handleSelect(folderId) {
  emit('select', folderId);
}

function handleContextMenu(event) {
  contextMenu.value = {
    visible: true,
    x: event.x,
    y: event.y,
    folder: event.folder,
  };
}

function hideContextMenu() {
  contextMenu.value.visible = false;
}

function handleRename() {
  if (contextMenu.value.folder) {
    emit('rename-folder', contextMenu.value.folder);
  }
  hideContextMenu();
}

function handleSetColor() {
  if (contextMenu.value.folder) {
    emit('set-folder-color', contextMenu.value.folder);
  }
  hideContextMenu();
}

function handleCreateSubfolder() {
  if (contextMenu.value.folder) {
    emit('create-folder', contextMenu.value.folder.id);
  }
  hideContextMenu();
}

function handleDelete() {
  if (contextMenu.value.folder) {
    emit('delete-folder', contextMenu.value.folder);
  }
  hideContextMenu();
}

function handleDropFiles(event) {
  emit('drop-files', event);
}

function handleRootDragOver(event) {
  event.dataTransfer.dropEffect = 'move';
}

function handleRootDrop(event) {
  const fileIds = event.dataTransfer.getData('file-ids');
  if (fileIds) {
    const ids = JSON.parse(fileIds);
    emit('drop-files', {
      fileIds: ids,
      targetFolderId: null, // 移动到根目录
    });
  }
}

// 监听键盘事件关闭右键菜单
function handleKeyDown(event) {
  if (event.key === 'Escape' && contextMenu.value.visible) {
    hideContextMenu();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* 文件夹树容器 */
.folder-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-xs) var(--spacing-mobile-xs);
}

.folder-node-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-mobile-xs);
  padding: var(--spacing-mobile-xs) var(--spacing-xs);
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

.root-folder {
  margin-bottom: var(--spacing-xs);
  background: rgba(96, 118, 255, 0.05);
  border: 1px solid rgba(96, 118, 255, 0.2);
  font-weight: 600;
}

.root-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-sm);
  padding-left: var(--spacing-sm);
  border-left: 2px solid rgba(96, 118, 255, 0.2);
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
  color: #6076ff;
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

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg) var(--spacing-sm);
  color: rgba(47, 59, 128, 0.6);
  text-align: center;
}

.loading-icon {
  font-size: var(--icon-size-xl);
  color: rgba(96, 118, 255, 0.7);
  animation: spin 1s linear infinite;
}

/* 右键菜单 */
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  padding: var(--spacing-mobile-xs);
  border-radius: var(--border-radius-xl);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(200, 210, 255, 0.4);
  box-shadow: 0 12px 32px rgba(47, 59, 128, 0.15);
  animation: menuFadeIn var(--transition-fast);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: #1f256a;
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
}

.menu-item:hover {
  background: rgba(96, 118, 255, 0.1);
}

.menu-item.danger {
  color: #e74c3c;
}

.menu-item.danger:hover {
  background: rgba(231, 76, 60, 0.1);
}

.menu-item :deep(svg) {
  font-size: var(--icon-size-sm);
}

.menu-divider {
  height: 1px;
  margin: var(--spacing-mobile-xs) 0;
  background: rgba(200, 210, 255, 0.3);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 滚动条样式 */
.folder-tree::-webkit-scrollbar {
  width: 6px;
}

.folder-tree::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 3px;
}

.folder-tree::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 3px;
}

.folder-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}
</style>


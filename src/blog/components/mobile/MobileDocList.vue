<template>
  <div class="mobile-doc-list">
    <!-- Loading 状态 -->
    <div v-if="loading" class="list-status">
      <div class="status-loader">
        <span class="ring"></span>
        <Icon icon="mdi:loading" class="spin" />
      </div>
      <span>正在加载...</span>
    </div>

    <!-- Error 状态 -->
    <div v-else-if="error" class="list-status list-status--error">
      <Icon icon="mdi:alert-circle-outline" />
      <span>{{ error }}</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="tree.length === 0" class="list-status">
      <Icon icon="mdi:folder-open-outline" />
      <p>暂无文档</p>
      <p class="hint">点击右下角按钮创建第一个文档</p>
    </div>

    <!-- 文档列表 -->
    <div v-else class="list-content">
      <!-- 根目录 -->
      <div class="list-group">
        <div class="list-group-header" @click="$emit('select', null, null)">
          <Icon icon="mdi:folder-open" class="header-icon" />
          <span class="header-label">全部文档</span>
          <button class="more-btn" @click.stop="toggleRootMenu">
            <Icon icon="mdi:dots-vertical" />
          </button>
        </div>
        
        <!-- 根目录菜单 -->
        <transition name="menu-fade">
          <div v-if="showRootMenu" class="action-menu-overlay" @click="showRootMenu = false">
            <div class="action-menu" @click.stop>
              <button class="menu-item" @click="handleRootAction('create-group')">
                <Icon icon="mdi:folder-plus" />
                <span>新建分组</span>
              </button>
              <button class="menu-item" @click="handleRootAction('create-rich-doc')">
                <Icon icon="mdi:file-document-edit" />
                <span>新建文档</span>
              </button>
              <button class="menu-item" @click="handleRootAction('create-doc')">
                <Icon icon="mdi:language-markdown" />
                <span>新建Markdown文档</span>
              </button>
              <button class="menu-item" @click="handleRootAction('import-file')">
                <Icon icon="mdi:file-import" />
                <span>导入文档</span>
              </button>
              <button class="menu-item" @click="handleRootAction('batch-import')">
                <Icon icon="mdi:folder-zip" />
                <span>批量导入</span>
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- 树节点列表 -->
      <MobileTreeNode
        v-for="node in tree"
        :key="`${node.nodeType}-${node.id}`"
        :node="node"
        :depth="0"
        :selected-id="selectedId"
        :selected-type="selectedType"
        :expanded-keys="expandedKeys"
        @select="$emit('select', $event, $event.nodeType === 'GROUP' ? 'group' : 'document')"
        @toggle="$emit('toggle', $event)"
        @create-group="$emit('create-group', $event)"
        @create-doc="$emit('create-doc', $event)"
        @create-rich-doc="$emit('create-rich-doc', $event)"
        @import-file="$emit('import-file', $event)"
        @batch-import="$emit('batch-import', $event)"
        @rename="$emit('rename', $event.node, $event.type)"
        @delete="$emit('delete', $event.node, $event.type)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import MobileTreeNode from './MobileTreeNode.vue';

defineProps({
  tree: {
    type: Array,
    default: () => [],
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
  selectedType: {
    type: String,
    default: null,
  },
  expandedKeys: {
    type: Set,
    default: () => new Set(),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  'select',
  'toggle',
  'create-group',
  'create-doc',
  'create-rich-doc',
  'import-file',
  'batch-import',
  'rename',
  'delete',
]);

const showRootMenu = ref(false);

function toggleRootMenu() {
  showRootMenu.value = !showRootMenu.value;
}

function handleRootAction(action) {
  showRootMenu.value = false;
  emit(action, null);
}
</script>

<style scoped>
.mobile-doc-list {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.list-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--color-text-secondary);
  text-align: center;
}

.list-status--error {
  color: var(--color-danger);
}

.status-loader {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-loader .ring {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-light);
  animation: pulse 1.8s ease-in-out infinite;
}

.status-loader .spin {
  font-size: 28px;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.hint {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-top: -8px;
}

.list-content {
  padding: 8px;
}

.list-group {
  margin-bottom: 12px;
}

.list-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-bottom: 8px;
}

.list-group-header:active {
  background: var(--color-bg-hover);
  transform: scale(0.98);
}

.header-icon {
  font-size: 22px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.header-label {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.more-btn:active {
  background: var(--color-bg-hover);
}

.more-btn :deep(svg) {
  font-size: 20px;
}

/* 菜单 */
.action-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  padding: 0;
}

.action-menu {
  width: 100%;
  background: var(--color-bg-primary);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-bottom: 8px;
}

.menu-item:last-child {
  margin-bottom: 0;
}

.menu-item:active {
  background: var(--color-bg-hover);
  transform: scale(0.98);
}

.menu-item :deep(svg) {
  font-size: 22px;
  color: var(--color-primary);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

.menu-fade-enter-active .action-menu {
  animation: slideUp 0.3s ease;
}

.menu-fade-leave-active .action-menu {
  animation: slideDown 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
</style>


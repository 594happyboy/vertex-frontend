<template>
  <div class="mobile-tree-node">
    <!-- 节点内容 -->
    <div 
      class="node-item"
      :class="{
        'is-group': isGroup,
        'is-document': isDocument,
        'is-selected': isSelected,
      }"
      :style="{ paddingLeft: `${depth * 16 + 16}px` }"
      @click="handleClick"
    >
      <!-- 展开/收起按钮（仅分组） -->
      <button 
        v-if="isGroup && hasChildren"
        class="expand-btn"
        @click.stop="$emit('toggle', node.id)"
      >
        <Icon :icon="isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
      </button>
      
      <!-- 占位（保持对齐） -->
      <span v-else-if="isGroup" class="expand-placeholder"></span>

      <!-- 图标 -->
      <span class="node-icon">
        <Icon :icon="nodeIcon" />
      </span>

      <!-- 名称 -->
      <span class="node-label">{{ node.name }}</span>

      <!-- 更多操作按钮 -->
      <button class="node-more-btn" @click.stop="toggleMenu">
        <Icon icon="mdi:dots-vertical" />
      </button>
    </div>

    <!-- 操作菜单 -->
    <transition name="menu-fade">
      <div v-if="showMenu" class="action-menu-overlay" @click="showMenu = false">
        <div class="action-menu" @click.stop>
          <!-- 分组操作 -->
          <template v-if="isGroup">
            <button class="menu-item" @click="handleAction('create-group')">
              <Icon icon="mdi:folder-plus" />
              <span>新建子分组</span>
            </button>
            <button class="menu-item" @click="handleAction('create-rich-doc')">
              <Icon icon="mdi:file-document-edit" />
              <span>新建文档</span>
            </button>
            <button class="menu-item" @click="handleAction('create-doc')">
              <Icon icon="mdi:language-markdown" />
              <span>新建Markdown</span>
            </button>
            <button class="menu-item" @click="handleAction('import-file')">
              <Icon icon="mdi:file-import" />
              <span>导入文档</span>
            </button>
            <button class="menu-item" @click="handleAction('batch-import')">
              <Icon icon="mdi:folder-zip" />
              <span>批量导入</span>
            </button>
          </template>

          <!-- 通用操作 -->
          <button class="menu-item" @click="handleAction('rename')">
            <Icon icon="mdi:pencil" />
            <span>重命名</span>
          </button>
          <button class="menu-item menu-item--danger" @click="handleAction('delete')">
            <Icon icon="mdi:delete" />
            <span>删除</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- 子节点（递归） -->
    <transition name="expand">
      <div v-if="isGroup && isExpanded && hasChildren" class="node-children">
        <MobileTreeNode
          v-for="child in node.children"
          :key="`${child.nodeType}-${child.id}`"
          :node="child"
          :depth="depth + 1"
          :selected-id="selectedId"
          :selected-type="selectedType"
          :expanded-keys="expandedKeys"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
          @create-group="$emit('create-group', $event)"
          @create-doc="$emit('create-doc', $event)"
          @create-rich-doc="$emit('create-rich-doc', $event)"
          @import-file="$emit('import-file', $event)"
          @batch-import="$emit('batch-import', $event)"
          @rename="$emit('rename', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
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

const showMenu = ref(false);

const isGroup = computed(() => props.node.nodeType === 'GROUP');
const isDocument = computed(() => props.node.nodeType === 'DOCUMENT');
const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
const isExpanded = computed(() => props.expandedKeys.includes(props.node.id));

const isSelected = computed(() => {
  if (isGroup.value) {
    return props.selectedType === 'group' && props.selectedId === props.node.id;
  } else {
    return props.selectedType === 'document' && props.selectedId === props.node.id;
  }
});

const nodeIcon = computed(() => {
  if (isGroup.value) {
    return isExpanded.value ? 'mdi:folder-open' : 'mdi:folder';
  }
  
  // 根据文档类型返回不同图标
  const typeIcons = {
    md: 'mdi:language-markdown',
    html: 'mdi:file-document-edit',
    pdf: 'mdi:file-pdf-box',
    txt: 'mdi:file-document-outline',
  };
  
  return typeIcons[props.node.type] || 'mdi:file-document-outline';
});

function handleClick() {
  emit('select', props.node);
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function handleAction(action) {
  showMenu.value = false;
  
  const nodeType = isGroup.value ? 'group' : 'document';
  
  switch (action) {
    case 'create-group':
    case 'create-doc':
    case 'create-rich-doc':
    case 'import-file':
    case 'batch-import':
      emit(action, props.node.id);
      break;
    case 'rename':
    case 'delete':
      emit(action, { node: props.node, type: nodeType });
      break;
  }
}
</script>

<style scoped>
.mobile-tree-node {
  width: 100%;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--color-bg-primary);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-bottom: 4px;
  min-height: 52px;
}

.node-item:active {
  background: var(--color-bg-hover);
  transform: scale(0.98);
}

.node-item.is-selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.expand-btn:active {
  background: var(--color-bg-hover);
}

.expand-btn :deep(svg) {
  font-size: 18px;
}

.expand-placeholder {
  width: 32px;
  flex-shrink: 0;
}

.node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.node-item.is-group .node-icon {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.node-item.is-document .node-icon {
  color: var(--color-text-secondary);
}

.node-icon :deep(svg) {
  font-size: 20px;
}

.node-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-more-btn {
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
  flex-shrink: 0;
}

.node-more-btn:active {
  background: var(--color-bg-hover);
}

.node-more-btn :deep(svg) {
  font-size: 20px;
}

.node-children {
  overflow: hidden;
}

/* 菜单样式 */
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

.menu-item--danger {
  color: var(--color-danger);
}

.menu-item--danger :deep(svg) {
  color: var(--color-danger);
}

/* 动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
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
</style>


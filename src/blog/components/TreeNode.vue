<template>
  <div class="tree-node">
    <div
      :class="['node-item', isGroup ? 'node-group' : 'node-doc', { selected: isSelected }]"
      @click="handleClick"
    >
      <div class="node-leading">
        <button
          v-if="isGroup"
          class="node-expand"
          @click.stop="handleToggle"
          :title="isExpanded ? '收起' : '展开'"
        >
          <Icon :icon="isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
        </button>
        <span v-else class="node-spacer"></span>

        <span class="node-avatar" :class="avatarClasses">
          <Icon
            class="node-icon"
            :icon="isGroup ? 'mdi:folder-star-outline' : nodeIcon"
          />
        </span>
        <span class="node-label" :title="node.name">{{ node.name }}</span>
      </div>

      <div class="node-actions" ref="menuRef">
        <button class="tree-action-btn" @click.stop="toggleMenu" title="更多操作">
          <Icon icon="mdi:dots-horizontal" />
        </button>
        <transition name="tree-menu-fade-scale">
          <div v-if="showMenu" class="tree-action-menu">
            <template v-if="isGroup">
              <button class="tree-menu-item" @click="handleOpenCreateModal">
                <Icon icon="mdi:plus-circle" />
                <span>新建...</span>
              </button>
              <button class="tree-menu-item" @click="handleImportFile">
                <Icon icon="mdi:file-import" />
                <span>导入文档</span>
              </button>
              <button class="tree-menu-item" @click="handleBatchImport">
                <Icon icon="mdi:folder-zip" />
                <span>批量导入</span>
              </button>
              <div class="tree-menu-divider"></div>
            </template>
            <button class="tree-menu-item" @click="handleRename">
              <Icon icon="mdi:pencil" />
              <span>重命名</span>
            </button>
            <button class="tree-menu-item danger" @click="handleDelete">
              <Icon icon="mdi:delete" />
              <span>删除</span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="isGroup && isExpanded && hasChildren" class="node-children" :style="childrenIndentStyle">
      <TreeNode
        v-for="child in node.children"
        :key="`${child.nodeType}-${child.id}`"
        :node="child"
        :depth="childDepth"
        :selected-id="selectedId"
        :selected-type="selectedType"
        :expanded-keys="expandedKeys"
        @select="(node, type) => $emit('select', node, type)"
        @toggle="(id) => $emit('toggle', id)"
        @open-create-modal="(payload) => $emit('open-create-modal', payload)"
        @import-file="(id) => $emit('import-file', id)"
        @batch-import="(id) => $emit('batch-import', id)"
        @rename="(node, type) => $emit('rename', node, type)"
        @delete="(node, type) => $emit('delete', node, type)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useTreeMenu } from '../composables/useTreeMenu';

const { isMobile } = useResponsive();

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
    type: Number,
    default: null,
  },
  selectedType: {
    type: String,
    default: null,
  },
  expandedKeys: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'select',
  'toggle',
  'open-create-modal',
  'import-file',
  'batch-import',
  'rename',
  'delete',
]);

// 使用菜单组合式函数
const { showMenu, menuRef, toggleMenu, handleMenuAction } = useTreeMenu();

// 最大缩进深度限制
const MAX_INDENT_DEPTH = 3;

// 文档类型图标映射
const ICON_MAP = {
  pdf: 'mdi:file-pdf-box',
  txt: 'mdi:file-document',
  md: 'mdi:file-document-outline',
  html: 'mdi:file-code'
};

// 计算属性
const isGroup = computed(() => props.node.nodeType?.toUpperCase() === 'GROUP');
const nodeType = computed(() => isGroup.value ? 'group' : 'document');

const isSelected = computed(() => 
  props.node.id === props.selectedId && 
  (!props.selectedType || nodeType.value === props.selectedType)
);

const isExpanded = computed(() => props.expandedKeys.includes(props.node.id));
const hasChildren = computed(() => isGroup.value && props.node.children?.length > 0);
const childDepth = computed(() => props.depth + 1);
const nodeIcon = computed(() => ICON_MAP[props.node.type] || ICON_MAP.md);

const avatarClasses = computed(() => {
  if (isGroup.value) {
    return ['node-avatar--group'];
  }

  const type = typeof props.node.type === 'string' ? props.node.type.toLowerCase() : 'default';
  const typeKey = ICON_MAP[type] ? type : 'default';
  return ['node-avatar--doc', `node-avatar--doc-${typeKey}`];
});

const childrenIndentStyle = computed(() => 
  props.depth >= MAX_INDENT_DEPTH 
    ? { marginLeft: '0', paddingLeft: '0', borderLeft: 'none' }
    : {}
);

// 事件处理
const handleClick = () => emit('select', props.node, nodeType.value);
const handleToggle = () => emit('toggle', props.node.id);

// 菜单操作
const handleOpenCreateModal = handleMenuAction(() => 
  emit('open-create-modal', { parentId: props.node.id, parentName: props.node.name })
);
const handleImportFile = handleMenuAction(() => emit('import-file', props.node.id));
const handleBatchImport = handleMenuAction(() => emit('batch-import', props.node.id));
const handleRename = handleMenuAction(() => emit('rename', props.node, nodeType.value));
const handleDelete = handleMenuAction(() => emit('delete', props.node, nodeType.value));
</script>

<style scoped>
@import '../styles/tree-menu.css';

.tree-node {
  user-select: none;
}

.node-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2xs);
  padding: 1px 4px;
  margin-bottom: 1px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  isolation: isolate;
  border: 1px solid transparent;
}

.node-item:has(.tree-action-menu) {
  z-index: var(--z-dropdown);
}

@media (max-width: 768px) {
  .node-item {
    padding: 2px 6px;
  }
}

.node-item:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.node-item.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18), var(--shadow-sm);
}

.node-group.selected {
  transform: none;
}

.node-leading {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
  flex: 1;
  min-width: 0;
}

.node-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-tertiary);
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.node-expand :deep(svg) {
  font-size: 12px;
}

.node-expand:hover {
  border-color: var(--color-border-hover);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.node-spacer {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.node-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--border-radius-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: var(--transition-fast);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

@media (max-width: 768px) {
  .node-avatar {
    width: 20px;
    height: 20px;
  }
}

.node-avatar--group {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.node-avatar--doc {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.node-avatar--doc-md {
  border-color: var(--color-success);
  background: var(--color-success-light);
  color: var(--color-success);
}

.node-avatar--doc-txt {
  border-color: var(--color-info);
  background: var(--color-info-light);
  color: var(--color-info);
}

.node-avatar--doc-pdf {
  border-color: var(--color-danger);
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.node-avatar--doc-html {
  border-color: var(--color-warning);
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.node-avatar--doc-default {
  border-color: var(--color-border);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.node-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .node-icon {
    font-size: 12px;
  }
}

.node-label {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-group .node-label {
  font-weight: 600;
}

.node-actions {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3xs);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}

.node-item:hover .node-actions,
.node-item.selected .node-actions,
.node-actions:has(.tree-action-menu) {
  opacity: 1;
  pointer-events: auto;
}

.node-children {
  margin-left: 12px;
  padding-left: 8px;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

@media (max-width: 768px) {
  .node-label {
    font-size: var(--font-size-mobile-sm);
  }

  .node-children {
    margin-left: 10px;
    padding-left: 6px;
  }
}
</style>

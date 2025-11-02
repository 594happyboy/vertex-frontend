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

        <span class="node-avatar" :class="{ 'node-avatar--group': isGroup }">
          <Icon
            class="node-icon"
            :icon="isGroup ? 'mdi:folder-star-outline' : nodeIcon"
          />
        </span>
        <span class="node-label" :title="node.name">{{ node.name }}</span>
      </div>

      <div class="node-actions" ref="menuRef">
        <button class="action-btn" @click.stop="toggleMenu" title="更多操作">
          <Icon icon="mdi:dots-horizontal" />
        </button>
        <transition name="fade-scale">
          <div v-if="showMenu" class="action-menu">
            <template v-if="isGroup">
              <button class="menu-item" @click="handleCreateGroup">
                <Icon icon="mdi:folder-plus" />
                <span>新建子分组</span>
              </button>
              <button class="menu-item" @click="handleCreateDoc">
                <Icon icon="mdi:file-document-plus" />
                <span>新建文档</span>
              </button>
              <button class="menu-item" @click="handleBatchImport">
                <Icon icon="mdi:folder-zip" />
                <span>批量导入</span>
              </button>
              <div class="menu-divider"></div>
            </template>
            <button class="menu-item" @click="handleRename">
              <Icon icon="mdi:pencil" />
              <span>重命名</span>
            </button>
            <button class="menu-item danger" @click="handleDelete">
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
        @create-group="(id) => $emit('create-group', id)"
        @create-doc="(id) => $emit('create-doc', id)"
        @batch-import="(id) => $emit('batch-import', id)"
        @rename="(node, type) => $emit('rename', node, type)"
        @delete="(node, type) => $emit('delete', node, type)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';

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
  'create-group',
  'create-doc',
  'batch-import',
  'rename',
  'delete',
]);

// 菜单状态管理
const showMenu = ref(false);
const menuRef = ref(null);

// 点击外部关闭菜单
function handleClickOutside(event) {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    showMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 最大缩进深度限制
const MAX_INDENT_DEPTH = 3;

// 文档类型图标映射
const ICON_MAP = {
  pdf: 'mdi:file-pdf-box',
  txt: 'mdi:file-document',
  md: 'mdi:file-document-outline'
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

const childrenIndentStyle = computed(() => 
  props.depth >= MAX_INDENT_DEPTH 
    ? { marginLeft: '0', paddingLeft: '0', borderLeft: 'none' }
    : {}
);

// 事件处理
const handleClick = () => emit('select', props.node, nodeType.value);
const handleToggle = () => emit('toggle', props.node.id);

const toggleMenu = (event) => {
  event.stopPropagation();
  showMenu.value = !showMenu.value;
};

// 菜单操作的通用处理函数
const handleMenuAction = (action, ...args) => {
  showMenu.value = false;
  emit(action, ...args);
};

const handleCreateGroup = () => handleMenuAction('create-group', props.node.id);
const handleCreateDoc = () => handleMenuAction('create-doc', props.node.id);
const handleBatchImport = () => handleMenuAction('batch-import', props.node.id);
const handleRename = () => handleMenuAction('rename', props.node, nodeType.value);
const handleDelete = () => handleMenuAction('delete', props.node, nodeType.value);
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xs);
  padding: var(--spacing-2xs) var(--spacing-xs);
  margin-bottom: 2px;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
  isolation: isolate;
  min-height: var(--touch-target-min);
}

@media (max-width: 768px) {
  .node-item {
    gap: var(--spacing-mobile-xs);
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-sm);
  }
}

.node-item:hover {
  background: var(--color-bg-hover);
}

.node-item.selected {
  background: var(--gradient-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.node-group.selected {
  transform: translateX(2px);
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
  width: var(--icon-size-md);
  height: var(--icon-size-md);
  border-radius: var(--border-radius-sm);
  border: none;
  background: var(--color-primary-light);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
}

.node-expand :deep(svg) {
  font-size: var(--icon-size-sm);
}

.node-expand:hover {
  transform: translateY(-1px);
}

.node-spacer {
  width: var(--icon-size-md);
}

.node-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size-xl);
  height: var(--icon-size-xl);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .node-avatar {
    width: var(--icon-size-mobile-xl);
    height: var(--icon-size-mobile-xl);
  }
}

.node-avatar--group {
  background: var(--gradient-primary);
}

.node-icon {
  font-size: var(--icon-size-sm);
}

@media (max-width: 768px) {
  .node-icon {
    font-size: var(--icon-size-mobile-sm);
  }
}

.node-label {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .node-label {
    font-size: var(--font-size-mobile-sm);
  }
}

.node-actions {
  position: relative;
  display: none;
  align-items: center;
}

.node-item:hover .node-actions,
.node-actions:has(.action-menu) {
  display: inline-flex;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-height-xs);
  height: var(--btn-height-xs);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-base);
}

@media (max-width: 768px) {
  .action-btn {
    width: var(--btn-height-mobile-xs);
    height: var(--btn-height-mobile-xs);
  }
}

.action-btn :deep(svg) {
  font-size: var(--icon-size-sm);
}

@media (max-width: 768px) {
  .action-btn :deep(svg) {
    font-size: var(--icon-size-mobile-sm);
  }
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.action-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 150px;
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(14px);
  padding: var(--spacing-2xs);
  z-index: var(--z-dropdown);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-2xs) var(--spacing-xs);
  border-radius: var(--border-radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
  min-height: var(--touch-target-min);
}

@media (max-width: 768px) {
  .menu-item {
    gap: var(--spacing-mobile-xs);
    padding: var(--spacing-mobile-xs) var(--spacing-mobile-sm);
    font-size: var(--font-size-mobile-sm);
  }
}

.menu-item :deep(svg) {
  font-size: var(--icon-size-sm);
}

@media (max-width: 768px) {
  .menu-item :deep(svg) {
    font-size: var(--icon-size-mobile-sm);
  }
}

.menu-item:hover {
  background: var(--color-bg-hover);
}

.menu-item.danger {
  color: var(--color-danger);
}

.menu-item.danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.menu-divider {
  height: 1px;
  margin: var(--spacing-2xs) 0;
  background: var(--color-border);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: var(--transition-fast);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}

.node-children {
  margin-left: var(--spacing-sm);
  padding-left: var(--spacing-xs);
  border-left: 1px dashed var(--color-border);
}

@media (max-width: 768px) {
  .node-children {
    margin-left: var(--spacing-mobile-xs);
    padding-left: var(--spacing-mobile-2xs);
  }
}
</style>



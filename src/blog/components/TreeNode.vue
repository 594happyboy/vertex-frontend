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

const isSelected = computed(() => {
  if (props.node.id !== props.selectedId) return false;
  if (!props.selectedType) return true;
  return nodeType.value === props.selectedType;
});

const isExpanded = computed(() => props.expandedKeys.includes(props.node.id));
const hasChildren = computed(() => isGroup.value && props.node.children?.length > 0);
const childDepth = computed(() => props.depth + 1);

const nodeIcon = computed(() => 
  ICON_MAP[props.node.type] || ICON_MAP.md
);

const childrenIndentStyle = computed(() => 
  props.depth < MAX_INDENT_DEPTH ? {} : {
    marginLeft: '0',
    paddingLeft: '0',
    borderLeft: 'none',
  }
);

// 事件处理
function handleClick() {
  emit('select', props.node, nodeType.value);
}

function handleToggle() {
  emit('toggle', props.node.id);
}

function toggleMenu(event) {
  event.stopPropagation();
  showMenu.value = !showMenu.value;
}

// 菜单操作的通用处理函数
function handleMenuAction(action, ...args) {
  showMenu.value = false;
  emit(action, ...args);
}

function handleCreateGroup() {
  handleMenuAction('create-group', props.node.id);
}

function handleCreateDoc() {
  handleMenuAction('create-doc', props.node.id);
}

function handleBatchImport() {
  handleMenuAction('batch-import', props.node.id);
}

function handleRename() {
  handleMenuAction('rename', props.node, nodeType.value);
}

function handleDelete() {
  handleMenuAction('delete', props.node, nodeType.value);
}
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
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 2px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  isolation: isolate;
}

.node-item:hover {
  background: rgba(234, 239, 255, 0.7);
}

.node-item.selected {
  background: linear-gradient(135deg, rgba(109, 130, 255, 0.16), rgba(54, 188, 255, 0.14));
  box-shadow: inset 0 0 0 1px rgba(109, 130, 255, 0.38);
}

.node-group.selected {
  transform: translateX(2px);
}

.node-leading {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.node-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: none;
  background: rgba(187, 198, 255, 0.22);
  color: #25307a;
  transition: transform 0.2s ease;
}

.node-expand :deep(svg) {
  font-size: 14px;
}

.node-expand:hover {
  transform: translateY(-1px);
}

.node-spacer {
  width: 18px;
}

.node-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(194, 206, 255, 0.35);
  color: #2b3270;
}

.node-avatar--group {
  background: linear-gradient(135deg, rgba(89, 114, 255, 0.2), rgba(87, 188, 255, 0.22));
}

.node-icon {
  font-size: 14px;
}

.node-label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #222a68;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-actions {
  position: relative;
  display: none;
  align-items: center;
}

.node-item:hover .node-actions {
  display: inline-flex;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: 1px solid rgba(194, 204, 255, 0.72);
  background: rgba(255, 255, 255, 0.95);
  color: #2b3270;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-btn :deep(svg) {
  font-size: 14px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px -18px rgba(26, 42, 116, 0.55);
}

.action-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 150px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(220, 230, 255, 0.85);
  box-shadow: 0 20px 38px -26px rgba(20, 28, 72, 0.55);
  backdrop-filter: blur(14px);
  padding: 6px;
  z-index: 40;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #202764;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item :deep(svg) {
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(214, 222, 255, 0.6);
}

.menu-item.danger {
  color: #d64545;
}

.menu-item.danger:hover {
  background: rgba(255, 229, 229, 0.9);
  color: #c23b3b;
}

.menu-divider {
  height: 1px;
  margin: 6px 0;
  background: rgba(207, 217, 255, 0.6);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}

.node-children {
  margin-left: 10px;
  padding-left: 5px;
  border-left: 1px dashed rgba(188, 200, 255, 0.6);
}
</style>


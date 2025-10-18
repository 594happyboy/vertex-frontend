<template>
  <div class="tree-node">
    <!-- 分组节点 -->
    <div
      v-if="isGroup"
      class="node-item"
      :class="{ selected: isSelected && !isGroup }"
      @click="handleClick"
    >
      <button class="node-expand" @click.stop="handleToggle">
        <Icon :icon="isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
      </button>
      <Icon class="node-icon" icon="mdi:folder" />
      <span class="node-label">{{ node.name }}</span>
      <div v-if="!readOnly" class="node-actions">
        <button class="action-btn" @click.stop="handleCreateGroup" title="新建子分组">
          <Icon icon="mdi:folder-plus" />
        </button>
        <button class="action-btn" @click.stop="handleCreateDoc" title="新建文档">
          <Icon icon="mdi:file-document-plus" />
        </button>
        <button class="action-btn" @click.stop="handleRename" title="重命名">
          <Icon icon="mdi:pencil" />
        </button>
        <button class="action-btn danger" @click.stop="handleDelete" title="删除">
          <Icon icon="mdi:delete" />
        </button>
      </div>
    </div>

    <!-- 文档节点 -->
    <div
      v-else
      class="node-item node-doc"
      :class="{ selected: isSelected }"
      @click="handleClick"
    >
      <span class="node-spacer"></span>
      <Icon
        class="node-icon"
        :icon="node.type === 'pdf' ? 'mdi:file-pdf-box' : 'mdi:file-document'"
      />
      <span class="node-label">{{ node.name }}</span>
      <span v-if="node.status === 'published'" class="node-badge">已发布</span>
      <div v-if="!readOnly" class="node-actions">
        <button class="action-btn" @click.stop="handleRename" title="重命名">
          <Icon icon="mdi:pencil" />
        </button>
        <button class="action-btn danger" @click.stop="handleDelete" title="删除">
          <Icon icon="mdi:delete" />
        </button>
      </div>
    </div>

    <!-- 子节点（包含子分组和文档） -->
    <div v-if="isGroup && isExpanded && hasChildren" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="`${child.nodeType}-${child.id}`"
        :node="child"
        :selected-id="selectedId"
        :expanded-keys="expandedKeys"
        :read-only="readOnly"
        @select="(node, type) => $emit('select', node, type)"
        @toggle="(id) => $emit('toggle', id)"
        @create-group="(id) => $emit('create-group', id)"
        @create-doc="(id) => $emit('create-doc', id)"
        @rename="(node, type) => $emit('rename', node, type)"
        @delete="(node, type) => $emit('delete', node, type)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  selectedId: {
    type: Number,
    default: null,
  },
  expandedKeys: {
    type: Array,
    default: () => [],
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'select',
  'toggle',
  'create-group',
  'create-doc',
  'rename',
  'delete',
]);

const isGroup = computed(() => props.node.nodeType?.toUpperCase() === 'GROUP');
const isSelected = computed(() => props.node.id === props.selectedId);
const isExpanded = computed(() => props.expandedKeys.includes(props.node.id));
const hasChildren = computed(() => {
  return isGroup.value && props.node.children && props.node.children.length > 0;
});

function handleClick() {
  const type = isGroup.value ? 'group' : 'document';
  emit('select', props.node, type);
}

function handleToggle() {
  emit('toggle', props.node.id);
}

function handleCreateGroup() {
  emit('create-group', props.node.id);
}

function handleCreateDoc() {
  emit('create-doc', props.node.id);
}

function handleRename() {
  const type = isGroup.value ? 'group' : 'document';
  emit('rename', props.node, type);
}

function handleDelete() {
  const type = isGroup.value ? 'group' : 'document';
  emit('delete', props.node, type);
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.node-item:hover {
  background-color: var(--color-bg-hover);
}

.node-item.selected {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.node-expand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.node-icon {
  flex-shrink: 0;
  font-size: 18px;
  color: var(--color-text-secondary);
}

.node-item.selected .node-icon {
  color: var(--color-primary);
}

.node-label {
  flex: 1;
  font-size: var(--text-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-badge {
  padding: 2px 6px;
  background-color: var(--color-success-light);
  color: var(--color-success);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
}

.node-spacer {
  width: 20px;
}

.node-actions {
  display: none;
  align-items: center;
  gap: 2px;
}

.node-item:hover .node-actions {
  display: flex;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  font-size: 14px;
}

.action-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.action-btn.danger:hover {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.node-children {
  margin-left: var(--spacing-lg);
  padding-left: var(--spacing-sm);
  border-left: 1px solid var(--color-border-light);
}

.node-doc {
  padding-left: var(--spacing-sm);
}
</style>


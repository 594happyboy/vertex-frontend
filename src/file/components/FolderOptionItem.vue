<template>
  <div>
    <div 
      class="folder-option"
      :class="{ selected: folder.id === selectedFolderId }"
      :style="{ paddingLeft: (8 + level * 18) + 'px' }"
      @click="$emit('select', folder.id)"
    >
      <Icon icon="mdi:folder" class="folder-icon" :style="{ color: folder.color || '#6076FF' }" />
      <span class="folder-name">{{ folder.name }}</span>
      <span v-if="folder.fileCount > 0" class="file-count">{{ folder.fileCount }}</span>
      <Icon v-if="folder.id === selectedFolderId" icon="mdi:check-circle" class="check-icon" />
    </div>
    
    <template v-if="folder.children && folder.children.length > 0">
      <FolderOptionItem
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :selected-folder-id="selectedFolderId"
        :level="level + 1"
        @select="$emit('select', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  folder: {
    type: Object,
    required: true,
  },
  selectedFolderId: {
    type: Number,
    default: null,
  },
  level: {
    type: Number,
    default: 0,
  },
});

defineEmits(['select']);
</script>

<style scoped>
.folder-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.folder-option:hover {
  background: rgba(96, 118, 255, 0.08);
}

.folder-option.selected {
  background: rgba(96, 118, 255, 0.15);
  font-weight: 600;
}

.folder-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  font-size: 13px;
  color: #1f256a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: rgba(96, 118, 255, 0.12);
  color: #3a54f5;
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.check-icon {
  font-size: 16px;
  color: #4CAF50;
  flex-shrink: 0;
}
</style>


<template>
  <div>
    <div 
      class="folder-option"
      :class="{ selected: folder.id === selectedFolderId }"
      :style="{ paddingLeft: (16 + level * 20) + 'px' }"
      @click="$emit('select', folder.id)"
    >
      <Icon icon="mdi:folder" class="folder-icon" :style="{ color: folder.color || '#6076FF' }" />
      <span>{{ folder.name }}</span>
      <span v-if="folder.fileCount > 0" class="file-count">({{ folder.fileCount }})</span>
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
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(200, 210, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.folder-option:hover {
  background: rgba(96, 118, 255, 0.08);
  border-color: rgba(96, 118, 255, 0.4);
}

.folder-option.selected {
  background: rgba(96, 118, 255, 0.15);
  border-color: rgba(96, 118, 255, 0.6);
  font-weight: 600;
}

.folder-icon {
  font-size: 20px;
  color: #6076FF;
  flex-shrink: 0;
}

.folder-option span {
  flex: 1;
  font-size: 14px;
  color: #1f256a;
}

.file-count {
  font-size: 12px;
  color: rgba(47, 59, 128, 0.6);
}

.check-icon {
  font-size: 20px;
  color: #4CAF50;
  flex-shrink: 0;
}
</style>


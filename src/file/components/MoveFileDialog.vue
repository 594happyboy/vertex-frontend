<template>
  <Teleport to="body">
    <transition name="dialog">
      <div v-if="show" class="dialog-overlay" @click="handleClose">
        <div class="dialog-container" @click.stop>
          <div class="dialog-header">
            <h3>移动文件</h3>
            <button class="btn-close" @click="handleClose">
              <Icon icon="mdi:close" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="selected-files-info">
              <Icon icon="mdi:file-multiple" />
              <span>已选择 {{ fileCount }} 个文件</span>
            </div>

            <div class="folder-selector">
              <div class="selector-label">选择目标文件夹：</div>
              
              <!-- 根目录 -->
              <div 
                class="folder-option"
                :class="{ selected: selectedFolderId === null }"
                @click="selectedFolderId = null"
              >
                <Icon icon="mdi:home" class="folder-icon" />
                <span>全部文件（根目录）</span>
                <Icon v-if="selectedFolderId === null" icon="mdi:check-circle" class="check-icon" />
              </div>

              <!-- 文件夹列表 -->
              <div v-if="folders && folders.length > 0" class="folder-list">
                <FolderOptionItem
                  v-for="folder in folders"
                  :key="folder.id"
                  :folder="folder"
                  :selected-folder-id="selectedFolderId"
                  :level="0"
                  @select="selectedFolderId = $event"
                />
              </div>

              <div v-else class="empty-folders">
                <Icon icon="mdi:folder-outline" />
                <p>暂无文件夹</p>
              </div>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-secondary" @click="handleClose">
              取消
            </button>
            <button class="btn btn-primary" @click="handleSubmit">
              <Icon icon="mdi:folder-move" />
              移动到此处
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import FolderOptionItem from './FolderOptionItem.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  fileCount: {
    type: Number,
    default: 0,
  },
  folders: {
    type: Array,
    default: () => [],
  },
  currentFolderId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['close', 'submit']);

const selectedFolderId = ref(null);

watch(() => props.show, (show) => {
  if (show) {
    selectedFolderId.value = props.currentFolderId;
  }
});

function handleClose() {
  emit('close');
}

function handleSubmit() {
  emit('submit', selectedFolderId.value);
  handleClose();
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 38, 106, 0.5);
  backdrop-filter: blur(8px);
}

.dialog-container {
  width: 90%;
  max-width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 60px rgba(47, 59, 128, 0.3);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.3);
  flex-shrink: 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f256a;
}

.btn-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(96, 118, 255, 0.1);
  color: #1f256a;
}

.btn-close :deep(svg) {
  font-size: 20px;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-files-info {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(96, 118, 255, 0.1);
  color: #1f256a;
  font-size: 14px;
  font-weight: 500;
}

.selected-files-info :deep(svg) {
  font-size: 20px;
  color: #6076FF;
}

.folder-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(47, 59, 128, 0.7);
  padding-left: 2px;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 2px;
}

/* 根目录选项样式 */
.folder-selector > .folder-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.3);
  padding-bottom: 6px;
}

.folder-selector > .folder-option:hover {
  background: rgba(96, 118, 255, 0.08);
}

.folder-selector > .folder-option.selected {
  background: rgba(96, 118, 255, 0.15);
  font-weight: 600;
}

.folder-selector > .folder-option .folder-icon {
  font-size: 18px;
  color: #6076FF;
  flex-shrink: 0;
}

.folder-selector > .folder-option span {
  flex: 1;
  font-size: 13px;
  color: #1f256a;
}

.folder-selector > .folder-option .check-icon {
  font-size: 16px;
  color: #4CAF50;
  flex-shrink: 0;
}

.empty-folders {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  color: rgba(47, 59, 128, 0.5);
}

.empty-folders :deep(svg) {
  font-size: 48px;
  color: rgba(96, 118, 255, 0.3);
}

.empty-folders p {
  margin: 0;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(200, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(200, 210, 255, 0.2);
  color: #1f256a;
}

.btn-secondary:hover {
  background: rgba(200, 210, 255, 0.35);
}

.btn-primary {
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.9), rgba(68, 95, 247, 1));
  color: white;
  font-weight: 600;
}

.btn-primary:hover {
  box-shadow: 0 8px 20px -8px rgba(96, 118, 255, 0.6);
  transform: translateY(-1px);
}

.btn :deep(svg) {
  font-size: 18px;
}

/* 滚动条样式 */
.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
}

.dialog-body::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 3px;
}

.folder-list::-webkit-scrollbar {
  width: 6px;
}

.folder-list::-webkit-scrollbar-track {
  background: rgba(200, 210, 255, 0.1);
  border-radius: 3px;
}

.folder-list::-webkit-scrollbar-thumb {
  background: rgba(96, 118, 255, 0.3);
  border-radius: 3px;
}

.folder-list::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 118, 255, 0.5);
}

/* 动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container,
.dialog-leave-to .dialog-container {
  transform: scale(0.9) translateY(20px);
}
</style>


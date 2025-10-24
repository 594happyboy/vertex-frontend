<template>
  <div class="file-toolbar">
    <!-- 左侧操作 -->
    <div class="toolbar-left">
      <button class="toolbar-btn primary" @click="$emit('create-folder')">
        <Icon icon="mdi:folder-plus" />
        <span>新建文件夹</span>
      </button>

      <label class="toolbar-btn">
        <input
          type="file"
          class="file-input"
          @change="handleFileSelect"
        />
        <Icon icon="mdi:upload" />
        <span>上传文件</span>
      </label>

      <!-- 批量操作（仅在有选中文件时显示） -->
      <template v-if="hasSelection">
        <div class="toolbar-divider"></div>
        
        <button class="toolbar-btn" @click="$emit('batch-move')">
          <Icon icon="mdi:folder-move" />
          <span>移动 ({{ selectionCount }})</span>
        </button>

        <button class="toolbar-btn danger" @click="$emit('batch-delete')">
          <Icon icon="mdi:delete" />
          <span>删除 ({{ selectionCount }})</span>
        </button>
      </template>
    </div>

    <!-- 右侧控制 -->
    <div class="toolbar-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <button class="search-icon" @click="handleSearch">
          <Icon icon="mdi:magnify" />
        </button>
        <input
          v-model="localKeyword"
          type="text"
          placeholder="搜索文件..."
          @keyup.enter="handleSearch"
        />
        <button
          v-if="localKeyword"
          class="clear-btn"
          @click="handleClearKeyword"
        >
          <Icon icon="mdi:close" />
        </button>
      </div>

      <!-- 排序选择器 -->
      <div class="sort-selector">
        <button class="sort-btn" @click="toggleSortDropdown">
          <Icon :icon="sortIcon" />
          <span>{{ sortLabel }}</span>
          <Icon icon="mdi:chevron-down" class="dropdown-icon" />
        </button>
        
        <transition name="dropdown">
          <div v-if="showSortDropdown" class="sort-dropdown">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="sort-option"
              :class="{ active: sortBy === option.value }"
              @click="handleSortChange(option.value)"
            >
              <Icon :icon="option.icon" />
              <span>{{ option.label }}</span>
              <Icon v-if="sortBy === option.value" icon="mdi:check" class="check-icon" />
            </button>
          </div>
        </transition>
      </div>

      <!-- 排序方向 -->
      <button 
        class="toolbar-btn icon-only" 
        :title="order === 'desc' ? '降序' : '升序'"
        @click="$emit('toggle-order')"
      >
        <Icon :icon="order === 'desc' ? 'mdi:sort-descending' : 'mdi:sort-ascending'" />
      </button>

      <!-- 视图切换 -->
      <div class="view-switcher">
        <button
          class="view-btn"
          :class="{ active: viewMode === 'grid' }"
          title="网格视图"
          @click="$emit('set-view-mode', 'grid')"
        >
          <Icon icon="mdi:view-grid" />
        </button>
        <button
          class="view-btn"
          :class="{ active: viewMode === 'list' }"
          title="列表视图"
          @click="$emit('set-view-mode', 'list')"
        >
          <Icon icon="mdi:view-list" />
        </button>
      </div>

      <!-- 刷新 -->
      <button class="toolbar-btn icon-only" title="刷新" @click="$emit('refresh')">
        <Icon icon="mdi:refresh" />
      </button>
    </div>
  </div>

  <!-- 点击外部关闭下拉框 -->
  <div
    v-if="showSortDropdown"
    class="dropdown-overlay"
    @click="showSortDropdown = false"
  ></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
  sortBy: {
    type: String,
    default: 'uploadTime',
  },
  order: {
    type: String,
    default: 'desc',
  },
  viewMode: {
    type: String,
    default: 'grid',
  },
  hasSelection: {
    type: Boolean,
    default: false,
  },
  selectionCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'search',
  'sort-change',
  'toggle-order',
  'set-view-mode',
  'refresh',
  'upload',
  'create-folder',
  'batch-move',
  'batch-delete',
]);

const localKeyword = ref(props.keyword);
const showSortDropdown = ref(false);

const sortOptions = [
  { value: 'uploadTime', label: '上传时间', icon: 'mdi:clock-outline' },
  { value: 'fileName', label: '文件名', icon: 'mdi:sort-alphabetical' },
  { value: 'fileSize', label: '文件大小', icon: 'mdi:file-chart' },
  { value: 'downloadCount', label: '下载次数', icon: 'mdi:download' },
];

const sortLabel = computed(() => {
  return sortOptions.find(opt => opt.value === props.sortBy)?.label || '排序';
});

const sortIcon = computed(() => {
  return sortOptions.find(opt => opt.value === props.sortBy)?.icon || 'mdi:sort';
});

watch(() => props.keyword, (value) => {
  localKeyword.value = value;
});

function handleSearch() {
  emit('search', localKeyword.value);
}

function handleClearKeyword() {
  localKeyword.value = '';
  emit('search', '');
}

function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (file) {
    emit('upload', file);
    event.target.value = '';
  }
}

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value;
}

function handleSortChange(value) {
  emit('sort-change', value);
  showSortDropdown.value = false;
}

function handleKeyDown(event) {
  if (event.key === 'Escape' && showSortDropdown.value) {
    showSortDropdown.value = false;
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
.file-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.toolbar-btn:hover {
  background: rgba(96, 118, 255, 0.08);
  border-color: rgba(96, 118, 255, 0.6);
}

.toolbar-btn.primary {
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.18), rgba(33, 181, 255, 0.14));
  border-color: rgba(96, 118, 255, 0.35);
  font-weight: 600;
}

.toolbar-btn.primary:hover {
  border-color: rgba(96, 118, 255, 0.6);
  box-shadow: 0 8px 16px -10px rgba(96, 118, 255, 0.4);
}

.toolbar-btn.danger {
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.toolbar-btn.danger:hover {
  background: rgba(231, 76, 60, 0.08);
  border-color: rgba(231, 76, 60, 0.5);
}

.toolbar-btn.icon-only {
  padding: 8px;
  min-width: 42px;
  justify-content: center;
}

.toolbar-btn :deep(svg) {
  font-size: 18px;
  flex-shrink: 0;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(200, 210, 255, 0.5);
}

.search-box {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  min-width: 200px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: rgba(96, 118, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(96, 118, 255, 0.1);
}

.search-icon,
.clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  transition: color 0.2s ease;
}

.search-icon:hover,
.clear-btn:hover {
  color: #1f256a;
}

.search-icon :deep(svg),
.clear-btn :deep(svg) {
  font-size: 18px;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #1f256a;
  font-size: 13px;
}

.sort-selector {
  position: relative;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background: rgba(96, 118, 255, 0.08);
  border-color: rgba(96, 118, 255, 0.6);
}

.sort-btn :deep(svg) {
  font-size: 18px;
}

.dropdown-icon {
  font-size: 16px !important;
}

.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 98;
}

.sort-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 99;
  min-width: 180px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(200, 210, 255, 0.4);
  box-shadow: 0 12px 32px rgba(47, 59, 128, 0.15);
}

.sort-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1f256a;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.sort-option:hover {
  background: rgba(96, 118, 255, 0.1);
}

.sort-option.active {
  background: rgba(96, 118, 255, 0.15);
  font-weight: 600;
}

.sort-option :deep(svg) {
  font-size: 16px;
}

.check-icon {
  margin-left: auto;
  color: #4CAF50 !important;
}

.view-switcher {
  display: inline-flex;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
}

.view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:not(:last-child) {
  border-right: 1px solid rgba(200, 210, 255, 0.3);
}

.view-btn:hover {
  background: rgba(96, 118, 255, 0.08);
  color: #1f256a;
}

.view-btn.active {
  background: rgba(96, 118, 255, 0.15);
  color: #1f256a;
}

.view-btn :deep(svg) {
  font-size: 20px;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

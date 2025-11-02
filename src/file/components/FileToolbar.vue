<template>
  <div class="file-toolbar">
    <!-- 左侧操作 -->
    <div class="toolbar-left">
      <!-- PC端完整按钮 -->
      <button class="toolbar-btn primary desktop-only" @click="$emit('create-folder')">
        <Icon icon="mdi:folder-plus" />
        <span>新建文件夹</span>
      </button>

      <label class="toolbar-btn desktop-only">
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
        <div class="toolbar-divider desktop-only"></div>
        
        <button class="toolbar-btn desktop-only" @click="$emit('batch-move')">
          <Icon icon="mdi:folder-move" />
          <span>移动 ({{ selectionCount }})</span>
        </button>

        <button class="toolbar-btn danger desktop-only" @click="$emit('batch-delete')">
          <Icon icon="mdi:delete" />
          <span>删除 ({{ selectionCount }})</span>
        </button>
      </template>

      <!-- 移动端"更多"菜单 -->
      <div class="more-menu mobile-only">
        <button class="toolbar-btn" @click="toggleMoreMenu">
          <Icon icon="mdi:dots-vertical" />
          <span>更多</span>
        </button>

        <transition name="dropdown">
          <div v-if="showMoreMenu" class="more-dropdown">
            <button class="dropdown-item" @click="handleMoreAction('create-folder')">
              <Icon icon="mdi:folder-plus" />
              <span>新建文件夹</span>
            </button>

            <button class="dropdown-item" @click="handleMoreAction('upload')">
              <Icon icon="mdi:upload" />
              <span>上传文件</span>
              <input
                ref="mobileFileInput"
                type="file"
                class="file-input"
                @change="handleFileSelect"
              />
            </button>

            <template v-if="hasSelection">
              <div class="dropdown-divider"></div>

              <button class="dropdown-item" @click="handleMoreAction('batch-move')">
                <Icon icon="mdi:folder-move" />
                <span>移动 ({{ selectionCount }})</span>
              </button>

              <button class="dropdown-item danger" @click="handleMoreAction('batch-delete')">
                <Icon icon="mdi:delete" />
                <span>删除 ({{ selectionCount }})</span>
              </button>
            </template>
          </div>
        </transition>
      </div>
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

      <!-- 排序选择器 (仅PC端显示) -->
      <div class="sort-selector desktop-only">
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

      <!-- 排序方向 (仅PC端显示) -->
      <button 
        class="toolbar-btn icon-only desktop-only" 
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

      <!-- 刷新 (仅PC端显示) -->
      <button class="toolbar-btn icon-only desktop-only" title="刷新" @click="$emit('refresh')">
        <Icon icon="mdi:refresh" />
      </button>
    </div>
  </div>

  <!-- 点击外部关闭下拉框 -->
  <div
    v-if="showSortDropdown || showMoreMenu"
    class="dropdown-overlay"
    @click="closeAllDropdowns"
  ></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';

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

// 响应式检测
const { isMobile } = useResponsive();

const localKeyword = ref(props.keyword);
const showSortDropdown = ref(false);
const showMoreMenu = ref(false);
const mobileFileInput = ref(null);

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
  showMoreMenu.value = false;
  showSortDropdown.value = !showSortDropdown.value;
}

function toggleMoreMenu() {
  showSortDropdown.value = false;
  showMoreMenu.value = !showMoreMenu.value;
}

function closeAllDropdowns() {
  showSortDropdown.value = false;
  showMoreMenu.value = false;
}

function handleSortChange(value) {
  emit('sort-change', value);
  showSortDropdown.value = false;
}

function handleMoreAction(action) {
  showMoreMenu.value = false;
  
  switch (action) {
    case 'create-folder':
      emit('create-folder');
      break;
    case 'upload':
      // 触发隐藏的文件输入框
      if (mobileFileInput.value) {
        mobileFileInput.value.click();
      }
      break;
    case 'batch-move':
      emit('batch-move');
      break;
    case 'batch-delete':
      emit('batch-delete');
      break;
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeAllDropdowns();
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
/* ========== 布局 ========== */
.file-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .file-toolbar {
    gap: var(--spacing-mobile-sm);
  }
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .toolbar-left,
  .toolbar-right {
    gap: var(--spacing-mobile-sm);
  }
}

/* ========== 按钮样式 ========== */
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
}

.toolbar-btn:hover {
  background: var(--color-primary-lighter);
  border-color: var(--color-border-hover);
}

.toolbar-btn.primary {
  background: var(--gradient-primary);
  border-color: var(--color-border-hover);
  font-weight: var(--font-weight-semibold);
}

.toolbar-btn.primary:hover {
  border-color: var(--color-border-active);
  box-shadow: var(--shadow-primary);
}

.toolbar-btn.danger {
  color: var(--color-danger);
  border-color: var(--color-danger-light);
}

.toolbar-btn.danger:hover {
  background: var(--color-danger-lighter);
  border-color: var(--color-danger);
}

.toolbar-btn.icon-only {
  padding: var(--spacing-xs);
  min-width: var(--btn-height-md);
  justify-content: center;
}

.toolbar-btn :deep(svg) {
  font-size: var(--icon-size-md);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .toolbar-btn {
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-md);
    font-size: var(--font-size-mobile-base);
  }
  
  .toolbar-btn.icon-only {
    padding: var(--spacing-mobile-sm);
    min-width: var(--touch-target-min);
  }
  
  .toolbar-btn :deep(svg) {
    font-size: var(--icon-size-mobile-md);
  }
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* ========== 分隔线 ========== */
.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
}

/* ========== 搜索框 ========== */
.search-box {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-bg-primary);
  min-width: 200px;
  transition: var(--transition-base);
}

.search-box:focus-within {
  border-color: var(--color-border-active);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

@media (max-width: 768px) {
  .search-box {
    flex: 1;
    min-width: 0;
    padding: var(--spacing-mobile-sm) var(--spacing-sm);
  }
  
  .search-box input {
    font-size: var(--font-size-mobile-base) !important;
  }
}

.search-icon,
.clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.search-icon:hover,
.clear-btn:hover {
  color: var(--color-text-primary);
}

.search-icon :deep(svg),
.clear-btn :deep(svg) {
  font-size: var(--icon-size-md);
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

/* ========== 排序选择器 ========== */
.sort-selector {
  position: relative;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
}

.sort-btn:hover {
  background: var(--color-primary-lighter);
  border-color: var(--color-border-hover);
}

.sort-btn :deep(svg) {
  font-size: var(--icon-size-md);
}

.dropdown-icon {
  font-size: var(--icon-size-sm) !important;
}

.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 98;
}

/* ========== 下拉菜单 ========== */
.sort-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  z-index: 99;
  min-width: 180px;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-elevated);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-xl);
}

.sort-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
}

.sort-option:hover {
  background: var(--color-primary-light);
}

.sort-option.active {
  background: var(--color-primary-light);
  font-weight: var(--font-weight-semibold);
}

.sort-option :deep(svg) {
  font-size: var(--icon-size-sm);
}

.check-icon {
  margin-left: auto;
  color: var(--color-success) !important;
}

/* ========== 视图切换 ========== */
.view-switcher {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: var(--color-bg-primary);
}

.view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.view-btn:not(:last-child) {
  border-right: 1px solid var(--color-border-light);
}

.view-btn:hover {
  background: var(--color-primary-lighter);
  color: var(--color-text-primary);
}

.view-btn.active {
  background: var(--color-primary-light);
  color: var(--color-text-primary);
}

.view-btn :deep(svg) {
  font-size: var(--icon-size-lg);
}

@media (max-width: 768px) {
  .view-btn {
    padding: var(--spacing-mobile-sm);
  }
  
  .view-btn :deep(svg) {
    font-size: var(--icon-size-mobile-lg);
  }
}

/* ========== 移动端更多菜单 ========== */
.more-menu {
  position: relative;
}

.more-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  z-index: 99;
  min-width: 200px;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-xl);
  background: var(--color-bg-elevated);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-xl);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
  position: relative;
}

.dropdown-item:hover {
  background: var(--color-primary-light);
}

.dropdown-item.danger {
  color: var(--color-danger);
}

.dropdown-item.danger:hover {
  background: var(--color-danger-lighter);
}

.dropdown-item :deep(svg) {
  font-size: var(--icon-size-md);
}

.dropdown-divider {
  height: 1px;
  margin: var(--spacing-2xs) 0;
  background: var(--color-border-light);
}

/* ========== 动画 ========== */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

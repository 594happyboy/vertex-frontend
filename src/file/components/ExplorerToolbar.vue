<template>
  <div class="explorer-toolbar">
    <!-- 左侧: 搜索 -->
    <div class="toolbar-left">
      <div class="search-box">
        <Icon icon="mdi:magnify" class="search-icon" />
        <input
          v-model="searchInput"
          type="text"
          placeholder="搜索文件或文件夹..."
          class="search-input"
          @input="handleSearchInput"
        />
        <Icon
          v-if="searchInput"
          icon="mdi:close-circle"
          class="clear-icon"
          @click="clearSearch"
        />
      </div>
    </div>

    <!-- 右侧: 工具按钮 -->
    <div class="toolbar-right">
      <!-- 排序 -->
      <div class="toolbar-group sort-group">
        <button
          class="toolbar-button"
          :class="{ active: sortBy === 'name' }"
          title="按名称排序"
          @click="$emit('sort-change', 'name')"
        >
          <Icon icon="mdi:sort-alphabetical" />
        </button>
        <button
          class="toolbar-button"
          :class="{ active: sortBy === 'size' }"
          title="按大小排序"
          @click="$emit('sort-change', 'size')"
        >
          <Icon icon="mdi:sort-numeric" />
        </button>
        <button
          class="toolbar-button"
          :class="{ active: sortBy === 'updatedAt' }"
          title="按时间排序"
          @click="$emit('sort-change', 'updatedAt')"
        >
          <Icon icon="mdi:sort-calendar" />
        </button>
        <button
          class="toolbar-button sort-order"
          :title="order === 'asc' ? '升序' : '降序'"
          @click="$emit('toggle-order')"
        >
          <Icon :icon="order === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'" />
        </button>
      </div>

      <!-- 视图切换 -->
      <div class="toolbar-group view-group">
        <button
          class="toolbar-button"
          :class="{ active: viewMode === 'grid' }"
          title="网格视图"
          @click="$emit('set-view-mode', 'grid')"
        >
          <Icon icon="mdi:view-grid" />
        </button>
        <button
          class="toolbar-button"
          :class="{ active: viewMode === 'list' }"
          title="列表视图"
          @click="$emit('set-view-mode', 'list')"
        >
          <Icon icon="mdi:view-list" />
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar-group actions-group">
        <button
          class="toolbar-button"
          title="刷新"
          @click="$emit('refresh')"
        >
          <Icon icon="mdi:refresh" />
        </button>
        <button
          class="toolbar-button primary"
          title="上传文件"
          @click="triggerFileUpload"
        >
          <Icon icon="mdi:upload" />
          <span class="button-text">上传</span>
        </button>
        <button
          class="toolbar-button primary"
          title="新建文件夹"
          @click="$emit('create-folder')"
        >
          <Icon icon="mdi:folder-plus" />
          <span class="button-text">新建</span>
        </button>
      </div>

      <!-- 批量操作 (有选中项时显示) -->
      <div v-if="hasSelection" class="toolbar-group batch-group">
        <div class="selection-info">
          已选择 <strong>{{ selectionCount }}</strong> 项
        </div>
        <button
          class="toolbar-button"
          title="移动"
          @click="$emit('batch-move')"
        >
          <Icon icon="mdi:folder-move" />
        </button>
        <button
          class="toolbar-button danger"
          title="删除"
          @click="$emit('batch-delete')"
        >
          <Icon icon="mdi:delete" />
        </button>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        class="toolbar-button mobile-menu-btn"
        title="更多"
        @click="toggleMobileMenu"
      >
        <Icon icon="mdi:dots-vertical" />
      </button>
    </div>

    <!-- 隐藏的文件上传input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 移动端菜单 -->
    <transition name="slide-fade">
      <div v-if="showMobileMenu" class="mobile-menu">
        <button class="mobile-menu-item" @click="handleMobileAction('upload')">
          <Icon icon="mdi:upload" />
          <span>上传文件</span>
        </button>
        <button class="mobile-menu-item" @click="handleMobileAction('create-folder')">
          <Icon icon="mdi:folder-plus" />
          <span>新建文件夹</span>
        </button>
        <button class="mobile-menu-item" @click="handleMobileAction('refresh')">
          <Icon icon="mdi:refresh" />
          <span>刷新</span>
        </button>
        <div v-if="hasSelection" class="mobile-menu-divider"></div>
        <button
          v-if="hasSelection"
          class="mobile-menu-item"
          @click="handleMobileAction('batch-move')"
        >
          <Icon icon="mdi:folder-move" />
          <span>移动 ({{ selectionCount }})</span>
        </button>
        <button
          v-if="hasSelection"
          class="mobile-menu-item danger"
          @click="handleMobileAction('batch-delete')"
        >
          <Icon icon="mdi:delete" />
          <span>删除 ({{ selectionCount }})</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  /** 搜索关键词 */
  keyword: {
    type: String,
    default: '',
  },
  /** 排序字段 */
  sortBy: {
    type: String,
    default: 'name',
  },
  /** 排序顺序 */
  order: {
    type: String,
    default: 'asc',
  },
  /** 视图模式 */
  viewMode: {
    type: String,
    default: 'grid',
  },
  /** 是否有选中项 */
  hasSelection: {
    type: Boolean,
    default: false,
  },
  /** 选中项数量 */
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

// 搜索输入
const searchInput = ref(props.keyword);

// 文件上传input引用
const fileInput = ref(null);

// 移动端菜单
const showMobileMenu = ref(false);

/**
 * 处理搜索输入
 */
const handleSearchInput = useDebounceFn(() => {
  emit('search', searchInput.value);
}, 300);

/**
 * 清除搜索
 */
function clearSearch() {
  searchInput.value = '';
  emit('search', '');
}

/**
 * 触发文件上传
 */
function triggerFileUpload() {
  fileInput.value?.click();
}

/**
 * 处理文件选择
 */
function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  
  for (const file of files) {
    emit('upload', file);
  }
  
  // 清空input,允许重复上传同一文件
  event.target.value = '';
}

/**
 * 切换移动端菜单
 */
function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
}

/**
 * 处理移动端菜单操作
 */
function handleMobileAction(action) {
  showMobileMenu.value = false;
  
  switch (action) {
    case 'upload':
      triggerFileUpload();
      break;
    case 'create-folder':
      emit('create-folder');
      break;
    case 'refresh':
      emit('refresh');
      break;
    case 'batch-move':
      emit('batch-move');
      break;
    case 'batch-delete':
      emit('batch-delete');
      break;
  }
}
</script>

<style scoped>
.explorer-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-2xs) var(--spacing-md);
  border-bottom: 1px solid rgba(200, 210, 255, 0.2);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

/* ========== 左侧: 搜索 ========== */
.toolbar-left {
  flex: 1;
  max-width: 400px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-sm);
  border-radius: 10px;
  border: 1px solid rgba(200, 210, 255, 1);
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: rgba(96, 118, 255, 0.7);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(96, 118, 255, 0.1);
}

.search-icon {
  font-size: 20px;
  color: rgba(96, 118, 255, 0.5);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: var(--spacing-xs) 0;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #1f256a;
  outline: none;
}

.search-input::placeholder {
  color: rgba(96, 118, 255, 0.4);
}

.clear-icon {
  font-size: 18px;
  color: rgba(96, 118, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.clear-icon:hover {
  color: rgba(96, 118, 255, 0.8);
}

/* ========== 右侧: 工具按钮 ========== */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-2xs);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
}

.toolbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-mobile-xs);
  padding: var(--padding-component-sm);
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(96, 118, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-button:hover {
  background: rgba(96, 118, 255, 0.1);
  color: rgba(96, 118, 255, 1);
}

.toolbar-button.active {
  background: rgba(96, 118, 255, 0.15);
  color: rgba(96, 118, 255, 1);
  font-weight: 600;
}

.toolbar-button.primary {
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.15), rgba(33, 181, 255, 0.12));
  border: 1px solid rgba(96, 118, 255, 0.3);
  color: rgba(96, 118, 255, 0.9);
}

.toolbar-button.primary:hover {
  border-color: rgba(96, 118, 255, 0.5);
  box-shadow: 0 4px 12px rgba(96, 118, 255, 0.2);
  transform: translateY(-1px);
}

.toolbar-button.danger {
  color: rgba(231, 76, 60, 0.8);
}

.toolbar-button.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  color: rgba(231, 76, 60, 1);
}

.toolbar-button :deep(svg) {
  font-size: 18px;
}

.button-text {
  font-size: 13px;
}

/* 批量操作 */
.batch-group {
  background: rgba(96, 118, 255, 0.08);
  border: 1px solid rgba(96, 118, 255, 0.2);
}

.selection-info {
  padding: 0 8px;
  font-size: 12px;
  color: rgba(96, 118, 255, 0.8);
}

.selection-info strong {
  color: rgba(96, 118, 255, 1);
  font-weight: 700;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
}

/* 移动端菜单 */
.mobile-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: var(--spacing-md);
  z-index: 100;
  min-width: 200px;
  padding: var(--spacing-xs);
  border-radius: 12px;
  border: 1px solid rgba(200, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--padding-component-md);
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #1f256a;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-menu-item:hover {
  background: rgba(96, 118, 255, 0.1);
}

.mobile-menu-item.danger {
  color: rgba(231, 76, 60, 0.9);
}

.mobile-menu-item.danger:hover {
  background: rgba(231, 76, 60, 0.1);
}

.mobile-menu-item :deep(svg) {
  font-size: 20px;
}

.mobile-menu-divider {
  height: 1px;
  margin: var(--spacing-xs) 0;
  background: rgba(200, 210, 255, 0.2);
}

/* 动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .button-text {
    display: none;
  }
  
  .toolbar-button {
    padding: var(--spacing-xs);
  }
}

@media (max-width: 768px) {
  .explorer-toolbar {
    padding: var(--spacing-mobile-2xs) var(--spacing-mobile-md);
    gap: var(--spacing-sm);
  }
  
  .toolbar-left {
    flex: 1;
    max-width: none;
  }
  
  .search-box {
    padding: 0 var(--spacing-mobile-sm);
  }
  
  .search-input {
    padding: var(--spacing-mobile-xs) 0;
    font-size: 12px;
  }
  
  /* 隐藏桌面版按钮 */
  .sort-group,
  .view-group,
  .actions-group,
  .batch-group {
    display: none;
  }
  
  /* 显示移动端菜单按钮 */
  .mobile-menu-btn {
    display: inline-flex;
  }
}
</style>


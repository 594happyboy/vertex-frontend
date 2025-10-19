<template>
  <div class="admin-view">
    <!-- 顶部栏 -->
    <header class="admin-header">
      <div class="header-left">
        <button class="btn-icon" @click="toggleSidebar" title="切换侧边栏">
          <Icon icon="mdi:menu" />
        </button>
        <h1 class="app-title">小男孩的空间</h1>
      </div>

      <div class="header-center">
        <div class="search-box">
          <Icon icon="mdi:magnify" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索文档..."
            @input="handleSearch"
          />
        </div>
      </div>

      <div class="header-right">
        <button class="btn-icon" @click="handleCreateNew" title="新建">
          <Icon icon="mdi:plus" />
        </button>
        <button class="btn-icon" @click="toggleTheme" title="切换主题">
          <Icon :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'" />
        </button>
        <div class="user-menu">
          <button class="btn-user" @click="toggleUserMenu">
            <span>{{ currentUsername }}</span>
            <Icon icon="mdi:chevron-down" />
          </button>
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-info">
              <div class="user-name">{{ currentUsername }}</div>
              <div class="user-role">管理员</div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="handleLogout">
              <Icon icon="mdi:logout" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="admin-body">
      <!-- 左侧目录树 -->
      <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <DocTree ref="docTreeRef"/>
      </aside>

      <!-- 右侧内容区 -->
      <main class="admin-content">
        <DocWorkspace />
      </main>
    </div>

    <!-- 新建对话框 -->
    <CreateDialog v-if="showCreateDialog" @close="showCreateDialog = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '../stores/auth';
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';
import DocTree from '../components/DocTree.vue';
import DocWorkspace from '../components/DocWorkspace.vue';
import CreateDialog from '../components/CreateDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

const searchKeyword = ref('');
const showUserMenu = ref(false);
const showCreateDialog = ref(false);

const currentUsername = computed(() => authStore.user?.username || '用户');
const isDark = computed(() => uiStore.isDark);
const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

// 加载初始数据
onMounted(async () => {
  try {
    await treeStore.fetchTree();
  } catch (error) {
    uiStore.showError('加载数据失败');
  }
});

// 搜索文档
function handleSearch() {
  docStore.setSearchKeyword(searchKeyword.value);
}

// 新建
function handleCreateNew() {
  showCreateDialog.value = true;
}

// 切换主题
function toggleTheme() {
  uiStore.toggleTheme();
}

// 切换侧边栏
function toggleSidebar() {
  uiStore.toggleSidebar();
}

// 切换用户菜单
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

// 退出登录
function handleLogout() {
  authStore.logout();
  uiStore.showInfo('已退出登录');
  router.push('/login');
}

// 点击外部关闭用户菜单
function handleClickOutside(event) {
  const userMenu = event.target.closest('.user-menu');
  if (!userMenu && showUserMenu.value) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.admin-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 顶部栏 */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 var(--spacing-lg);
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-center {
  flex: 1;
  max-width: 600px;
  margin: 0 var(--spacing-lg);
}

.app-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  font-size: 20px;
}

.btn-icon:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-icon:disabled {
  opacity: 0.4;
}

/* 用户菜单 */
.user-menu {
  position: relative;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.btn-user:hover {
  background-color: var(--color-bg-hover);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  min-width: 200px;
  padding: var(--spacing-sm);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.user-info {
  padding: var(--spacing-sm);
}

.user-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-role {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.dropdown-divider {
  height: 1px;
  margin: var(--spacing-sm) 0;
  background-color: var(--color-border);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--color-bg-hover);
}

/* 主体区域 */
.admin-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-sidebar {
  width: 280px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow: hidden;
  transition: width var(--transition-base);
  flex-shrink: 0;
}

.admin-sidebar.collapsed {
  width: 0;
  border-right: none;
}

.admin-content {
  flex: 1;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}
</style>


<template>
  <div class="main-layout">
    <!-- 顶部主导航 -->
    <header class="main-header">
      <div class="header-primary">
        <button class="btn-icon" @click="toggleSidebar" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <Icon :icon="sidebarCollapsed ? 'mdi:menu-open' : 'mdi:menu'" />
        </button>
        <div class="brand">
          <Icon icon="mdi:star-circle-outline" class="brand__icon" />
          <div class="brand__text">
            <span class="brand__eyebrow">Vertex Studio</span>
            <h1 class="brand__title">小男孩的空间</h1>
          </div>
        </div>
      </div>

      <!-- 主导航菜单 -->
      <nav class="main-nav">
        <button 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          :class="{ 'is-active': isNavItemActive(item) }"
          @click="navigateTo(item.path)"
        >
          <Icon :icon="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </nav>

      <!-- 占位空间，让右侧按钮靠右 -->
      <div class="header-spacer"></div>

      <div class="header-actions">
        <button class="btn-ghost" @click="toggleTheme" title="切换主题">
          <Icon :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'" />
        </button>
        <div class="user-menu">
          <button class="btn-user" @click="toggleUserMenu">
            <span class="user-avatar">{{ avatarInitial }}</span>
            <span class="user-name">{{ currentUsername }}</span>
            <Icon icon="mdi:chevron-down" />
          </button>
          <transition name="fade-scale">
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="user-card">
                <div class="user-card__avatar">{{ avatarInitial }}</div>
                <div>
                  <div class="user-card__name">{{ currentUsername }}</div>
                  <div class="user-card__role">Vertex 控制台</div>
                </div>
              </div>
              <button class="dropdown-item" @click="handleLogout">
                <Icon icon="mdi:logout" />
                <span>退出登录</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <!-- 内容区域（由子路由决定） -->
    <main class="main-body">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();

const showUserMenu = ref(false);

// 导航菜单项配置
const navItems = ref([
  {
    path: '/me',
    label: '知识库',
    icon: 'mdi:file-document-multiple-outline',
    badge: null,
    // 自定义激活匹配规则：知识库在 /me 或 /me/doc/:id 时激活
    isActiveWhen: (currentPath) => {
      return currentPath === '/me' || currentPath.startsWith('/me/doc/');
    },
  },
  {
    path: '/me/files',
    label: '文件库',
    icon: 'mdi:folder-star-multiple-outline',
    badge: null,
    // 自定义激活匹配规则：文件库在 /me/files 时激活
    isActiveWhen: (currentPath) => {
      return currentPath.startsWith('/me/files');
    },
  },
  // 未来扩展示例：
  // {
  //   path: '/me/stats',
  //   label: '数据统计',
  //   icon: 'mdi:chart-line',
  //   badge: null,
  //   isActiveWhen: (currentPath) => currentPath.startsWith('/me/stats'),
  // },
  // {
  //   path: '/me/settings',
  //   label: '设置',
  //   icon: 'mdi:cog-outline',
  //   badge: null,
  //   isActiveWhen: (currentPath) => currentPath.startsWith('/me/settings'),
  // },
]);

const currentUsername = computed(() => authStore.user?.username || '用户');
const avatarInitial = computed(() => currentUsername.value.slice(0, 1).toUpperCase());
const isDark = computed(() => uiStore.isDark);
const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

// 判断导航项是否激活
function isNavItemActive(item) {
  const currentPath = route.path;
  if (item.isActiveWhen) {
    return item.isActiveWhen(currentPath);
  }
  // 默认精确匹配
  return currentPath === item.path;
}

// 导航到指定路径
function navigateTo(path) {
  router.push(path);
}

function toggleTheme() {
  uiStore.toggleTheme();
}

function toggleSidebar() {
  uiStore.toggleSidebar();
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function handleLogout() {
  authStore.logout();
  uiStore.showInfo('已退出登录');
  router.push('/login');
}

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
.main-layout {
  width: 100%;
  min-width: 1000px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, rgba(67, 90, 255, 0.18), rgba(37, 203, 255, 0.14));
}

.main-header {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(180px, auto) auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(140deg, rgba(58, 84, 245, 0.96), rgba(21, 37, 117, 0.88));
  color: #f6f8ff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(10, 26, 128, 0.3);
  flex-shrink: 0;
}

.main-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(180px 180px at 88% 12%, rgba(255, 255, 255, 0.28), transparent 70%),
    radial-gradient(220px 220px at 12% 90%, rgba(114, 162, 255, 0.32), transparent 80%);
  opacity: 0.85;
  pointer-events: none;
}

.header-primary,
.main-nav,
.header-actions {
  position: relative;
  z-index: 1;
}

/* 品牌区域 */
.header-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand__icon {
  font-size: 18px;
  background: rgba(255, 255, 255, 0.16);
  padding: 6px;
  border-radius: 9px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.brand__eyebrow {
  font-size: 8px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
}

.brand__title {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}

/* 主导航 */
.main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.nav-item :deep(svg) {
  font-size: 15px;
  transition: transform 0.25s ease;
}

.nav-item:hover:not(.is-active) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.nav-item.is-active {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 600;
  box-shadow: 
    0 10px 24px -18px rgba(59, 94, 211, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.nav-item.is-active :deep(svg) {
  transform: scale(1.1);
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: rgba(255, 90, 95, 0.9);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

/* 右侧操作区 */
.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.24);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.16);
  color: #f6f8ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.24);
}

.btn-ghost :deep(svg) {
  font-size: 16px;
}

/* 用户菜单 */
.user-menu {
  position: relative;
}

.btn-user {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-user:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.18);
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.18);
  font-weight: 600;
  font-size: 11px;
}

.user-name {
  font-size: 12px;
  font-weight: 600;
}

.btn-user :deep(svg) {
  font-size: 14px;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 180px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 36px -24px rgba(14, 22, 72, 0.58);
  border: 1px solid rgba(225, 233, 255, 0.8);
  backdrop-filter: blur(18px);
  z-index: 100;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(91, 122, 255, 0.2), rgba(32, 183, 255, 0.18));
  color: #25308f;
  font-weight: 700;
  font-size: 13px;
}

.user-card__name {
  font-weight: 600;
  color: #1c2466;
  font-size: 13px;
}

.user-card__role {
  font-size: 11px;
  color: rgba(28, 36, 110, 0.55);
  margin-top: 3px;
}

.dropdown-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(204, 212, 255, 0.65);
  background: rgba(255, 255, 255, 0.85);
  color: #222a68;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  border-color: rgba(255, 110, 110, 0.65);
  color: #d44848;
  background: rgba(255, 235, 235, 0.9);
}

.dropdown-item :deep(svg) {
  font-size: 16px;
}

/* 内容区域 */
.main-body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>


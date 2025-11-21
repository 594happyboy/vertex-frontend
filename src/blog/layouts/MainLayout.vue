<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 左侧模块栏 -->
    <aside class="shell-aside">
      <div class="shell-brand">
        <Icon icon="mdi:star-circle" class="brand-icon" />
        <div class="brand-text">
          <span class="brand-eyebrow">Vertex Studio</span>
          <span class="brand-title">小男孩的空间</span>
        </div>
      </div>

      <nav class="module-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="module-nav-item"
          :class="{ 'is-active': isNavItemActive(item) }"
          @click="navigateTo(item.path)"
        >
          <Icon :icon="item.icon" />
          <span class="label">{{ item.label }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </button>
      </nav>

      <div class="shell-aside-footer">
        <button class="btn-icon ghost" @click="toggleTheme" title="切换主题">
          <Icon :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'" />
        </button>
      </div>
    </aside>

    <div class="shell-body">
      <!-- 顶部工作栏 -->
      <header v-if="showHeader" class="shell-header">
        <div class="header-left">
          <button class="btn-icon ghost" @click="toggleSidebar" title="展开/收起模块栏">
            <Icon :icon="sidebarCollapsed ? 'mdi:menu-open' : 'mdi:menu'" />
          </button>

          <div class="header-context">
            <div class="context-title">
              <h1>{{ currentModuleTitle }}</h1>
              <p class="context-breadcrumb">{{ currentBreadcrumb }}</p>
            </div>
          </div>
        </div>

        <!-- 占位符，确保 header 布局平衡 -->
        <div class="header-spacer"></div>

        <div class="header-actions">
          <div class="user-menu">
            <button class="btn-user" @click="toggleUserMenu">
              <span class="user-avatar">{{ avatarInitial }}</span>
              <span class="user-name">{{ currentUsername }}</span>
              <Icon icon="mdi:chevron-down" />
            </button>
            <transition name="fade-scale">
              <div v-if="showUserMenu" class="user-menu-wrapper" @click.self="showUserMenu = false">
                <div class="user-dropdown" @click.stop>
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
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- 内容区域（由子路由决定） -->
      <main class="shell-content">
        <RouterView />
      </main>
    </div>

    <!-- 移动端底部导航栏 -->
    <nav v-if="showBottomNav" class="bottom-nav">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="bottom-nav-item"
        :class="{ 'is-active': isNavItemActive(item) }"
        @click="navigateTo(item.path)"
      >
        <Icon :icon="item.icon" />
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="bottom-nav-badge">{{ item.badge }}</span>
      </button>
    </nav>

    <!-- Loading 对话框 -->
    <LoadingDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import LoadingDialog from '../components/LoadingDialog.vue';

const { isMobile } = useResponsive();
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

const currentModuleTitle = computed(() => {
  const currentPath = route.path;
  if (currentPath.startsWith('/me/files')) {
    return '文件库';
  }
  return '知识库';
});

const currentBreadcrumb = computed(() => {
  const currentPath = route.path;
  if (currentPath.startsWith('/me/doc/')) {
    return '知识库 · 文档编辑';
  }
  if (currentPath.startsWith('/me/files')) {
    return '文件库 · 管理与上传';
  }
  return '知识库 · 智能文档树';
});

// 控制导航显示/隐藏
const showHeader = computed(() => {
  // 桌面端始终显示
  if (!isMobile.value) return true;
  // 移动端根据状态
  return uiStore.navigationVisible;
});

const showBottomNav = computed(() => {
  // 桌面端不显示底部导航
  if (!isMobile.value) return false;
  // 移动端根据状态
  return uiStore.navigationVisible;
});

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

async function handleLogout() {
  await authStore.logout();
  uiStore.showInfo('已退出登录');
  router.push('/login');
}

function handleClickOutside(event) {
  // PC端点击外部关闭
  if (window.innerWidth > 768) {
    const userMenu = event.target.closest('.user-menu');
    if (!userMenu && showUserMenu.value) {
      showUserMenu.value = false;
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  uiStore.initSidebar();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
:global(:root) {
  --shell-aside-width: 96px;
  --shell-aside-collapsed-width: 72px;
  --shell-header-height: 72px;
  --shell-padding: 24px;
}

.app-shell {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: var(--shell-aside-width) 1fr;
  background: #fdf8f1;
  color: #2f1b0c;
}

.app-shell.sidebar-collapsed {
  grid-template-columns: var(--shell-aside-collapsed-width) 1fr;
}

.shell-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px 12px 16px;
  background: linear-gradient(180deg, #2d2035 0%, #1a131f 100%);
  color: #fdf5ec;
  overflow: hidden;
}

.shell-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px;
  min-height: 48px;
}

.brand-icon {
  font-size: 28px;
  color: #ffc482;
  filter: drop-shadow(0 0 8px rgba(255, 196, 130, 0.4));
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.brand-eyebrow {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.6;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
}

.app-shell.sidebar-collapsed .brand-text {
  display: none;
}

.module-nav {
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  gap: 10px;
  flex: 1;
}

.module-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 10px;
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.25s ease;
}

.module-nav-item .label {
  font-size: 12px;
}

.app-shell.sidebar-collapsed .module-nav-item .label {
  display: none;
}

.module-nav-item .badge {
  position: absolute;
  top: 8px;
  right: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 14px;
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
}

.module-nav-item.is-active {
  background: linear-gradient(135deg, rgba(242, 143, 59, 0.4), rgba(255, 107, 107, 0.2));
  color: #fff;
  box-shadow: 0 8px 24px -4px rgba(242, 143, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shell-aside-footer {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-icon:hover {
  transform: translateY(-1px);
}

/* Header toggle button custom size */
.header-left .btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(47, 27, 12, 0.04);
  border: none;
  color: rgba(47, 27, 12, 0.7);
}

.header-left .btn-icon:hover {
  background: rgba(47, 27, 12, 0.08);
  color: #2f1b0c;
}

.shell-body {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fdf8f1;
}

.shell-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 12px 24px;
  backdrop-filter: blur(12px);
  background: rgba(253, 248, 241, 0.85);
  box-shadow: 0 1px 2px rgba(47, 27, 12, 0.03), 0 4px 24px rgba(47, 27, 12, 0.02);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-context {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.context-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.context-title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.context-breadcrumb {
  margin: 0;
  font-size: 12px;
  color: rgba(47, 27, 12, 0.65);
}

.header-spacer {
  flex: 1;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.btn-user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(47, 27, 12, 0.08);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2f1b0c;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-menu-wrapper {
  position: fixed;
  inset: 0;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 80px 24px 24px;
}

.user-dropdown {
  width: 260px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
  padding: 18px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(47, 27, 12, 0.08);
  margin-bottom: 12px;
}

.user-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(242, 143, 59, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.dropdown-item {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(242, 143, 59, 0.08);
}

.shell-content {
  flex: 1;
  height: calc(100vh - var(--shell-header-height));
  overflow: auto;
  
  /* 内容区圆角容器化，使其看起来更柔和 */
  border-radius: 24px 24px;
  background: #fff; /* 确保背景色独立 */
  box-shadow: -4px -4px 24px rgba(47, 27, 12, 0.03); /* 增加柔和投影 */
  margin: 12px;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px;
  background: #fff;
  border-top: 1px solid rgba(47, 27, 12, 0.08);
}

.bottom-nav-item {
  flex: 1;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border: none;
  background: transparent;
}

.bottom-nav-item.is-active {
  color: #f28f3b;
}

.bottom-nav-badge {
  min-width: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ff6b6b;
  color: #fff;
  font-size: 11px;
}

@media (max-width: 1024px) {
  .shell-header {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
  }

  .header-search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .shell-aside {
    position: fixed;
    z-index: 20;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 240px;
  }

  .app-shell.sidebar-collapsed .shell-aside {
    transform: translateX(-100%);
  }

  .app-shell:not(.sidebar-collapsed) .shell-aside {
    transform: translateX(0);
  }

  .shell-body {
    grid-column: 1 / -1;
  }

  .shell-header {
    padding: 10px 16px;
  }

  .shell-content {
    padding: 16px;
    padding-bottom: 80px;
  }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

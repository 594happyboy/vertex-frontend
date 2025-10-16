<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar" :class="{ 'is-open': sidebarOpen }">
      <div class="sidebar-header">
        <router-link to="/" class="logo">
          <span class="logo-icon">⚙️</span>
          <span class="logo-text">管理后台</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>仪表盘</span>
        </router-link>

        <div class="nav-group">
          <div class="nav-group__title">内容管理</div>
          <router-link to="/admin/articles" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>文章</span>
          </router-link>
          <router-link to="/admin/groups" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>分组标签</span>
          </router-link>
          <router-link to="/admin/comments" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>评论</span>
          </router-link>
        </div>

        <div class="nav-group">
          <div class="nav-group__title">资源管理</div>
          <router-link to="/admin/files" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <span>文件管理</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">{{ user?.username?.charAt(0)?.toUpperCase() || 'A' }}</div>
          <div class="user-info">
            <div class="name">{{ user?.username || 'Admin' }}</div>
            <button @click="handleLogout" class="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶部操作栏 -->
      <header class="admin-header">
        <div class="header-left">
          <button class="mobile-menu-btn" @click="toggleSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>

        <div class="header-right">
          <BaseButton 
            variant="primary" 
            size="sm"
            @click="$router.push('/admin/articles/edit')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            发布新文章
          </BaseButton>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="admin-content">
        <router-view />
      </div>
    </div>

    <!-- 移动端遮罩 -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const user = computed(() => authStore.user)

const pageTitle = computed(() => {
  return route.meta.title || '管理后台'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--gray-900);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: var(--z-sidebar);
  transition: transform var(--duration-base);
}

.sidebar-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-decoration: none;
  color: white;
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
}

.logo-icon {
  font-size: 1.5rem;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-4);
  overflow-y: auto;
}

.nav-group {
  margin-bottom: var(--spacing-6);
}

.nav-group__title {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  margin-bottom: var(--spacing-1);
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
  color: white;
}

.sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name {
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all var(--duration-base);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.admin-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

.admin-header {
  position: sticky;
  top: 0;
  height: 64px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-6);
  z-index: var(--z-sticky);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.admin-content {
  flex: 1;
  padding: var(--spacing-6);
}

.sidebar-overlay {
  display: none;
}

/* 响应式 */
@media (max-width: 767px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar.is-open {
    transform: translateX(0);
  }
  
  .admin-main {
    margin-left: 0;
  }
  
  .mobile-menu-btn {
    display: inline-flex;
  }
  
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: calc(var(--z-sidebar) - 1);
  }
  
  .admin-content {
    padding: var(--spacing-4);
  }
  
  .admin-header {
    padding: 0 var(--spacing-4);
  }
}
</style>


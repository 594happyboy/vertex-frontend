<template>
  <nav class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="navbar__container">
      <!-- Logo -->
      <router-link to="/" class="navbar__logo">
        <div class="logo-icon">📝</div>
        <span class="logo-text">{{ siteName }}</span>
      </router-link>

      <!-- 导航菜单 -->
      <div class="navbar__menu">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/archive" class="nav-link">归档</router-link>
        <router-link to="/groups" class="nav-link">分组</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
      </div>

      <!-- 操作区 -->
      <div class="navbar__actions">
        <button class="icon-btn" @click="toggleTheme" :title="theme === 'light' ? '切换暗色模式' : '切换亮色模式'">
          <svg v-if="theme === 'light'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <button class="icon-btn mobile-menu-btn" @click="toggleMobileMenu" title="菜单">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <transition name="drawer">
      <div v-if="showMobileMenu" class="mobile-drawer">
        <div class="drawer-overlay" @click="toggleMobileMenu"></div>
        <nav class="drawer-content">
          <div class="drawer-header">
            <span class="drawer-title">菜单</span>
            <button class="close-btn" @click="toggleMobileMenu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="drawer-menu">
            <router-link to="/" @click="toggleMobileMenu" class="drawer-link">首页</router-link>
            <router-link to="/archive" @click="toggleMobileMenu" class="drawer-link">归档</router-link>
            <router-link to="/groups" @click="toggleMobileMenu" class="drawer-link">分组</router-link>
            <router-link to="/about" @click="toggleMobileMenu" class="drawer-link">关于</router-link>
          </div>
        </nav>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const siteName = ref('个人博客')
const isScrolled = ref(false)
const showMobileMenu = ref(false)
const theme = ref('light')

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  // 防止背景滚动
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 从 localStorage 读取主题
  const savedTheme = localStorage.getItem('theme') || 'light'
  theme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  z-index: var(--z-navbar);
  transition: all var(--duration-base);
}

.navbar--scrolled {
  box-shadow: var(--shadow-md);
  background: rgba(255, 255, 255, 0.9);
}

.navbar__container {
  max-width: var(--container-max-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-decoration: none;
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
  transition: color var(--duration-base);
}

.navbar__logo:hover {
  color: var(--primary-500);
}

.logo-icon {
  font-size: 1.5rem;
}

.navbar__menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  transition: color var(--duration-base);
  padding: var(--spacing-2) 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-500);
  transition: all var(--duration-base);
  transform: translateX(-50%);
}

.nav-link:hover {
  color: var(--primary-500);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.nav-link.router-link-active {
  color: var(--primary-500);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-base);
}

.icon-btn:hover {
  background: var(--gray-100);
  color: var(--primary-500);
}

.mobile-menu-btn {
  display: none;
}

/* 移动端抽屉 */
.mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.drawer-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: var(--bg-primary);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-color);
}

.drawer-title {
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-base);
}

.close-btn:hover {
  background: var(--gray-100);
  color: var(--error);
}

.drawer-menu {
  flex: 1;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.drawer-link {
  display: block;
  padding: var(--spacing-4);
  text-decoration: none;
  color: var(--text-primary);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-base);
}

.drawer-link:hover,
.drawer-link.router-link-active {
  background: var(--primary-50);
  color: var(--primary-600);
}

/* 抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--duration-base);
}

.drawer-enter-active .drawer-content,
.drawer-leave-active .drawer-content {
  transition: transform var(--duration-base) var(--easing);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-content {
  transform: translateX(100%);
}

.drawer-leave-to .drawer-content {
  transform: translateX(100%);
}

/* 响应式 */
@media (max-width: 767px) {
  .navbar {
    height: var(--navbar-height-mobile);
  }
  
  .navbar__menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: inline-flex;
  }
  
  .navbar__container {
    padding: 0 var(--spacing-4);
  }
}
</style>


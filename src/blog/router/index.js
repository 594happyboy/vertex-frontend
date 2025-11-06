import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import MainLayout from '../layouts/MainLayout.vue';
import AdminView from '../views/AdminView.vue';

const routes = [
  {
    path: '/',
    redirect: '/me',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/me',
    component: MainLayout,  // 使用主布局
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Knowledge',
        component: AdminView,
      },
      {
        path: 'doc/:id',
        name: 'KnowledgeDoc',
        component: AdminView,
      },
      {
        path: 'files',
        name: 'Files',
        component: () => import('../../file/views/FileManager.vue'),
      },
      // 未来扩展：
      // {
      //   path: 'stats',
      //   name: 'Stats',
      //   component: () => import('../views/StatsView.vue'),
      // },
      // {
      //   path: 'settings',
      //   name: 'Settings',
      //   component: () => import('../views/SettingsView.vue'),
      // },
    ],
  },
  // 富文本编辑器测试页（独立页面，可滚动）
  {
    path: '/editor-test',
    name: 'EditorTest',
    component: () => import('../views/EditorTestView.vue'),
    meta: { requiresAuth: true },
  },
  // 可选：公开阅读页
  {
    path: '/public/:username?',
    name: 'Public',
    component: () => import('../views/PublicView.vue'),
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // 等待认证状态初始化完成（首次访问时从 RefreshToken 恢复登录状态）
  if (!authStore.isInitialized) {
    await authStore.init();
  }
  
  // 已登录用户访问登录页，重定向到管理页
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next('/me');
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  
  next();
});

export default router;


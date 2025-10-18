import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
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
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true },
  },
  {
    path: '/me/doc/:id',
    name: 'AdminDoc',
    component: AdminView,
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
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未认证，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    // 不需要认证的页面
    if (to.path === '/login' && authStore.isAuthenticated) {
      // 已登录用户访问登录页，重定向到管理页
      next('/me');
    } else {
      next();
    }
  }
});

export default router;


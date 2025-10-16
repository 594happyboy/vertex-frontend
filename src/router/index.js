import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // 公共端
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'archive',
        name: 'Archive',
        component: () => import('@/views/ArchiveView.vue'),
        meta: { title: '归档' }
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/GroupsView.vue'),
        meta: { title: '分组' }
      },
      {
        path: 'groups/:id',
        name: 'GroupDetail',
        component: () => import('@/views/GroupDetailView.vue'),
        meta: { title: '分组详情' }
      },
      {
        path: 'posts/:slug',
        name: 'PostDetail',
        component: () => import('@/views/PostDetailView.vue'),
        meta: { title: '文章详情' }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: '关于' }
      }
    ]
  },

  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' }
  },

  // 后台管理
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '仪表盘', requiresAuth: true }
      },
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/admin/ArticlesManageView.vue'),
        meta: { title: '文章管理', requiresAuth: true }
      },
      {
        path: 'articles/edit/:id?',
        name: 'ArticleEdit',
        component: () => import('@/views/admin/ArticleEditView.vue'),
        meta: { title: '编辑文章', requiresAuth: true }
      },
      {
        path: 'groups',
        name: 'GroupsManage',
        component: () => import('@/views/admin/GroupsManageView.vue'),
        meta: { title: '分组管理', requiresAuth: true }
      },
      {
        path: 'comments',
        name: 'CommentsManage',
        component: () => import('@/views/admin/CommentsManageView.vue'),
        meta: { title: '评论管理', requiresAuth: true }
      },
      {
        path: 'files',
        name: 'FilesManage',
        component: () => import('@/views/FileManager.vue'),
        meta: { title: '文件管理', requiresAuth: true }
      }
    ]
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const siteName = '个人博客'
  document.title = to.meta.title ? `${to.meta.title} - ${siteName}` : siteName

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  next()
})

export default router


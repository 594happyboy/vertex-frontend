import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light', // 'light' | 'dark'
    toasts: [], // 通知消息列表
    dialogs: {}, // 对话框状态
    sidebarCollapsed: false, // 侧边栏是否折叠
    documentSidebarCollapsed: false, // 知识库模块侧边栏
    latestSidebarCollapsed: false, // 最新模块侧边栏
    loading: {
      show: false,
      message: '加载中...',
    }, // loading 对话框状态
    navigationVisible: true, // 导航栏是否可见（移动端）
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    // 初始化侧边栏状态
    initSidebar() {
      // 移动端默认收起侧边栏
      if (window.innerWidth <= 768) {
        this.sidebarCollapsed = true;
      } else {
        this.sidebarCollapsed = false;
      }
    },

    // 初始化主题
    initTheme() {
      const savedTheme = localStorage.getItem('theme');
      this.theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      this.applyTheme();
    },

    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.applyTheme();
      localStorage.setItem('theme', this.theme);
    },

    // 设置主题
    setTheme(theme) {
      this.theme = theme;
      this.applyTheme();
      localStorage.setItem('theme', theme);
    },

    // 应用主题到 DOM
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    },

    // 显示通知
    showToast(message, type = 'info', duration = 3000) {
      const id = Date.now();
      this.toasts.push({ id, message, type, duration });

      if (duration > 0) {
        setTimeout(() => this.removeToast(id), duration);
      }

      return id;
    },

    // 移除通知
    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index > -1) this.toasts.splice(index, 1);
    },

    // 快捷通知方法
    showSuccess(message, duration) { return this.showToast(message, 'success', duration); },
    showError(message, duration) { return this.showToast(message, 'error', duration); },
    showWarning(message, duration) { return this.showToast(message, 'warning', duration); },
    showInfo(message, duration) { return this.showToast(message, 'info', duration); },

    // 打开对话框
    openDialog(name, data = {}) {
      this.dialogs[name] = { open: true, data };
    },

    // 关闭对话框
    closeDialog(name) {
      if (this.dialogs[name]) {
        this.dialogs[name].open = false;
      }
    },

    // 切换侧边栏
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    // 设置侧边栏状态
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed;
    },

    // 知识库模块侧边栏
    toggleDocumentSidebar() {
      this.documentSidebarCollapsed = !this.documentSidebarCollapsed;
    },

    setDocumentSidebarCollapsed(collapsed) {
      this.documentSidebarCollapsed = collapsed;
    },

    // 最新模块侧边栏
    toggleLatestSidebar() {
      this.latestSidebarCollapsed = !this.latestSidebarCollapsed;
    },

    setLatestSidebarCollapsed(collapsed) {
      this.latestSidebarCollapsed = collapsed;
    },

    // 显示 Loading 对话框
    showLoading(message = '加载中...') {
      this.loading.show = true;
      this.loading.message = message;
    },

    // 隐藏 Loading 对话框
    hideLoading() {
      this.loading.show = false;
    },

    // 设置导航栏可见性
    setNavigationVisible(visible) {
      this.navigationVisible = visible;
    },

    // 显示导航栏
    showNavigation() {
      this.navigationVisible = true;
    },

    // 隐藏导航栏
    hideNavigation() {
      this.navigationVisible = false;
    },
  },
});


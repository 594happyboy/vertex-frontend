import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light', // 'light' | 'dark'
    toasts: [], // 通知消息列表
    dialogs: {}, // 对话框状态
    sidebarCollapsed: false, // 侧边栏是否折叠
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    // 初始化主题
    initTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.theme = savedTheme;
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme = prefersDark ? 'dark' : 'light';
      }
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
      const toast = { id, message, type, duration };
      this.toasts.push(toast);

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }

      return id;
    },

    // 移除通知
    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },

    // 显示成功消息
    showSuccess(message, duration) {
      return this.showToast(message, 'success', duration);
    },

    // 显示错误消息
    showError(message, duration) {
      return this.showToast(message, 'error', duration);
    },

    // 显示警告消息
    showWarning(message, duration) {
      return this.showToast(message, 'warning', duration);
    },

    // 显示信息消息
    showInfo(message, duration) {
      return this.showToast(message, 'info', duration);
    },

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
  },
});


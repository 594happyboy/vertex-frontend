import { defineStore } from 'pinia';
import { login as apiLogin, getVisitorToken as apiGetVisitorToken } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    visitorToken: null,
    role: null, // 'user' | 'visitor' | null
  }),

  getters: {
    isAuthenticated: (state) => !!(state.accessToken || state.visitorToken),
    isVisitor: (state) => state.role === 'visitor',
    isUser: (state) => state.role === 'user',
    currentToken: (state) => state.accessToken || state.visitorToken,
  },

  actions: {
    // 初始化，从 localStorage 恢复状态
    init() {
      const accessToken = localStorage.getItem('accessToken');
      const visitorToken = localStorage.getItem('visitorToken');
      const userInfo = localStorage.getItem('userInfo');

      if (accessToken) {
        this.accessToken = accessToken;
        this.role = 'user';
        if (userInfo) {
          try {
            this.user = JSON.parse(userInfo);
          } catch (e) {
            console.error('Failed to parse userInfo:', e);
          }
        }
      } else if (visitorToken) {
        this.visitorToken = visitorToken;
        this.role = 'visitor';
      }

      // 监听其他标签页的Token变化，实现多标签页Token同步
      this.setupStorageListener();
    },

    // 设置storage监听器，同步多标签页的Token
    setupStorageListener() {
      window.addEventListener('storage', (e) => {
        // accessToken变化
        if (e.key === 'accessToken') {
          if (e.newValue) {
            this.accessToken = e.newValue;
            console.log('✅ AccessToken已从其他标签页同步更新');
          } else {
            this.accessToken = null;
          }
        }
        
        // visitorToken变化
        if (e.key === 'visitorToken') {
          if (e.newValue) {
            this.visitorToken = e.newValue;
            console.log('✅ VisitorToken已从其他标签页同步更新');
          } else {
            this.visitorToken = null;
          }
        }

        // 用户信息变化
        if (e.key === 'userInfo') {
          if (e.newValue) {
            try {
              this.user = JSON.parse(e.newValue);
            } catch (error) {
              console.error('Failed to parse userInfo from storage event:', error);
            }
          } else {
            this.user = null;
          }
        }

        // 如果Token被清除（登出），同步登出状态
        if (e.key === 'accessToken' && !e.newValue && e.key === 'visitorToken' && !e.newValue) {
          this.logout();
        }
      });
    },

    // 用户登录
    async login(username, password) {
      try {
        const data = await apiLogin({ username, password });
        
        this.accessToken = data.accessToken;
        this.user = data.user;
        this.role = 'user';
        this.visitorToken = null;

        // 保存到 localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        localStorage.removeItem('visitorToken');

        return data;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    // 游客登录
    async loginAsVisitor(targetUser) {
      try {
        const data = await apiGetVisitorToken({ targetUser });
        
        this.visitorToken = data.visitorToken;
        this.user = data.targetUser;
        this.role = 'visitor';
        this.accessToken = null;

        // 保存到 localStorage
        localStorage.setItem('visitorToken', data.visitorToken);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');

        return data;
      } catch (error) {
        console.error('Visitor login failed:', error);
        throw error;
      }
    },

    // 登出
    logout() {
      this.user = null;
      this.accessToken = null;
      this.visitorToken = null;
      this.role = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('visitorToken');
      localStorage.removeItem('userInfo');
    },

    // 检查是否为只读模式
    isReadOnly() {
      return this.role === 'visitor';
    },
  },
});


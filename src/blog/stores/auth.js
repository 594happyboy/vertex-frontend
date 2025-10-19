import { defineStore } from 'pinia';
import { login as apiLogin } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    role: null, // 'user' | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isUser: (state) => state.role === 'user',
    currentToken: (state) => state.accessToken,
  },

  actions: {
    // 初始化，从 localStorage 恢复状态
    init() {
      const accessToken = localStorage.getItem('accessToken');
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
        if (e.key === 'accessToken' && !e.newValue) {
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

        // 保存到 localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        return data;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    // 登出
    logout() {
      this.user = null;
      this.accessToken = null;
      this.role = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
    },
  },
});


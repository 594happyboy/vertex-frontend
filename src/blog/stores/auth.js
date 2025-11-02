import { defineStore } from 'pinia';
import { login as apiLogin, logout as apiLogout, getUserInfo as apiGetUserInfo } from '../api/auth';
import { setAccessToken, clearAccessToken } from '@/api/request';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isInitialized: false, // 标记是否已完成初始化
  }),

  getters: {
    // 通过是否有 user 来判断是否已登录
    isAuthenticated: (state) => !!state.user,
    isUser: (state) => !!state.user,
  },

  actions: {
    /**
     * 初始化：尝试从后端恢复登录状态
     * 通过调用 /api/user/me 接口，如果 RefreshToken 有效会自动刷新 AccessToken
     * 注意：此方法仅在路由守卫中调用，由路由守卫保证不会并发执行
     */
    async init() {
      if (this.isInitialized) {
        return;
      }

      try {
        // 调用用户信息接口，如果 RefreshToken 存在且有效，后端会自动返回新的 AccessToken
        const user = await apiGetUserInfo();
        this.user = user;
        console.log('✅ 登录状态已恢复:', user.username);
      } catch (error) {
        // RefreshToken 不存在或已过期，清除状态
        console.log('ℹ️ 未登录或登录已过期');
        this.user = null;
        clearAccessToken();
      } finally {
        this.isInitialized = true;
      }
    },

    /**
     * 用户登录
     */
    async login(username, password) {
      try {
        const data = await apiLogin({ username, password });
        
        // 保存 AccessToken 到内存（通过 request.js 的 setAccessToken 方法）
        setAccessToken(data.accessToken);
        
        // 保存用户信息到 store
        this.user = data.user;
        
        console.log('✅ 登录成功:', data.user.username);
        return data;
      } catch (error) {
        console.error('❌ 登录失败:', error);
        throw error;
      }
    },

    /**
     * 用户登出
     */
    async logout() {
      try {
        // 调用后端登出接口（会撤销 RefreshToken）
        await apiLogout();
      } catch (error) {
        console.error('⚠️ 登出接口调用失败:', error);
        // 即使接口失败也要清除本地状态
      } finally {
        // 清除本地状态
        this.user = null;
        clearAccessToken();
        console.log('✅ 已登出');
      }
    },
  },
});


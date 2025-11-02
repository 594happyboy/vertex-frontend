import axios from 'axios';
import router from '@/blog/router';
import { useAuthStore } from '@/blog/stores/auth';

// ===== AccessToken 存储在内存中（刷新页面会丢失，但可通过 RefreshToken 自动恢复） =====
let accessToken = null;

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  withCredentials: true, // ⚠️ 重要：允许发送和接收Cookie（RefreshToken存储在HttpOnly Cookie中）
  headers: {
    'Content-Type': 'application/json',
  },
});

// 防止重复弹出401错误
let isTokenExpired = false;

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 自动注入 AccessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // ===== 自动刷新Token逻辑 =====
    // 检查响应头中是否有新的 AccessToken（当 AccessToken 过期时，后端会自动用 RefreshToken 刷新）
    const newAccessToken = response.headers['x-new-access-token'];
    if (newAccessToken) {
      console.log('✅ AccessToken已自动刷新');
      accessToken = newAccessToken;
    }
    
    const { data } = response;
    
    // 后端统一返回格式 { code, message, data, timestamp }
    // ===== Token过期处理 =====
    if (data.code === 401) {
      // 避免重复处理（多个请求同时401时只处理一次）
      if (!isTokenExpired) {
        isTokenExpired = true;
        
        console.warn('⚠️ Token已过期或无效，即将跳转到登录页');
        
        // 清除本地认证信息（不等待后端登出接口，直接清除）
        const authStore = useAuthStore();
        authStore.user = null;
        clearAccessToken();
        
        // 跳转到登录页，并记录原始路径用于登录后重定向
        const currentPath = router.currentRoute.value.fullPath;
        router.push({
          path: '/login',
          query: currentPath !== '/login' ? { redirect: currentPath } : {}
        }).then(() => {
          // 跳转完成后重置标志，允许下次401处理
          setTimeout(() => {
            isTokenExpired = false;
          }, 1000);
        });
      }
      
      const error = new Error(data.message || '登录已过期，请重新登录');
      error.code = 401;
      return Promise.reject(error);
    }
    
    // 处理其他业务错误码
    if (data.code === 200) {
      return data.data;
    }
    
    // 处理业务错误
    const error = new Error(data.message || '请求失败');
    error.code = data.code;
    return Promise.reject(error);
  },
  (error) => {
    // 处理网络层面的HTTP错误（如网络断开、服务器无响应等）
    // 注意：正常业务错误码（如401、403等）在上面的成功回调中处理
    if (error.response) {
      const { status } = error.response;
      
      // 真正的HTTP错误（非200状态）
      switch (status) {
        case 404:
          error.message = '请求的接口不存在';
          break;
        case 500:
          error.message = '服务器内部错误';
          break;
        case 502:
          error.message = '网关错误';
          break;
        case 503:
          error.message = '服务暂时不可用';
          break;
        default:
          error.message = `服务器错误 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应（网络问题）
      error.message = '网络连接失败，请检查网络';
    } else {
      // 请求配置错误
      error.message = error.message || '请求配置错误';
    }
    
    console.error('❌ 网络请求错误:', error.message);
    return Promise.reject(error);
  }
);

// ===== 导出 Token 管理方法 =====
/**
 * 设置 AccessToken（登录成功后调用）
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * 清除 AccessToken（登出时调用）
 */
export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * 获取当前的 AccessToken
 */
export const getAccessToken = () => {
  return accessToken;
};

export default request;


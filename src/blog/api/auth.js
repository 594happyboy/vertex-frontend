import request from '@/api/request';

/**
 * 用户登录
 * @param {Object} data - { username, password }
 * @returns {Promise<{ accessToken: string, user: Object }>}
 */
export function login(data) {
  return request.post('/api/auth/login', data);
}

/**
 * 用户登出
 * @returns {Promise<void>}
 */
export function logout() {
  return request.post('/api/auth/logout');
}

/**
 * 获取当前用户信息
 * 用于刷新页面后恢复登录状态
 * 如果 AccessToken 丢失但 RefreshToken 有效，会自动刷新
 * @returns {Promise<Object>} 用户信息
 */
export function getUserInfo() {
  return request.get('/api/user/me');
}


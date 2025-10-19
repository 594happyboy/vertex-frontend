import request from './request';

/**
 * 用户登录
 * @param {Object} data - { username, password }
 * @returns {Promise<{ accessToken: string, user: Object }>}
 */
export function login(data) {
  return request.post('/api/auth/login', data);
}

/**
 * 刷新令牌
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken: string }>}
 */
export function refreshToken(refreshToken) {
  return request.post('/api/auth/refresh', { refreshToken });
}


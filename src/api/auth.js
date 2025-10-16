import request from './request'

/**
 * 登录
 */
export const login = (data) => {
  return request.post('/api/auth/login', data)
}

/**
 * 登出
 */
export const logout = () => {
  return request.post('/api/auth/logout')
}


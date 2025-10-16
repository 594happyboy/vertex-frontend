import axios from 'axios'

// 创建axios实例（类似Retrofit.Builder）
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和错误
request.interceptors.response.use(
  response => {
    // 对于文件下载（blob），返回完整响应
    if (response.config && response.config.responseType === 'blob') {
      return response
    }
    // 返回响应数据
    return response.data
  },
  error => {
    // 处理认证错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // 统一错误提示
    const message = error.response?.data?.message || error.message || '请求失败'
    console.error('API错误:', message)
    
    return Promise.reject(error)
  }
)

export default request


import axios from 'axios'

// 创建axios实例（类似Retrofit.Builder）
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器（类似OkHttp Interceptor）
request.interceptors.request.use(
  config => {
    console.log('请求:', config.url)
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  }
)

export default request


import axios from 'axios'

// 创建axios实例（类似Retrofit.Builder）
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    // 对于文件下载（blob），根据请求配置判断并返回原始响应以保留headers等信息
    if (response.config && response.config.responseType === 'blob') {
      return response // 保留完整AxiosResponse
    }
    // 其他情况保持原来的行为
    return response.data
  },
  error => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  }
)

export default request


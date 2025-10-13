import request from './request'

// 文件相关API（类似Retrofit的@GET、@POST注解）
export const fileApi = {
  // 上传文件
  upload(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 获取文件列表
  getList(page = 1, size = 10, keyword = '') {
    return request.get('/files', {
      params: { page, size, keyword }
    })
  },

  // 下载文件
  download(id) {
    return `/api/files/${id}/download`
  },

  // 删除文件
  delete(id) {
    return request.delete(`/files/${id}`)
  }
}


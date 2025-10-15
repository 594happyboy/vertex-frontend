<template>
  <div class="file-dashboard">
    <div class="dashboard-shell">
      <header class="dashboard-header">
        <div class="header-left">
          <span class="brand-icon">📁</span>
          <div class="brand-text">
            <h1>云端文件中心</h1>
            <p>集中管理日常文件资源，支持上传、下载与删除</p>
          </div>
        </div>
        <div class="header-right">
          <div class="stat-card">
            <span class="stat-label">文件总数</span>
            <span class="stat-value">{{ total }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">当前时间</span>
            <span class="stat-value time">
              🕐 {{ currentTime }}
            </span>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <section class="panel upload-panel">
          <div class="panel-header">
            <div>
              <h2>上传文件</h2>
              <p>支持拖拽或点击上传，单个文件不超过 100MB</p>
            </div>
          </div>

          <div class="upload-dropzone" :class="{ 'is-uploading': uploading, 'is-dragover': isDragOver }"
            @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave">
            <input ref="fileInputRef" type="file" style="display: none" @change="handleFileInputChange" />
            <div class="dropzone-content">
              <span class="dropzone-icon">
                {{ uploading ? '⬆️' : '📤' }}
              </span>
              <div class="dropzone-text">
                <p class="title">
                  {{ selectedFile ? selectedFile.name : '拖拽文件到此处或点击选择' }}
                </p>
                <p class="subtitle">文件将通过后端接口安全保存并可随时下载</p>
              </div>
            </div>
          </div>

          <div v-if="selectedFile" class="selected-file-card">
            <div>
              <span class="file-name" :title="selectedFile.name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <button class="btn btn-link btn-danger" @click="clearSelection">清除</button>
          </div>

          <button class="btn btn-primary btn-large upload-action" :disabled="!selectedFile || uploading"
            @click="uploadFile">
            ⬆️ {{ uploading ? '正在上传…' : '开始上传' }}
          </button>
        </section>

        <section class="panel list-panel">
          <div class="panel-header list-header">
            <button class="btn btn-text" @click="loadFileList" :disabled="loading">
              {{ loading ? '加载中...' : '刷新' }}
            </button>
            <div>
              <h2>文件列表</h2>
              <p>显示后端提供的文件数据，可直接下载或删除</p>
            </div>
            <div class="toolbar">
              <div class="search-input">
                <span class="search-icon">🔍</span>
                <input v-model="searchKeyword" type="text" placeholder="搜索文件名..." @keyup.enter="onSearch"
                  @input="onSearch" />
                <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''; onSearch()">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="table-wrapper" :class="{ 'is-loading': loading }">
            <div v-if="loading" class="loading-overlay">
              <div class="spinner"></div>
              <p>加载中...</p>
            </div>

            <table v-if="fileList.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>文件</th>
                  <th width="120">大小</th>
                  <th width="180">上传时间</th>
                  <th width="180" align="center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in fileList" :key="row.id">
                  <td>
                    <div class="file-cell">
                      <span class="file-cell-icon">📄</span>
                      <div class="file-cell-info">
                        <p class="name" :title="row.fileName">{{ row.fileName }}</p>
                        <span class="type">{{ formatFileType(row.fileType) }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ row.fileSizeFormatted || formatFileSize(row.fileSize) }}</td>
                  <td>{{ formatTime(row.uploadTime) }}</td>
                  <td align="center">
                    <button class="btn btn-small btn-primary" @click="downloadFile(row)">
                      ⬇️ 下载
                    </button>
                    <button class="btn btn-small btn-danger" @click="deleteFile(row)" style="margin-top: 5px;">
                      🗑️ 删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-else-if="!loading" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无文件，快去上传吧</p>
            </div>
          </div>

          <div class="pagination" v-if="total > 0">
            <div class="pagination-info">
              共 {{ total }} 条
            </div>
            <div class="pagination-size">
              <select v-model.number="pageSize" @change="handleSizeChange">
                <option :value="10">10 条/页</option>
                <option :value="20">20 条/页</option>
                <option :value="50">50 条/页</option>
              </select>
            </div>
            <div class="pagination-controls">
              <button class="btn btn-small" :disabled="currentPage === 1" @click="handleCurrentChange(currentPage - 1)">
                上一页
              </button>
              <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
              <button class="btn btn-small" :disabled="currentPage === totalPages"
                @click="handleCurrentChange(currentPage + 1)">
                下一页
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Toast Message -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon">{{ getToastIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Confirm Dialog -->
    <transition name="dialog">
      <div v-if="dialog.show" class="dialog-overlay" @click="cancelDialog">
        <div class="dialog-box" @click.stop>
          <div class="dialog-header">
            <h3>{{ dialog.title }}</h3>
          </div>
          <div class="dialog-body">
            <p>{{ dialog.message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-default" @click="cancelDialog">
              取消
            </button>
            <button class="btn btn-danger" @click="confirmDialog">
              删除
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fileApi } from '../api/file'

const fileList = ref([])
const loading = ref(false)
const uploading = ref(false)
const selectedFile = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const currentTime = ref('')
const fileInputRef = ref(null)
const isDragOver = ref(false)
let clockTimer = null

// Toast state
const toast = ref({
  show: false,
  message: '',
  type: 'info'
})

// Dialog state
const dialog = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null
})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1
})

const getCurrentTime = () => {
  return new Date().toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateClock = () => {
  currentTime.value = getCurrentTime()
}

const getToastIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || icons.info
}

const showMessage = (message, type = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, type === 'error' ? 3000 : 2000)
}

const showConfirm = (title, message) => {
  return new Promise((resolve) => {
    dialog.value = {
      show: true,
      title,
      message,
      onConfirm: () => {
        dialog.value.show = false
        resolve(true)
      }
    }
  })
}

const cancelDialog = () => {
  dialog.value.show = false
}

const confirmDialog = () => {
  if (dialog.value.onConfirm) {
    dialog.value.onConfirm()
  }
}

const triggerFileInput = () => {
  if (!uploading.value) {
    fileInputRef.value?.click()
  }
}

const handleFileInputChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDragOver = (event) => {
  if (!uploading.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = (event) => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false
  if (uploading.value) return

  const file = event.dataTransfer.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const validateAndSetFile = (file) => {
  if (file.size > 100 * 1024 * 1024) {
    showMessage('单个文件大小不能超过 100MB', 'error')
    selectedFile.value = null
    return
  }
  selectedFile.value = file
  showMessage(`已选择 ${file.name}`, 'success')
}

const clearSelection = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  showMessage('已清除文件选择', 'info')
}

const uploadFile = async () => {
  if (!selectedFile.value) {
    showMessage('请先选择文件', 'warning')
    return
  }

  uploading.value = true
  try {
    const response = await fileApi.upload(selectedFile.value)
    if (response.code === 200) {
      showMessage('上传成功', 'success')
      clearSelection()
      await loadFileList()
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error) {
    showMessage(error.message ?? '上传失败，请稍后再试', 'error')
  } finally {
    uploading.value = false
  }
}

const onSearch = () => {
  currentPage.value = 1
  loadFileList()
}

const loadFileList = async () => {
  loading.value = true
  try {
    const response = await fileApi.getList(
      currentPage.value,
      pageSize.value,
      searchKeyword.value.trim()
    )
    if (response.code === 200) {
      const data = response.data || {}
      fileList.value = data.files || []
      total.value = data.total || 0
    } else {
      throw new Error(response.message || '获取文件列表失败')
    }
  } catch (error) {
    showMessage(error.message ?? '加载列表失败，请检查后端服务', 'error')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadFileList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadFileList()
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileType = (fileType) => {
  return fileType || '未知类型'
}

const downloadFile = async (file) => {
  try {
    showMessage(`正在下载：${file.fileName}`, 'info')

    const axiosResponse = await fileApi.download(file.id)

    // 处理可能返回的错误JSON（有些后端即便设置了blob也会返回JSON错误）
    const isBlob = axiosResponse?.data instanceof Blob
    if (!isBlob) {
      const text = typeof axiosResponse === 'string' ? axiosResponse : JSON.stringify(axiosResponse)
      throw new Error(text || '未知的下载响应')
    }

    // 从响应头提取文件名
    const disposition = axiosResponse.headers?.['content-disposition'] || axiosResponse.headers?.['Content-Disposition']
    let filename = file.fileName
    if (disposition) {
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
      const raw = match?.[1] || match?.[2]
      if (raw) {
        try {
          filename = decodeURIComponent(raw)
        } catch {
          filename = raw
        }
      }
    }

    // 创建blob对象URL
    const blob = axiosResponse.data
    // 检测是否返回了错误的JSON blob（例如9B大小）
    if (blob.size < 20) {
      try {
        const text = await blob.text()
        // 如果能解析为JSON，展示后端错误信息
        try {
          const json = JSON.parse(text)
          throw new Error(json.message || text)
        } catch {
          throw new Error(text)
        }
      } catch {
        // ignore，按普通错误处理
      }
    }

    const url = window.URL.createObjectURL(blob)

    // 创建隐藏的<a>标签并触发下载
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showMessage(`下载成功：${filename}`, 'success')
  } catch (error) {
    console.error('下载失败：', error)
    const message = error?.message || error?.response?.statusText || '下载失败，请稍后重试'
    showMessage(message, 'error')
  }
}

const deleteFile = async (file) => {
  const confirmed = await showConfirm(
    '删除确认',
    `确认删除文件「${file.fileName}」？删除后无法恢复。`
  )

  if (!confirmed) return

  try {
    const response = await fileApi.delete(file.id)
    if (response.code === 200) {
      showMessage('删除成功', 'success')
      await loadFileList()
    } else {
      throw new Error(response.message || '删除失败')
    }
  } catch (error) {
    showMessage(error.message ?? '删除失败，请稍后再试', 'error')
  }
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 60000)
  loadFileList()
})

onUnmounted(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.file-dashboard {
  min-height: 100vh;
  background: #eef2f8;
  padding: 32px 0 48px;
}

.dashboard-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, rgba(58, 91, 229, 0.12), rgba(108, 99, 255, 0.05));
  border-radius: 24px;
  padding: 24px 28px;
  box-shadow: 0 24px 48px rgba(31, 47, 74, 0.08);
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(58, 91, 229, 0.15);
  font-size: 28px;
}

.brand-text h1 {
  margin: 0 0 6px;
  font-size: 24px;
  color: #1f2f4a;
  font-weight: 700;
}

.brand-text p {
  margin: 0;
  font-size: 14px;
  color: #5b6b84;
}

.header-right {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  min-width: 140px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #6c7a92;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1f2f4a;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.stat-value.time {
  font-size: 16px;
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.panel {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 26px;
  box-shadow: 0 18px 36px rgba(31, 47, 74, 0.07);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.panel-header h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1f2f4a;
  font-weight: 600;
}

.panel-header p {
  margin: 0;
  color: #6c7a92;
  font-size: 13px;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f0f3f8;
  color: #1f2f4a;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3a5be5 0%, #5d7bff 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #f15b67 0%, #f88f7c 100%);
  color: white;
}

.btn-default {
  background: #f0f3f8;
  color: #1f2f4a;
}

.btn-text {
  background: transparent;
  color: #3a5be5;
  padding: 0 0;
}

.btn-link {
  background: transparent;
  color: #3a5be5;
  padding: 4px 8px;
  font-size: 13px;
}

.btn-link.btn-danger {
  color: #f15b67;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-large {
  padding: 12px 24px;
  font-size: 15px;
  height: 42px;
}

/* Upload Dropzone */
.upload-dropzone {
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px dashed rgba(58, 91, 229, 0.35);
  background: rgba(58, 91, 229, 0.06);
  cursor: pointer;
}

.upload-dropzone:hover:not(.is-uploading) {
  transform: translateY(-4px);
  border-color: rgba(58, 91, 229, 0.6);
  background: rgba(58, 91, 229, 0.1);
}

.upload-dropzone.is-dragover {
  border-color: rgba(58, 91, 229, 0.8);
  background: rgba(58, 91, 229, 0.15);
}

.upload-dropzone.is-uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  gap: 12px;
}

.dropzone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(58, 91, 229, 0.1);
  font-size: 28px;
}

.dropzone-text .title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2f4a;
  text-align: center;
}

.dropzone-text .subtitle {
  margin: 0;
  font-size: 12px;
  color: #6c7a92;
  text-align: center;
}

.selected-file-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f4f6ff;
  border: 1px solid #dbe3ff;
  gap: 12px;
}

.selected-file-card .file-name {
  font-weight: 600;
  color: #1f2f4a;
  font-size: 13px;
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-file-card .file-size {
  margin-left: 10px;
  color: #6c7a92;
  font-size: 12px;
}

.upload-action {
  width: 100%;
}

/* List Panel */
.list-panel {
  min-height: 520px;
}

.list-header {
  align-items: center;
}

.toolbar {
  min-width: 260px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border: 1px solid #dde3f0;
  border-radius: 14px;
  background: #f6f8ff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input input:focus {
  border-color: #3a5be5;
  background: white;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  color: #6c7a92;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: #6c7a92;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
}

.clear-btn:hover {
  background: #f0f3f8;
}

/* Table Styles */
.table-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e4e9f2;
  min-height: 300px;
}

.table-wrapper.is-loading {
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f3f8;
  border-top-color: #3a5be5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: #f0f3ff;
}

.data-table th {
  padding: 14px 16px;
  text-align: left;
  color: #1f2f4a;
  font-weight: 600;
  border-bottom: 2px solid #e4e9f2;
}

.data-table th[align="center"] {
  text-align: center;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f3f8;
  color: #1f2f4a;
}

.data-table td[align="center"] {
  text-align: center;
}

.data-table tbody tr:hover {
  background: #f8f9ff;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.file-cell-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #eef2ff;
  font-size: 20px;
}

.file-cell-info {
  min-width: 0;
}

.file-cell-info .name {
  margin: 0 0 4px;
  font-weight: 600;
  color: #1f2f4a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-cell-info .type {
  font-size: 12px;
  color: #6c7a92;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  color: #6c7a92;
  font-size: 14px;
}

/* Pagination */
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 13px;
  color: #6c7a92;
}

.pagination-size select {
  padding: 6px 12px;
  border: 1px solid #dde3f0;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-number {
  padding: 0 12px;
  font-size: 13px;
  color: #1f2f4a;
  font-weight: 500;
}

/* Toast */
.toast {
  position: fixed;
  left: 50%;
  top: 100px;
  transform: translateX(-50%);
  min-width: 280px;
  max-width: 420px;
  padding: 12px 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 24px rgba(31, 47, 74, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  font-size: 14px;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

.toast-success {
  background: #f0f9f4;
  color: #22863a;
  border: 1px solid #34d058;
}

.toast-error {
  background: #ffeef0;
  color: #d73a49;
  border: 1px solid #f15b67;
}

.toast-warning {
  background: #fffbf0;
  color: #b08800;
  border: 1px solid #ffdf5d;
}

.toast-info {
  background: #f0f6ff;
  color: #0366d6;
  border: 1px solid #3a5be5;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.dialog-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  min-width: 420px;
  max-width: 90vw;
}

.dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e4e9f2;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2f4a;
  font-weight: 600;
}

.dialog-body {
  padding: 20px 24px;
}

.dialog-body p {
  margin: 0;
  font-size: 14px;
  color: #5b6b84;
  line-height: 1.6;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #e4e9f2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-box,
.dialog-leave-to .dialog-box {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 1080px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    width: 100%;
  }

  .panel {
    padding: 22px 20px;
  }

  .selected-file-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination {
    justify-content: center;
  }

  .dialog-box {
    min-width: 90vw;
  }
}
</style>

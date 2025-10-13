<template>
  <div class="file-dashboard">
    <div class="dashboard-shell">
      <header class="dashboard-header">
        <div class="header-left">
          <span class="brand-icon">
            <el-icon :size="28">
              <FolderOpened />
            </el-icon>
          </span>
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
              <el-icon :size="16"><Clock /></el-icon>
              {{ currentTime }}
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
            <el-button
              type="primary"
              text
              :icon="Refresh"
              @click="loadFileList"
              :loading="loading"
            >
              刷新列表
            </el-button>
          </div>

          <el-upload
            ref="uploadRef"
            class="upload-dropzone"
            drag
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            :disabled="uploading"
            :limit="1"
          >
            <div class="dropzone-content" :class="{ 'is-uploading': uploading }">
              <span class="dropzone-icon">
                <el-icon :size="48">
                  <UploadFilled v-if="!uploading" />
                  <Upload v-else />
                </el-icon>
              </span>
              <div class="dropzone-text">
                <p class="title">
                  {{ selectedFile ? selectedFile.name : '拖拽文件到此处或点击选择' }}
                </p>
                <p class="subtitle">文件将通过后端接口安全保存并可随时下载</p>
              </div>
            </div>
          </el-upload>

          <div v-if="selectedFile" class="selected-file-card">
            <div>
              <span class="file-name" :title="selectedFile.name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <el-button link type="danger" @click="clearSelection">清除</el-button>
          </div>

          <el-button
            class="upload-action"
            type="primary"
            size="large"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="uploadFile"
          >
            <el-icon class="action-icon"><Upload /></el-icon>
            {{ uploading ? '正在上传…' : '开始上传' }}
          </el-button>
        </section>

        <section class="panel list-panel">
          <div class="panel-header list-header">
            <div>
              <h2>文件列表</h2>
              <p>显示后端提供的文件数据，可直接下载或删除</p>
            </div>
            <div class="toolbar">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索文件名..."
                :prefix-icon="Search"
                clearable
                @clear="onSearch"
                @keyup.enter="onSearch"
                @change="onSearch"
              />
            </div>
          </div>

          <div class="table-wrapper" v-loading="loading">
            <el-table
              v-if="fileList.length > 0"
              :data="fileList"
              border
              :header-cell-style="{ backgroundColor: '#f0f3ff', color: '#1f2f4a' }"
            >
              <el-table-column label="文件" min-width="260">
                <template #default="{ row }">
                  <div class="file-cell">
                    <span class="file-cell-icon">
                      <el-icon :size="20"><Document /></el-icon>
                    </span>
                    <div class="file-cell-info">
                      <p class="name" :title="row.fileName">{{ row.fileName }}</p>
                      <span class="type">{{ formatFileType(row.fileType) }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="大小" width="120">
                <template #default="{ row }">
                  {{ row.fileSizeFormatted || formatFileSize(row.fileSize) }}
                </template>
              </el-table-column>
              <el-table-column label="上传时间" min-width="180">
                <template #default="{ row }">
                  {{ formatTime(row.uploadTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button
                    size="small"
                    type="primary"
                    :icon="Download"
                    @click="downloadFile(row)"
                  >
                    下载
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="deleteFile(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无文件，快去上传吧" />
          </div>

          <div class="pagination" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              background
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UploadFilled,
  Upload,
  Download,
  Delete,
  Search,
  Refresh,
  Document,
  FolderOpened,
  Clock
} from '@element-plus/icons-vue'
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
const uploadRef = ref(null)
let clockTimer = null

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

// 居中显示的消息提示
const showMessage = (message, type = 'info') => {
  ElMessage.closeAll() // 关闭所有现有消息
  ElMessage({
    message,
    type,
    duration: type === 'error' ? 3000 : 2000,
    showClose: true,
    offset: 0, // 使用 CSS 固定定位，不需要 offset
    grouping: true,
    customClass: 'center-toast'
  })
}

const handleExceed = () => {
  showMessage('一次仅支持上传一个文件，请先完成当前上传', 'warning')
}

const handleFileChange = (file) => {
  if (!file?.raw) return
  if (file.raw.size > 100 * 1024 * 1024) {
    showMessage('单个文件大小不能超过 100MB', 'error')
    uploadRef.value?.clearFiles()
    selectedFile.value = null
    return
  }
  selectedFile.value = file.raw
  showMessage(`已选择 ${file.name}`, 'success')
}

const clearSelection = () => {
  selectedFile.value = null
  uploadRef.value?.clearFiles()
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

const handleSizeChange = (size) => {
  pageSize.value = size
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

const downloadFile = (file) => {
  const url = fileApi.download(file.id)
  window.open(url, '_blank')
  showMessage(`开始下载：${file.fileName}`, 'success')
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确认删除文件「${file.fileName}」？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    const response = await fileApi.delete(file.id)
    if (response.code === 200) {
      showMessage('删除成功', 'success')
      await loadFileList()
    } else {
      throw new Error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      showMessage(error.message ?? '删除失败，请稍后再试', 'error')
    }
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
  color: #3a5be5;
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

.upload-dropzone {
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.upload-dropzone:hover {
  transform: translateY(-4px);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  gap: 12px;
  transition: filter 0.3s ease;
}

.dropzone-content.is-uploading {
  filter: grayscale(0.1) brightness(0.95);
}

.dropzone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(58, 91, 229, 0.1);
  color: #3a5be5;
}

.dropzone-icon .el-icon {
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
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.action-icon {
  margin-right: 6px;
  font-size: 16px;
}

.list-panel {
  min-height: 520px;
}

.list-header {
  align-items: center;
}

.toolbar {
  min-width: 260px;
}

.table-wrapper {
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e4e9f2;
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
  color: #3a5be5;
}

.file-cell-info {
  min-width: 0;
}

.file-cell-info .name {
  margin: 0;
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

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

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
}

:deep(.upload-dropzone .el-upload-dragger) {
  border: 2px dashed rgba(58, 91, 229, 0.35);
  background: rgba(58, 91, 229, 0.06);
  transition: all 0.3s ease;
}

:deep(.upload-dropzone .el-upload-dragger:hover) {
  border-color: rgba(58, 91, 229, 0.6);
  background: rgba(58, 91, 229, 0.1);
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table .cell) {
  color: #1f2f4a;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #3a5be5 0%, #5d7bff 100%);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f15b67 0%, #f88f7c 100%);
  border: none;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: linear-gradient(135deg, #3a5be5 0%, #5d7bff 100%);
  border: none;
}

:deep(.el-input__wrapper) {
  background: #f6f8ff;
  box-shadow: none;
  border-radius: 14px;
}

:deep(.el-empty__description) {
  color: #6c7a92;
}

/* 居中消息提示样式 - 使用全局样式覆盖 */
</style>

<style>
/* 全局样式：消息提示居中显示 */
.el-message.center-toast {
  position: fixed !important;
  left: 50% !important;
  right: auto !important;
  top: 100px !important;
  transform: translateX(-50%) !important;
  margin: 0 !important;
  min-width: 280px;
  max-width: 420px;
  min-height: auto !important;
  max-height: 80px !important;
  border-radius: 12px;
  padding: 10px 18px !important;
  box-shadow: 0 8px 24px rgba(31, 47, 74, 0.15);
  font-weight: 500;
  letter-spacing: 0.01em;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
}

.el-message.center-toast .el-message__content {
  text-align: center;
  font-size: 13px !important;
  line-height: 1.4 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 强制限制消息图标大小 */
.el-message.center-toast .el-message__icon {
  font-size: 16px !important;
  width: 16px !important;
  height: 16px !important;
  line-height: 16px !important;
  margin-right: 8px !important;
}

.el-message.center-toast .el-message__icon svg {
  width: 16px !important;
  height: 16px !important;
}

/* 调整关闭按钮大小 */
.el-message.center-toast .el-message__closeBtn {
  font-size: 14px !important;
  width: 14px !important;
  height: 14px !important;
  line-height: 14px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  padding: 0 !important;
}

.el-message.center-toast .el-message__closeBtn:hover {
  opacity: 0.7;
}

/* 防止消息出现时页面抖动 */
html {
  overflow-y: scroll;
}
</style>


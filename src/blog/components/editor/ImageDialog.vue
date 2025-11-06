<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="image-dialog-overlay" @click.self="cancel">
        <div class="image-dialog" :class="{ 'is-mobile': isMobile }">
          <div class="dialog-header">
            <h3>插入图片</h3>
            <button @click="cancel" class="btn-close" title="关闭">×</button>
          </div>
          
          <div class="dialog-body">
            <!-- Tab 切换 -->
            <div class="tabs">
              <button
                @click="activeTab = 'url'"
                :class="{ active: activeTab === 'url' }"
                class="tab-btn"
              >
                网址
              </button>
              <button
                @click="activeTab = 'upload'"
                :class="{ active: activeTab === 'upload' }"
                class="tab-btn"
              >
                本地上传
              </button>
            </div>
            
            <!-- URL 输入 -->
            <div v-show="activeTab === 'url'" class="tab-content">
              <div class="form-group">
                <label for="image-url">图片地址</label>
                <input
                  id="image-url"
                  ref="urlInputRef"
                  v-model="url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="input-url"
                  @keydown.enter="confirmUrl"
                  @keydown.esc="cancel"
                />
                <div v-if="urlError" class="error-message">{{ urlError }}</div>
              </div>
              
              <div v-if="url && isValidImageUrl" class="image-preview">
                <img :src="url" alt="预览" @error="handleImageError" />
              </div>
            </div>
            
            <!-- 文件上传 -->
            <div v-show="activeTab === 'upload'" class="tab-content">
              <div class="upload-area" @click="triggerFileInput">
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleFileSelect"
                />
                
                <div v-if="!preview" class="upload-placeholder">
                  <div class="upload-icon">📷</div>
                  <div class="upload-text">点击选择图片</div>
                  <div class="upload-hint">支持 JPG、PNG、GIF、WebP（最大 5MB）</div>
                </div>
                
                <div v-else class="preview-container">
                  <img :src="preview" alt="预览" class="preview-image" />
                  <button @click.stop="clearFile" class="btn-clear" title="清除">×</button>
                </div>
              </div>
              
              <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
              
              <div v-if="fileSize" class="file-info">
                文件大小: {{ formatFileSize(fileSize) }}
              </div>
            </div>
          </div>
          
          <div class="dialog-footer">
            <button @click="cancel" class="btn btn-cancel">
              取消
            </button>
            <button
              @click="confirm"
              :disabled="!canConfirm"
              class="btn btn-confirm"
            >
              插入
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useResponsive } from '@/composables'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const { isMobile } = useResponsive()

const activeTab = ref('url')
const url = ref('')
const urlInputRef = ref(null)
const urlError = ref('')
const fileInputRef = ref(null)
const selectedFile = ref(null)
const preview = ref('')
const uploadError = ref('')
const fileSize = ref(0)

const isValidImageUrl = computed(() => {
  if (!url.value) return false
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i
  return imageExtensions.test(url.value) || url.value.includes('data:image/')
})

const canConfirm = computed(() => {
  if (activeTab.value === 'url') {
    return url.value.trim() !== ''
  } else {
    return !!preview.value
  }
})

// 监听显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 重置状态
    activeTab.value = 'url'
    url.value = ''
    urlError.value = ''
    selectedFile.value = null
    preview.value = ''
    uploadError.value = ''
    fileSize.value = 0
    
    nextTick(() => {
      if (activeTab.value === 'url') {
        urlInputRef.value?.focus()
      }
    })
  }
})

const handleImageError = () => {
  urlError.value = '图片加载失败，请检查地址是否正确'
}

const confirmUrl = () => {
  const trimmedUrl = url.value.trim()
  
  if (!trimmedUrl) {
    urlError.value = '请输入图片地址'
    return
  }
  
  emit('confirm', trimmedUrl)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  uploadError.value = ''
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    uploadError.value = '请选择图片文件'
    return
  }
  
  // 验证文件大小（5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = '图片大小不能超过 5MB'
    return
  }
  
  selectedFile.value = file
  fileSize.value = file.size
  
  // 读取文件预览
  const reader = new FileReader()
  reader.onload = (e) => {
    preview.value = e.target?.result
  }
  reader.onerror = () => {
    uploadError.value = '图片读取失败，请重试'
  }
  reader.readAsDataURL(file)
  
  // 清空 input，允许重复选择同一文件
  event.target.value = ''
}

const clearFile = () => {
  selectedFile.value = null
  preview.value = ''
  uploadError.value = ''
  fileSize.value = 0
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const confirm = () => {
  if (activeTab.value === 'url') {
    confirmUrl()
  } else {
    if (preview.value) {
      emit('confirm', preview.value)
    }
  }
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.image-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.image-dialog {
  background: var(--color-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.image-dialog.is-mobile {
  max-width: 100%;
  border-radius: 12px 12px 0 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text, #111827);
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary, #6b7280);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}

.btn-close:hover {
  background: var(--color-bg-hover, #f3f4f6);
  color: var(--color-text, #374151);
}

.dialog-body {
  padding: 24px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-border, #e5e7eb);
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #6b7280);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.15s;
}

.tab-btn:hover {
  color: var(--color-text, #111827);
}

.tab-btn.active {
  color: var(--color-primary, #3b82f6);
  border-bottom-color: var(--color-primary, #3b82f6);
}

.tab-content {
  min-height: 200px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.input-url {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  font-size: 16px;
  color: var(--color-text, #111827);
  background: var(--color-bg, #ffffff);
  transition: all 0.15s;
}

.input-url:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.image-preview {
  margin-top: 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  padding: 16px;
  background: var(--color-bg-secondary, #f9fafb);
}

.image-preview img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

.upload-area {
  border: 2px dashed var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.02);
}

.upload-placeholder {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text, #374151);
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: var(--color-text-secondary, #9ca3af);
}

.preview-container {
  position: relative;
  width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

.btn-clear {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-clear:hover {
  background: rgba(0, 0, 0, 0.8);
}

.error-message {
  margin-top: 8px;
  font-size: 14px;
  color: #ef4444;
}

.file-info {
  margin-top: 12px;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  text-align: center;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 48px;
}

.btn:active {
  transform: scale(0.98);
}

.btn-cancel {
  background: var(--color-bg-secondary, #f3f4f6);
  color: var(--color-text, #374151);
}

.btn-cancel:hover {
  background: var(--color-bg-hover, #e5e7eb);
}

.btn-confirm {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.btn-confirm:hover {
  background: var(--color-primary-dark, #2563eb);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .image-dialog,
.modal-leave-active .image-dialog {
  transition: transform 0.2s ease;
}

.modal-enter-from .image-dialog,
.modal-leave-to .image-dialog {
  transform: scale(0.95) translateY(20px);
}

.modal-enter-from .image-dialog.is-mobile,
.modal-leave-to .image-dialog.is-mobile {
  transform: translateY(100%);
}

/* 暗色主题 */
[data-theme='dark'] .image-dialog {
  background: #1f2937;
}

[data-theme='dark'] .dialog-header {
  border-bottom-color: #374151;
}

[data-theme='dark'] .dialog-header h3 {
  color: #f9fafb;
}

[data-theme='dark'] .btn-close:hover {
  background: #374151;
  color: #d1d5db;
}

[data-theme='dark'] .tabs {
  border-bottom-color: #374151;
}

[data-theme='dark'] .input-url {
  background: #111827;
  border-color: #374151;
  color: #f9fafb;
}

[data-theme='dark'] .image-preview {
  background: #111827;
  border-color: #374151;
}

[data-theme='dark'] .upload-area {
  border-color: #374151;
}

[data-theme='dark'] .upload-area:hover {
  background: rgba(59, 130, 246, 0.05);
}

[data-theme='dark'] .dialog-footer {
  border-top-color: #374151;
}

[data-theme='dark'] .btn-cancel {
  background: #374151;
  color: #d1d5db;
}

[data-theme='dark'] .btn-cancel:hover {
  background: #4b5563;
}
</style>


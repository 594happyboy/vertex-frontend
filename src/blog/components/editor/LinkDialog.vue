<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="link-dialog-overlay" @click.self="cancel">
        <div class="link-dialog" :class="{ 'is-mobile': isMobile }">
          <div class="dialog-header">
            <h3>{{ isEdit ? '编辑链接' : '插入链接' }}</h3>
            <button @click="cancel" class="btn-close" title="关闭">×</button>
          </div>
          
          <div class="dialog-body">
            <div class="form-group">
              <label for="link-url">链接地址</label>
              <input
                id="link-url"
                ref="urlInputRef"
                v-model="url"
                type="url"
                placeholder="https://example.com"
                class="input-url"
                @keydown.enter="confirm"
                @keydown.esc="cancel"
              />
              <div v-if="urlError" class="error-message">{{ urlError }}</div>
            </div>
            
            <div v-if="url && isValidUrl" class="link-preview">
              <span class="preview-label">预览：</span>
              <a :href="url" target="_blank" rel="noopener noreferrer" class="preview-link">
                {{ url }}
              </a>
            </div>
          </div>
          
          <div class="dialog-footer">
            <button @click="cancel" class="btn btn-cancel">
              取消
            </button>
            <button
              v-if="isEdit"
              @click="removeLink"
              class="btn btn-remove"
            >
              删除链接
            </button>
            <button
              @click="confirm"
              :disabled="!url.trim()"
              class="btn btn-confirm"
            >
              确定
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
  },
  initialUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel', 'remove'])

const { isMobile } = useResponsive()

const url = ref('')
const urlInputRef = ref(null)
const urlError = ref('')

const isEdit = computed(() => !!props.initialUrl)

const isValidUrl = computed(() => {
  if (!url.value) return false
  try {
    // 如果没有协议，自动添加 https://
    const urlToTest = url.value.match(/^https?:\/\//i) 
      ? url.value 
      : 'https://' + url.value
    new URL(urlToTest)
    return true
  } catch {
    return false
  }
})

// 监听显示状态，自动聚焦
watch(() => props.show, (newVal) => {
  if (newVal) {
    url.value = props.initialUrl
    urlError.value = ''
    nextTick(() => {
      urlInputRef.value?.focus()
      urlInputRef.value?.select()
    })
  }
})

const confirm = () => {
  const trimmedUrl = url.value.trim()
  
  if (!trimmedUrl) {
    urlError.value = '请输入链接地址'
    return
  }
  
  // 自动添加 https:// 前缀
  let finalUrl = trimmedUrl
  if (!finalUrl.match(/^https?:\/\//i)) {
    finalUrl = 'https://' + finalUrl
  }
  
  // 验证 URL 格式
  try {
    new URL(finalUrl)
    emit('confirm', finalUrl)
  } catch {
    urlError.value = '链接地址格式不正确'
  }
}

const cancel = () => {
  emit('cancel')
}

const removeLink = () => {
  emit('remove')
}
</script>

<style scoped>
.link-dialog-overlay {
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

.link-dialog {
  background: var(--color-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.link-dialog.is-mobile {
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
  font-size: 16px; /* 防止 iOS 自动缩放 */
  color: var(--color-text, #111827);
  background: var(--color-bg, #ffffff);
  transition: all 0.15s;
}

.input-url:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  margin-top: 8px;
  font-size: 14px;
  color: #ef4444;
}

.link-preview {
  padding: 12px 16px;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: 6px;
  font-size: 14px;
}

.preview-label {
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
  margin-right: 8px;
}

.preview-link {
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
  word-break: break-all;
}

.preview-link:hover {
  text-decoration: underline;
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
  min-height: 48px; /* 触摸友好 */
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

.btn-remove {
  background: #fee2e2;
  color: #ef4444;
}

.btn-remove:hover {
  background: #fecaca;
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

.modal-enter-active .link-dialog,
.modal-leave-active .link-dialog {
  transition: transform 0.2s ease;
}

.modal-enter-from .link-dialog,
.modal-leave-to .link-dialog {
  transform: scale(0.95) translateY(20px);
}

.modal-enter-from .link-dialog.is-mobile,
.modal-leave-to .link-dialog.is-mobile {
  transform: translateY(100%);
}

/* 暗色主题 */
[data-theme='dark'] .link-dialog {
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

[data-theme='dark'] .input-url {
  background: #111827;
  border-color: #374151;
  color: #f9fafb;
}

[data-theme='dark'] .link-preview {
  background: #111827;
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


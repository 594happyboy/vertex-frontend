<template>
  <Teleport to="body">
    <transition name="dialog">
      <div v-if="show" class="dialog-overlay" @click="handleClose">
        <div class="dialog-container" @click.stop>
          <div class="dialog-header">
            <h3>{{ parentFolderId ? '新建子文件夹' : '新建文件夹' }}</h3>
            <button class="btn-close" @click="handleClose">
              <Icon icon="mdi:close" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="form-group">
              <label class="form-label">文件夹名称</label>
              <input
                ref="nameInput"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="请输入文件夹名称..."
                @keyup.enter="handleSubmit"
                @keyup.esc="handleClose"
              />
            </div>

            <div class="form-group">
              <label class="form-label">颜色标识（可选）</label>
              <div class="color-picker">
                <button
                  v-for="color in colorOptions"
                  :key="color.value"
                  class="color-option"
                  :class="{ active: formData.color === color.value }"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                  @click="formData.color = color.value"
                >
                  <Icon v-if="formData.color === color.value" icon="mdi:check" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">描述（可选）</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                placeholder="添加文件夹描述..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-secondary" @click="handleClose">
              取消
            </button>
            <button class="btn btn-primary" @click="handleSubmit" :disabled="!formData.name.trim()">
              <Icon icon="mdi:check" />
              创建
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  parentFolderId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['close', 'submit']);

const nameInput = ref(null);
const formData = ref({
  name: '',
  color: '#6076FF',
  description: '',
});

const colorOptions = [
  { name: '蓝色', value: '#6076FF' },
  { name: '紫色', value: '#9C27B0' },
  { name: '粉色', value: '#E91E63' },
  { name: '红色', value: '#F44336' },
  { name: '橙色', value: '#FF9800' },
  { name: '黄色', value: '#FFC107' },
  { name: '绿色', value: '#4CAF50' },
  { name: '青色', value: '#00BCD4' },
];

watch(() => props.show, async (show) => {
  if (show) {
    // 重置表单
    formData.value = {
      name: '',
      color: '#6076FF',
      description: '',
    };
    
    // 聚焦输入框
    await nextTick();
    nameInput.value?.focus();
  }
});

function handleClose() {
  emit('close');
}

function handleSubmit() {
  const name = formData.value.name.trim();
  if (!name) return;
  
  emit('submit', {
    name,
    parentId: props.parentFolderId,
    color: formData.value.color,
    description: formData.value.description.trim() || null,
  });
  
  handleClose();
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 38, 106, 0.5);
  backdrop-filter: blur(8px);
}

.dialog-container {
  width: 90%;
  max-width: 480px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 60px rgba(47, 59, 128, 0.3);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(200, 210, 255, 0.3);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f256a;
}

.btn-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(47, 59, 128, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(96, 118, 255, 0.1);
  color: #1f256a;
}

.btn-close :deep(svg) {
  font-size: 20px;
}

.dialog-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(47, 59, 128, 0.8);
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid rgba(200, 210, 255, 0.5);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f256a;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(96, 118, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(96, 118, 255, 0.1);
}

.form-textarea {
  resize: vertical;
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-option.active {
  border-color: #1f256a;
  box-shadow: 0 0 0 3px rgba(96, 118, 255, 0.2);
}

.color-option :deep(svg) {
  font-size: 20px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid rgba(200, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.5);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(200, 210, 255, 0.2);
  color: #1f256a;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(200, 210, 255, 0.35);
}

.btn-primary {
  background: linear-gradient(135deg, rgba(96, 118, 255, 0.9), rgba(68, 95, 247, 1));
  color: white;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 8px 20px -8px rgba(96, 118, 255, 0.6);
  transform: translateY(-1px);
}

.btn :deep(svg) {
  font-size: 18px;
}

/* 动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container,
.dialog-leave-to .dialog-container {
  transform: scale(0.9) translateY(20px);
}
</style>


<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>新建</h3>
        <button class="btn-close" @click="$emit('close')">
          <Icon icon="mdi:close" />
        </button>
      </div>

      <div class="dialog-body">
        <div class="create-options">
          <button class="create-option" @click="handleCreate('md')">
            <Icon icon="mdi:file-document-plus" class="option-icon" />
            <div class="option-content">
              <div class="option-title">Markdown 文档</div>
              <div class="option-desc">创建 Markdown 格式文档</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('pdf')" :disabled="uploading">
            <Icon icon="mdi:file-pdf-box" class="option-icon" />
            <div class="option-content">
              <div class="option-title">PDF 文档</div>
              <div class="option-desc">{{ uploading ? '上传中...' : '上传 PDF 文件' }}</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('txt')" :disabled="uploading">
            <Icon icon="mdi:file-document" class="option-icon" />
            <div class="option-content">
              <div class="option-title">TXT 文档</div>
              <div class="option-desc">创建纯文本文档</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('import')" :disabled="uploading">
            <Icon icon="mdi:file-import" class="option-icon" />
            <div class="option-content">
              <div class="option-title">导入文件</div>
              <div class="option-desc">{{ uploading ? '上传中...' : '导入本地 Markdown、PDF 或 TXT' }}</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('batch')" :disabled="uploading">
            <Icon icon="mdi:folder-zip" class="option-icon" />
            <div class="option-content">
              <div class="option-title">批量导入</div>
              <div class="option-desc">{{ uploading ? '上传中...' : '上传 ZIP 压缩包批量导入' }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件选择器 -->
    <input
      ref="pdfInputRef"
      type="file"
      accept=".pdf"
      style="display: none"
      @change="handlePdfSelect"
    />
    <input
      ref="importInputRef"
      type="file"
      accept=".md,.pdf,.txt"
      style="display: none"
      @change="handleImportSelect"
    />
    <input
      ref="batchInputRef"
      type="file"
      accept=".zip"
      style="display: none"
      @change="handleBatchSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useResponsive } from '@/composables';
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';
import { batchUploadDocuments } from '../api/document';

const { isMobile } = useResponsive();

const emit = defineEmits(['close']);

const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

const pdfInputRef = ref(null);
const importInputRef = ref(null);
const batchInputRef = ref(null);
const uploading = ref(false);

async function handleCreate(type) {
  try {
    if (type === 'md' || type === 'txt') {
      emit('close');
      const title = prompt('请输入文档标题：');
      if (!title?.trim()) return;
      
      const file = createTextFile(title.trim(), type);
      const doc = await docStore.createDoc(title.trim(), file);
      
      await treeStore.fetchTree();
      treeStore.selectNode(doc.id, 'document');
      
      const typeName = type === 'md' ? 'Markdown' : 'TXT';
      uiStore.showSuccess(`${typeName} 文档创建成功`);
    } else {
      const inputMap = { pdf: pdfInputRef, import: importInputRef, batch: batchInputRef };
      inputMap[type]?.value?.click();
    }
  } catch (error) {
    uiStore.showError(error.message || '操作失败');
  }
}

// 工具函数：创建文本文件
function createTextFile(title, type) {
  const config = {
    md: { content: `# ${title}\n\n开始编写你的文档...`, mime: 'text/markdown', ext: '.md' },
    txt: { content: '', mime: 'text/plain', ext: '.txt' }
  }[type];
  
  const blob = new Blob([config.content], { type: config.mime });
  return new File([blob], `${title}${config.ext}`, { type: config.mime });
}

// 处理PDF文件选择
async function handlePdfSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  event.target.value = '';
  await uploadDocument(file);
}

// 处理导入文件选择
async function handleImportSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  event.target.value = '';

  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const supportedTypes = ['.md', '.pdf', '.txt'];
  
  if (!supportedTypes.includes(fileExt)) {
    uiStore.showError('不支持的文件格式，仅支持 .md、.pdf 和 .txt');
    return;
  }

  await uploadDocument(file);
}

// 上传文档（通用方法）
async function uploadDocument(file) {
  if (uploading.value) return;

  try {
    uploading.value = true;
    emit('close');
    uiStore.showInfo('文件上传中，请稍候...');

    const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const doc = await docStore.createDoc(title, file);

    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    
    const typeMap = { '.md': 'Markdown', '.pdf': 'PDF', '.txt': 'TXT' };
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    uiStore.showSuccess(`${typeMap[fileExt] || '文档'} 导入成功`);
  } catch (error) {
    console.error('Upload error:', error);
    uiStore.showError(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
  }
}

// 处理批量导入文件选择
async function handleBatchSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  event.target.value = '';
  await handleBatchUpload(file);
}

// 批量上传处理
async function handleBatchUpload(file, parentGroupId = null) {
  if (uploading.value) return;

  const validationError = validateBatchFile(file);
  if (validationError) {
    uiStore.showError(validationError);
    return;
  }

  try {
    uploading.value = true;
    emit('close');
    uiStore.showInfo('正在上传压缩包，请稍候...');

    const result = await batchUploadDocuments(file, parentGroupId);
    await treeStore.fetchTree();
    
    const { successCount, failedCount } = result;
    if (failedCount === 0) {
      uiStore.showSuccess(`批量导入成功！共导入 ${result.totalFolders} 个分组，${successCount} 个文档`);
    } else {
      const failedMsg = result.items
        .filter(item => !item.success)
        .map(item => `${item.name}: ${item.message}`)
        .join('\n');
      uiStore.showError(`部分导入失败！成功：${successCount}，失败：${failedCount}\n${failedMsg}`);
    }
  } catch (error) {
    console.error('Batch upload error:', error);
    uiStore.showError(error.message || '批量导入失败');
  } finally {
    uploading.value = false;
  }
}

// 验证批量上传文件
function validateBatchFile(file) {
  const MAX_SIZE = 100 * 1024 * 1024;
  if (!file.name.toLowerCase().endsWith('.zip')) return '请选择 ZIP 格式的压缩包';
  if (file.size > MAX_SIZE) return '文件大小超过限制（最大100MB）';
  return null;
}

defineExpose({ handleBatchUpload });
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.dialog {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  background-color: var(--color-bg-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .dialog-header {
    padding: var(--spacing-mobile-md);
  }
}

.dialog-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .dialog-header h3 {
    font-size: var(--font-size-mobile-lg);
  }
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-height-sm);
  height: var(--btn-height-sm);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
  font-size: var(--icon-size-lg);
}

@media (max-width: 768px) {
  .btn-close {
    width: var(--btn-height-mobile-sm);
    height: var(--btn-height-mobile-sm);
    font-size: var(--icon-size-mobile-lg);
  }
}

.btn-close:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.dialog-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .dialog-body {
    padding: var(--spacing-mobile-md);
  }
}

.create-options {
  display: grid;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .create-options {
    gap: var(--spacing-mobile-sm);
  }
}

.create-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-fast);
  text-align: left;
  min-height: var(--touch-target-min);
}

@media (max-width: 768px) {
  .create-option {
    gap: var(--spacing-mobile-sm);
    padding: var(--spacing-mobile-sm) var(--spacing-mobile-md);
  }
}

.create-option:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--color-bg-hover);
}

.create-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-icon {
  font-size: var(--icon-size-xl);
  color: var(--color-primary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .option-icon {
    font-size: var(--icon-size-mobile-xl);
  }
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

@media (max-width: 768px) {
  .option-title {
    font-size: var(--font-size-mobile-base);
    margin-bottom: var(--spacing-mobile-2xs);
  }
}

.option-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .option-desc {
    font-size: var(--font-size-mobile-sm);
  }
}
</style>


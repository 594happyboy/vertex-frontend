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

          <button class="create-option" @click="handleCreate('import')" :disabled="uploading">
            <Icon icon="mdi:file-import" class="option-icon" />
            <div class="option-content">
              <div class="option-title">导入文件</div>
              <div class="option-desc">{{ uploading ? '上传中...' : '导入本地 Markdown 或 PDF' }}</div>
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
      accept=".md,.pdf"
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
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';
import { uploadFile } from '../api/file';
import { batchUploadDocuments } from '../api/document';

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
    if (type === 'md') {
      emit('close');
      const title = prompt('请输入文档标题：');
      if (!title || !title.trim()) return;
      
      const doc = await docStore.createDoc(title.trim(), 'md');
      await treeStore.fetchTree();
      treeStore.selectNode(doc.id, 'document');
      uiStore.showSuccess('文档创建成功');
    } else if (type === 'pdf') {
      // 触发PDF文件选择
      pdfInputRef.value?.click();
    } else if (type === 'import') {
      // 触发导入文件选择
      importInputRef.value?.click();
    } else if (type === 'batch') {
      // 触发批量导入文件选择
      batchInputRef.value?.click();
    }
  } catch (error) {
    uiStore.showError(error.message || '操作失败');
  }
}

// 处理PDF文件选择
async function handlePdfSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 重置input，允许重复选择同一个文件
  event.target.value = '';

  await uploadDocument(file, 'pdf');
}

// 处理导入文件选择
async function handleImportSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 重置input，允许重复选择同一个文件
  event.target.value = '';

  // 根据文件扩展名判断类型
  const fileName = file.name;
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  
  let docType = '';
  if (fileExt === '.md') {
    docType = 'md';
  } else if (fileExt === '.pdf') {
    docType = 'pdf';
  } else {
    uiStore.showError('不支持的文件格式，仅支持 .md 和 .pdf');
    return;
  }

  await uploadDocument(file, docType);
}

// 上传文档（通用方法）
async function uploadDocument(file, docType) {
  if (uploading.value) return;

  try {
    uploading.value = true;
    emit('close');
    
    // 显示上传提示
    uiStore.showInfo('文件上传中，请稍候...');

    // 1. 上传文件到服务器
    const fileData = await uploadFile(file);
    
    // 2. 从文件名提取标题（去除扩展名）
    const fileName = file.name;
    const title = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    // 3. 创建文档记录
    let doc;
    if (docType === 'md') {
      // 对于Markdown文件，需要读取内容
      const content = await readFileAsText(file);
      doc = await docStore.createDocWithFile(title, docType, fileData.id, content);
    } else {
      // 对于PDF文件，只需要关联文件ID
      doc = await docStore.createDocWithFile(title, docType, fileData.id);
    }

    // 4. 刷新树并选中新文档
    await treeStore.fetchTree();
    treeStore.selectNode(doc.id, 'document');
    
    uiStore.showSuccess(`${docType === 'md' ? 'Markdown' : 'PDF'} 文档导入成功`);
  } catch (error) {
    console.error('Upload error:', error);
    uiStore.showError(error.message || '文件上传失败');
  } finally {
    uploading.value = false;
  }
}

// 读取文件内容为文本
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

// 处理批量导入文件选择
async function handleBatchSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 重置input，允许重复选择同一个文件
  event.target.value = '';

  await handleBatchUpload(file);
}

// 批量上传处理
async function handleBatchUpload(file, parentGroupId = null) {
  if (uploading.value) return;

  // 验证文件类型
  if (!file.name.toLowerCase().endsWith('.zip')) {
    uiStore.showError('请选择 ZIP 格式的压缩包');
    return;
  }

  // 验证文件大小（最大100MB）
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    uiStore.showError('文件大小超过限制（最大100MB）');
    return;
  }

  try {
    uploading.value = true;
    emit('close');
    
    // 显示上传提示
    uiStore.showInfo('正在上传压缩包，请稍候...');

    // 调用批量上传API
    const result = await batchUploadDocuments(file, parentGroupId);
    
    // 刷新文档树
    await treeStore.fetchTree();
    
    // 显示结果
    const { totalFiles, totalFolders, successCount, failedCount, items } = result;
    
    if (failedCount === 0) {
      uiStore.showSuccess(
        `批量导入成功！共导入 ${totalFolders} 个分组，${successCount} 个文档`
      );
    } else {
      // 显示详细的失败信息
      const failedItems = items.filter(item => !item.success);
      const failedMsg = failedItems.map(item => `${item.name}: ${item.message}`).join('\n');
      
      uiStore.showError(
        `部分导入失败！成功：${successCount}，失败：${failedCount}\n${failedMsg}`
      );
    }
    
  } catch (error) {
    console.error('Batch upload error:', error);
    uiStore.showError(error.message || '批量导入失败');
  } finally {
    uploading.value = false;
  }
}

// 导出供外部使用
defineExpose({
  handleBatchUpload
});
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
  border-radius: var(--radius-xl);
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

.dialog-header h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  font-size: 20px;
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

.create-options {
  display: grid;
  gap: var(--spacing-md);
}

.create-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  text-align: left;
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
  font-size: 32px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.option-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>


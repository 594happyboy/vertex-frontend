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
          <button class="create-option" @click="handleCreate('group')">
            <Icon icon="mdi:folder-plus" class="option-icon" />
            <div class="option-content">
              <div class="option-title">新建分组</div>
              <div class="option-desc">创建一个文档分组</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('md')">
            <Icon icon="mdi:file-document-plus" class="option-icon" />
            <div class="option-content">
              <div class="option-title">Markdown 文档</div>
              <div class="option-desc">创建 Markdown 格式文档</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('pdf')">
            <Icon icon="mdi:file-pdf-box" class="option-icon" />
            <div class="option-content">
              <div class="option-title">PDF 文档</div>
              <div class="option-desc">上传 PDF 文件</div>
            </div>
          </button>

          <button class="create-option" @click="handleCreate('import')">
            <Icon icon="mdi:file-import" class="option-icon" />
            <div class="option-content">
              <div class="option-title">导入文件</div>
              <div class="option-desc">导入本地 Markdown 或 PDF</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { useTreeStore } from '../stores/tree';
import { useDocStore } from '../stores/doc';
import { useUiStore } from '../stores/ui';

const emit = defineEmits(['close']);

const treeStore = useTreeStore();
const docStore = useDocStore();
const uiStore = useUiStore();

async function handleCreate(type) {
  emit('close');

  try {
    if (type === 'group') {
      const name = prompt('请输入分组名称：');
      if (!name || !name.trim()) return;
      
      await treeStore.createGroup(name.trim());
      uiStore.showSuccess('分组创建成功');
    } else if (type === 'md') {
      const title = prompt('请输入文档标题：');
      if (!title || !title.trim()) return;
      
      const doc = await docStore.createDoc(title.trim(), 'md');
      await treeStore.fetchTree();
      treeStore.selectNode(doc.id, 'document');
      uiStore.showSuccess('文档创建成功');
    } else if (type === 'pdf' || type === 'import') {
      uiStore.showInfo('此功能正在开发中');
    }
  } catch (error) {
    uiStore.showError(error.message || '操作失败');
  }
}
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
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
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

.create-option:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-hover);
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


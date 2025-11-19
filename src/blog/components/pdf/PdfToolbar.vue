<template>
  <div class="pdf-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-icon">
        <Icon icon="mdi:file-pdf-box" />
      </span>
      <div class="toolbar-title">
        <h2 class="doc-title" :title="docTitle">{{ docTitle }}</h2>
        <span class="doc-status">PDF 文档</span>
      </div>
    </div>

    <div class="toolbar-right">
      <!-- 模式切换（仅PC端显示） -->
      <div v-if="!isMobile" class="control-group">
        <button 
          class="btn-icon" 
          :class="{ active: viewMode === 'paged' }"
          @click="$emit('switch-mode', 'paged')" 
          title="分页模式"
        >
          <Icon icon="mdi:book-open-page-variant" />
        </button>
        <button 
          class="btn-icon" 
          :class="{ active: viewMode === 'scroll' }"
          @click="$emit('switch-mode', 'scroll')" 
          title="滚动模式"
        >
          <Icon icon="mdi:view-sequential" />
        </button>
      </div>

      <!-- 翻页控制（仅分页模式显示，移动端隐藏） -->
      <div v-if="viewMode === 'paged' && !isMobile" class="control-group">
        <button 
          class="btn-icon" 
          @click="$emit('prev-page')" 
          :disabled="isFirstPage || rendering" 
          title="上一页"
        >
          <Icon icon="mdi:chevron-left" />
        </button>
        <span class="page-info">
          <input
            :value="pageInput"
            @input="$emit('update:page-input', Number($event.target.value))"
            @keydown.enter="$emit('go-to-page')"
            @blur="$emit('reset-page-input')"
            type="number"
            min="1"
            :max="totalPages"
            class="page-input"
            :disabled="rendering"
          />
          <span class="page-separator">/</span>
          <span class="page-total">{{ totalPages }}</span>
        </span>
        <button 
          class="btn-icon" 
          @click="$emit('next-page')" 
          :disabled="isLastPage || rendering" 
          title="下一页"
        >
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>

      <!-- 页码显示（滚动模式） -->
      <div v-if="viewMode === 'scroll'" class="page-indicator">
        {{ currentPage }} / {{ totalPages }}
      </div>

      <!-- 缩放控制（PC端显示） -->
      <div v-if="!isMobile" class="control-group">
        <button 
          class="btn-icon" 
          @click="$emit('zoom-out')" 
          :disabled="!canZoomOut || rendering" 
          title="缩小"
        >
          <Icon icon="mdi:minus" />
        </button>
        <span class="zoom-info">{{ scalePercent }}%</span>
        <button 
          class="btn-icon" 
          @click="$emit('zoom-in')" 
          :disabled="!canZoomIn || rendering" 
          title="放大"
        >
          <Icon icon="mdi:plus" />
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  docTitle: {
    type: String,
    default: '',
  },
  viewMode: {
    type: String,
    default: 'paged',
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 0,
  },
  pageInput: {
    type: Number,
    default: 1,
  },
  scale: {
    type: Number,
    default: 1.5,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  rendering: {
    type: Boolean,
    default: false,
  },
  scaleMin: {
    type: Number,
    default: 0.5,
  },
  scaleMax: {
    type: Number,
    default: 3,
  },
});

defineEmits([
  'switch-mode',
  'prev-page',
  'next-page',
  'go-to-page',
  'reset-page-input',
  'update:page-input',
  'zoom-in',
  'zoom-out',
]);

const isFirstPage = computed(() => props.currentPage <= 1);
const isLastPage = computed(() => props.currentPage >= props.totalPages);
const canZoomIn = computed(() => props.scale < props.scaleMax);
const canZoomOut = computed(() => props.scale > props.scaleMin);
const scalePercent = computed(() => Math.round(props.scale * 100));
</script>

<style scoped>
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(247, 249, 255, 0.98), rgba(233, 239, 255, 0.95));
  border-bottom: 1px solid rgba(220, 230, 255, 0.7);
  box-shadow: 0 2px 8px rgba(18, 28, 88, 0.1);
  backdrop-filter: blur(18px);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .pdf-toolbar {
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  flex-shrink: 0;
  gap: 12px;
}

@media (max-width: 768px) {
  .toolbar-left,
  .toolbar-right {
    gap: 8px;
  }
  
  .toolbar-left {
    flex-basis: 100%;
    max-width: 100%;
  }
  
  .toolbar-right {
    flex-wrap: wrap;
    gap: 6px;
  }
}

.toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 93, 93, 0.22), rgba(255, 136, 28, 0.18));
  color: #842632;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.toolbar-icon :deep(svg) {
  font-size: 20px;
}

@media (max-width: 768px) {
  .toolbar-icon {
    width: 32px;
    height: 32px;
  }
  
  .toolbar-icon :deep(svg) {
    font-size: 18px;
  }
}

.toolbar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.doc-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2664;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .doc-title {
    font-size: 14px;
  }
}

.doc-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(31, 39, 102, 0.65);
}

@media (max-width: 768px) {
  .doc-status {
    font-size: 11px;
  }
}

.control-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(196, 206, 255, 0.5);
}

@media (max-width: 768px) {
  .control-group {
    gap: 6px;
    padding: 6px 10px;
  }
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #4a5578;
  background-color: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 18px;
  cursor: pointer;
}

.btn-icon:hover:not(:disabled) {
  background-color: rgba(116, 137, 255, 0.15);
  color: #1f2a72;
  border-color: rgba(116, 137, 255, 0.3);
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon.active {
  background-color: rgba(116, 137, 255, 0.2);
  color: #1f2a72;
  border-color: rgba(116, 137, 255, 0.4);
}

@media (max-width: 768px) {
  .btn-icon {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
}

.page-info,
.zoom-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2a72;
  user-select: none;
}

@media (max-width: 768px) {
  .page-info,
  .zoom-info {
    font-size: 14px;
    gap: 4px;
  }
}

.page-input {
  width: 45px;
  padding: 4px 6px;
  text-align: center;
  border: 1px solid rgba(196, 206, 255, 0.6);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #1f2a72;
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.2s ease;
}

@media (max-width: 768px) {
  .page-input {
    width: 50px;
    padding: 6px 8px;
    font-size: 14px;
  }
}

.page-input:focus {
  outline: none;
  border-color: rgba(108, 126, 255, 0.8);
  background-color: #fff;
}

.page-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-separator {
  color: rgba(31, 39, 102, 0.45);
  font-weight: 400;
}

.page-total {
  min-width: 24px;
}

.zoom-info {
  min-width: 52px;
  justify-content: center;
}

.page-indicator {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(196, 206, 255, 0.5);
  font-size: 13px;
  font-weight: 500;
  color: #1f2a72;
  user-select: none;
}

@media (max-width: 768px) {
  .page-indicator {
    font-size: 14px;
    padding: 8px 14px;
  }
}

</style>


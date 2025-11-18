<template>
  <aside 
    class="latest-sidebar"
    :class="{ collapsed: collapsed }"
    :style="{ width: width + 'px' }"
  >
    <div class="latest-root">
      <div class="latest-root__leading">
        <span class="latest-root__icon">
          <Icon icon="mdi:update" />
        </span>
        <span class="latest-root__label">最新文档</span>
      </div>
      <div class="latest-root__meta">共 {{ total }} 篇</div>
    </div>

    <div class="latest-doc-list" data-scroll ref="listRef">
      <div v-if="loading && !docs.length" class="latest-status">
        <Icon icon="mdi:loading" class="spin" />
        <span>正在加载最新内容...</span>
      </div>

      <div v-else-if="error && !docs.length" class="latest-status latest-status--error">
        <Icon icon="mdi:alert-circle-outline" />
        <span>{{ error }}</span>
        <button type="button" class="latest-status__action" @click="$emit('refresh')">
          重试
        </button>
      </div>

      <div v-else-if="!loading && docs.length === 0" class="latest-status latest-status--empty">
        <Icon icon="mdi:file-search-outline" />
        <span>这里还没有文档</span>
        <p>稍后再来看看最新更新吧。</p>
      </div>

      <template v-else>
        <button
          v-for="doc in docs"
          :key="doc.id"
          class="latest-doc-item"
          :class="{ active: currentDocId === doc.id }"
          type="button"
          @click="$emit('select', doc.id)"
        >
          <div class="latest-doc-item__title" :title="doc.title">
            {{ doc.title || '未命名文档' }}
          </div>
          <div class="latest-doc-item__meta">
            更新于 {{ formatDate(doc.updatedAt || doc.createdAt) }}
          </div>
        </button>
      </template>

      <InfiniteFooterBar :state="barState" @retry="$emit('retry')" />
      <div ref="sentinelRef" class="latest-sentinel" />
    </div>
  </aside>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { formatDate } from '@/utils/formatters';
import InfiniteFooterBar from '../../../shared/InfiniteFooterBar.vue';

defineProps({
  docs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  total: {
    type: Number,
    default: 0,
  },
  currentDocId: {
    type: [String, Number],
    default: null,
  },
  barState: {
    type: String,
    default: 'idle',
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 280,
  },
  listRef: {
    type: Object,
    default: null,
  },
  sentinelRef: {
    type: Object,
    default: null,
  },
});

defineEmits(['select', 'refresh', 'retry']);
</script>

<style scoped>
.latest-sidebar {
  position: relative;
  width: 280px;
  background: #ffffff;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  gap: 16px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 16px -2px rgba(0, 0, 0, 0.08), 6px 0 24px -2px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.latest-sidebar.collapsed {
  width: 0 !important;
  opacity: 0;
  overflow: hidden;
  padding: 0;
}

.latest-root {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.latest-root__leading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.latest-root__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(99, 102, 241, 1);
}

.latest-root__label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.latest-root__meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.latest-doc-list {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 6px;
}

.latest-sentinel {
  height: 1px;
}

.latest-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  text-align: center;
}

.latest-status :deep(svg) {
  font-size: 32px;
}

.latest-status.latest-status--error {
  color: var(--color-error);
}

.latest-status.latest-status--empty {
  color: var(--color-text-tertiary);
}

.latest-status__action {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.latest-status__action:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-hover);
}

.latest-doc-item {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  text-align: left;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.latest-doc-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-text-primary);
}

.latest-doc-item.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  color: var(--color-text-primary);
}

.latest-doc-item__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-doc-item__meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

/* 暗色主题 */
[data-theme='dark'] .latest-sidebar {
  background: #111827;
  border-right-color: rgba(148, 163, 184, 0.2);
  box-shadow: 4px 0 16px -2px rgba(0, 0, 0, 0.4), 6px 0 24px -2px rgba(0, 0, 0, 0.3);
}

[data-theme='dark'] .latest-doc-item {
  color: #e5e7eb;
}

[data-theme='dark'] .latest-doc-item__meta {
  color: #9ca3af;
}

[data-theme='dark'] .latest-doc-item.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
}
</style>

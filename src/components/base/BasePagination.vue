<template>
  <nav v-if="totalPages > 1" class="pagination">
    <button 
      class="pagination-btn"
      :disabled="current === 1"
      @click="changePage(current - 1)"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      <span class="btn-text">上一页</span>
    </button>

    <div class="pagination-numbers">
      <button 
        v-for="page in visiblePages"
        :key="page"
        :class="['pagination-number', { 'is-active': page === current, 'is-ellipsis': page === '...' }]"
        :disabled="page === '...'"
        @click="page !== '...' && changePage(page)"
      >
        {{ page }}
      </button>
    </div>

    <button 
      class="pagination-btn"
      :disabled="current === totalPages"
      @click="changePage(current + 1)"
    >
      <span class="btn-text">下一页</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  showPages: {
    type: Number,
    default: 7
  }
})

const emit = defineEmits(['change'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = props.current
  const show = props.showPages

  if (total <= show) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(show / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + show - 1)

    if (end - start < show - 1) {
      start = Math.max(1, end - show + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < total) {
      if (end < total - 1) {
        pages.push('...')
      }
      pages.push(total)
    }
  }

  return pages
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.current) {
    emit('change', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin: var(--spacing-8) 0;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-base);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-500);
  color: var(--primary-500);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: var(--spacing-1);
}

.pagination-number {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);
}

.pagination-number:hover:not(:disabled):not(.is-active) {
  background: var(--gray-100);
}

.pagination-number.is-active {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.pagination-number.is-ellipsis {
  cursor: default;
  border: none;
}

.pagination-number:disabled {
  cursor: default;
}

@media (max-width: 767px) {
  .btn-text {
    display: none;
  }
  
  .pagination-number {
    min-width: 32px;
    height: 32px;
    font-size: var(--text-xs);
  }
}
</style>


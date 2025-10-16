<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">
      <svg class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="3" stroke-linecap="round" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  block: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    'btn--block': props.block,
    'btn--loading': props.loading
  }
])

const handleClick = (e) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: 1;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all var(--duration-base) var(--easing);
  white-space: nowrap;
}

/* 变体 */
.btn--primary {
  background: var(--primary-500);
  color: white;
  box-shadow: var(--shadow-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(63, 122, 254, 0.3);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn--secondary {
  background: var(--gray-100);
  color: var(--text-primary);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--gray-200);
}

.btn--ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--gray-100);
  border-color: var(--primary-300);
  color: var(--primary-600);
}

.btn--danger {
  background: var(--error);
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn--success {
  background: var(--success);
  color: white;
}

.btn--success:hover:not(:disabled) {
  background: #059669;
}

/* 尺寸 */
.btn--sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
}

.btn--lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--text-lg);
}

/* 状态 */
.btn:disabled,
.btn--loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--block {
  width: 100%;
}

.btn-loading {
  display: inline-flex;
  align-items: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}
</style>


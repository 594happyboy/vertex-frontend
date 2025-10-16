<template>
  <span 
    :class="tagClasses"
    @click="handleClick"
  >
    <slot />
    <button 
      v-if="closable" 
      class="tag-close" 
      @click.stop="handleClose"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  closable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'close'])

const tagClasses = computed(() => [
  'tag',
  `tag--${props.variant}`,
  `tag--${props.size}`,
  {
    'tag--clickable': props.clickable || props.closable
  }
])

const handleClick = (e) => {
  if (props.clickable) {
    emit('click', e)
  }
}

const handleClose = (e) => {
  emit('close', e)
}
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: 1;
  border: 1px solid transparent;
  transition: all var(--duration-fast);
  white-space: nowrap;
}

.tag--clickable {
  cursor: pointer;
}

/* 变体 */
.tag--primary {
  background: var(--primary-100);
  color: var(--primary-700);
  border-color: var(--primary-300);
}

.tag--primary:hover {
  background: var(--primary-200);
  transform: translateY(-1px);
}

.tag--secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
}

.tag--secondary:hover {
  background: var(--gray-200);
}

.tag--success {
  background: #D1FAE5;
  color: #065F46;
  border-color: #6EE7B7;
}

.tag--warning {
  background: #FEF3C7;
  color: #92400E;
  border-color: #FCD34D;
}

.tag--error {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.tag--info {
  background: #DBEAFE;
  color: #1E40AF;
  border-color: #93C5FD;
}

/* 尺寸 */
.tag--sm {
  padding: 2px var(--spacing-2);
  font-size: var(--text-xs);
}

.tag--lg {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-base);
}

.tag-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: var(--spacing-1);
  background: transparent;
  border: none;
  cursor: pointer;
  color: currentColor;
  opacity: 0.6;
  transition: opacity var(--duration-fast);
}

.tag-close:hover {
  opacity: 1;
}
</style>


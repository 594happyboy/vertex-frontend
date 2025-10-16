<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 'has-error': error }">
      <span v-if="prefixIcon" class="input-icon input-icon--prefix">
        <component :is="prefixIcon" />
      </span>
      
      <input 
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <span v-if="suffixIcon" class="input-icon input-icon--suffix">
        <component :is="suffixIcon" />
      </span>
    </div>
    
    <div v-if="error" class="input-error">{{ error }}</div>
    <div v-else-if="hint" class="input-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number,
    default: null
  },
  prefixIcon: {
    type: Object,
    default: null
  },
  suffixIcon: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
const isFocused = ref(false)

const inputClasses = computed(() => [
  'input',
  {
    'has-prefix': props.prefixIcon,
    'has-suffix': props.suffixIcon,
    'is-error': props.error,
    'is-focused': isFocused.value
  }
])

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleFocus = (e) => {
  isFocused.value = true
  emit('focus', e)
}

const handleBlur = (e) => {
  isFocused.value = false
  emit('blur', e)
}
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.required-mark {
  color: var(--error);
  margin-left: var(--spacing-1);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all var(--duration-base);
  outline: none;
}

.input.has-prefix {
  padding-left: var(--spacing-10);
}

.input.has-suffix {
  padding-right: var(--spacing-10);
}

.input:hover:not(:disabled) {
  border-color: var(--border-hover);
}

.input:focus,
.input.is-focused {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(63, 122, 254, 0.1);
}

.input.is-error {
  border-color: var(--error);
}

.input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.input-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  width: 20px;
  height: 20px;
}

.input-icon--prefix {
  left: var(--spacing-4);
}

.input-icon--suffix {
  right: var(--spacing-4);
}

.input-error {
  font-size: var(--text-sm);
  color: var(--error);
}

.input-hint {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>


<template>
  <nav class="module-sidebar">
    <button
      v-for="module in modules"
      :key="module.id"
      class="module-sidebar__item"
      :class="{ active: activeModuleId === module.id }"
      type="button"
      @click="$emit('select', module.id)"
    >
      <Icon :icon="module.icon" class="module-sidebar__icon" />
      <span class="module-sidebar__text">{{ module.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  modules: {
    type: Array,
    required: true,
  },
  activeModuleId: {
    type: String,
    required: true,
  },
});

defineEmits(['select']);
</script>

<style scoped>
.module-sidebar {
  flex: 0 0 71px;
  background: #ffffff;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  padding: 16px 5px;
  gap: 12px;
}

.module-sidebar__item {
  width: 100%;
  padding: 10px 10px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.module-sidebar__item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-text-primary);
}

.module-sidebar__item.active {
  background: var(--color-surface-elevated, #ffffff);
  border-color: rgba(99, 102, 241, 0.35);
  color: var(--color-text-primary);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.module-sidebar__icon {
  font-size: calc(22px);
}

.module-sidebar__text {
  font-size: 11px;
  font-weight: 400;
}

/* 暗色主题 */
[data-theme='dark'] .module-sidebar {
  background: #ffffff;
  border-right-color: rgba(148, 163, 184, 0.15);
}

[data-theme='dark'] .module-sidebar__item.active {
  background: rgba(148, 163, 184, 0.08);
}
</style>

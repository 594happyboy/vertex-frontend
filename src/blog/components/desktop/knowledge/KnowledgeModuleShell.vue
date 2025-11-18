<template>
  <div class="module-shell">
    <component v-if="currentModuleComponent" :is="currentModuleComponent" ref="moduleRef" />
    <div v-else class="module-placeholder">
      <Icon :icon="moduleConfig?.icon || 'mdi:file-outline'" class="module-placeholder__icon" />
      <h3>{{ moduleConfig?.label || '未知' }}模块建设中</h3>
      <p>敬请期待，更多能力即将上线。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  moduleConfig: {
    type: Object,
    default: null,
  },
});

const currentModuleComponent = shallowRef(null);
const moduleRef = ref(null);

/**
 * 加载模块组件
 */
async function loadModule() {
  if (!props.moduleConfig?.component) {
    currentModuleComponent.value = null;
    return;
  }

  try {
    const moduleImport = await props.moduleConfig.component();
    currentModuleComponent.value = moduleImport.default || moduleImport;
  } catch (error) {
    console.error(`Failed to load module ${props.moduleConfig.id}:`, error);
    currentModuleComponent.value = null;
  }
}

// 监听模块配置变化，动态加载
watch(() => props.moduleConfig, loadModule, { immediate: true });

// 挂载时加载
onMounted(() => {
  loadModule();
});

// 暴露模块实例，供外部调用（如刷新）
defineExpose({
  moduleRef,
});
</script>

<style scoped>
.module-shell {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.module-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg-primary);
  text-align: center;
}

.module-placeholder__icon {
  font-size: 48px;
  color: var(--color-text-primary);
}

.module-placeholder h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.module-placeholder p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 暗色主题 */
[data-theme='dark'] .module-placeholder {
  background: #0f172a;
}
</style>

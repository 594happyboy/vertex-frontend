<template>
  <div class="module-shell">
    <component v-if="currentModuleComponent" :is="currentModuleComponent" ref="moduleRef" />
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted } from 'vue';

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
</style>

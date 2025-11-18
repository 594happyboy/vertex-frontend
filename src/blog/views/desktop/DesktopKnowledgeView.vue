<template>
  <div class="desktop-knowledge-view">
    <div class="desktop-layout">
      <KnowledgeModuleSidebar 
        :modules="modules" 
        :active-module-id="activeModuleId"
        @select="handleModuleSelect"
      />
      
      <KnowledgeModuleShell 
        :module-config="currentModuleConfig"
        ref="moduleShellRef"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useUiStore } from '../../stores/ui';
import { useTreeStore } from '../../stores/tree';
import { useDocStore } from '../../stores/doc';
import { useModuleRegistry } from '../../composables/modules/useModuleRegistry';
import { useModuleState } from '../../composables/modules/useModuleState';
import { DEFAULT_MODULE_ID } from '../../constants/modules';
import KnowledgeModuleSidebar from '../../components/desktop/knowledge/KnowledgeModuleSidebar.vue';
import KnowledgeModuleShell from '../../components/desktop/knowledge/KnowledgeModuleShell.vue';

const uiStore = useUiStore();
const treeStore = useTreeStore();
const docStore = useDocStore();

// 模块注册表
const { modules, getModuleById } = useModuleRegistry();

// 模块状态管理
const { saveModuleDoc, restoreModuleDoc, initModuleStates } = useModuleState();

// 当前激活的模块ID
const activeModuleId = ref(DEFAULT_MODULE_ID);

// 模块壳组件引用
const moduleShellRef = ref(null);

// 当前模块配置
const currentModuleConfig = computed(() => {
  return getModuleById(activeModuleId.value);
});

/**
 * 处理模块切换
 */
async function handleModuleSelect(moduleId) {
  if (activeModuleId.value === moduleId) return;

  // 保存当前模块的文档状态
  saveModuleDoc(activeModuleId.value);

  // 切换模块
  activeModuleId.value = moduleId;

  // 恢复新模块的文档状态
  await restoreModuleDoc(moduleId);
}

/**
 * 监听文档变化，保存到当前模块状态
 */
watch(
  () => docStore.currentDoc?.id ?? null,
  (docId) => {
    saveModuleDoc(activeModuleId.value, docId);
  }
);

/**
 * 处理窗口大小变化
 */
function handleWindowResize() {
  uiStore.initSidebar();
}

/**
 * 组件挂载
 */
onMounted(async () => {
  // 初始化侧边栏状态
  uiStore.initSidebar();

  // 初始化所有模块的状态存储
  initModuleStates(modules.value.map(m => m.id));
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize);
  
  // 加载文档树
  try {
    await treeStore.fetchTree();
  } catch (error) {
    // 401错误在request拦截器中已处理
    if (error.code !== 401) {
      uiStore.showError(error.message || '加载数据失败');
    }
  }
});

/**
 * 组件卸载
 */
onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
});
</script>

<style scoped>
.desktop-knowledge-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.desktop-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  position: relative;
}
</style>

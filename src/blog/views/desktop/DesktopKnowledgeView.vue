<template>
  <div class="desktop-knowledge-view">
    <div class="desktop-layout">
      <!-- 侧边栏 -->
      <aside 
        class="desktop-sidebar" 
        :class="{ collapsed: sidebarCollapsed }"
        :style="{ width: SIDEBAR_WIDTH + 'px' }"
      >
        <DesktopDocTree />
      </aside>

      <!-- 侧边栏把手 -->
      <DesktopSidebarHandle 
        :collapsed="sidebarCollapsed"
        :width="SIDEBAR_WIDTH"
        @toggle="toggleSidebar"
      />

      <!-- 主内容区 -->
      <main class="desktop-content">
        <DesktopDocWorkspace />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useUiStore } from '../../stores/ui';
import { useTreeStore } from '../../stores/tree';
import DesktopDocTree from '../../components/desktop/DesktopDocTree.vue';
import DesktopDocWorkspace from '../../components/desktop/DesktopDocWorkspace.vue';
import DesktopSidebarHandle from '../../components/desktop/DesktopSidebarHandle.vue';

const uiStore = useUiStore();
const treeStore = useTreeStore();

const SIDEBAR_WIDTH = 280;

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

function toggleSidebar() {
  uiStore.toggleSidebar();
}

// 处理窗口大小变化
function handleWindowResize() {
  uiStore.initSidebar();
}

onMounted(async () => {
  // 初始化侧边栏状态
  uiStore.initSidebar();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize);
  
  try {
    await treeStore.fetchTree();
  } catch (error) {
    // 401错误在request拦截器中已处理
    if (error.code !== 401) {
      uiStore.showError(error.message || '加载数据失败');
    }
  }
});

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
  gap: 0;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.desktop-sidebar {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 4px 0 16px -2px rgba(0, 0, 0, 0.08), 6px 0 24px -2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  z-index: 10;
}

.desktop-sidebar.collapsed {
  width: 0 !important;
  opacity: 0;
  overflow: hidden;
}

.desktop-content {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 暗色主题 */
[data-theme='dark'] .desktop-sidebar {
  background: #1f2937;
  box-shadow: 4px 0 16px -2px rgba(0, 0, 0, 0.3), 6px 0 24px -2px rgba(0, 0, 0, 0.2);
}
</style>


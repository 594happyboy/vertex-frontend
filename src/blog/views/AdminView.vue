<template>
  <div class="knowledge-view">
    <div class="knowledge-layout">
      <!-- 移动端遮罩层 -->
      <div 
        v-if="!sidebarCollapsed" 
        class="sidebar-overlay" 
        @click="uiStore.toggleSidebar()"
      ></div>

      <aside class="knowledge-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <!-- 文档树 -->
        <DocTree
          ref="docTreeRef"
          @refresh="handleRefresh"
        />
      </aside>

      <main class="knowledge-content">
        <div class="workspace-shell">
          <DocWorkspace />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useTreeStore } from '../stores/tree';
import { useUiStore } from '../stores/ui';
import DocTree from '../components/DocTree.vue';
import DocWorkspace from '../components/DocWorkspace.vue';

const treeStore = useTreeStore();
const uiStore = useUiStore();

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

// 处理窗口大小变化
function handleResize() {
  uiStore.initSidebar();
}

onMounted(async () => {
  // 初始化侧边栏状态（移动端默认关闭）
  uiStore.initSidebar();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  
  try {
    await treeStore.fetchTree();
  } catch (error) {
    // 401错误在request拦截器中已处理（自动跳转登录），无需再提示
    if (error.code !== 401) {
      uiStore.showError(error.message || '加载数据失败');
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

function handleRefresh() {
  treeStore.fetchTree();
}
</script>

<style scoped>
.knowledge-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.knowledge-layout {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

.knowledge-sidebar {
  position: relative;
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  transition: var(--transition-slow);
  flex-shrink: 0;
  z-index: 10;
}

.knowledge-sidebar.collapsed {
  width: 0;
  opacity: 0;
  border-right-color: transparent;
}

/* 移动端抽屉式侧边栏 */
@media (max-width: 768px) {
  .knowledge-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 85%;
    max-width: 320px;
    z-index: 100;
    transform: translateX(-100%);
    opacity: 1;
    border-right-color: var(--color-border);
    box-shadow: var(--shadow-lg);
    transition: var(--transition-slow);
  }

  .knowledge-sidebar.collapsed {
    width: 85%;
    max-width: 320px;
    opacity: 1;
    transform: translateX(-100%);
  }

  .knowledge-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}

.knowledge-content {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  transition: var(--transition-slow);
}

.workspace-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-primary);
  overflow: hidden;
}

/* 移动端侧边栏遮罩 */
.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-overlay);
    z-index: 99;
    backdrop-filter: blur(2px);
  }
}
</style>

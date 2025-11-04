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

      <!-- Web端侧边栏把手 -->
      <button 
        class="sidebar-handle"
        @click="uiStore.toggleSidebar()"
        :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <Icon :icon="sidebarCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
      </button>

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
import { Icon } from '@iconify/vue';
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

/* Web端侧边栏把手 */
.sidebar-handle {
  position: absolute;
  left: 280px; /* 紧贴侧边栏右边缘 */
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-left: none; /* 左侧无边框，与侧边栏融为一体 */
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-secondary);
  opacity: 1;
}

/* 侧边栏展开时，把手样式 */
.knowledge-sidebar:not(.collapsed) ~ .sidebar-handle {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.15);
}

/* 侧边栏收起时，把手样式 - 更明显 */
.knowledge-layout:has(.knowledge-sidebar.collapsed) .sidebar-handle {
  left: 0;
  border-left: 1px solid var(--color-border);
  border-radius: 0 8px 8px 0; /* 左侧直角，右侧圆角 */
  background: #ffffff;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  width: 24px;
  height: 100px;
}

/* 悬停效果 - 简洁优雅 */
.sidebar-handle:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transform: translateY(-50%);
}

.sidebar-handle :deep(svg) {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.sidebar-handle:hover :deep(svg) {
  transform: translateX(2px);
}

.sidebar-handle:active {
  transform: translateY(-50%) scale(0.95);
}

/* 移动端隐藏把手 */
@media (max-width: 768px) {
  .sidebar-handle {
    display: none;
  }
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

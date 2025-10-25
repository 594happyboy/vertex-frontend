<template>
  <div class="knowledge-view">
    <div class="knowledge-layout">
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
import { computed, onMounted } from 'vue';
import { useTreeStore } from '../stores/tree';
import { useUiStore } from '../stores/ui';
import DocTree from '../components/DocTree.vue';
import DocWorkspace from '../components/DocWorkspace.vue';

const treeStore = useTreeStore();
const uiStore = useUiStore();

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

onMounted(async () => {
  try {
    await treeStore.fetchTree();
  } catch (error) {
    uiStore.showError('加载数据失败');
  }
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
  border-right: 1px solid rgba(200, 210, 255, 0.3);
  background: rgba(255, 255, 255, 0.4);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-right-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.knowledge-sidebar.collapsed {
  width: 0;
  opacity: 0;
  border-right-color: transparent;
}

.knowledge-content {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.workspace-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.workspace-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, rgba(87, 110, 255, 0.08), transparent 45%, rgba(63, 191, 255, 0.06));
}
</style>

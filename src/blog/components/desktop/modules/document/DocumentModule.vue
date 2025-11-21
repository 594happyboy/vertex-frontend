<template>
  <div class="document-module">
    <aside 
      class="module-sidebar" 
      :class="{ collapsed: sidebarCollapsed }"
      :style="{ width: SIDEBAR_WIDTH + 'px' }"
    >
      <DocumentSidebar />
    </aside>

    <ModuleSidebarHandle 
      :collapsed="sidebarCollapsed"
      :width="SIDEBAR_WIDTH"
      @toggle="toggleSidebar"
    />

    <main class="module-content">
      <ModuleWorkspace />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '../../../../stores/ui';
import DocumentSidebar from './DocumentSidebar.vue';
import ModuleSidebarHandle from '../_shared/ModuleSidebarHandle.vue';
import ModuleWorkspace from '../_shared/ModuleWorkspace.vue';

const SIDEBAR_WIDTH = 280;

const uiStore = useUiStore();

const sidebarCollapsed = computed(() => uiStore.documentSidebarCollapsed);

function toggleSidebar() {
  uiStore.toggleDocumentSidebar();
}
</script>

<style scoped>
.document-module {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.module-sidebar {
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

.module-sidebar.collapsed {
  width: 0 !important;
  opacity: 0;
  overflow: hidden;
}

.module-content {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 暗色主题 */
[data-theme='dark'] .module-sidebar {
  background: #1f2937;
  box-shadow: 4px 0 16px -2px rgba(0, 0, 0, 0.3), 6px 0 24px -2px rgba(0, 0, 0, 0.2);
}
</style>

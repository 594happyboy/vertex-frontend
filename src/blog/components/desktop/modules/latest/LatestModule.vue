<template>
  <div class="latest-module">
    <LatestSidebar
      :docs="latestDocs"
      :loading="latestLoading"
      :error="latestError"
      :total="latestTotal"
      :current-doc-id="currentDocId"
      :bar-state="latestBarState"
      :collapsed="sidebarCollapsed"
      :width="SIDEBAR_WIDTH"
      :list-ref="bindLatestListRef"
      :sentinel-ref="bindLatestSentinelRef"
      @select="selectLatestDoc"
      @refresh="refreshLatestDocs"
      @retry="retryLatestLoad"
    />

    <ModuleSidebarHandle 
      :collapsed="sidebarCollapsed"
      :width="SIDEBAR_WIDTH"
      @toggle="toggleSidebar"
    />

    <main class="module-content">
      <ModuleWorkspace
        empty-title="选择一个最新文档"
        empty-description="在左侧最新文档列表中挑选内容，内容将展示在这里。"
      />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useUiStore } from '../../../../stores/ui';
import { useLatestModule } from './useLatestModule';
import LatestSidebar from './LatestSidebar.vue';
import ModuleSidebarHandle from '../_shared/ModuleSidebarHandle.vue';
import ModuleWorkspace from '../_shared/ModuleWorkspace.vue';

const SIDEBAR_WIDTH = 280;

const uiStore = useUiStore();

const {
  latestDocs,
  latestLoading,
  latestError,
  latestTotal,
  latestBarState,
  currentDocId,
  latestListRef,
  latestSentinelRef,
  selectLatestDoc,
  refreshLatestDocs,
  retryLatestLoad,
  fetchLatestDocs,
} = useLatestModule();

const bindLatestListRef = (el) => {
  latestListRef.value = el;
};

const bindLatestSentinelRef = (el) => {
  latestSentinelRef.value = el;
};

const sidebarCollapsed = computed(() => uiStore.latestSidebarCollapsed);

function toggleSidebar() {
  uiStore.toggleLatestSidebar();
}

// 组件挂载时加载最新文档
onMounted(() => {
  if (latestDocs.value.length === 0 && !latestLoading.value) {
    refreshLatestDocs();
  }
});

// 导出供外部访问（例如模块切换时重新加载）
defineExpose({
  refresh: refreshLatestDocs,
  fetchLatestDocs,
});
</script>

<style scoped>
.latest-module {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.module-content {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

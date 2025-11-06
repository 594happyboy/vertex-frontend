<template>
  <component :is="viewComponent" v-bind="componentProps" />
</template>

<script setup>
import { computed, defineAsyncComponent, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useResponsive } from '@/composables';
import { useUiStore } from '../stores/ui';

const route = useRoute();
const { isMobile } = useResponsive();
const uiStore = useUiStore();

// 懒加载组件
const DesktopKnowledge = defineAsyncComponent(() => 
  import('./desktop/DesktopKnowledgeView.vue')
);
const MobileKnowledgeList = defineAsyncComponent(() => 
  import('./mobile/MobileKnowledgeListView.vue')
);
const MobileDocEditor = defineAsyncComponent(() => 
  import('./mobile/MobileDocEditorView.vue')
);

const viewComponent = computed(() => {
  // 桌面端始终显示桌面视图
  if (!isMobile.value) {
    return DesktopKnowledge;
  }
  
  // 移动端：根据路由判断
  // /me -> 列表页
  // /me/doc/:id -> 编辑页
  return route.params.id ? MobileDocEditor : MobileKnowledgeList;
});

const componentProps = computed(() => {
  if (route.params.id) {
    return { docId: route.params.id };
  }
  return {};
});

// 监听路由变化，控制移动端导航可见性
watch(
  () => ({ path: route.path, isMobile: isMobile.value }),
  ({ path, isMobile }) => {
    if (!isMobile) {
      uiStore.showNavigation();
      return;
    }
    
    // 移动端编辑页隐藏导航
    const isEditorPage = path.includes('/doc/');
    if (isEditorPage) {
      uiStore.hideNavigation();
    } else {
      uiStore.showNavigation();
    }
  },
  { immediate: true }
);

// 清理：离开时恢复导航
onUnmounted(() => {
  if (isMobile.value) {
    uiStore.showNavigation();
  }
});
</script>

<style scoped>
/* 适配器组件，无需样式 */
</style>

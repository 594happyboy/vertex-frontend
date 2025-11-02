<template>
  <div id="app">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUiStore } from './blog/stores/ui';
import ToastContainer from './blog/components/ToastContainer.vue';

const uiStore = useUiStore();

onMounted(() => {
  // 初始化主题
  // 注意：认证状态的初始化由路由守卫统一处理，无需在此重复调用
  uiStore.initTheme();
});
</script>

<style>
@import './blog/styles/tokens.css';
@import './blog/styles/base.css';
@import './blog/styles/markdown.css';
@import 'highlight.js/styles/github.css';

/* 暗色主题的代码高亮 */
[data-theme='dark'] {
  @import 'highlight.js/styles/github-dark.css';
}
</style>

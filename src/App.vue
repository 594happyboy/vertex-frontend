<template>
  <div id="app">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './blog/stores/auth';
import { useUiStore } from './blog/stores/ui';
import ToastContainer from './blog/components/ToastContainer.vue';

const authStore = useAuthStore();
const uiStore = useUiStore();

onMounted(() => {
  // 初始化认证状态
  authStore.init();
  
  // 初始化主题
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

<template>
  <div class="public-view">
    <header class="public-header">
      <div class="header-content">
        <h1 class="site-title">{{ username }}'s Blog</h1>
        <button class="btn-login" @click="goToLogin">
          <Icon icon="mdi:login" />
          <span>登录</span>
        </button>
      </div>
    </header>

    <div class="public-body">
      <aside class="public-sidebar">
        <div class="sidebar-content">
          <h3>目录</h3>
          <!-- 简化版目录树，只显示已发布内容 -->
          <div v-if="tree.length === 0" class="empty">
            暂无内容
          </div>
          <div v-else class="tree-list">
            <!-- 这里可以复用 TreeNode，但只显示已发布的内容 -->
            <p class="placeholder">公开内容树待实现</p>
          </div>
        </div>
      </aside>

      <main class="public-content">
        <div class="content-wrapper">
          <h2>欢迎访问</h2>
          <p>这是一个公开的博客页面。左侧可以浏览已发布的文档。</p>
          <p class="info">此页面功能待完善</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useTreeStore } from '../stores/tree';

const router = useRouter();
const route = useRoute();
const treeStore = useTreeStore();

const username = ref(route.params.username || '用户');
const tree = ref([]);

onMounted(async () => {
  // 加载已发布的内容树
  try {
    await treeStore.fetchTree();
    // 这里需要过滤只显示已发布的内容
    tree.value = treeStore.tree;
  } catch (error) {
    console.error('Failed to load public tree:', error);
  }
});

function goToLogin() {
  router.push('/login');
}
</script>

<style scoped>
.public-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.public-header {
  height: 60px;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.site-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.btn-login {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-login:hover {
  background-color: var(--color-primary-hover);
}

.public-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.public-sidebar {
  width: 280px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.sidebar-content {
  padding: var(--spacing-lg);
}

.sidebar-content h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.empty,
.placeholder {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  text-align: center;
  padding: var(--spacing-lg);
}

.public-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.content-wrapper h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.content-wrapper p {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  line-height: var(--leading-loose);
}

.info {
  padding: var(--spacing-md);
  background-color: var(--color-info-light);
  border-left: 4px solid var(--color-info);
  border-radius: var(--radius-md);
}
</style>


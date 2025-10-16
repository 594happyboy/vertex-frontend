<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <div class="error-actions">
        <BaseButton variant="primary" @click="goHome">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          返回首页
        </BaseButton>
        <BaseButton variant="ghost" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          返回上一页
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--accent-50) 100%);
}

.not-found-content {
  text-align: center;
  padding: var(--spacing-8);
}

.error-code {
  font-size: 120px;
  font-weight: var(--font-bold);
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: var(--spacing-6) 0 var(--spacing-3);
}

.error-message {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-8);
}

.error-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}

@media (max-width: 767px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>


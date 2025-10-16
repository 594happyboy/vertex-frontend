<template>
  <div class="dashboard-view">
    <div class="welcome-card">
      <div class="welcome-content">
        <h1>欢迎回来，{{ user?.username || 'Admin' }} 👋</h1>
        <p>今天是 {{ todayDate }}</p>
      </div>
      <BaseButton variant="primary" @click="$router.push('/admin/articles/edit')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        发布新文章
      </BaseButton>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-card--primary">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总文章数</div>
          <div class="stat-value">{{ stats.articleCount || 0 }}</div>
        </div>
      </div>

      <div class="stat-card stat-card--success">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总浏览量</div>
          <div class="stat-value">{{ stats.totalViews || 0 }}</div>
        </div>
      </div>

      <div class="stat-card stat-card--warning">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">评论数</div>
          <div class="stat-value">{{ stats.commentCount || 0 }}</div>
        </div>
      </div>

      <div class="stat-card stat-card--info">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日访问</div>
          <div class="stat-value">{{ stats.todayViews || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="placeholder-message">
      <p>仪表盘数据统计功能待实现</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import BaseButton from '@/components/base/BaseButton.vue'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const todayDate = computed(() => dayjs().format('YYYY年MM月DD日'))

const stats = ref({
  articleCount: 0,
  totalViews: 0,
  commentCount: 0,
  todayViews: 0
})

onMounted(() => {
  // TODO: 加载统计数据
})
</script>

<style scoped>
.dashboard-view {
  padding: var(--spacing-6);
}

.welcome-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-8);
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--accent-50) 100%);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-8);
}

.welcome-content h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-2);
  color: var(--text-primary);
}

.welcome-content p {
  margin: 0;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
}

.stat-card--primary .stat-icon {
  background: var(--primary-100);
  color: var(--primary-600);
}

.stat-card--success .stat-icon {
  background: #D1FAE5;
  color: #059669;
}

.stat-card--warning .stat-icon {
  background: #FEF3C7;
  color: #D97706;
}

.stat-card--info .stat-icon {
  background: #DBEAFE;
  color: #2563EB;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.placeholder-message {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--text-secondary);
}

@media (max-width: 767px) {
  .welcome-card {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>


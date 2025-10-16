<template>
  <div class="groups-view">
    <div class="container">
      <header class="page-header">
        <h1>文章分组</h1>
        <p>按分组浏览文章内容</p>
      </header>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="groups-grid">
        <router-link
          v-for="group in groups"
          :key="group.id"
          :to="`/groups/${group.id}`"
          class="group-card"
        >
          <div class="group-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3>{{ group.name }}</h3>
          <p>{{ group.description }}</p>
          <div class="group-footer">
            <span class="count">{{ group.articleCount || 0 }} 篇文章</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'

const groupStore = useGroupStore()

const loading = ref(false)
const groups = computed(() => groupStore.groups)

const loadGroups = async () => {
  loading.value = true
  try {
    await groupStore.fetchGroups()
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.groups-view {
  padding: var(--spacing-12) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-12);
}

.page-header h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-3);
  color: var(--text-primary);
}

.page-header p {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
}

.loading {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--text-secondary);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-6);
}

.group-card {
  padding: var(--spacing-8);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: all var(--duration-base);
}

.group-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.group-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-100);
  color: var(--primary-600);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
}

.group-card h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--spacing-2);
  color: var(--text-primary);
}

.group-card p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-4);
  line-height: var(--leading-relaxed);
}

.group-footer {
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--border-color);
}

.count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

@media (max-width: 767px) {
  .groups-view {
    padding: var(--spacing-8) 0;
  }
  
  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>


<template>
  <div class="group-detail-view">
    <div class="container">
      <!-- 分组头部 -->
      <header class="group-header">
        <div class="group-info">
          <h1>{{ group?.name || '分组详情' }}</h1>
          <p class="description">{{ group?.description || '' }}</p>
        </div>
      </header>

      <!-- 文章列表 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else>
        <div class="article-grid">
          <ArticleCard 
            v-for="article in articles" 
            :key="article.id"
            :article="article"
          />
        </div>

        <BasePagination 
          v-if="totalPages > 1"
          :current="currentPage"
          :total="totalArticles"
          :page-size="pageSize"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { useGroupStore } from '@/stores/group'
import ArticleCard from '@/components/ArticleCard.vue'
import BasePagination from '@/components/base/BasePagination.vue'

const route = useRoute()
const articleStore = useArticleStore()
const groupStore = useGroupStore()

const loading = ref(false)

const groupId = computed(() => route.params.id)
const group = computed(() => groupStore.groupById(groupId.value))
const articles = computed(() => articleStore.articles)
const currentPage = computed(() => articleStore.pagination.page)
const pageSize = computed(() => articleStore.pagination.size)
const totalArticles = computed(() => articleStore.pagination.total)
const totalPages = computed(() => articleStore.totalPages)

const loadArticles = async () => {
  loading.value = true
  try {
    articleStore.setFilter('groupId', groupId.value)
    await articleStore.fetchArticles()
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  articleStore.setPage(page)
}

onMounted(() => {
  if (!groupStore.groups.length) {
    groupStore.fetchGroups()
  }
  loadArticles()
})
</script>

<style scoped>
.group-detail-view {
  padding: var(--spacing-12) 0;
}

.group-header {
  text-align: center;
  margin-bottom: var(--spacing-12);
  padding: var(--spacing-8);
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--accent-50) 100%);
  border-radius: var(--radius-lg);
}

.group-info h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-3);
  color: var(--text-primary);
}

.description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.loading {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--text-secondary);
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

@media (max-width: 767px) {
  .group-detail-view {
    padding: var(--spacing-8) 0;
  }
  
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>


<template>
  <div class="archive-view">
    <div class="container">
      <header class="archive-header">
        <h1>文章归档</h1>
        <div class="archive-search">
          <input 
            v-model="keyword" 
            type="search" 
            placeholder="搜索文章..." 
            class="search-input"
            @input="handleSearch"
          />
        </div>
      </header>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="archive-timeline">
        <div 
          v-for="year in archiveByYear" 
          :key="year.year" 
          class="year-group"
        >
          <div class="year-header" @click="toggleYear(year.year)">
            <h2>{{ year.year }}</h2>
            <span class="count">{{ year.count }} 篇</span>
            <svg 
              :class="['chevron', { 'rotated': !collapsedYears.includes(year.year) }]"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <transition name="expand">
            <div v-show="!collapsedYears.includes(year.year)" class="month-list">
              <div 
                v-for="month in year.months" 
                :key="month.month" 
                class="month-group"
              >
                <h3 class="month-title">{{ month.month }}月</h3>
                <ul class="article-list">
                  <li v-for="article in month.articles" :key="article.id">
                    <router-link :to="`/posts/${article.slug}`" class="article-link">
                      <time>{{ formatDate(article.publishTime, 'MM-DD') }}</time>
                      <span class="title">{{ article.title }}</span>
                      <div class="tags">
                        <BaseTag 
                          v-for="tag in article.tags?.slice(0, 2)" 
                          :key="tag"
                          variant="secondary"
                          size="sm"
                        >
                          {{ tag }}
                        </BaseTag>
                      </div>
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>

        <div v-if="archiveByYear.length === 0" class="empty-state">
          <p>暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import dayjs from 'dayjs'
import BaseTag from '@/components/base/BaseTag.vue'

const articleStore = useArticleStore()

const keyword = ref('')
const loading = ref(false)
const collapsedYears = ref([])

const archiveByYear = computed(() => {
  const articles = articleStore.articles
  const grouped = {}
  
  articles.forEach(article => {
    const date = dayjs(article.publishTime)
    const year = date.year()
    const month = date.month() + 1
    
    if (!grouped[year]) {
      grouped[year] = {}
    }
    if (!grouped[year][month]) {
      grouped[year][month] = []
    }
    
    // 关键字过滤
    if (keyword.value) {
      if (article.title.toLowerCase().includes(keyword.value.toLowerCase())) {
        grouped[year][month].push(article)
      }
    } else {
      grouped[year][month].push(article)
    }
  })
  
  return Object.keys(grouped)
    .sort((a, b) => b - a)
    .map(year => ({
      year,
      months: Object.keys(grouped[year])
        .sort((a, b) => b - a)
        .map(month => ({
          month,
          articles: grouped[year][month]
        })),
      count: Object.values(grouped[year]).flat().length
    }))
    .filter(year => year.count > 0)
})

const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

const toggleYear = (year) => {
  const index = collapsedYears.value.indexOf(year)
  if (index > -1) {
    collapsedYears.value.splice(index, 1)
  } else {
    collapsedYears.value.push(year)
  }
}

const handleSearch = () => {
  // 实时搜索
}

const loadArticles = async () => {
  loading.value = true
  try {
    await articleStore.fetchArticles({ size: 1000 }) // 获取所有文章
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.archive-view {
  padding: var(--spacing-12) 0;
}

.archive-header {
  text-align: center;
  margin-bottom: var(--spacing-12);
}

.archive-header h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-6);
  color: var(--text-primary);
}

.search-input {
  max-width: 400px;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--duration-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(63, 122, 254, 0.1);
}

.loading,
.empty-state {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--text-secondary);
}

.archive-timeline {
  max-width: 800px;
  margin: 0 auto;
}

.year-group {
  margin-bottom: var(--spacing-8);
}

.year-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--primary-50);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-base);
  border-left: 4px solid var(--primary-500);
}

.year-header:hover {
  background: var(--primary-100);
}

.year-header h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0;
  color: var(--primary-700);
}

.year-header .count {
  font-size: var(--text-sm);
  color: var(--primary-600);
}

.chevron {
  margin-left: auto;
  transition: transform var(--duration-base);
}

.chevron.rotated {
  transform: rotate(180deg);
}

.month-list {
  padding-left: var(--spacing-6);
  margin-top: var(--spacing-4);
}

.month-group {
  margin-bottom: var(--spacing-6);
}

.month-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-3);
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-list li {
  margin-bottom: var(--spacing-2);
}

.article-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--duration-base);
}

.article-link:hover {
  background: var(--gray-100);
}

.article-link time {
  flex-shrink: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.article-link .title {
  flex: 1;
  font-weight: var(--font-medium);
}

.article-link .tags {
  display: flex;
  gap: var(--spacing-2);
}

/* 展开/折叠动画 */
.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
  transition: all var(--duration-slow);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}

@media (max-width: 767px) {
  .archive-view {
    padding: var(--spacing-8) 0;
  }
  
  .article-link {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .article-link .tags {
    display: none;
  }
}
</style>


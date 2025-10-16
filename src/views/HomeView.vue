<template>
  <div class="home-view">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          <span class="gradient-text">探索技术</span>
          <br />
          <span>记录生活</span>
        </h1>
        <p class="hero__subtitle">
          分享有价值的技术见解与生活感悟
        </p>
        <div class="hero__actions">
          <BaseButton variant="primary" size="lg" @click="scrollToArticles">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            开始阅读
          </BaseButton>
        </div>
      </div>
      <div class="hero__decoration"></div>
    </section>

    <!-- 主内容区 -->
    <div class="container">
      <div class="content-wrapper" ref="articlesSection">
        <!-- 文章列表 -->
        <div class="main-content">
          <div v-if="loading" class="loading">加载中...</div>
          
          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <BaseButton @click="loadArticles">重试</BaseButton>
          </div>

          <div v-else>
            <div class="article-grid">
              <ArticleCard 
                v-for="article in articles" 
                :key="article.id"
                :article="article"
              />
            </div>

            <!-- 分页 -->
            <BasePagination 
              v-if="totalPages > 1"
              :current="currentPage"
              :total="totalArticles"
              :page-size="pageSize"
              @change="handlePageChange"
            />
          </div>
        </div>

        <!-- 侧边栏 -->
        <aside class="sidebar">
          <!-- 分组 -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">分组</h3>
            <div class="group-list">
              <router-link 
                v-for="group in groups" 
                :key="group.id"
                :to="`/groups/${group.id}`"
                class="group-item"
              >
                <span>{{ group.name }}</span>
                <span class="count">{{ group.articleCount }}</span>
              </router-link>
            </div>
          </div>

          <!-- 热门标签 -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">热门标签</h3>
            <div class="tag-cloud">
              <BaseTag 
                v-for="tag in popularTags" 
                :key="tag"
                variant="primary"
                size="sm"
                clickable
                @click="filterByTag(tag)"
              >
                {{ tag }}
              </BaseTag>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useArticleStore } from '@/stores/article'
import { useGroupStore } from '@/stores/group'
import BaseButton from '@/components/base/BaseButton.vue'
import BasePagination from '@/components/base/BasePagination.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import ArticleCard from '@/components/ArticleCard.vue'

const articleStore = useArticleStore()
const groupStore = useGroupStore()

const loading = ref(false)
const error = ref(null)
const articlesSection = ref(null)

const articles = computed(() => articleStore.articles)
const currentPage = computed(() => articleStore.pagination.page)
const pageSize = computed(() => articleStore.pagination.size)
const totalArticles = computed(() => articleStore.pagination.total)
const totalPages = computed(() => articleStore.totalPages)
const groups = computed(() => groupStore.groups)

// 模拟热门标签
const popularTags = ref(['Vue', 'JavaScript', 'CSS', 'Node.js', 'TypeScript', 'React'])

const loadArticles = async () => {
  loading.value = true
  error.value = null
  try {
    await articleStore.fetchArticles()
  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const loadGroups = async () => {
  try {
    await groupStore.fetchGroups()
  } catch (err) {
    console.error('加载分组失败:', err)
  }
}

const handlePageChange = (page) => {
  articleStore.setPage(page)
  // 滚动到文章区域
  if (articlesSection.value) {
    articlesSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToArticles = () => {
  if (articlesSection.value) {
    articlesSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const filterByTag = (tag) => {
  articleStore.setFilter('tags', [tag])
  articleStore.fetchArticles()
}

onMounted(() => {
  loadArticles()
  loadGroups()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* Hero 区域 */
.hero {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--accent-50) 100%);
  overflow: hidden;
}

.hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 0 var(--spacing-6);
}

.hero__title {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--spacing-6);
  color: var(--text-primary);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__subtitle {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-8);
  line-height: var(--leading-relaxed);
}

.hero__actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}

.hero__decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0.1;
  background-image: radial-gradient(var(--primary-300) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* 内容区域 */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-8);
  padding: var(--spacing-12) 0;
}

.main-content {
  min-width: 0;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

/* 侧边栏 */
.sidebar {
  position: sticky;
  top: calc(var(--navbar-height) + var(--spacing-6));
  height: fit-content;
}

.sidebar-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.sidebar-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-4);
  color: var(--text-primary);
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--duration-base);
}

.group-item:hover {
  background: var(--primary-50);
  color: var(--primary-600);
}

.group-item .count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: var(--gray-100);
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-full);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

/* 状态 */
.loading,
.error-state {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--text-secondary);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
}

/* 响应式 */
@media (max-width: 767px) {
  .hero {
    height: 350px;
  }
  
  .hero__title {
    font-size: var(--text-3xl);
  }
  
  .hero__subtitle {
    font-size: var(--text-base);
  }
  
  .content-wrapper {
    grid-template-columns: 1fr;
    padding: var(--spacing-8) 0;
  }
  
  .sidebar {
    position: static;
  }
  
  .article-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
}
</style>


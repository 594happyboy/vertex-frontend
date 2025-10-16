<template>
  <div class="post-detail-view">
    <div class="container">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <BaseButton @click="loadArticle">重试</BaseButton>
      </div>

      <article v-else-if="article" class="post-detail">
        <!-- 文章头部 -->
        <header class="post-header">
          <h1 class="post-title">{{ article.title }}</h1>
          <div class="post-meta">
            <span class="group">{{ article.groupName }}</span>
            <span class="divider">·</span>
            <time>{{ formatDate(article.publishTime) }}</time>
            <span class="divider">·</span>
            <span class="views">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {{ article.views }} 次阅读
            </span>
          </div>
          <div class="post-tags">
            <BaseTag 
              v-for="tag in article.tags" 
              :key="tag"
              variant="primary"
            >
              {{ tag }}
            </BaseTag>
          </div>
        </header>

        <!-- 文章内容 -->
        <div class="post-content">
          <div v-if="article.contentType === 'markdown'" class="markdown-body">
            {{ article.contentText || '暂无内容' }}
          </div>
          <div v-else class="pdf-viewer">
            <p>PDF 预览功能待实现</p>
            <a v-if="article.contentUrl" :href="article.contentUrl" target="_blank" class="btn">
              下载 PDF
            </a>
          </div>
        </div>

        <!-- 评论区占位 -->
        <div class="comments-section">
          <h2>评论 (0)</h2>
          <p class="placeholder">评论功能待实现</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import dayjs from 'dayjs'
import BaseTag from '@/components/base/BaseTag.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const articleStore = useArticleStore()

const loading = ref(false)
const error = ref(null)

const article = computed(() => articleStore.currentArticle)
const slug = computed(() => route.params.slug)

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const loadArticle = async () => {
  loading.value = true
  error.value = null
  try {
    await articleStore.fetchArticleBySlug(slug.value)
  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.post-detail-view {
  padding: var(--spacing-12) 0;
}

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

.post-detail {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.post-header {
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--border-color);
}

.post-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin: 0 0 var(--spacing-4);
  color: var(--text-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
}

.post-meta .group {
  padding: 2px var(--spacing-3);
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-weight: var(--font-medium);
}

.post-meta .views {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.divider {
  color: var(--text-tertiary);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.post-content {
  margin-bottom: var(--spacing-12);
  padding: var(--spacing-6);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
}

.markdown-body {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

.pdf-viewer {
  text-align: center;
  padding: var(--spacing-8);
}

.comments-section {
  padding: var(--spacing-8);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.comments-section h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--spacing-4);
  color: var(--text-primary);
}

.placeholder {
  color: var(--text-secondary);
  font-size: var(--text-base);
  margin: 0;
}

@media (max-width: 767px) {
  .post-detail-view {
    padding: var(--spacing-8) 0;
  }
  
  .post-title {
    font-size: var(--text-2xl);
  }
  
  .post-content {
    padding: var(--spacing-4);
  }
}
</style>


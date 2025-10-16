<template>
  <article class="article-card" @click="goToArticle">
    <!-- 封面 -->
    <div class="article-card__cover">
      <img 
        :src="article.coverUrl || defaultCover" 
        :alt="article.title"
        loading="lazy"
      />
      <div class="cover-overlay"></div>
      <div v-if="article.contentType === 'pdf'" class="article-card__type" title="PDF文档">
        PDF
      </div>
    </div>

    <!-- 内容 -->
    <div class="article-card__body">
      <div class="article-card__meta">
        <span class="group-badge">{{ article.groupName }}</span>
        <time>{{ formatDate(article.publishTime) }}</time>
      </div>
      
      <h3 class="article-card__title">{{ article.title }}</h3>
      <p class="article-card__summary">{{ article.summary }}</p>

      <div class="article-card__tags">
        <BaseTag 
          v-for="tag in article.tags?.slice(0, 3)" 
          :key="tag"
          variant="secondary"
          size="sm"
        >
          {{ tag }}
        </BaseTag>
      </div>

      <div class="article-card__footer">
        <div class="stats">
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {{ article.views }}
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {{ article.commentCount }}
          </span>
        </div>
        <span class="read-more">
          阅读全文
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import BaseTag from './base/BaseTag.vue'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const defaultCover = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect width="400" height="225" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E暂无封面%3C/text%3E%3C/svg%3E'

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const goToArticle = () => {
  router.push(`/posts/${props.article.slug}`)
}
</script>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all var(--duration-base);
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.article-card__cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  overflow: hidden;
}

.article-card__cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow);
}

.article-card:hover .article-card__cover img {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity var(--duration-base);
}

.article-card:hover .cover-overlay {
  opacity: 1;
}

.article-card__type {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-md);
  color: var(--primary-600);
  border: 1px solid var(--primary-300);
}

.article-card__body {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  flex: 1;
}

.article-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.group-badge {
  padding: 2px var(--spacing-3);
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-weight: var(--font-medium);
  font-size: var(--text-xs);
}

.article-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__summary {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.article-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--border-color);
}

.stats {
  display: flex;
  gap: var(--spacing-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.stats span {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.read-more {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--primary-500);
  transition: gap var(--duration-base);
}

.article-card:hover .read-more {
  gap: var(--spacing-2);
}

/* 移动端适配 */
@media (max-width: 767px) {
  .article-card {
    flex-direction: row;
    height: 140px;
  }
  
  .article-card__cover {
    flex-shrink: 0;
    width: 140px;
    height: 140px;
    padding-top: 0;
  }
  
  .article-card__body {
    padding: var(--spacing-3);
    gap: var(--spacing-2);
  }
  
  .article-card__title {
    font-size: var(--text-base);
    -webkit-line-clamp: 2;
  }
  
  .article-card__summary,
  .article-card__tags {
    display: none;
  }
  
  .stats span:first-child {
    display: none;
  }
}
</style>


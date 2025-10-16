# 个人博客前端设计方案

## 1. 设计概述

### 1.1 设计理念
- **现代简洁**：采用玻璃拟态、柔和渐变、微妙阴影营造轻量感
- **内容优先**：专注阅读体验，减少干扰元素
- **优雅交互**：流畅动画、即时反馈、细腻微交互
- **响应式**：桌面与手机双端适配，简洁高效

### 1.2 技术栈
- **框架**：Vue 3 + Vite + Vue Router 4
- **状态管理**：Pinia
- **样式方案**：CSS Variables + Scoped CSS
- **Markdown**：markdown-it + highlight.js
- **PDF**：pdfjs-dist
- **动画**：CSS Transitions + 轻量 GSAP（可选）
- **图标**：Iconify (Lucide Icons)
- **响应式**：仅适配桌面（≥768px）和手机（<768px）

---

## 2. 设计系统

### 2.1 色彩体系

#### 品牌色
```css
/* 主色 - 科技蓝 */
--primary-50: #EBF2FF;
--primary-100: #D6E4FF;
--primary-200: #ADC8FF;
--primary-300: #84ADFF;
--primary-400: #5B91FF;
--primary-500: #3F7AFE;  /* 主色 */
--primary-600: #1E5FE8;
--primary-700: #1347C4;
--primary-800: #0D3399;
--primary-900: #08206B;

/* 辅助色 - 活力橙 */
--accent-300: #FFB199;
--accent-500: #FF8D6B;
--accent-700: #E86844;

/* 灰度 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* 语义色 */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

#### 暗色模式
```css
[data-theme="dark"] {
  --bg-primary: #0F1419;
  --bg-secondary: #1A1F2E;
  --bg-tertiary: #242B3D;
  --text-primary: #E8EAED;
  --text-secondary: #9AA0A6;
  --border-color: #2D3748;
}
```

### 2.2 字体规范

```css
/* 字体家族 */
--font-sans: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* 字号 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* 行高 */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 2.3 间距与圆角

```css
/* 间距 */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */

/* 圆角 */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;
```

### 2.4 阴影与效果

```css
/* 阴影 */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 12px 36px rgba(0, 0, 0, 0.16);
--shadow-primary: 0 8px 20px rgba(63, 122, 254, 0.25);

/* 玻璃拟态 */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.18);
backdrop-filter: blur(12px);
```

### 2.5 动画时长

```css
--duration-fast: 120ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--easing: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 3. 公共端界面设计

### 3.1 全局布局

```
┌─────────────────────────────────────────┐
│          NavBar (固定顶部)               │ 64px
├─────────────────────────────────────────┤
│                                         │
│           Main Content                  │
│         (最大宽度 1200px)                │
│                                         │
├─────────────────────────────────────────┤
│             Footer                      │
└─────────────────────────────────────────┘
```

### 3.2 顶部导航 `NavBar.vue`

#### 视觉设计
```vue
<template>
  <nav class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="navbar__container">
      <!-- Logo -->
      <router-link to="/" class="navbar__logo">
        <div class="logo-icon"></div>
        <span class="logo-text">{{ siteName }}</span>
      </router-link>

      <!-- 导航菜单 -->
      <div class="navbar__menu">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/archive" class="nav-link">归档</router-link>
        <router-link to="/groups" class="nav-link">分组</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
      </div>

      <!-- 操作区 -->
      <div class="navbar__actions">
        <button class="icon-btn" @click="toggleSearch">
          <i-lucide-search />
        </button>
        <button class="icon-btn" @click="toggleTheme">
          <i-lucide-moon v-if="theme === 'light'" />
          <i-lucide-sun v-else />
        </button>
        <button class="icon-btn mobile-menu" @click="toggleMobileMenu">
          <i-lucide-menu />
        </button>
      </div>
    </div>

    <!-- 搜索面板 -->
    <transition name="fade">
      <SearchPanel v-if="showSearch" @close="toggleSearch" />
    </transition>
  </nav>
</template>
```

#### 样式要点
- **初始状态**：背景半透明玻璃 `rgba(255,255,255,0.7)` + `backdrop-filter: blur(12px)`
- **滚动状态**：增加阴影 `box-shadow: var(--shadow-md)`，高度收缩到 56px
- **导航链接**：悬停下划线从中心展开，当前页面高亮主色
- **响应式**：移动端隐藏菜单，显示汉堡按钮，侧滑抽屉展开

### 3.3 首页 `HomeView.vue`

#### 布局结构
```
┌─────────────────────────────────────────────┐
│   Hero Section (渐变背景 + 标题 + 简介)      │ 400px
├─────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────┐  │
│ │                     │                 │  │
│ │   文章列表           │   侧边栏         │  │
│ │   (3列网格)          │   - 分组        │  │
│ │                     │   - 热门标签     │  │
│ │                     │   - 最新评论     │  │
│ └─────────────────────┴─────────────────┘  │
│                                             │
│           分页组件                           │
└─────────────────────────────────────────────┘
```

#### Hero 区域
```vue
<section class="hero">
  <div class="hero__content">
    <h1 class="hero__title">
      <span class="gradient-text">探索技术</span>
      <span>记录生活</span>
    </h1>
    <p class="hero__subtitle">
      分享有价值的技术见解与生活感悟
    </p>
    <div class="hero__actions">
      <button class="btn btn--primary btn--large">
        <i-lucide-book-open />
        开始阅读
      </button>
      <button class="btn btn--ghost btn--large">
        <i-lucide-rss />
        订阅更新
      </button>
    </div>
  </div>
  <div class="hero__decoration">
    <!-- 装饰性几何图案 -->
  </div>
</section>
```

#### 文章卡片 `ArticleCard.vue`
```vue
<article class="article-card">
  <!-- 封面 -->
  <div class="article-card__cover">
    <img :src="article.coverUrl" :alt="article.title" />
    <div class="cover-overlay"></div>
    <div class="article-card__type">
      <i-lucide-file-text v-if="article.contentType === 'markdown'" />
      <i-lucide-file-pdf v-else />
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
      <span v-for="tag in article.tags" class="tag">{{ tag }}</span>
    </div>

    <div class="article-card__footer">
      <div class="stats">
        <span><i-lucide-eye /> {{ article.views }}</span>
        <span><i-lucide-message-circle /> {{ article.commentCount }}</span>
      </div>
      <router-link :to="`/posts/${article.slug}`" class="read-more">
        阅读全文 <i-lucide-arrow-right />
      </router-link>
    </div>
  </div>
</article>
```

**卡片样式要点**：
- 封面 16:9，悬停时图片缩放 105%，叠加渐变遮罩
- 标题最多显示 2 行，超出省略
- 标签使用玻璃背景 + 主色描边
- 悬停整体上浮 8px，阴影增强

### 3.4 文章详情 `PostDetailView.vue`

#### 布局
```
┌────────────────────────────────────────┐
│   面包屑导航                            │
├────────────────────────────────────────┤
│                                        │
│   文章头部                              │
│   - 标题                                │
│   - 元信息 (日期/阅读量/分组)           │
│   - 标签                                │
│                                        │
├───────────┬────────────────────────────┤
│           │                            │
│  目录     │   Markdown/PDF 内容         │
│  (固定)   │   (最大 768px)              │
│           │                            │
│           ├────────────────────────────┤
│           │   相关文章推荐              │
│           ├────────────────────────────┤
│           │   评论区                    │
└───────────┴────────────────────────────┘
```

#### Markdown 渲染 `MarkdownViewer.vue`
```vue
<template>
  <div class="markdown-viewer">
    <!-- 内容 -->
    <article 
      class="markdown-body" 
      v-html="renderedHtml"
      @click="handleImageClick"
    ></article>

    <!-- 图片预览 -->
    <ImageLightbox 
      v-if="lightboxImage" 
      :src="lightboxImage" 
      @close="lightboxImage = null" 
    />
  </div>
</template>
```

**Markdown 样式定制**：
```css
.markdown-body {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

/* 标题 */
.markdown-body h1 {
  font-size: var(--text-4xl);
  font-weight: 700;
  margin: 2em 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid var(--primary-200);
}

.markdown-body h2 {
  font-size: var(--text-3xl);
  font-weight: 600;
  margin: 1.5em 0 0.75em;
}

/* 代码块 */
.markdown-body pre {
  background: var(--gray-900);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  position: relative;
  overflow-x: auto;
}

.markdown-body pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: var(--text-xs);
  color: var(--gray-400);
}

/* 引用块 */
.markdown-body blockquote {
  border-left: 4px solid var(--primary-500);
  background: var(--primary-50);
  padding: var(--spacing-4) var(--spacing-6);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

/* 表格 */
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 2em 0;
}

.markdown-body th {
  background: var(--gray-100);
  font-weight: 600;
  padding: var(--spacing-3) var(--spacing-4);
}

.markdown-body td {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--gray-200);
}

/* 图片 */
.markdown-body img {
  max-width: 100%;
  border-radius: var(--radius-md);
  cursor: zoom-in;
  transition: transform var(--duration-base);
}

.markdown-body img:hover {
  transform: scale(1.02);
}
```

#### 目录组件 `TableOfContents.vue`
```vue
<aside class="toc" :class="{ 'toc--collapsed': isCollapsed }">
  <div class="toc__header">
    <h4>目录</h4>
    <button @click="toggleCollapse" class="icon-btn">
      <i-lucide-chevron-left />
    </button>
  </div>
  <nav class="toc__nav">
    <a 
      v-for="heading in headings" 
      :href="`#${heading.id}`"
      :class="[
        'toc__link',
        `toc__link--${heading.level}`,
        { 'is-active': activeId === heading.id }
      ]"
    >
      {{ heading.text }}
    </a>
  </nav>
</aside>
```

**目录特性**：
- 滚动监听高亮当前标题
- 点击平滑滚动到对应位置
- 窄屏自动收起，悬浮展开

#### PDF 预览 `PdfViewer.vue`
```vue
<template>
  <div class="pdf-viewer">
    <div class="pdf-viewer__toolbar">
      <div class="pdf-toolbar__left">
        <button @click="prevPage" :disabled="currentPage === 1">
          <i-lucide-chevron-left />
        </button>
        <span class="page-indicator">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          <i-lucide-chevron-right />
        </button>
      </div>
      <div class="pdf-toolbar__right">
        <button @click="zoomOut"><i-lucide-zoom-out /></button>
        <span>{{ Math.round(scale * 100) }}%</span>
        <button @click="zoomIn"><i-lucide-zoom-in /></button>
        <button @click="toggleFullscreen"><i-lucide-maximize /></button>
        <a :href="pdfUrl" download class="btn btn--sm">
          <i-lucide-download /> 下载
        </a>
      </div>
    </div>
    
    <div class="pdf-viewer__canvas" ref="canvasContainer">
      <canvas ref="pdfCanvas"></canvas>
    </div>

    <!-- 缩略图侧栏 -->
    <div class="pdf-thumbnails" v-if="showThumbnails">
      <div 
        v-for="page in totalPages" 
        :key="page"
        class="thumbnail"
        :class="{ 'is-active': page === currentPage }"
        @click="goToPage(page)"
      >
        <canvas :ref="`thumb-${page}`"></canvas>
        <span>{{ page }}</span>
      </div>
    </div>
  </div>
</template>
```

### 3.5 评论区 `CommentSection.vue`

#### 布局
```vue
<section class="comment-section">
  <div class="comment-section__header">
    <h3>评论 ({{ comments.length }})</h3>
    <button class="btn btn--sm btn--ghost" @click="sortBy = 'latest'">
      最新优先
    </button>
  </div>

  <!-- 评论表单 -->
  <CommentForm @submit="handleSubmit" />

  <!-- 评论列表 -->
  <CommentList :comments="comments" />
</section>
```

#### 评论表单 `CommentForm.vue`
```vue
<form class="comment-form" @submit.prevent="submitComment">
  <div class="form-group">
    <input 
      v-model="nickname" 
      type="text" 
      placeholder="昵称（选填，默认为访客）"
      class="input"
    />
  </div>
  
  <div class="form-group">
    <textarea 
      v-model="content"
      placeholder="写下你的想法..."
      rows="4"
      class="textarea"
      maxlength="500"
    ></textarea>
    <div class="char-count">{{ content.length }} / 500</div>
  </div>

  <button 
    type="submit" 
    class="btn btn--primary"
    :disabled="!content.trim() || isSubmitting"
  >
    <span v-if="!isSubmitting">发表评论</span>
    <span v-else>
      <i-lucide-loader class="spinning" /> 提交中...
    </span>
  </button>
</form>
```

**表单样式**：
- 聚焦时边框高亮主色
- 字符计数器接近上限变红
- 提交按钮 loading 状态旋转图标

#### 评论列表 `CommentList.vue`
```vue
<div class="comment-list">
  <article 
    v-for="comment in comments" 
    :key="comment.id" 
    class="comment-item"
  >
    <div class="comment-avatar">
      <div 
        class="avatar" 
        :style="{ background: getAvatarColor(comment.nickname) }"
      >
        {{ comment.nickname.charAt(0) }}
      </div>
    </div>
    
    <div class="comment-content">
      <div class="comment-header">
        <span class="nickname">{{ comment.nickname }}</span>
        <time class="timestamp">{{ formatTime(comment.createdAt) }}</time>
      </div>
      <p class="comment-text">{{ comment.content }}</p>
    </div>
  </article>

  <!-- 空状态 -->
  <div v-if="comments.length === 0" class="empty-state">
    <i-lucide-message-circle-off />
    <p>暂无评论，快来抢沙发吧~</p>
  </div>
</div>
```

**评论样式要点**：
- 头像使用昵称首字母 + 随机渐变色
- 评论气泡背景 `var(--gray-50)`，圆角 12px
- 悬停时轻微高亮

### 3.6 归档页 `ArchiveView.vue`

```vue
<template>
  <div class="archive-view">
    <header class="archive-header">
      <h1>文章归档</h1>
      <div class="archive-search">
        <input 
          v-model="keyword" 
          type="search" 
          placeholder="搜索文章..." 
        />
      </div>
    </header>

    <div class="archive-timeline">
      <div 
        v-for="year in archiveByYear" 
        :key="year.year" 
        class="year-group"
      >
        <div class="year-header" @click="toggleYear(year.year)">
          <h2>{{ year.year }}</h2>
          <span class="count">{{ year.count }} 篇</span>
          <i-lucide-chevron-down :class="{ 'rotated': !year.collapsed }" />
        </div>

        <transition name="expand">
          <div v-show="!year.collapsed" class="month-list">
            <div 
              v-for="month in year.months" 
              :key="month.month" 
              class="month-group"
            >
              <h3 class="month-title">{{ month.month }}月</h3>
              <ul class="article-list">
                <li v-for="article in month.articles" :key="article.id">
                  <router-link :to="`/posts/${article.slug}`">
                    <time>{{ formatDate(article.publishTime, 'MM-DD') }}</time>
                    <span class="title">{{ article.title }}</span>
                    <span class="tags">
                      <span v-for="tag in article.tags" class="tag">
                        {{ tag }}
                      </span>
                    </span>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
```

**时间轴样式**：
- 年份大标题左侧彩色竖线
- 文章列表带圆点指示器
- 展开/折叠动画 300ms

### 3.7 分组页 `GroupView.vue`

```vue
<template>
  <div class="group-view">
    <!-- 分组头部 -->
    <header class="group-header">
      <div class="group-info">
        <h1>{{ group.name }}</h1>
        <p class="description">{{ group.description }}</p>
        <div class="stats">
          <span><i-lucide-file-text /> {{ articleCount }} 篇文章</span>
          <span><i-lucide-tag /> {{ tagCount }} 个标签</span>
        </div>
      </div>
    </header>

    <!-- 标签筛选 -->
    <div class="tag-filter">
      <button 
        v-for="tag in tags" 
        :key="tag.name"
        class="tag-chip"
        :class="{ 'is-active': selectedTags.includes(tag.name) }"
        @click="toggleTag(tag.name)"
      >
        {{ tag.name }} <span class="count">{{ tag.count }}</span>
      </button>
    </div>

    <!-- 文章网格 -->
    <div class="article-grid">
      <ArticleCard 
        v-for="article in filteredArticles" 
        :key="article.id"
        :article="article" 
      />
    </div>

    <!-- 分页 -->
    <Pagination 
      :current="currentPage"
      :total="totalPages"
      @change="handlePageChange"
    />
  </div>
</template>
```

### 3.8 关于页 `AboutView.vue`

```vue
<template>
  <div class="about-view">
    <!-- 个人信息卡 -->
    <section class="profile-card">
      <div class="avatar-wrapper">
        <img :src="profile.avatar" alt="Avatar" class="avatar" />
        <div class="avatar-ring"></div>
      </div>
      <h1>{{ profile.name }}</h1>
      <p class="bio">{{ profile.bio }}</p>
      <div class="social-links">
        <a href="#" class="social-link">
          <i-lucide-github />
        </a>
        <a href="#" class="social-link">
          <i-lucide-twitter />
        </a>
        <a href="#" class="social-link">
          <i-lucide-mail />
        </a>
      </div>
    </section>

    <!-- 技能标签云 -->
    <section class="skills-section">
      <h2>技能</h2>
      <div class="skill-cloud">
        <span 
          v-for="skill in skills" 
          :key="skill.name"
          class="skill-tag"
          :style="{ fontSize: `${skill.level * 0.2 + 0.8}rem` }"
        >
          {{ skill.name }}
        </span>
      </div>
    </section>

    <!-- 时间线 -->
    <section class="timeline-section">
      <h2>个人经历</h2>
      <div class="timeline">
        <div 
          v-for="item in timeline" 
          :key="item.id" 
          class="timeline-item"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <time>{{ item.date }}</time>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
```

---

## 4. 后台界面设计

### 4.1 登录页 `LoginView.vue`

```vue
<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>管理后台</h1>
          <p>欢迎回来，请登录以继续</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>用户名</label>
            <input 
              v-model="username" 
              type="text" 
              class="input"
              placeholder="请输入用户名"
            />
          </div>

          <div class="form-group">
            <label>密码</label>
            <input 
              v-model="password" 
              type="password" 
              class="input"
              placeholder="请输入密码"
            />
          </div>

          <button 
            type="submit" 
            class="btn btn--primary btn--block"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">登录</span>
            <span v-else><i-lucide-loader class="spinning" /> 登录中...</span>
          </button>
        </form>

        <!-- 错误提示 -->
        <transition name="shake">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </transition>
      </div>

      <!-- 装饰插画 -->
      <div class="login-illustration">
        <!-- SVG 插画 -->
      </div>
    </div>
  </div>
</template>
```

**登录页样式**：
- 全屏渐变背景
- 卡片居中，玻璃拟态
- 错误提示轻微抖动动画

### 4.2 后台主框架 `AdminLayout.vue`

```
┌──────────┬────────────────────────────────────┐
│          │   Header (操作区)                   │ 64px
│          ├────────────────────────────────────┤
│  Sidebar │                                    │
│  240px   │                                    │
│          │        Main Content                │
│  (固定)  │        (卡片容器)                   │
│          │                                    │
│          │                                    │
└──────────┴────────────────────────────────────┘
```

#### 侧边栏 `AdminSidebar.vue`
```vue
<aside class="admin-sidebar">
  <div class="sidebar-header">
    <router-link to="/" class="logo">
      <i-lucide-layout-dashboard />
      <span>管理后台</span>
    </router-link>
  </div>

  <nav class="sidebar-nav">
    <router-link to="/admin/dashboard" class="nav-item">
      <i-lucide-home />
      <span>仪表盘</span>
    </router-link>

    <div class="nav-group">
      <div class="nav-group__title">内容管理</div>
      <router-link to="/admin/articles" class="nav-item">
        <i-lucide-file-text />
        <span>文章</span>
        <span class="badge">12</span>
      </router-link>
      <router-link to="/admin/groups" class="nav-item">
        <i-lucide-folder />
        <span>分组标签</span>
      </router-link>
      <router-link to="/admin/comments" class="nav-item">
        <i-lucide-message-circle />
        <span>评论</span>
        <span class="badge badge--warning">5</span>
      </router-link>
    </div>

    <div class="nav-group">
      <div class="nav-group__title">系统</div>
      <router-link to="/admin/settings" class="nav-item">
        <i-lucide-settings />
        <span>设置</span>
      </router-link>
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="user-profile">
      <img :src="user.avatar" class="avatar" />
      <div class="user-info">
        <div class="name">{{ user.username }}</div>
        <button @click="logout" class="logout-btn">
          <i-lucide-log-out />
        </button>
      </div>
    </div>
  </div>
</aside>
```

**侧边栏样式**：
- 背景深色 `var(--gray-900)`
- 当前页渐变选中态：`linear-gradient(90deg, var(--primary-500), var(--primary-600))`
- 悬停图标轻微放大

#### 顶部操作区 `AdminHeader.vue`
```vue
<header class="admin-header">
  <div class="header-left">
    <h2 class="page-title">{{ pageTitle }}</h2>
  </div>

  <div class="header-right">
    <button class="icon-btn">
      <i-lucide-search />
    </button>
    <button class="icon-btn" @click="$router.push('/admin/articles/edit')">
      <i-lucide-plus />
    </button>
    <button class="icon-btn">
      <i-lucide-bell />
      <span class="notification-dot"></span>
    </button>
  </div>
</header>
```

### 4.3 仪表盘 `DashboardView.vue`

```vue
<template>
  <div class="dashboard-view">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-content">
        <h1>欢迎回来，{{ user.username }} 👋</h1>
        <p>今天是 {{ todayDate }}，祝你工作愉快！</p>
      </div>
      <button class="btn btn--primary" @click="$router.push('/admin/articles/edit')">
        <i-lucide-plus /> 发布新文章
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <StatCard 
        title="总文章数"
        :value="stats.articleCount"
        icon="file-text"
        color="primary"
        :trend="{ value: 12, direction: 'up' }"
      />
      <StatCard 
        title="总浏览量"
        :value="stats.totalViews"
        icon="eye"
        color="success"
        :trend="{ value: 8, direction: 'up' }"
      />
      <StatCard 
        title="评论数"
        :value="stats.commentCount"
        icon="message-circle"
        color="warning"
      />
      <StatCard 
        title="今日访问"
        :value="stats.todayViews"
        icon="trending-up"
        color="info"
        :trend="{ value: 15, direction: 'up' }"
      />
    </div>

    <!-- 图表区 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <h3>最近7天浏览量</h3>
          <select class="select-sm">
            <option>最近7天</option>
            <option>最近30天</option>
          </select>
        </div>
        <div class="chart-container">
          <!-- 使用 Chart.js 或 ECharts -->
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>热门文章</h3>
        </div>
        <ul class="article-rank">
          <li v-for="(article, index) in topArticles" :key="article.id">
            <span class="rank" :class="`rank--${index + 1}`">{{ index + 1 }}</span>
            <span class="title">{{ article.title }}</span>
            <span class="views">{{ article.views }} 次</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>最近操作</h3>
      <div class="action-list">
        <div v-for="action in recentActions" :key="action.id" class="action-item">
          <div class="action-icon" :class="`bg-${action.type}`">
            <component :is="`i-lucide-${action.icon}`" />
          </div>
          <div class="action-content">
            <div class="action-title">{{ action.title }}</div>
            <time>{{ formatTime(action.time) }}</time>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 统计卡片 `StatCard.vue`
```vue
<template>
  <div class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-icon">
      <component :is="`i-lucide-${icon}`" />
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ title }}</div>
      <div class="stat-value">{{ formattedValue }}</div>
      <div v-if="trend" class="stat-trend" :class="`trend--${trend.direction}`">
        <i-lucide-trending-up v-if="trend.direction === 'up'" />
        <i-lucide-trending-down v-else />
        {{ trend.value }}%
      </div>
    </div>
  </div>
</template>
```

### 4.4 文章管理 `ArticlesManageView.vue`

```vue
<template>
  <div class="articles-manage">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <input 
          v-model="searchKeyword" 
          type="search" 
          placeholder="搜索文章..." 
          class="search-input"
        />
        <select v-model="filterStatus" class="select">
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <select v-model="filterGroup" class="select">
          <option value="">全部分组</option>
          <option v-for="group in groups" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn--primary" @click="createArticle">
          <i-lucide-plus /> 新建文章
        </button>
      </div>
    </div>

    <!-- 文章表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="40">
              <input type="checkbox" @change="toggleSelectAll" />
            </th>
            <th width="50"></th>
            <th>标题</th>
            <th width="120">分组</th>
            <th width="100">状态</th>
            <th width="120">浏览量</th>
            <th width="150">发布时间</th>
            <th width="150">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>
              <input type="checkbox" v-model="selectedIds" :value="article.id" />
            </td>
            <td>
              <div class="article-cover-sm">
                <img :src="article.coverUrl" />
              </div>
            </td>
            <td>
              <div class="article-title-cell">
                <router-link :to="`/posts/${article.slug}`" target="_blank">
                  {{ article.title }}
                </router-link>
                <div class="article-meta">
                  <span v-for="tag in article.tags" class="tag-sm">{{ tag }}</span>
                </div>
              </div>
            </td>
            <td>{{ article.groupName }}</td>
            <td>
              <span 
                class="status-badge" 
                :class="`status-badge--${article.status}`"
              >
                {{ statusText[article.status] }}
              </span>
            </td>
            <td>
              <div class="stats-cell">
                <i-lucide-eye /> {{ article.views }}
                <i-lucide-message-circle /> {{ article.commentCount }}
              </div>
            </td>
            <td>{{ formatDate(article.publishTime) }}</td>
            <td>
              <div class="action-btns">
                <button 
                  class="btn-icon" 
                  title="编辑"
                  @click="editArticle(article.id)"
                >
                  <i-lucide-edit />
                </button>
                <button 
                  class="btn-icon" 
                  title="删除"
                  @click="deleteArticle(article.id)"
                >
                  <i-lucide-trash-2 />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 批量操作 -->
    <transition name="slide-up">
      <div v-if="selectedIds.length > 0" class="bulk-actions">
        <span>已选择 {{ selectedIds.length }} 项</span>
        <button class="btn btn--sm" @click="bulkPublish">批量发布</button>
        <button class="btn btn--sm btn--danger" @click="bulkDelete">批量删除</button>
      </div>
    </transition>

    <!-- 分页 -->
    <Pagination 
      :current="currentPage"
      :total="totalPages"
      @change="loadArticles"
    />
  </div>
</template>
```

### 4.5 文章编辑器 `ArticleEditView.vue`

```vue
<template>
  <div class="article-edit">
    <form @submit.prevent="saveArticle">
      <!-- 顶部操作栏 -->
      <div class="edit-toolbar">
        <button type="button" class="btn btn--ghost" @click="goBack">
          <i-lucide-arrow-left /> 返回
        </button>
        <div class="toolbar-actions">
          <button type="button" class="btn" @click="saveDraft">
            <i-lucide-save /> 保存草稿
          </button>
          <button type="submit" class="btn btn--primary">
            <i-lucide-send /> 发布
          </button>
        </div>
      </div>

      <!-- 编辑区 -->
      <div class="edit-container">
        <!-- 左侧：编辑器 -->
        <div class="edit-main">
          <!-- 标题 -->
          <input 
            v-model="form.title"
            type="text"
            class="title-input"
            placeholder="请输入文章标题..."
          />

          <!-- 内容类型切换 -->
          <div class="content-type-switcher">
            <button 
              type="button"
              :class="{ 'is-active': form.contentType === 'markdown' }"
              @click="form.contentType = 'markdown'"
            >
              <i-lucide-file-text /> Markdown
            </button>
            <button 
              type="button"
              :class="{ 'is-active': form.contentType === 'pdf' }"
              @click="form.contentType = 'pdf'"
            >
              <i-lucide-file-pdf /> PDF
            </button>
          </div>

          <!-- Markdown 编辑器 -->
          <div v-if="form.contentType === 'markdown'" class="markdown-editor">
            <div class="editor-toolbar">
              <button type="button" @click="insertMarkdown('bold')">
                <i-lucide-bold />
              </button>
              <button type="button" @click="insertMarkdown('italic')">
                <i-lucide-italic />
              </button>
              <button type="button" @click="insertMarkdown('code')">
                <i-lucide-code />
              </button>
              <button type="button" @click="insertMarkdown('image')">
                <i-lucide-image />
              </button>
              <button type="button" @click="togglePreview">
                <i-lucide-eye /> {{ showPreview ? '隐藏' : '预览' }}
              </button>
            </div>

            <div class="editor-content" :class="{ 'split-view': showPreview }">
              <textarea 
                v-model="form.contentText"
                class="markdown-textarea"
                placeholder="开始写作..."
              ></textarea>

              <div v-if="showPreview" class="preview-pane">
                <MarkdownViewer :content="form.contentText" />
              </div>
            </div>
          </div>

          <!-- PDF 上传 -->
          <div v-else class="pdf-upload">
            <div v-if="!form.contentUrl" class="upload-area" @click="selectPdf">
              <i-lucide-upload />
              <p>点击上传 PDF 文件</p>
              <span class="hint">支持 PDF 格式，最大 20MB</span>
              <input 
                ref="pdfInput" 
                type="file" 
                accept=".pdf"
                hidden 
                @change="handlePdfUpload"
              />
            </div>

            <div v-else class="pdf-preview">
              <div class="pdf-info">
                <i-lucide-file-pdf />
                <span>{{ pdfFileName }}</span>
                <button type="button" @click="removePdf" class="btn-icon">
                  <i-lucide-x />
                </button>
              </div>
              <PdfViewer :url="form.contentUrl" />
            </div>
          </div>
        </div>

        <!-- 右侧：元数据 -->
        <aside class="edit-sidebar">
          <!-- 摘要 -->
          <div class="meta-section">
            <label>文章摘要</label>
            <textarea 
              v-model="form.summary"
              rows="3"
              class="textarea"
              placeholder="简要介绍文章内容..."
              maxlength="200"
            ></textarea>
            <div class="char-count">{{ form.summary.length }} / 200</div>
          </div>

          <!-- 封面 -->
          <div class="meta-section">
            <label>封面图片</label>
            <div class="cover-upload">
              <img 
                v-if="form.coverUrl" 
                :src="form.coverUrl" 
                class="cover-preview"
              />
              <button 
                type="button" 
                class="btn btn--sm btn--block"
                @click="selectCover"
              >
                <i-lucide-image /> {{ form.coverUrl ? '更换封面' : '上传封面' }}
              </button>
            </div>
          </div>

          <!-- 分组 -->
          <div class="meta-section">
            <label>分组</label>
            <select v-model="form.groupId" class="select">
              <option :value="null">选择分组</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- 标签 -->
          <div class="meta-section">
            <label>标签</label>
            <div class="tag-input">
              <div class="selected-tags">
                <span 
                  v-for="(tag, index) in form.tags" 
                  :key="index"
                  class="tag"
                >
                  {{ tag }}
                  <button type="button" @click="removeTag(index)">
                    <i-lucide-x />
                  </button>
                </span>
              </div>
              <input 
                v-model="newTag"
                type="text"
                placeholder="输入标签后按回车"
                @keydown.enter.prevent="addTag"
              />
            </div>
          </div>

          <!-- URL Slug -->
          <div class="meta-section">
            <label>URL Slug</label>
            <input 
              v-model="form.slug"
              type="text"
              class="input"
              placeholder="自动生成"
            />
            <div class="hint">
              预览：/posts/{{ form.slug || 'auto-generated' }}
            </div>
          </div>

          <!-- 发布时间 -->
          <div class="meta-section">
            <label>发布时间</label>
            <input 
              v-model="form.publishTime"
              type="datetime-local"
              class="input"
            />
          </div>
        </aside>
      </div>
    </form>
  </div>
</template>
```

**编辑器样式要点**：
- 左侧编辑器最小宽度 600px，可拖拽调整
- Markdown 预览实时渲染
- 保存按钮固定在右下角，悬浮按钮样式

### 4.6 评论管理 `CommentsManageView.vue`

```vue
<template>
  <div class="comments-manage">
    <!-- 筛选栏 -->
    <div class="toolbar">
      <input 
        v-model="searchKeyword" 
        type="search" 
        placeholder="搜索评论内容..." 
        class="search-input"
      />
      <select v-model="filterArticle" class="select">
        <option value="">全部文章</option>
        <option v-for="article in articles" :value="article.id">
          {{ article.title }}
        </option>
      </select>
    </div>

    <!-- 评论卡片列表 -->
    <div class="comment-cards">
      <article 
        v-for="comment in comments" 
        :key="comment.id"
        class="comment-card"
      >
        <div class="comment-header">
          <div class="user-info">
            <div class="avatar">{{ comment.nickname.charAt(0) }}</div>
            <div>
              <div class="nickname">{{ comment.nickname }}</div>
              <time>{{ formatTime(comment.createdAt) }}</time>
            </div>
          </div>
          <button 
            class="btn-icon btn-icon--danger"
            @click="deleteComment(comment.id)"
          >
            <i-lucide-trash-2 />
          </button>
        </div>

        <div class="comment-body">
          <p>{{ comment.content }}</p>
        </div>

        <div class="comment-footer">
          <router-link 
            :to="`/posts/${comment.articleSlug}`"
            class="article-link"
            target="_blank"
          >
            <i-lucide-file-text />
            {{ comment.articleTitle }}
          </router-link>
        </div>
      </article>

      <!-- 空状态 -->
      <div v-if="comments.length === 0" class="empty-state">
        <i-lucide-message-circle-off />
        <p>暂无评论</p>
      </div>
    </div>

    <!-- 分页 -->
    <Pagination 
      :current="currentPage"
      :total="totalPages"
      @change="loadComments"
    />
  </div>
</template>
```

### 4.7 分组标签管理 `GroupsManageView.vue`

```vue
<template>
  <div class="groups-manage">
    <div class="manage-grid">
      <!-- 分组列表 -->
      <div class="groups-list">
        <div class="section-header">
          <h3>分组列表</h3>
          <button class="btn btn--sm btn--primary" @click="showCreateDialog">
            <i-lucide-plus /> 新建分组
          </button>
        </div>

        <draggable 
          v-model="groups" 
          class="group-items"
          @end="updateOrder"
        >
          <div 
            v-for="group in groups" 
            :key="group.id"
            class="group-item"
            :class="{ 'is-active': selectedGroup?.id === group.id }"
            @click="selectGroup(group)"
          >
            <div class="drag-handle">
              <i-lucide-grip-vertical />
            </div>
            <div class="group-info">
              <div class="group-name">{{ group.name }}</div>
              <div class="group-meta">
                {{ group.articleCount }} 篇文章
              </div>
            </div>
            <div class="group-actions">
              <button class="btn-icon" @click.stop="editGroup(group)">
                <i-lucide-edit />
              </button>
              <button class="btn-icon" @click.stop="deleteGroup(group.id)">
                <i-lucide-trash-2 />
              </button>
            </div>
          </div>
        </draggable>
      </div>

      <!-- 分组详情 -->
      <div v-if="selectedGroup" class="group-detail">
        <h3>分组详情</h3>
        <form @submit.prevent="saveGroup">
          <div class="form-group">
            <label>分组名称</label>
            <input 
              v-model="groupForm.name"
              type="text"
              class="input"
              placeholder="输入分组名称"
            />
          </div>

          <div class="form-group">
            <label>URL Slug</label>
            <input 
              v-model="groupForm.slug"
              type="text"
              class="input"
              placeholder="自动生成"
            />
            <div class="hint">
              URL: /groups/{{ groupForm.slug || 'auto' }}
            </div>
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="groupForm.description"
              rows="4"
              class="textarea"
              placeholder="简要描述分组..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn--primary">
              <i-lucide-check /> 保存
            </button>
            <button type="button" class="btn" @click="cancelEdit">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
```

---

## 5. 通用组件库

### 5.1 按钮组件 `Button.vue`

```vue
<template>
  <button 
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--block': block, 'btn--loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <i-lucide-loader v-if="loading" class="spinning" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 500;
  transition: all var(--duration-base) var(--easing);
  cursor: pointer;
  border: none;
  outline: none;
}

/* 变体 */
.btn--primary {
  background: var(--primary-500);
  color: white;
  box-shadow: var(--shadow-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(63, 122, 254, 0.3);
}

.btn--ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--gray-300);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--gray-100);
  border-color: var(--primary-300);
}

/* 尺寸 */
.btn--sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
}

.btn--large {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--text-lg);
}

/* 状态 */
.btn--loading {
  pointer-events: none;
  opacity: 0.7;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--block {
  width: 100%;
}
</style>
```

### 5.2 输入框组件 `Input.vue`

```vue
<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-wrapper">
      <span v-if="prefixIcon" class="input-icon input-icon--prefix">
        <component :is="`i-lucide-${prefixIcon}`" />
      </span>
      
      <input 
        :id="inputId"
        v-model="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'input',
          { 'has-prefix': prefixIcon, 'has-suffix': suffixIcon, 'is-error': error }
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      
      <span v-if="suffixIcon" class="input-icon input-icon--suffix">
        <component :is="`i-lucide-${suffixIcon}`" />
      </span>
    </div>
    
    <div v-if="error" class="input-error">{{ error }}</div>
    <div v-if="hint && !error" class="input-hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--duration-base);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px rgba(63, 122, 254, 0.1);
}

.input.is-error {
  border-color: var(--error);
}

.input-error {
  margin-top: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--error);
}
</style>
```

### 5.3 分页组件 `Pagination.vue`

```vue
<template>
  <nav class="pagination">
    <button 
      class="pagination-btn"
      :disabled="current === 1"
      @click="$emit('change', current - 1)"
    >
      <i-lucide-chevron-left />
      上一页
    </button>

    <div class="pagination-numbers">
      <button 
        v-for="page in visiblePages"
        :key="page"
        :class="['pagination-number', { 'is-active': page === current }]"
        @click="$emit('change', page)"
      >
        {{ page }}
      </button>
    </div>

    <button 
      class="pagination-btn"
      :disabled="current === total"
      @click="$emit('change', current + 1)"
    >
      下一页
      <i-lucide-chevron-right />
    </button>
  </nav>
</template>
```

### 5.4 标签组件 `Tag.vue`

```vue
<template>
  <span 
    :class="['tag', `tag--${variant}`, `tag--${size}`]"
    @click="$emit('click')"
  >
    <slot />
    <button v-if="closable" class="tag-close" @click.stop="$emit('close')">
      <i-lucide-x />
    </button>
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--duration-fast);
}

.tag--primary {
  background: var(--primary-100);
  color: var(--primary-700);
  border: 1px solid var(--primary-300);
}

.tag--primary:hover {
  background: var(--primary-200);
  transform: translateY(-1px);
}
</style>
```

---

## 6. 状态管理 (Pinia)

### 6.1 认证 Store

```javascript
// stores/auth.js
import { defineStore } from 'pinia'
import { login, logout } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(credentials) {
      const res = await login(credentials)
      this.token = res.data.token
      this.user = res.data.user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async logout() {
      await logout()
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
```

### 6.2 文章 Store

```javascript
// stores/article.js
import { defineStore } from 'pinia'
import { getArticles, getArticleBySlug } from '@/api/article'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    currentArticle: null,
    pagination: {
      page: 1,
      size: 10,
      total: 0,
    },
    filters: {
      keyword: '',
      groupId: null,
      tags: [],
    },
  }),

  actions: {
    async fetchArticles(params) {
      const res = await getArticles({ ...this.pagination, ...this.filters, ...params })
      this.articles = res.data.items
      this.pagination.total = res.data.total
    },

    async fetchArticleBySlug(slug) {
      const res = await getArticleBySlug(slug)
      this.currentArticle = res.data
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.pagination.page = 1
      this.fetchArticles()
    },
  },
})
```

---

## 7. 路由配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // 公共端
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/HomeView.vue') },
      { path: 'archive', name: 'Archive', component: () => import('@/views/ArchiveView.vue') },
      { path: 'groups', name: 'Groups', component: () => import('@/views/GroupsView.vue') },
      { path: 'groups/:id', name: 'GroupDetail', component: () => import('@/views/GroupDetailView.vue') },
      { path: 'posts/:slug', name: 'PostDetail', component: () => import('@/views/PostDetailView.vue') },
      { path: 'about', name: 'About', component: () => import('@/views/AboutView.vue') },
    ],
  },

  // 登录
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },

  // 后台
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'articles', name: 'Articles', component: () => import('@/views/admin/ArticlesManageView.vue') },
      { path: 'articles/edit/:id?', name: 'ArticleEdit', component: () => import('@/views/admin/ArticleEditView.vue') },
      { path: 'groups', name: 'GroupsManage', component: () => import('@/views/admin/GroupsManageView.vue') },
      { path: 'comments', name: 'CommentsManage', component: () => import('@/views/admin/CommentsManageView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
```

---

## 8. API 封装（简化说明）

### 8.1 公共接口

```javascript
// api/article.js
import request from './request'

// 获取文章列表
export const getArticles = (params) => 
  request.get('/api/articles', { params })

// 获取文章详情
export const getArticleBySlug = (slug) => 
  request.get(`/api/articles/${slug}`)

// 获取评论列表
export const getComments = (articleId) => 
  request.get(`/api/articles/${articleId}/comments`)

// 提交评论
export const createComment = (articleId, data) => 
  request.post(`/api/articles/${articleId}/comments`, data)
```

### 8.2 后台接口

```javascript
// api/admin.js
import request from './request'

// 登录
export const login = (data) => 
  request.post('/api/auth/login', data)

// 文章管理
export const getAdminArticles = (params) => 
  request.get('/api/admin/articles', { params })

export const createArticle = (data) => 
  request.post('/api/admin/articles', data)

export const updateArticle = (id, data) => 
  request.put(`/api/admin/articles/${id}`, data)

export const deleteArticle = (id) => 
  request.delete(`/api/admin/articles/${id}`)

// 统计数据
export const getDashboardStats = () => 
  request.get('/api/admin/dashboard/stats')
```

---

## 9. 响应式设计

### 9.1 断点定义

```css
/* 断点：仅适配桌面和手机 */
--breakpoint-mobile: 768px;   /* 小于768px为手机，大于等于768px为桌面 */
```

### 9.2 响应式规则

```css
/* 桌面端（默认） >= 768px */
.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);
}

.navbar__menu {
  display: flex;
}

.mobile-menu {
  display: none;
}

/* 手机端 < 768px */
@media (max-width: 767px) {
  /* 文章网格 - 单列 */
  .article-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
  
  /* 导航栏 - 折叠菜单 */
  .navbar {
    height: 56px;
  }
  
  .navbar__menu {
    display: none;
  }
  
  .mobile-menu {
    display: block;
  }
  
  /* 文章详情 - 隐藏侧边目录 */
  .toc {
    display: none;
  }
  
  /* Hero区域 - 调整字体和间距 */
  .hero__title {
    font-size: var(--text-3xl);
  }
  
  .hero {
    height: 300px;
    padding: var(--spacing-6);
  }
  
  /* 内容区域 - 减少内边距 */
  .container {
    padding: var(--spacing-4);
  }
  
  /* 文章详情 - 全宽显示 */
  .post-detail__content {
    max-width: 100%;
    padding: var(--spacing-4);
  }
  
  /* 评论表单 - 调整间距 */
  .comment-form {
    padding: var(--spacing-4);
  }
  
  /* 后台侧边栏 - 收起或抽屉模式 */
  .admin-sidebar {
    position: fixed;
    left: -240px;
    transition: left var(--duration-base);
  }
  
  .admin-sidebar.is-open {
    left: 0;
    z-index: 1000;
  }
  
  /* 后台内容区 - 全宽 */
  .admin-main {
    margin-left: 0;
    padding: var(--spacing-4);
  }
  
  /* 表格 - 转为卡片布局 */
  .data-table {
    display: none;
  }
  
  .mobile-card-list {
    display: block;
  }
  
  /* 编辑器 - 取消左右分栏 */
  .edit-container {
    flex-direction: column;
  }
  
  .edit-sidebar {
    width: 100%;
    position: static;
  }
  
  /* 字体调整 */
  :root {
    --text-base: 0.875rem;   /* 14px */
    --text-lg: 1rem;         /* 16px */
    --text-xl: 1.125rem;     /* 18px */
  }
}

/* 桌面端特定优化 >= 1280px */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
  
  .article-grid {
    gap: var(--spacing-8);
  }
}
```

### 9.3 移动端专属组件

#### 移动端抽屉菜单 `MobileDrawer.vue`
```vue
<template>
  <transition name="drawer">
    <div v-if="isOpen" class="mobile-drawer">
      <div class="drawer-overlay" @click="close"></div>
      <nav class="drawer-content">
        <div class="drawer-header">
          <button class="close-btn" @click="close">
            <i-lucide-x />
          </button>
        </div>
        <div class="drawer-menu">
          <router-link to="/" @click="close">首页</router-link>
          <router-link to="/archive" @click="close">归档</router-link>
          <router-link to="/groups" @click="close">分组</router-link>
          <router-link to="/about" @click="close">关于</router-link>
        </div>
      </nav>
    </div>
  </transition>
</template>

<style scoped>
.mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.drawer-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: var(--bg-primary);
  box-shadow: var(--shadow-xl);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--duration-base);
}

.drawer-enter-active .drawer-content,
.drawer-leave-active .drawer-content {
  transition: transform var(--duration-base) var(--easing);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-content {
  transform: translateX(100%);
}

.drawer-leave-to .drawer-content {
  transform: translateX(100%);
}
</style>
```

#### 移动端文章卡片列表
```css
/* 手机端文章卡片优化 */
@media (max-width: 767px) {
  .article-card {
    display: flex;
    flex-direction: row;
    height: 120px;
  }
  
  .article-card__cover {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }
  
  .article-card__body {
    flex: 1;
    padding: var(--spacing-3);
  }
  
  .article-card__title {
    font-size: var(--text-base);
    line-height: 1.4;
    -webkit-line-clamp: 2;
  }
  
  .article-card__summary {
    display: none;
  }
  
  .article-card__tags {
    display: none;
  }
}
```

---

## 10. 动画与交互

### 10.1 页面过渡

```vue
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--easing);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 10.2 常用动画

```css
/* 上浮动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 旋转加载 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* 抖动动画 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.shake-enter-active {
  animation: shake 0.3s;
}
```

---

## 11. 性能优化

### 11.1 代码分割
- 路由懒加载
- 组件异步加载
- 第三方库按需引入

### 11.2 资源优化
- 图片懒加载 (`Intersection Observer`)
- Markdown 渲染防抖
- 虚拟滚动（大列表）

### 11.3 缓存策略
- API 数据缓存（Pinia）
- 静态资源 CDN
- Service Worker（可选）

---

## 12. 后端接口快速参考

```
认证
POST   /api/auth/login          登录
POST   /api/auth/logout         登出

公共文章
GET    /api/articles            文章列表（分页、筛选）
GET    /api/articles/:slug      文章详情

评论
GET    /api/articles/:id/comments     评论列表
POST   /api/articles/:id/comments     提交评论

分组
GET    /api/groups              分组列表

后台文章
GET    /api/admin/articles      文章列表
POST   /api/admin/articles      创建文章
PUT    /api/admin/articles/:id  更新文章
DELETE /api/admin/articles/:id  删除文章

后台评论
GET    /api/admin/comments      评论列表
DELETE /api/admin/comments/:id  删除评论

后台统计
GET    /api/admin/dashboard/stats  仪表盘数据
```

---

## 13. 开发建议

1. **使用 TypeScript**（可选）：提升代码可维护性
2. **ESLint + Prettier**：统一代码风格
3. **组件文档**：使用 Storybook 展示组件
4. **单元测试**：关键组件编写测试
5. **性能监控**：使用 Vue Devtools
6. **错误追踪**：集成 Sentry

---

**本文档专注前端实现，提供精美现代的界面设计与完整组件方案。**

📅 **版本**：v1.0  
📅 **日期**：2025-10-16


<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__content">
        <div class="footer__section">
          <h3 class="footer__title">{{ siteName }}</h3>
          <p class="footer__desc">分享有价值的技术见解与生活感悟</p>
        </div>

        <div class="footer__section">
          <h4 class="footer__subtitle">快速链接</h4>
          <div class="footer__links">
            <router-link to="/">首页</router-link>
            <router-link to="/archive">归档</router-link>
            <router-link to="/groups">分组</router-link>
            <router-link to="/about">关于</router-link>
          </div>
        </div>

        <div class="footer__section">
          <h4 class="footer__subtitle">联系方式</h4>
          <div class="footer__links">
            <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
            <a href="mailto:example@email.com">Email</a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="copyright">
          © {{ currentYear }} {{ siteName }}. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'

const siteName = ref('个人博客')
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-12) 0 var(--spacing-6);
  margin-top: var(--spacing-16);
}

.footer__container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.footer__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
}

.footer__section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.footer__title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.footer__desc {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.footer__subtitle {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.footer__links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--duration-base);
}

.footer__links a:hover {
  color: var(--primary-500);
}

.footer__bottom {
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.copyright {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  margin: 0;
}

@media (max-width: 767px) {
  .footer {
    padding: var(--spacing-8) 0 var(--spacing-4);
  }
  
  .footer__content {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
  
  .footer__container {
    padding: 0 var(--spacing-4);
  }
}
</style>


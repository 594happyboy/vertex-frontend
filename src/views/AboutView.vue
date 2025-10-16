<template>
  <div class="about-view">
    <div class="container">
      <!-- 个人信息卡 -->
      <section class="profile-card">
        <div class="avatar-wrapper">
          <div class="avatar">👨‍💻</div>
          <div class="avatar-ring"></div>
        </div>
        <h1>关于我</h1>
        <p class="bio">这里是个人简介，分享技术见解与生活感悟</p>
        <div class="social-links">
          <a href="https://github.com" target="_blank" rel="noopener" class="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="mailto:example@email.com" class="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </a>
        </div>
      </section>

      <!-- 技能标签云 -->
      <section class="skills-section">
        <h2>技能</h2>
        <div class="skill-cloud">
          <BaseTag 
            v-for="skill in skills" 
            :key="skill.name"
            variant="primary"
            :style="{ fontSize: `${0.8 + skill.level * 0.2}rem` }"
          >
            {{ skill.name }}
          </BaseTag>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="contact-section">
        <h2>联系方式</h2>
        <div class="contact-cards">
          <div class="contact-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <h3>Email</h3>
            <p>example@email.com</p>
          </div>
          <div class="contact-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <h3>GitHub</h3>
            <p>@yourname</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseTag from '@/components/base/BaseTag.vue'

const skills = ref([
  { name: 'Vue.js', level: 5 },
  { name: 'JavaScript', level: 5 },
  { name: 'TypeScript', level: 4 },
  { name: 'CSS', level: 4 },
  { name: 'Node.js', level: 3 },
  { name: 'React', level: 3 },
  { name: 'Python', level: 2 },
  { name: 'Java', level: 2 }
])
</script>

<style scoped>
.about-view {
  padding: var(--spacing-12) 0;
}

.profile-card {
  text-align: center;
  padding: var(--spacing-12);
  margin-bottom: var(--spacing-12);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: var(--spacing-6);
}

.avatar {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  border-radius: var(--radius-full);
  position: relative;
  z-index: 2;
}

.avatar-ring {
  position: absolute;
  inset: -8px;
  border: 3px solid var(--primary-200);
  border-radius: var(--radius-full);
  animation: ring-pulse 3s infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.profile-card h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-3);
  color: var(--text-primary);
}

.bio {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--spacing-6);
  line-height: var(--leading-relaxed);
}

.social-links {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--text-secondary);
  transition: all var(--duration-base);
}

.social-link:hover {
  background: var(--primary-500);
  color: white;
  transform: translateY(-4px);
}

.skills-section,
.contact-section {
  margin-bottom: var(--spacing-12);
}

.skills-section h2,
.contact-section h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  text-align: center;
  margin-bottom: var(--spacing-8);
  color: var(--text-primary);
}

.skill-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
  max-width: 800px;
  margin: 0 auto;
}

.contact-card {
  padding: var(--spacing-8);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all var(--duration-base);
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.contact-card svg {
  color: var(--primary-500);
  margin-bottom: var(--spacing-4);
}

.contact-card h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--spacing-2);
  color: var(--text-primary);
}

.contact-card p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 767px) {
  .about-view {
    padding: var(--spacing-8) 0;
  }
  
  .contact-cards {
    grid-template-columns: 1fr;
  }
}
</style>


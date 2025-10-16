<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>管理后台</h1>
          <p>欢迎回来，请登录以继续</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <BaseInput
            v-model="form.username"
            label="用户名"
            placeholder="请输入用户名"
            :error="errors.username"
            required
          />

          <BaseInput
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :error="errors.password"
            required
          />

          <BaseButton 
            type="submit" 
            variant="primary" 
            block
            :loading="isLoading"
          >
            登录
          </BaseButton>
        </form>

        <!-- 错误提示 -->
        <transition name="shake">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </transition>
      </div>

      <!-- 装饰 -->
      <div class="login-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const validate = () => {
  errors.username = ''
  errors.password = ''
  
  if (!form.username) {
    errors.username = '请输入用户名'
    return false
  }
  
  if (!form.password) {
    errors.password = '请输入密码'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = '密码至少6位'
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validate()) {
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login({
      username: form.username,
      password: form.password
    })
    
    // 登录成功，跳转
    const redirect = route.query.redirect || '/admin/dashboard'
    router.push(redirect)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '登录失败，请检查用户名和密码'
    
    // 清空密码
    form.password = ''
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--accent-50) 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  padding: 0 var(--spacing-6);
}

.login-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.login-header h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
}

.login-header p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.error-message {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background: #FEE2E2;
  color: #991B1B;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  text-align: center;
}

/* 装饰圆圈 */
.login-decoration {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary-200) 0%, transparent 70%);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  left: -200px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -100px;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 抖动动画 */
.shake-enter-active {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@media (max-width: 767px) {
  .login-card {
    padding: var(--spacing-6);
  }
  
  .login-header h1 {
    font-size: var(--text-2xl);
  }
}
</style>


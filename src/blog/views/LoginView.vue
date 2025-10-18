<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">个人博客</h1>
        <p class="login-subtitle">欢迎回来</p>
      </div>

      <div class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            @keydown.enter="handleLogin"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            @keydown.enter="handleLogin"
            :disabled="loading"
          />
        </div>

        <button
          class="btn btn-primary btn-block"
          @click="handleLogin"
          :disabled="loading || !canSubmit"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>登 录</span>
        </button>

        <div class="divider">
          <span>或</span>
        </div>

        <button
          class="btn btn-secondary btn-block"
          @click="handleVisitorLogin"
          :disabled="loading"
        >
          游客访问
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();

const form = ref({
  username: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

const canSubmit = computed(() => {
  return form.value.username.trim() && form.value.password.trim();
});

// 获取重定向路径（Token过期前的页面）
function getRedirectPath() {
  const redirect = route.query.redirect;
  // 如果有redirect参数且不是登录页，则使用该路径
  if (redirect && redirect !== '/login') {
    return redirect;
  }
  // 否则默认跳转到管理页
  return '/me';
}

// 用户登录
async function handleLogin() {
  if (!canSubmit.value || loading.value) return;

  error.value = '';
  loading.value = true;

  try {
    await authStore.login(form.value.username, form.value.password);
    uiStore.showSuccess('登录成功');
    
    // 登录成功后跳转到原来的页面或默认页面
    const redirectPath = getRedirectPath();
    router.push(redirectPath);
  } catch (err) {
    error.value = err.message || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
}

// 游客登录
async function handleVisitorLogin() {
  if (loading.value) return;

  error.value = '';
  loading.value = true;

  try {
    await authStore.loginAsVisitor();
    uiStore.showInfo('以游客身份进入（仅可查看已发布内容）');
    
    // 游客登录后也支持重定向
    const redirectPath = getRedirectPath();
    router.push(redirectPath);
  } catch (err) {
    error.value = err.message || '游客访问失败';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-2xl);
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.login-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.error-message {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-error-light);
  color: var(--color-error);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-group input {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:active:not(:disabled) {
  background-color: var(--color-primary-active);
}

.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
}

.btn-block {
  width: 100%;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  margin: var(--spacing-md) 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.divider span {
  padding: 0 var(--spacing-md);
}
</style>


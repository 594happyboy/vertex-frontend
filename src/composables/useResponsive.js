/**
 * 响应式检测 Hook
 * 提供统一的响应式断点检测（只区分手机和PC）
 * 
 * @example
 * const { isMobile, isDesktop } = useResponsive()
 * 
 * // 在模板中使用
 * <div v-if="isMobile">移动端内容</div>
 * <div v-else>PC端内容</div>
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

// 断点定义（与 CSS tokens 保持一致）
// 768px 以下为手机，以上为PC
export const BREAKPOINT_MOBILE = 768;

export function useResponsive() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // 响应式计算属性
  const isMobile = computed(() => windowWidth.value <= BREAKPOINT_MOBILE);
  const isDesktop = computed(() => windowWidth.value > BREAKPOINT_MOBILE);
  
  // 更新窗口宽度
  function updateWidth() {
    windowWidth.value = window.innerWidth;
  }
  
  // 防抖函数 - 避免频繁触发
  let timeoutId = null;
  function debouncedUpdateWidth() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(updateWidth, 150);
  }
  
  // 生命周期管理
  if (typeof window !== 'undefined') {
    onMounted(() => {
      window.addEventListener('resize', debouncedUpdateWidth);
      // 初始化时更新一次
      updateWidth();
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', debouncedUpdateWidth);
      if (timeoutId) clearTimeout(timeoutId);
    });
  }
  
  return {
    // 原始数据
    windowWidth,
    breakpoint: BREAKPOINT_MOBILE,
    
    // 断点判断（只有两种）
    isMobile,
    isDesktop,
    
    // 工具方法
    updateWidth,
  };
}


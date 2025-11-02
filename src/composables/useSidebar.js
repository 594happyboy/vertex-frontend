/**
 * 侧边栏管理 Hook
 * 统一管理侧边栏的打开/关闭状态
 * 支持响应式自动适配
 * 
 * @example
 * const { isCollapsed, toggle, open, close } = useSidebar()
 */

import { computed } from 'vue';
import { useUiStore } from '@/blog/stores/ui';
import { useResponsive } from './useResponsive';

export function useSidebar() {
  const uiStore = useUiStore();
  const { isMobile } = useResponsive();
  
  // 侧边栏是否收起
  const isCollapsed = computed(() => uiStore.sidebarCollapsed);
  
  // 切换侧边栏
  function toggle() {
    uiStore.toggleSidebar();
  }
  
  // 打开侧边栏
  function open() {
    if (isCollapsed.value) {
      uiStore.toggleSidebar();
    }
  }
  
  // 关闭侧边栏
  function close() {
    if (!isCollapsed.value) {
      uiStore.toggleSidebar();
    }
  }
  
  // 初始化侧边栏状态（根据设备类型）
  function init() {
    uiStore.initSidebar();
  }
  
  // 移动端点击遮罩时自动关闭
  function handleOverlayClick() {
    if (isMobile.value && !isCollapsed.value) {
      close();
    }
  }
  
  return {
    // 状态
    isCollapsed,
    isMobile,
    
    // 方法
    toggle,
    open,
    close,
    init,
    handleOverlayClick,
  };
}


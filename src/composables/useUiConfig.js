/**
 * UI 配置 Hook
 * 根据设备类型提供统一的 UI 配置（只区分手机和PC）
 * 
 * @example
 * const { config, isMobile } = useUiConfig()
 * 
 * // 使用配置
 * const buttonStyle = {
 *   padding: config.value.button.padding,
 *   fontSize: config.value.button.fontSize,
 * }
 */

import { computed } from 'vue';
import { useResponsive } from './useResponsive';

export function useUiConfig() {
  const { isMobile, windowWidth } = useResponsive();
  
  // 统一的 UI 配置
  const config = computed(() => {
    const mobile = isMobile.value;
    
    return {
      // 按钮配置
      button: {
        // 尺寸
        heightSm: mobile ? 'var(--btn-height-mobile-sm)' : 'var(--btn-height-sm)',
        heightMd: mobile ? 'var(--btn-height-mobile-md)' : 'var(--btn-height-md)',
        heightLg: mobile ? 'var(--btn-height-mobile-lg)' : 'var(--btn-height-lg)',
        
        // 内边距
        paddingSm: mobile ? 'var(--btn-padding-mobile-sm)' : 'var(--btn-padding-sm)',
        paddingMd: mobile ? 'var(--btn-padding-mobile-md)' : 'var(--btn-padding-md)',
        paddingLg: mobile ? 'var(--btn-padding-mobile-lg)' : 'var(--btn-padding-lg)',
        
        // 字体
        fontSize: mobile ? 'var(--font-size-mobile-base)' : 'var(--font-size-sm)',
        
        // 图标
        iconSize: mobile ? 'var(--icon-size-mobile-md)' : 'var(--icon-size-md)',
      },
      
      // 间距配置
      spacing: {
        xs: mobile ? 'var(--spacing-mobile-xs)' : 'var(--spacing-xs)',
        sm: mobile ? 'var(--spacing-mobile-sm)' : 'var(--spacing-sm)',
        md: mobile ? 'var(--spacing-mobile-md)' : 'var(--spacing-md)',
        lg: mobile ? 'var(--spacing-mobile-lg)' : 'var(--spacing-lg)',
        xl: mobile ? 'var(--spacing-mobile-xl)' : 'var(--spacing-xl)',
      },
      
      // 字体配置
      typography: {
        xs: mobile ? 'var(--font-size-mobile-xs)' : 'var(--font-size-xs)',
        sm: mobile ? 'var(--font-size-mobile-sm)' : 'var(--font-size-sm)',
        base: mobile ? 'var(--font-size-mobile-base)' : 'var(--font-size-base)',
        md: mobile ? 'var(--font-size-mobile-md)' : 'var(--font-size-md)',
        lg: mobile ? 'var(--font-size-mobile-lg)' : 'var(--font-size-lg)',
      },
      
      // 图标配置
      icon: {
        sm: mobile ? 'var(--icon-size-mobile-sm)' : 'var(--icon-size-sm)',
        md: mobile ? 'var(--icon-size-mobile-md)' : 'var(--icon-size-md)',
        lg: mobile ? 'var(--icon-size-mobile-lg)' : 'var(--icon-size-lg)',
      },
      
      // 侧边栏配置
      sidebar: {
        width: mobile ? '85%' : '280px',
        maxWidth: mobile ? '320px' : 'none',
        collapsedByDefault: mobile,
        isDrawer: mobile, // 移动端使用抽屉式
      },
      
      // 工具栏配置
      toolbar: {
        showFullButtons: !mobile,
        useMoreMenu: mobile,
        searchBoxFlex: mobile ? '1' : 'initial',
      },
      
      // 网格配置
      grid: {
        minColumnWidth: mobile ? '160px' : '240px',
        gap: mobile ? 'var(--spacing-mobile-md)' : 'var(--spacing-md)',
      },
      
      // 输入框配置
      input: {
        height: mobile ? 'var(--input-height-mobile-md)' : 'var(--input-height-md)',
        fontSize: mobile ? 'var(--font-size-mobile-base)' : 'var(--font-size-sm)',
      },
    };
  });
  
  return {
    config,
    isMobile,
    isDesktop: !isMobile.value,
    windowWidth,
  };
}


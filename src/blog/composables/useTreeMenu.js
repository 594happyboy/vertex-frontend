import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

// 全局状态：当前打开的菜单ID
let activeMenuId = null;
const closeCallbacks = new Map();

/**
 * 树形菜单的通用逻辑
 * @returns {Object} 菜单状态和方法
 */
export function useTreeMenu() {
  // 生成唯一的菜单ID
  const menuId = Symbol('menu');
  const showMenu = ref(false);
  const menuRef = ref(null);

  // 点击外部关闭菜单
  function handleClickOutside(event) {
    if (menuRef.value && !menuRef.value.contains(event.target)) {
      showMenu.value = false;
    }
  }

  // 关闭所有其他菜单
  function closeOtherMenus() {
    if (activeMenuId !== null && activeMenuId !== menuId) {
      const closeCallback = closeCallbacks.get(activeMenuId);
      if (closeCallback) {
        closeCallback();
      }
    }
  }

  // 切换菜单显示状态
  function toggleMenu(event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!showMenu.value) {
      // 打开新菜单前，关闭其他所有菜单
      closeOtherMenus();
      showMenu.value = true;
      activeMenuId = menuId;
    } else {
      // 关闭当前菜单
      showMenu.value = false;
      if (activeMenuId === menuId) {
        activeMenuId = null;
      }
    }
  }

  // 关闭菜单
  function closeMenu() {
    showMenu.value = false;
    if (activeMenuId === menuId) {
      activeMenuId = null;
    }
  }

  // 执行菜单操作并关闭菜单
  function handleMenuAction(callback) {
    return (...args) => {
      closeMenu();
      callback?.(...args);
    };
  }

  // 注册关闭回调
  closeCallbacks.set(menuId, closeMenu);

  // 生命周期
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    closeCallbacks.delete(menuId);
    if (activeMenuId === menuId) {
      activeMenuId = null;
    }
  });

  return {
    showMenu,
    menuRef,
    toggleMenu,
    closeMenu,
    handleMenuAction,
  };
}


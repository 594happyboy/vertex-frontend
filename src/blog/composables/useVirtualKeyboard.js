/**
 * 虚拟键盘监听 Hook
 * 监听移动端虚拟键盘的弹出和收起，并计算键盘高度
 * 
 * @example
 * const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboard()
 * 
 * // 在模板中使用
 * <div :style="{ paddingBottom: keyboardHeight + 'px' }">
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useVirtualKeyboard() {
  const keyboardHeight = ref(0)
  const isKeyboardVisible = ref(false)
  const viewportHeight = ref(0)

  // 更新键盘状态
  function updateKeyboardState() {
    if (!window.visualViewport) {
      return
    }

    const viewport = window.visualViewport
    const windowHeight = window.innerHeight
    const viewportHeightValue = viewport.height

    // 计算键盘高度（窗口高度 - 视口高度）
    const calculatedKeyboardHeight = windowHeight - viewportHeightValue

    // 键盘高度大于 100px 才认为是键盘弹出
    // （避免误判，如浏览器地址栏的收起）
    if (calculatedKeyboardHeight > 100) {
      keyboardHeight.value = calculatedKeyboardHeight
      isKeyboardVisible.value = true
    } else {
      keyboardHeight.value = 0
      isKeyboardVisible.value = false
    }

    viewportHeight.value = viewportHeightValue
  }

  // 生命周期管理
  onMounted(() => {
    if (window.visualViewport) {
      // 监听视口变化
      window.visualViewport.addEventListener('resize', updateKeyboardState)
      window.visualViewport.addEventListener('scroll', updateKeyboardState)
      
      // 初始化
      updateKeyboardState()
    }
  })

  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateKeyboardState)
      window.visualViewport.removeEventListener('scroll', updateKeyboardState)
    }
  })

  return {
    // 键盘高度（px）
    keyboardHeight,
    // 键盘是否可见
    isKeyboardVisible,
    // 视口高度
    viewportHeight,
    // 手动更新
    updateKeyboardState,
  }
}


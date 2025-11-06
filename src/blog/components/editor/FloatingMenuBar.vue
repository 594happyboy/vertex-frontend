<template>
  <div class="floating-menu-bar" :class="{ 'is-mobile': isMobile }">
    <button
      @click="toggleMenu"
      class="floating-trigger"
      title="插入内容"
    >
      <span class="plus-icon">+</span>
    </button>
    
    <Transition name="menu-expand">
      <div v-if="showMenu" class="floating-menu-panel">
        <button
          @click="insertHeading(1)"
          class="menu-item"
        >
          <span class="menu-icon">H1</span>
          <span class="menu-label">标题 1</span>
        </button>
        
        <button
          @click="insertHeading(2)"
          class="menu-item"
        >
          <span class="menu-icon">H2</span>
          <span class="menu-label">标题 2</span>
        </button>
        
        <button
          @click="insertHeading(3)"
          class="menu-item"
        >
          <span class="menu-icon">H3</span>
          <span class="menu-label">标题 3</span>
        </button>
        
        <div class="menu-divider"></div>
        
        <button
          @click="insertBulletList"
          class="menu-item"
        >
          <span class="menu-icon">•</span>
          <span class="menu-label">无序列表</span>
        </button>
        
        <button
          @click="insertOrderedList"
          class="menu-item"
        >
          <span class="menu-icon">1.</span>
          <span class="menu-label">有序列表</span>
        </button>
        
        <button
          @click="insertQuote"
          class="menu-item"
        >
          <span class="menu-icon">"</span>
          <span class="menu-label">引用</span>
        </button>
        
        <div class="menu-divider"></div>
        
        <button
          @click="handleInsertImage"
          class="menu-item"
        >
          <span class="menu-icon">🖼️</span>
          <span class="menu-label">图片</span>
        </button>
        
        <button
          @click="handleInsertLink"
          class="menu-item"
        >
          <span class="menu-icon">🔗</span>
          <span class="menu-label">链接</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useResponsive } from '@/composables'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-image', 'add-link'])

const { isMobile } = useResponsive()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const insertHeading = (level) => {
  props.editor.chain().focus().toggleHeading({ level }).run()
  closeMenu()
}

const insertBulletList = () => {
  props.editor.chain().focus().toggleBulletList().run()
  closeMenu()
}

const insertOrderedList = () => {
  props.editor.chain().focus().toggleOrderedList().run()
  closeMenu()
}

const insertQuote = () => {
  props.editor.chain().focus().toggleBlockquote().run()
  closeMenu()
}

const handleInsertImage = () => {
  emit('add-image')
  closeMenu()
}

const handleInsertLink = () => {
  emit('add-link')
  closeMenu()
}
</script>

<style scoped>
.floating-menu-bar {
  position: relative;
  z-index: 10;
}

.floating-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px dashed var(--color-border, #e5e7eb);
  border-radius: 50%;
  background: var(--color-bg, #ffffff);
  color: var(--color-text-secondary, #9ca3af);
  cursor: pointer;
  transition: all 0.2s;
}

.floating-menu-bar.is-mobile .floating-trigger {
  width: 40px;
  height: 40px;
}

.floating-trigger:hover {
  border-color: var(--color-primary, #3b82f6);
  color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

.plus-icon {
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
}

.floating-menu-panel {
  position: absolute;
  left: 40px;
  top: 0;
  min-width: 180px;
  background: var(--color-bg, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 20;
}

.floating-menu-bar.is-mobile .floating-menu-panel {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-width: 280px;
  max-width: 90vw;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text, #374151);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.floating-menu-bar.is-mobile .menu-item {
  padding: 14px 16px;
  font-size: 16px;
}

.menu-item:hover {
  background: var(--color-bg-hover, #f3f4f6);
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
}

.menu-label {
  flex: 1;
}

.menu-divider {
  height: 1px;
  background: var(--color-border, #e5e7eb);
  margin: 4px 0;
}

/* 动画 */
.menu-expand-enter-active,
.menu-expand-leave-active {
  transition: all 0.2s ease;
}

.menu-expand-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

.menu-expand-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

.floating-menu-bar.is-mobile .menu-expand-enter-from,
.floating-menu-bar.is-mobile .menu-expand-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* 暗色主题 */
[data-theme='dark'] .floating-trigger {
  background: #1f2937;
  border-color: #374151;
  color: #9ca3af;
}

[data-theme='dark'] .floating-trigger:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

[data-theme='dark'] .floating-menu-panel {
  background: #1f2937;
  border-color: #374151;
}

[data-theme='dark'] .menu-item {
  color: #d1d5db;
}

[data-theme='dark'] .menu-item:hover {
  background: #374151;
}
</style>


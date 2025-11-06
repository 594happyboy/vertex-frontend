<template>
  <div class="bubble-menu-bar" :class="{ 'is-mobile': isMobile }">
    <button
      @click="toggleBold"
      :class="{ 'is-active': editor.isActive('bold') }"
      class="bubble-btn"
      title="加粗"
    >
      <span class="icon">B</span>
    </button>
    
    <button
      @click="toggleItalic"
      :class="{ 'is-active': editor.isActive('italic') }"
      class="bubble-btn"
      title="斜体"
    >
      <span class="icon italic">I</span>
    </button>
    
    <button
      @click="toggleUnderline"
      :class="{ 'is-active': editor.isActive('underline') }"
      class="bubble-btn"
      title="下划线"
    >
      <span class="icon underline">U</span>
    </button>
    
    <button
      @click="toggleStrike"
      :class="{ 'is-active': editor.isActive('strike') }"
      class="bubble-btn"
      title="删除线"
    >
      <span class="icon strike">S</span>
    </button>
    
    <div class="bubble-divider"></div>
    
    <button
      @click="$emit('add-link')"
      :class="{ 'is-active': editor.isActive('link') }"
      class="bubble-btn"
      title="链接"
    >
      🔗
    </button>
  </div>
</template>

<script setup>
import { useResponsive } from '@/composables'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

defineEmits(['add-link'])

const { isMobile } = useResponsive()

const toggleBold = () => {
  props.editor.chain().focus().toggleBold().run()
}

const toggleItalic = () => {
  props.editor.chain().focus().toggleItalic().run()
}

const toggleUnderline = () => {
  props.editor.chain().focus().toggleUnderline().run()
}

const toggleStrike = () => {
  props.editor.chain().focus().toggleStrike().run()
}
</script>

<style scoped>
.bubble-menu-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.bubble-menu-bar.is-mobile {
  padding: 8px;
  gap: 6px;
}

.bubble-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.bubble-menu-bar.is-mobile .bubble-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
  font-size: 16px;
}

.bubble-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.bubble-btn:active {
  transform: scale(0.95);
}

.bubble-btn.is-active {
  background: rgba(59, 130, 246, 0.8);
  color: white;
}

.bubble-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}

.icon {
  display: inline-block;
}

.icon.italic {
  font-style: italic;
}

.icon.underline {
  text-decoration: underline;
}

.icon.strike {
  text-decoration: line-through;
}
</style>


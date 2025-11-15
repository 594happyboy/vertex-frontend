<template>
  <div 
    class="rich-text-editor" 
    :class="{ 
      'is-focused': editor?.isFocused,
      'is-mobile': isMobile 
    }"
    :style="editorContainerStyle"
  >
    <!-- 桌面端工具栏 -->
    <div v-if="editor && !isMobile" class="editor-toolbar">
      <!-- 文本样式 -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          title="加粗 (Ctrl+B)"
          class="toolbar-btn"
        >
          <span class="icon">B</span>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          title="斜体 (Ctrl+I)"
          class="toolbar-btn"
        >
          <span class="icon italic">I</span>
        </button>
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
          title="下划线 (Ctrl+U)"
          class="toolbar-btn"
        >
          <span class="icon underline">U</span>
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          title="删除线"
          class="toolbar-btn"
        >
          <span class="icon strike">S</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 标题 -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          title="一级标题"
          class="toolbar-btn"
        >
          H1
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          title="二级标题"
          class="toolbar-btn"
        >
          H2
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          title="三级标题"
          class="toolbar-btn"
        >
          H3
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 对齐 -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().setTextAlign('left').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
          title="左对齐"
          class="toolbar-btn"
        >
          ≡
        </button>
        <button
          @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
          title="居中对齐"
          class="toolbar-btn"
        >
          ≣
        </button>
        <button
          @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
          title="右对齐"
          class="toolbar-btn"
        >
          ≡
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 列表 -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          title="无序列表"
          class="toolbar-btn"
        >
          •·•
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          title="有序列表"
          class="toolbar-btn"
        >
          1.2.3
        </button>
        <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          title="代码块"
          class="toolbar-btn"
        >
          &lt;/&gt;
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 其他 -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          title="引用"
          class="toolbar-btn"
        >
          "
        </button>
        <button
          @click="editor.chain().focus().setHorizontalRule().run()"
          title="分隔线"
          class="toolbar-btn"
        >
          ―
        </button>
        <button
          @click="showLinkDialog = true"
          :class="{ 'is-active': editor.isActive('link') }"
          title="链接"
          class="toolbar-btn"
        >
          🔗
        </button>
        <button
          @click="showImageDialog = true"
          title="插入图片"
          class="toolbar-btn"
        >
          🖼️
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 操作 -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().undo()"
          title="撤销 (Ctrl+Z)"
          class="toolbar-btn"
        >
          ↶
        </button>
        <button
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().redo()"
          title="重做 (Ctrl+Y)"
          class="toolbar-btn"
        >
          ↷
        </button>
        <button
          @click="clearFormat"
          title="清除格式"
          class="toolbar-btn"
        >
          ⌧
        </button>
      </div>
    </div>

    <!-- BubbleMenu（选中文本时显示）-->
    <BubbleMenu 
      v-if="editor"
      :editor="editor"
      :tippy-options="{ 
        duration: 100,
        placement: 'top',
        maxWidth: isMobile ? '100vw' : 'none'
      }"
    >
      <BubbleMenuBar :editor="editor" @add-link="showLinkDialog = true" />
    </BubbleMenu>

    <!-- FloatingMenu（空行时显示）-->
    <FloatingMenu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ 
        duration: 100,
        placement: 'left'
      }"
    >
      <FloatingMenuBar 
        :editor="editor" 
        @add-image="showImageDialog = true"
        @add-link="showLinkDialog = true"
      />
    </FloatingMenu>

    <!-- 编辑器内容区 -->
    <editor-content :editor="editor" class="editor-content" />

    <!-- 移动端工具栏（固定在底部）-->
    <div v-if="editor && isMobile" class="editor-toolbar editor-toolbar-mobile">
      <div 
        ref="mobileToolbarScroll"
        class="mobile-toolbar-scroll"
        @scroll="handleToolbarScroll"
      >
        <div class="mobile-toolbar-content">
          <!-- 文本样式 -->
          <button
            @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
            title="加粗"
            class="toolbar-btn"
          >
            <span class="icon">B</span>
          </button>
          <button
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
            title="斜体"
            class="toolbar-btn"
          >
            <span class="icon italic">I</span>
          </button>
          <button
            @click="editor.chain().focus().toggleUnderline().run()"
            :class="{ 'is-active': editor.isActive('underline') }"
            title="下划线"
            class="toolbar-btn"
          >
            <span class="icon underline">U</span>
          </button>
          <button
            @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
            title="删除线"
            class="toolbar-btn"
          >
            <span class="icon strike">S</span>
          </button>
          
          <div class="toolbar-divider"></div>
          
          <!-- 标题 -->
          <button
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            title="一级标题"
            class="toolbar-btn"
          >
            H1
          </button>
          <button
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            title="二级标题"
            class="toolbar-btn"
          >
            H2
          </button>
          <button
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            title="三级标题"
            class="toolbar-btn"
          >
            H3
          </button>
          
          <div class="toolbar-divider"></div>
          
          <!-- 对齐 -->
          <button
            @click="editor.chain().focus().setTextAlign('left').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
            title="左对齐"
            class="toolbar-btn"
          >
            ≡
          </button>
          <button
            @click="editor.chain().focus().setTextAlign('center').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
            title="居中对齐"
            class="toolbar-btn"
          >
            ≣
          </button>
          <button
            @click="editor.chain().focus().setTextAlign('right').run()"
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
            title="右对齐"
            class="toolbar-btn"
          >
            ≡
          </button>
          
          <div class="toolbar-divider"></div>
          
          <!-- 列表 -->
          <button
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            title="无序列表"
            class="toolbar-btn"
          >
            •·•
          </button>
          <button
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            title="有序列表"
            class="toolbar-btn"
          >
            1.2.3
          </button>
          <button
            @click="editor.chain().focus().toggleCodeBlock().run()"
            :class="{ 'is-active': editor.isActive('codeBlock') }"
            title="代码块"
            class="toolbar-btn"
          >
            &lt;/&gt;
          </button>
          
          <div class="toolbar-divider"></div>
          
          <!-- 其他 -->
          <button
            @click="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'is-active': editor.isActive('blockquote') }"
            title="引用"
            class="toolbar-btn"
          >
            "
          </button>
          <button
            @click="editor.chain().focus().setHorizontalRule().run()"
            title="分隔线"
            class="toolbar-btn"
          >
            ―
          </button>
          <button
            @click="showLinkDialog = true"
            :class="{ 'is-active': editor.isActive('link') }"
            title="链接"
            class="toolbar-btn"
          >
            🔗
          </button>
          <button
            @click="showImageDialog = true"
            title="插入图片"
            class="toolbar-btn"
          >
            🖼️
          </button>
          
          <div class="toolbar-divider"></div>
          
          <!-- 操作 -->
          <button
            @click="editor.chain().focus().undo().run()"
            :disabled="!editor.can().undo()"
            title="撤销"
            class="toolbar-btn"
          >
            ↶
          </button>
          <button
            @click="editor.chain().focus().redo().run()"
            :disabled="!editor.can().redo()"
            title="重做"
            class="toolbar-btn"
          >
            ↷
          </button>
          <button
            @click="clearFormat"
            title="清除格式"
            class="toolbar-btn"
          >
            ⌧
          </button>
        </div>
      </div>
      
      <!-- 左侧渐变遮罩 -->
      <div 
        v-show="showLeftGradient" 
        class="scroll-gradient scroll-gradient-left"
      ></div>
      
      <!-- 右侧渐变遮罩 -->
      <div 
        v-show="showRightGradient" 
        class="scroll-gradient scroll-gradient-right"
      ></div>
    </div>
    
    <!-- 隐藏的文件上传输入框（已废弃，使用 ImageDialog）-->
    <input 
      ref="imageInputRef" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleImageUpload" 
    />

    <!-- 字数统计 -->
    <div v-if="showStats" class="editor-stats">
      <span>字符: {{ stats.characters }}</span>
      <span>单词: {{ stats.words }}</span>
    </div>

    <!-- LinkDialog -->
    <LinkDialog
      :show="showLinkDialog"
      :initial-url="currentLinkUrl"
      @confirm="handleLinkConfirm"
      @cancel="showLinkDialog = false"
      @remove="handleLinkRemove"
    />

    <!-- ImageDialog -->
    <ImageDialog
      :show="showImageDialog"
      @confirm="handleImageConfirm"
      @cancel="showImageDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';

import BubbleMenuBar from '../editor/BubbleMenuBar.vue';
import FloatingMenuBar from '../editor/FloatingMenuBar.vue';
import LinkDialog from '../editor/LinkDialog.vue';
import ImageDialog from '../editor/ImageDialog.vue';

import { useResponsive } from '@/composables';
import { useVirtualKeyboard } from '../../composables/useVirtualKeyboard';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '开始输入...',
  },
  showStats: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

// 响应式和虚拟键盘
const { isMobile } = useResponsive();
const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboard();

// 对话框状态
const showLinkDialog = ref(false);
const showImageDialog = ref(false);
const currentLinkUrl = ref('');

// 图片上传输入框引用（保留兼容性）
const imageInputRef = ref(null);

// 移动端工具栏滚动
const mobileToolbarScroll = ref(null);
const isScrolledToEnd = ref(false);
const showLeftGradient = ref(false);
const showRightGradient = ref(true);

// 编辑器容器样式（适配虚拟键盘）
const editorContainerStyle = computed(() => {
  if (isMobile.value && isKeyboardVisible.value) {
    return {
      paddingBottom: `${keyboardHeight.value + 20}px`
    };
  }
  return {};
});

// 初始化编辑器
const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      link: false,
      underline: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    TextStyle,
    Color,
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: 'editor-image',
        loading: 'lazy', // 懒加载
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
    },
  },
});

// 监听外部值变化
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, false);
    }
  }
);

// 监听 editable 属性变化
watch(
  () => props.editable,
  (value) => {
    if (editor.value) {
      editor.value.setEditable(value);
    }
  }
);

// 字数统计
const stats = computed(() => {
  if (!editor.value) {
    return { characters: 0, words: 0 };
  }
  
  const text = editor.value.getText();
  return {
    characters: text.length,
    words: text.split(/\s+/).filter(Boolean).length,
  };
});

// 处理链接确认
const handleLinkConfirm = (url) => {
  if (!editor.value) return;
  
  const { from, to, empty } = editor.value.state.selection;
  const hasSelection = !empty;
  
  if (!hasSelection) {
    // 没有选中文本，插入链接文本
    const linkText = url.replace(/^https?:\/\//i, '');
    editor.value
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: linkText,
        marks: [{ type: 'link', attrs: { href: url } }],
      })
      .run();
  } else {
    // 有选中文本，直接添加链接
    editor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }
  
  showLinkDialog.value = false;
};

// 处理链接删除
const handleLinkRemove = () => {
  if (editor.value) {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
  }
  showLinkDialog.value = false;
};

// 处理图片确认
const handleImageConfirm = (src) => {
  if (editor.value && src) {
    editor.value.chain().focus().setImage({ src }).run();
  }
  showImageDialog.value = false;
};

// 处理图片上传（旧方法，保留兼容性）
const handleImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file || !editor.value) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('图片大小不能超过 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result;
    if (base64) {
      editor.value.chain().focus().setImage({ src: base64 }).run();
    }
  };
  reader.onerror = () => {
    alert('图片读取失败，请重试');
  };
  reader.readAsDataURL(file);

  event.target.value = '';
};

// 清除格式
const clearFormat = () => {
  editor.value.chain().focus().clearNodes().unsetAllMarks().run();
};

// 处理工具栏滚动
const handleToolbarScroll = () => {
  if (!mobileToolbarScroll.value) return;
  
  const element = mobileToolbarScroll.value;
  const scrollLeft = element.scrollLeft;
  const scrollWidth = element.scrollWidth;
  const clientWidth = element.clientWidth;
  
  // 判断是否滚动到末尾
  isScrolledToEnd.value = scrollLeft + clientWidth >= scrollWidth - 5;
  
  // 判断是否滚动到开头
  const isAtStart = scrollLeft <= 5;
  
  // 更新渐变遮罩显示状态
  showLeftGradient.value = !isAtStart;
  showRightGradient.value = !isScrolledToEnd.value;
};

// 清理
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

// 暴露方法供外部调用
defineExpose({
  editor,
  getHTML: () => editor.value?.getHTML(),
  getText: () => editor.value?.getText(),
  getJSON: () => editor.value?.getJSON(),
  setContent: (content) => editor.value?.commands.setContent(content),
  focus: () => editor.value?.commands.focus(),
  clear: () => editor.value?.commands.clearContent(),
});
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  background: var(--color-bg, #ffffff);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s, padding-bottom 0.3s;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.rich-text-editor.is-focused {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 工具栏 */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background: var(--color-bg-secondary, #f9fafb);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.editor-toolbar-mobile {
  position: relative;
  padding: 0;
  overflow: visible;
  display: block;
  order: 999;
  border-top: 1px solid var(--color-border, #e5e7eb);
  border-bottom: none;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.mobile-toolbar-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  touch-action: pan-x;
}

.mobile-toolbar-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.mobile-toolbar-content {
  display: flex;
  gap: 6px;
  align-items: center;
  width: max-content;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  background: var(--color-border, #e5e7eb);
  margin: 0 4px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text, #374151);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

/* 移动端按钮 */
.is-mobile .toolbar-btn {
  min-width: 44px;
  min-height: 44px;
  font-size: 16px;
  border-radius: 8px;
  flex-shrink: 0;
}

.mobile-toolbar-content .toolbar-divider {
  height: 40px;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--color-bg-hover, #e5e7eb);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.toolbar-btn.is-active {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn .icon {
  display: inline-block;
}

.toolbar-btn .icon.italic {
  font-style: italic;
}

.toolbar-btn .icon.underline {
  text-decoration: underline;
}

.toolbar-btn .icon.strike {
  text-decoration: line-through;
}

/* 滚动渐变遮罩 */
.scroll-gradient {
  position: absolute;
  top: 0;
  width: 20%;
  max-width: 120px;
  pointer-events: none;
  z-index: 2;
  transition: opacity 0.3s;
  bottom: env(safe-area-inset-bottom);
}

.scroll-gradient-left {
  left: 0;
  background: linear-gradient(to right, var(--color-bg-secondary, #f9fafb), rgba(249, 250, 251, 0.8), transparent);
}

.scroll-gradient-right {
  right: 0;
  background: linear-gradient(to left, var(--color-bg-secondary, #f9fafb), rgba(249, 250, 251, 0.8), transparent);
}

[data-theme='dark'] .scroll-gradient-left {
  background: linear-gradient(to right, rgba(17, 24, 39, 1), rgba(17, 24, 39, 0.8), transparent);
}

[data-theme='dark'] .scroll-gradient-right {
  background: linear-gradient(to left, rgba(17, 24, 39, 1), rgba(17, 24, 39, 0.8), transparent);
}

/* 编辑器内容区 */
.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  min-height: 200px;
  max-height: 600px;
}

.is-mobile .editor-content {
  padding: 12px;
  padding-bottom: 0;
  max-height: none;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 150px;
  white-space: pre-wrap; /* 保留空格和换行 */
  word-wrap: break-word; /* 长单词换行 */
}

/* 移动端光标加粗 */
.is-mobile .editor-content :deep(.ProseMirror) {
  caret-color: var(--color-primary, #3b82f6);
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-secondary, #9ca3af);
  pointer-events: none;
  height: 0;
}

/* 内容样式 */
.editor-content :deep(.ProseMirror) h1 {
  font-size: 2em;
  font-weight: 700;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  line-height: 1.2;
}

.editor-content :deep(.ProseMirror) h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  line-height: 1.3;
}

.editor-content :deep(.ProseMirror) h3 {
  font-size: 1.17em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 1em;
  line-height: 1.4;
}

.editor-content :deep(.ProseMirror) p {
  margin: 0.75em 0;
  line-height: 1.6;
  min-height: 1.6em; /* 确保空段落也有高度 */
}

/* 确保空段落在编辑器中也能正确显示（排除带 placeholder 的首段落）*/
.editor-content :deep(.ProseMirror) p:empty:not(.is-editor-empty)::before {
  content: '\00a0'; /* 不间断空格，确保空段落有高度 */
  display: inline-block;
}

.editor-content :deep(.ProseMirror) ul,
.editor-content :deep(.ProseMirror) ol {
  padding-left: 1.5em;
  margin: 0.75em 0;
  list-style-position: outside;
}

.editor-content :deep(.ProseMirror) ul {
  list-style-type: disc;
}

.editor-content :deep(.ProseMirror) ol {
  list-style-type: decimal;
}

.editor-content :deep(.ProseMirror) li {
  margin: 0.25em 0;
  display: list-item;
}

.editor-content :deep(.ProseMirror) ul ul {
  list-style-type: circle;
}

.editor-content :deep(.ProseMirror) ul ul ul {
  list-style-type: square;
}

.editor-content :deep(.ProseMirror) code {
  background: var(--color-bg-secondary, #f3f4f6);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.editor-content :deep(.ProseMirror) pre {
  background: var(--color-bg-secondary, #1f2937);
  color: var(--color-code-text, #f3f4f6);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.editor-content :deep(.ProseMirror) pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 0.9em;
  line-height: 1.5;
}

.editor-content :deep(.ProseMirror) blockquote {
  border-left: 3px solid var(--color-primary, #3b82f6);
  padding-left: 1em;
  margin: 1em 0;
  color: var(--color-text-secondary, #6b7280);
  font-style: italic;
}

.editor-content :deep(.ProseMirror) hr {
  border: none;
  border-top: 2px solid var(--color-border, #e5e7eb);
  margin: 2em 0;
}

.editor-content :deep(.ProseMirror) a {
  color: var(--color-primary, #3b82f6);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.ProseMirror) a:hover {
  color: var(--color-primary-dark, #2563eb);
}

.editor-content :deep(.ProseMirror) img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.5em 0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.editor-content :deep(.ProseMirror) img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.editor-content :deep(.ProseMirror) img.ProseMirror-selectednode {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: 2px;
}

/* 字数统计 */
.editor-stats {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background: var(--color-bg-secondary, #f9fafb);
  border-top: 1px solid var(--color-border, #e5e7eb);
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}

/* 暗色主题支持 */
[data-theme='dark'] .rich-text-editor {
  border-color: #374151;
  background: #1f2937;
}

[data-theme='dark'] .editor-toolbar {
  background: #111827;
  border-bottom-color: #374151;
}

[data-theme='dark'] .toolbar-divider {
  background: #374151;
}

[data-theme='dark'] .toolbar-btn {
  color: #d1d5db;
}

[data-theme='dark'] .toolbar-btn:hover:not(:disabled) {
  background: #374151;
}

[data-theme='dark'] .editor-content :deep(.ProseMirror) code {
  background: #374151;
  color: #e5e7eb;
}

[data-theme='dark'] .editor-content :deep(.ProseMirror) pre {
  background: #111827;
  color: #f3f4f6;
}

[data-theme='dark'] .editor-stats {
  background: #111827;
  border-top-color: #374151;
  color: #9ca3af;
}
</style>

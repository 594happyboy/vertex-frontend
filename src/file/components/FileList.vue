<template>
  <div class="file-list">
    <transition name="fade-scale" mode="out-in">
      <div v-if="loading" key="loading" class="list-status">
        <div class="loading-ring">
          <span class="loading-ring__bg"></span>
          <Icon icon="mdi:loading" class="loading-icon" />
        </div>
        <span>正在加载资源...</span>
      </div>
      
      <template v-else>
        <div v-if="items.length === 0" key="empty" class="list-status empty">
          <div class="empty-illustration">
            <div class="empty-illustration__circle"></div>
            <Icon icon="mdi:file-outline" class="empty-icon" />
          </div>
          <div class="empty-text">
            <strong>暂无文件</strong>
            <p>上传内容即可快速生成可分享的链接。</p>
          </div>
        </div>
        
        <div v-else key="list" class="file-grid">
          <transition-group name="slide-fade" tag="div" class="file-grid__inner">
            <FileItem
              v-for="item in items"
              :key="item.id"
              :item="item"
              @remove="$emit('remove', item.id)"
              @copy-url="$emit('copy-url', item.id)"
            />
          </transition-group>
        </div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import FileItem from './FileItem.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['remove', 'copy-url']);
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.list-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 32px;
  color: rgba(43, 49, 96, 0.65);
  border-radius: 20px;
  border: 1px dashed rgba(150, 162, 218, 0.5);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.loading-icon {
  font-size: 28px;
  animation: spin 1s linear infinite;
  color: rgba(47, 79, 200, 0.8);
}

.empty-icon {
  font-size: 52px;
  color: rgba(75, 86, 178, 0.42);
}

.empty-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-text strong {
  font-size: 16px;
  font-weight: 600;
  color: #1f2664;
}

.empty-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(31, 38, 98, 0.55);
}

.loading-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loading-ring__bg {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(91, 117, 245, 0.08), rgba(28, 185, 255, 0.08));
  border: 1px solid rgba(102, 126, 255, 0.25);
  animation: pulse 1.8s ease-in-out infinite;
}

.file-grid {
  position: relative;
}

.file-grid__inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.empty-illustration {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.empty-illustration__circle {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(115, 139, 255, 0.11), rgba(185, 218, 255, 0.08));
  border: 1px solid rgba(130, 158, 255, 0.15);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.slide-fade-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s ease;
  position: absolute;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-move {
  transition: transform 0.35s ease;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
</style>


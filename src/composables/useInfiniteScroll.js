import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

/**
 * 基于 IntersectionObserver 的下滑自动加载封装。
 *
 * 用法示例：
 * const containerRef = ref(null);
 * const { sentinelRef } = useInfiniteScroll({
 *   containerRef,
 *   hasMore,
 *   loading,
 *   enabled: computed(() => activeModule === 'latest'),
 *   onLoadMore: loadMore,
 * });
 * 模板中将 containerRef 绑定到可滚动容器，将 sentinelRef 放在列表底部占位。
 *
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement | null>} options.containerRef 可滚动容器
 * @param {import('vue').Ref<boolean>} options.hasMore 是否还有更多数据
 * @param {import('vue').Ref<boolean>} options.loading 是否正在加载
 * @param {Function} options.onLoadMore 触底后的加载回调
 * @param {import('vue').Ref<boolean>} [options.enabled] 额外的开关控制
 * @param {string} [options.rootMargin='0px 0px 120px 0px'] 触发边距，向下预加载
 * @param {number|number[]} [options.threshold=0] 触发阈值
 */
export function useInfiniteScroll({
  containerRef,
  hasMore,
  loading,
  onLoadMore,
  enabled = ref(true),
  rootMargin = '0px 0px 120px 0px',
  threshold = 0,
}) {
  const sentinelRef = ref(null);
  let observer = null;

  const canObserve = () =>
    enabled.value &&
    hasMore.value &&
    !loading.value &&
    containerRef.value instanceof HTMLElement &&
    sentinelRef.value instanceof HTMLElement;

  const disconnect = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const setupObserver = () => {
    disconnect();
    if (!canObserve()) return;

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && canObserve()) {
          onLoadMore?.();
        }
      },
      {
        root: containerRef.value,
        rootMargin,
        threshold,
      }
    );

    observer.observe(sentinelRef.value);
  };

  // 监听关键依赖变化，必要时重建观察
  // 不监听 loading，避免加载结束后因仍在底部而重复触发
  watch([enabled, hasMore, containerRef], () => {
    setupObserver();
  });

  onMounted(setupObserver);
  onBeforeUnmount(disconnect);

  return {
    sentinelRef,
    start: setupObserver,
    stop: disconnect,
  };
}

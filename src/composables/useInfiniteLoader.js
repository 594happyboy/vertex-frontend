import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

/**
 * 下滑自动加载组合式，带统一的底部状态（loading/error/done）。
 * 使用：
 * const listRef = ref(null);
 * const { sentinelRef, barState, retry } = useInfiniteLoader({ containerRef: listRef, hasMore, loading, enabled, loadMore, onError });
 * 模板：列表末尾放 <InfiniteFooterBar :state="barState" @retry="retry" /> 和 <div ref="sentinelRef" />。
 */
export function useInfiniteLoader({
  containerRef,
  hasMore,
  loading,
  enabled = ref(true),
  loadMore,
  onError,
  rootMargin = '0px 0px 120px 0px',
  threshold = 0,
}) {
  const sentinelRef = ref(null);
  const barState = ref('idle'); // idle | loading | error | done
  let observer = null;
  let hasPendingTrigger = false;
  let hasAttempted = false;

  const canTrigger = () =>
    enabled.value &&
    hasMore.value &&
    !loading.value &&
    barState.value === 'idle' &&
    containerRef.value instanceof HTMLElement &&
    sentinelRef.value instanceof HTMLElement;

  const disconnect = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const triggerLoad = async () => {
    if (!canTrigger()) return;
    barState.value = 'loading';
    hasPendingTrigger = false;
    hasAttempted = true;
    try {
      await loadMore?.();
      barState.value = hasMore.value ? 'idle' : 'done';
    } catch (err) {
      barState.value = 'error';
      onError?.(err);
    }
  };

  const setupObserver = () => {
    disconnect();
    if (!enabled.value || !containerRef.value || !sentinelRef.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          // 仅在触达时触发一次，离开再进才会再次触发
          if (!hasPendingTrigger) {
            hasPendingTrigger = true;
            triggerLoad();
          }
        } else {
          hasPendingTrigger = false;
          // 离开底部后，允许再次触发（包括从错误状态恢复）
          if (barState.value === 'error') {
            barState.value = 'idle';
          }
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

  const retry = () => {
    if (barState.value === 'error') {
      barState.value = 'idle';
    }
    triggerLoad();
  };

  // 关键依赖变化时重建 observer
  watch([enabled, hasMore, containerRef], () => {
    // 未开始尝试加载前不展示 done
    if (hasAttempted && !hasMore.value && !loading.value) {
      barState.value = 'done';
      disconnect();
      return;
    }
    // 还有更多，恢复 idle
    if (barState.value === 'done' && hasMore.value) {
      barState.value = 'idle';
    }
    setupObserver();
  });

  onMounted(setupObserver);
  onBeforeUnmount(disconnect);

  return { sentinelRef, barState, retry };
}

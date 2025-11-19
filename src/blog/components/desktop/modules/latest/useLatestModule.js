/**
 * 最新文档模块逻辑
 * 管理最新文档列表的加载、分页、更新等功能
 */

import { computed, onMounted, ref, watch } from 'vue';
import { useDocStore } from '../../../../stores/doc';
import { useTreeStore } from '../../../../stores/tree';
import { useUiStore } from '../../../../stores/ui';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useLatestDocumentsService } from '@/blog/composables/modules/latest/useLatestDocumentsService';

export function useLatestModule() {
  const docStore = useDocStore();
  const treeStore = useTreeStore();
  const uiStore = useUiStore();
  const {
    docs: latestDocs,
    loading: latestLoading,
    error: latestError,
    total: latestTotal,
    hasMore: latestHasMore,
    fetchLatestDocs,
    refreshLatestDocs: refreshLatestDocsFromService,
    loadMoreLatest: loadMoreLatestFromService,
    promoteDoc,
    ensureInitialized,
  } = useLatestDocumentsService();

  // UI 引用
  const latestListRef = ref(null);
  const latestBarState = ref('idle');

  // 计算属性
  const currentDocId = computed(() => docStore.currentDoc?.id ?? null);

  /**
   * 选择最新文档
   */
  async function selectLatestDoc(docId) {
    if (!docId) return;
    treeStore.selectNode(docId, 'document');
    try {
      await docStore.openDoc(docId);
    } catch (error) {
      uiStore.showError(error.message || '打开文档失败');
    }
  }

  /**
   * 刷新最新文档列表
   */
  function refreshLatestDocs() {
    refreshLatestDocsFromService().catch(() => {});
  }

  /**
   * 加载更多最新文档
   */
  function loadMoreLatest() {
    return loadMoreLatestFromService();
  }

  /**
   * 提升文档到列表顶部（保存后触发）
   */
  /**
   * 无限滚动加载器
   */
  const { sentinelRef: latestSentinelRef, barState: latestBarStateFromLoader, retry: retryLoadMoreLatest } = useInfiniteLoader({
    containerRef: latestListRef,
    hasMore: latestHasMore,
    loading: latestLoading,
    enabled: computed(() => true), // 在模块内始终启用
    loadMore: loadMoreLatest,
  });

  /**
   * 监听无限加载器状态
   */
  watch(
    () => latestBarStateFromLoader.value,
    (state) => {
      latestBarState.value = state;
    },
    { immediate: true }
  );

  /**
   * 重试加载
   */
  function retryLatestLoad() {
    retryLoadMoreLatest();
  }

  onMounted(() => {
    ensureInitialized().catch(() => {});
  });

  return {
    // 状态
    latestDocs,
    latestLoading,
    latestError,
    latestTotal,
    latestBarState,
    currentDocId,

    // 引用
    latestListRef,
    latestSentinelRef,

    // 方法
    selectLatestDoc,
    refreshLatestDocs,
    retryLatestLoad,
    fetchLatestDocs,
  };
}

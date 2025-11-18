/**
 * 最新文档模块逻辑
 * 管理最新文档列表的加载、分页、更新等功能
 */

import { computed, ref, watch } from 'vue';
import { useDocStore } from '../../../../stores/doc';
import { useTreeStore } from '../../../../stores/tree';
import { useUiStore } from '../../../../stores/ui';
import { fetchDocumentsService } from '../../../../services/documentService';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { SYNC_STATUS } from '../../../../constants';

const LATEST_PAGE_SIZE = 20;

export function useLatestModule() {
  const docStore = useDocStore();
  const treeStore = useTreeStore();
  const uiStore = useUiStore();

  // 文档列表状态
  const latestDocs = ref([]);
  const latestLoading = ref(false);
  const latestError = ref('');
  const latestHasMore = ref(false);
  const latestNextCursor = ref(null);
  const latestTotal = ref(0);

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
   * 替换文档列表
   */
  function replaceLatestDocs(items = []) {
    latestDocs.value.splice(0, latestDocs.value.length, ...items);
  }

  /**
   * 追加文档列表
   */
  function appendLatestDocs(items = []) {
    if (!items.length) return;
    items.forEach((item) => {
      const existingIdx = latestDocs.value.findIndex((doc) => doc.id === item.id);
      if (existingIdx !== -1) {
        latestDocs.value.splice(existingIdx, 1);
      }
      latestDocs.value.push(item);
    });
  }

  /**
   * 获取最新文档列表
   */
  async function fetchLatestDocs({ reset = false } = {}) {
    if (latestLoading.value) return;
    latestLoading.value = true;
    latestError.value = '';

    if (reset) {
      replaceLatestDocs();
      latestNextCursor.value = null;
      latestHasMore.value = false;
    }

    try {
      const params = {
        limit: LATEST_PAGE_SIZE,
        sortBy: 'updatedAt',
        order: 'desc',
      };

      if (!reset && latestNextCursor.value) {
        params.cursor = latestNextCursor.value;
      }

      const result = await fetchDocumentsService(params);
      const items = result.items || [];

      if (reset) {
        replaceLatestDocs(items);
      } else {
        appendLatestDocs(items);
      }

      latestNextCursor.value = result.pagination?.nextCursor ?? null;
      latestHasMore.value = result.pagination?.hasMore ?? false;
      latestTotal.value = result.pagination?.total ?? latestDocs.value.length;
    } catch (error) {
      console.error('Failed to fetch latest documents:', error);
      latestError.value = error.message || '加载最新文档失败';
      throw error;
    } finally {
      latestLoading.value = false;
    }
  }

  /**
   * 刷新最新文档列表
   */
  function refreshLatestDocs() {
    fetchLatestDocs({ reset: true }).catch(() => {});
  }

  /**
   * 加载更多最新文档
   */
  function loadMoreLatest() {
    if (!latestHasMore.value || latestLoading.value) return;
    return fetchLatestDocs();
  }

  /**
   * 提升文档到列表顶部（保存后触发）
   */
  function promoteLatestDoc(doc) {
    if (!doc?.id) return;

    const updatedDoc = {
      ...doc,
      updatedAt: doc.updatedAt ?? docStore.currentDoc?.updatedAt ?? new Date().toISOString(),
    };

    const docs = latestDocs.value;
    const previousLength = docs.length;
    const existingIdx = docs.findIndex((item) => item.id === updatedDoc.id);
    const existed = existingIdx !== -1;

    if (existed) {
      docs.splice(existingIdx, 1);
    } else if (latestTotal.value !== null && latestTotal.value !== undefined) {
      latestTotal.value += 1;
    } else {
      latestTotal.value = previousLength + 1;
    }

    docs.unshift(updatedDoc);

    if (!existed && previousLength > 0 && docs.length > previousLength && latestHasMore.value) {
      docs.pop();
    }
  }

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

  /**
   * 监听文档同步状态，保存后提升文档
   */
  watch(
    () => docStore.syncStatus,
    (status, prev) => {
      if (status === SYNC_STATUS.SYNCED && prev !== SYNC_STATUS.SYNCED && docStore.currentDoc) {
        promoteLatestDoc(docStore.currentDoc);
      }
    }
  );

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

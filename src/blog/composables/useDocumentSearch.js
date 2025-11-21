import { ref, reactive, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { searchDocuments } from '../api/document';

const DEFAULT_OPTIONS = {
  pageSize: 20,
  debounce: 450,
};

export function useDocumentSearch(options = {}) {
  const { pageSize, debounce } = { ...DEFAULT_OPTIONS, ...options };

  const keyword = ref('');
  const trimmedKeyword = computed(() => keyword.value.trim());
  const active = computed(() => trimmedKeyword.value.length > 0);

  const loading = ref(false);
  const error = ref(null);
  const results = ref([]);
  const pagination = reactive({
    page: 1,
    size: pageSize,
    total: null,
  });
  const lastBatchCount = ref(0);
  const requestToken = ref(0);

  const cancelPending = () => {
    requestToken.value += 1;
  };

  const executeSearch = async ({ page = 1, append = false } = {}) => {
    const query = trimmedKeyword.value;
    if (!query) return;

    const currentToken = ++requestToken.value;
    loading.value = true;
    if (!append) {
      error.value = null;
    }

    try {
      const response = await searchDocuments({
        q: query,
        page,
        size: pagination.size,
      });

      if (currentToken !== requestToken.value) return;

      const items = response?.items || [];
      lastBatchCount.value = items.length;

      if (append) {
        results.value = [...results.value, ...items];
      } else {
        results.value = items;
      }

      pagination.page = response?.page || page;
      pagination.size = response?.size || pagination.size;
      pagination.total = response?.total ?? null;
    } catch (err) {
      if (currentToken !== requestToken.value) return;
      error.value = err?.message || '搜索失败，请稍后重试';
      if (!append) {
        results.value = [];
      }
    } finally {
      if (currentToken === requestToken.value) {
        loading.value = false;
      }
    }
  };

  const searchScheduler = useDebounceFn(() => {
    executeSearch({ page: 1, append: false });
  }, debounce);

  const resetState = () => {
    cancelPending();
    results.value = [];
    error.value = null;
    pagination.page = 1;
    pagination.size = pageSize;
    pagination.total = null;
    lastBatchCount.value = 0;
    loading.value = false;
    searchScheduler.cancel();
  };

  watch(trimmedKeyword, (value) => {
    if (!value) {
      resetState();
      return;
    }
    pagination.page = 1;
    searchScheduler();
  });

  const hasMore = computed(() => {
    if (!active.value || loading.value) return false;
    if (pagination.total != null) {
      return results.value.length < pagination.total;
    }
    return lastBatchCount.value === pagination.size;
  });

  const loadMore = () => {
    if (!hasMore.value || loading.value) return;
    executeSearch({ page: pagination.page + 1, append: true });
  };

  const clear = () => {
    keyword.value = '';
    resetState();
  };

  const refresh = () => {
    if (!active.value) return;
    executeSearch({ page: 1, append: false });
  };

  return {
    keyword,
    trimmedKeyword,
    active,
    loading,
    error,
    results,
    pagination,
    hasMore,
    loadMore,
    clear,
    refresh,
    reset: resetState,
    executeSearch,
  };
}

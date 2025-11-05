import { ref, computed } from 'vue';

/**
 * 游标分页 Composable
 * 
 * @template T 数据项类型
 * @param {Object} options - 配置选项
 * @param {Function} options.fetchFn - 获取数据的函数，接收 cursor 参数，返回 Promise<PaginatedResponse<T>>
 * @param {number} options.pageSize - 每页大小，默认50
 * @param {boolean} options.autoLoad - 是否自动加载第一页，默认true
 * @param {Function} options.onError - 错误处理回调
 * @param {Function} options.onSuccess - 成功加载回调
 * 
 * @returns {Object} 返回分页状态和操作方法
 */
export function useCursorPagination(options = {}) {
  const {
    fetchFn,
    pageSize = 50,
    autoLoad = true,
    onError = null,
    onSuccess = null,
  } = options;

  // 状态
  const items = ref([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const nextCursor = ref(null);
  const total = ref(null);
  const error = ref(null);

  // 计算属性
  const isEmpty = computed(() => items.value.length === 0);
  const canLoadMore = computed(() => hasMore.value && !loading.value && nextCursor.value !== null);

  /**
   * 加载第一页
   */
  const loadFirstPage = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchFn(undefined);

      items.value = response.items || [];
      nextCursor.value = response.pagination?.nextCursor || null;
      hasMore.value = response.pagination?.hasMore || false;
      total.value = response.pagination?.total ?? null;

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      error.value = err;
      hasMore.value = false;

      if (onError) {
        onError(err);
      } else {
        console.error('加载数据失败:', err);
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载下一页
   */
  const loadMore = async () => {
    if (!hasMore.value || !nextCursor.value || loading.value) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetchFn(nextCursor.value);

      items.value.push(...(response.items || []));
      nextCursor.value = response.pagination?.nextCursor || null;
      hasMore.value = response.pagination?.hasMore || false;
      total.value = response.pagination?.total ?? null;

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      error.value = err;

      // 游标失效处理
      if (err.code === 410) {
        console.warn('游标已失效，需要刷新列表');
        hasMore.value = false;
        nextCursor.value = null;
      }

      if (onError) {
        onError(err);
      } else {
        console.error('加载更多失败:', err);
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新（重新加载第一页）
   */
  const refresh = async () => {
    items.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    total.value = null;
    error.value = null;
    return await loadFirstPage();
  };

  /**
   * 重置状态
   */
  const reset = () => {
    items.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    total.value = null;
    error.value = null;
    loading.value = false;
  };

  /**
   * 添加单个项目到列表开头
   */
  const prependItem = (item) => {
    items.value.unshift(item);
    if (total.value !== null) {
      total.value++;
    }
  };

  /**
   * 添加单个项目到列表末尾
   */
  const appendItem = (item) => {
    items.value.push(item);
    if (total.value !== null) {
      total.value++;
    }
  };

  /**
   * 更新列表中的项目
   */
  const updateItem = (id, updater) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      if (typeof updater === 'function') {
        items.value[index] = updater(items.value[index]);
      } else {
        items.value[index] = { ...items.value[index], ...updater };
      }
    }
  };

  /**
   * 从列表中移除项目
   */
  const removeItem = (id) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
      if (total.value !== null) {
        total.value--;
      }
    }
  };

  /**
   * 批量移除项目
   */
  const removeItems = (ids) => {
    const idSet = new Set(ids);
    const removedCount = items.value.filter(item => idSet.has(item.id)).length;
    items.value = items.value.filter(item => !idSet.has(item.id));
    if (total.value !== null) {
      total.value -= removedCount;
    }
  };

  /**
   * 查找项目
   */
  const findItem = (id) => {
    return items.value.find(item => item.id === id);
  };

  // 自动加载第一页
  if (autoLoad && fetchFn) {
    loadFirstPage();
  }

  return {
    // 状态
    items,
    loading,
    hasMore,
    nextCursor,
    total,
    error,

    // 计算属性
    isEmpty,
    canLoadMore,

    // 操作方法
    loadFirstPage,
    loadMore,
    refresh,
    reset,

    // 列表操作
    prependItem,
    appendItem,
    updateItem,
    removeItem,
    removeItems,
    findItem,
  };
}

/**
 * 创建带有查询条件的游标分页
 * 当查询条件改变时，自动重新加载第一页
 * 
 * @template T 数据项类型
 * @param {Object} options
 * @param {Function} options.fetchFn - 获取数据的函数，接收 (cursor, queryParams) 参数
 * @param {Function} options.queryParams - 返回当前查询参数的函数
 * @param {number} options.pageSize - 每页大小
 * @param {Function} options.onError - 错误处理回调
 * @param {Function} options.onSuccess - 成功加载回调
 */
export function useCursorPaginationWithQuery(options = {}) {
  const {
    fetchFn,
    queryParams,
    pageSize = 50,
    onError = null,
    onSuccess = null,
  } = options;

  const lastQueryParams = ref(null);

  // 创建基础分页
  const pagination = useCursorPagination({
    fetchFn: async (cursor) => {
      const params = typeof queryParams === 'function' ? queryParams() : queryParams;
      return await fetchFn(cursor, params);
    },
    pageSize,
    autoLoad: false, // 手动控制加载
    onError,
    onSuccess,
  });

  /**
   * 检查查询参数是否改变
   */
  const hasQueryChanged = () => {
    const params = typeof queryParams === 'function' ? queryParams() : queryParams;
    const current = JSON.stringify(params);
    const last = lastQueryParams.value;
    return current !== last;
  };

  /**
   * 加载数据（自动检测是否需要刷新）
   */
  const load = async () => {
    const params = typeof queryParams === 'function' ? queryParams() : queryParams;
    const paramsStr = JSON.stringify(params);

    // 查询条件改变，刷新列表
    if (lastQueryParams.value !== null && paramsStr !== lastQueryParams.value) {
      lastQueryParams.value = paramsStr;
      return await pagination.refresh();
    }

    // 首次加载
    lastQueryParams.value = paramsStr;
    return await pagination.loadFirstPage();
  };

  /**
   * 刷新列表
   */
  const refresh = async () => {
    const params = typeof queryParams === 'function' ? queryParams() : queryParams;
    lastQueryParams.value = JSON.stringify(params);
    return await pagination.refresh();
  };

  return {
    ...pagination,
    load,
    refresh,
    hasQueryChanged,
  };
}


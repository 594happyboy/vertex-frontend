import { reactive, toRefs } from 'vue';
import { fetchDocumentsService } from '@/blog/services/documentService';

const LATEST_PAGE_SIZE = 20;

const state = reactive({
  docs: [],
  total: 0,
  hasMore: false,
  nextCursor: null,
  loading: false,
  error: '',
  initialized: false,
});

function replaceDocs(items = []) {
  state.docs.splice(0, state.docs.length, ...items);
}

function appendDocs(items = []) {
  if (!items.length) return;
  items.forEach((item) => {
    const idx = state.docs.findIndex((doc) => doc.id === item.id);
    if (idx !== -1) {
      state.docs.splice(idx, 1);
    }
    state.docs.push(item);
  });
}

async function fetchLatestDocs({ reset = false } = {}) {
  if (state.loading) return;
  state.loading = true;
  state.error = '';

  if (reset) {
    replaceDocs();
    state.nextCursor = null;
    state.hasMore = false;
  }

  try {
    const params = {
      limit: LATEST_PAGE_SIZE,
      sortBy: 'updatedAt',
      order: 'desc',
    };

    if (!reset && state.nextCursor) {
      params.cursor = state.nextCursor;
    }

    const result = await fetchDocumentsService(params);
    const items = result.items || [];

    if (reset) {
      replaceDocs(items);
    } else {
      appendDocs(items);
    }

    state.nextCursor = result.pagination?.nextCursor ?? null;
    state.hasMore = result.pagination?.hasMore ?? false;
    state.total = result.pagination?.total ?? state.docs.length;
    state.initialized = true;
  } catch (error) {
    console.error('Failed to fetch latest documents:', error);
    state.error = error.message || '加载最新文档失败';
    throw error;
  } finally {
    state.loading = false;
  }
}

function refreshLatestDocs() {
  return fetchLatestDocs({ reset: true });
}

function loadMoreLatest() {
  if (!state.hasMore || state.loading) return;
  return fetchLatestDocs();
}

function promoteDoc(doc) {
  if (!doc?.id) return;

  const updatedDoc = {
    ...doc,
    updatedAt: doc.updatedAt ?? new Date().toISOString(),
  };

  const previousLength = state.docs.length;
  const existingIdx = state.docs.findIndex((item) => item.id === updatedDoc.id);
  const existed = existingIdx !== -1;

  if (existed) {
    state.docs.splice(existingIdx, 1);
  } else if (state.total !== null && state.total !== undefined) {
    state.total += 1;
  } else {
    state.total = previousLength + 1;
  }

  state.docs.unshift(updatedDoc);

  if (!existed && previousLength > 0 && state.docs.length > previousLength && state.hasMore) {
    state.docs.pop();
  }
}

async function ensureInitialized() {
  if (state.initialized || state.loading) return;
  await fetchLatestDocs({ reset: true });
}

export function useLatestDocumentsService() {
  return {
    ...toRefs(state),
    fetchLatestDocs,
    refreshLatestDocs,
    loadMoreLatest,
    promoteDoc,
    ensureInitialized,
  };
}

import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import { debounce } from '@/helpers/debounce'
import { isAbortError } from '@/helpers/async'
import { searchProducts } from '@/services/products'
import { ApiError } from '@/services/api'
import type { CatalogProduct } from '@/types/product'

export const SEARCH_DEBOUNCE_MS = 300

export type ProductSearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export function useProductSearch() {
  const query = ref('')
  const results = ref<CatalogProduct[]>([])
  const status = ref<ProductSearchStatus>('idle')
  const errorMessage = ref<string | null>(null)
  const showResults = computed(() => status.value !== 'idle')
  const isLoading = computed(() => status.value === 'loading')
  const isError = computed(() => status.value === 'error')
  const isEmpty = computed(() => status.value === 'empty')
  const isSuccess = computed(() => status.value === 'success')

  let requestId = 0
  let abortController: AbortController | null = null

  function cancelActiveSearch() {
    requestId += 1
    abortController?.abort()
    abortController = null
    debouncedSearch.cancel()
  }

  async function runSearch(searchKey: string) {
    abortController?.abort()
    const controller = new AbortController()
    abortController = controller
    const id = ++requestId

    status.value = 'loading'
    errorMessage.value = null

    try {
      const items = (await searchProducts(searchKey, controller.signal)) ?? []
      if (id !== requestId) return

      results.value = items
      status.value = items.length > 0 ? 'success' : 'empty'
    } catch (error) {
      if (id !== requestId || isAbortError(error)) return

      results.value = []
      status.value = 'error'
      errorMessage.value =
        error instanceof ApiError && error.message
          ? error.message
          : UI_MESSAGES.products.loadFailed
    }
  }

  const debouncedSearch = debounce((searchKey: string) => {
    void runSearch(searchKey)
  }, SEARCH_DEBOUNCE_MS)

  function retry() {
    const searchKey = query.value?.trim() ?? ''
    if (searchKey.length === 0) return
    void runSearch(searchKey)
  }

  function clear() {
    cancelActiveSearch()
    query.value = ''
    results.value = []
    status.value = 'idle'
    errorMessage.value = null
  }

  watch(query, (value) => {
    const searchKey = value.trim()
    if (searchKey.length === 0) {
      cancelActiveSearch()
      results.value = []
      status.value = 'idle'
      errorMessage.value = null
      return
    }

    status.value = 'loading'
    errorMessage.value = null
    debouncedSearch(searchKey)
  })

  if (getCurrentScope()) {
    onScopeDispose(() => {
      cancelActiveSearch()
    })
  }

  return {
    query,
    results,
    status,
    errorMessage,
    showResults,
    isLoading,
    isError,
    isEmpty,
    isSuccess,
    retry,
    clear,
  }
}

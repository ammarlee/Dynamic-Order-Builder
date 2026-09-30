import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import { isAbortError } from '@/helpers/async'
import { getWarehouses } from '@/services/warehouses'
import type { Warehouse } from '@/types/warehouse'

export function useWarehouses() {
  const warehouses = ref<Warehouse[]>([])
  const status = ref<'loading' | 'ready' | 'error'>('loading')

  let abortController: AbortController | null = null

  const loading = computed(() => status.value === 'loading')
  const error = computed(() => (status.value === 'error' ? UI_MESSAGES.warehouses.loadFailed : null))

  async function load() {
    abortController?.abort()
    const controller = new AbortController()
    abortController = controller
    status.value = 'loading'

    try {
      warehouses.value = await getWarehouses(controller.signal)
      status.value = 'ready'
    } catch (err) {
      if (isAbortError(err)) return
      status.value = 'error'
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(() => abortController?.abort())
  }

  return { warehouses, status, loading, error, load }
}

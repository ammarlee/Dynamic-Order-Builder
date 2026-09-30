import { ref } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import { isAbortError } from '@/helpers/async'
import { validateWarehouseStock } from '@/services/stock'
import type { WarehouseValidationResult } from '@/types/stock'

export type WarehouseValidationStatus = 'idle' | 'loading' | 'error'

export function useWarehouseStock() {
  const status = ref<WarehouseValidationStatus>('idle')
  const errorMessage = ref<string | null>(null)

  let requestId = 0
  let abortController: AbortController | null = null

  function cancel() {
    requestId += 1
    abortController?.abort()
    abortController = null
    status.value = 'idle'
    errorMessage.value = null
  }

  async function validate(warehouseId: number): Promise<WarehouseValidationResult | null> {
    abortController?.abort()
    const controller = new AbortController()
    abortController = controller
    const id = ++requestId

    status.value = 'loading'
    errorMessage.value = null

    try {
      const result = await validateWarehouseStock(warehouseId, controller.signal)
      if (id !== requestId) return null

      status.value = 'idle'
      return result
    } catch (error) {
      if (id !== requestId || isAbortError(error)) return null

      status.value = 'error'
      errorMessage.value = UI_MESSAGES.warehouses.validationFailed
      return null
    }
  }

  return {
    status,
    errorMessage,
    validate,
    cancel,
  }
}

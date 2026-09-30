import { ref } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import { ApiError } from '@/services/api'
import { createOrder, type CreateOrderPayload, type CreateOrderResult } from '@/services/orders'

export function useOrderSubmission() {
  const submitting = ref(false)
  const unexpectedError = ref<string | null>(null)

  async function submit(payload: CreateOrderPayload): Promise<CreateOrderResult | null> {
    if (submitting.value) return null

    submitting.value = true
    unexpectedError.value = null

    try {
      return await createOrder(payload)
    } catch (error) {
      unexpectedError.value =
        error instanceof ApiError && error.message
          ? error.message
          : UI_MESSAGES.order.submitFailed
      return null
    } finally {
      submitting.value = false
    }
  }

  function clearUnexpectedError() {
    unexpectedError.value = null
  }

  return {
    submitting,
    unexpectedError,
    submit,
    clearUnexpectedError,
  }
}

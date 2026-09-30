import { useToast } from 'primevue/usetoast'
import { UI_MESSAGES } from '@/constants/messages'
import type { ProductSearchResult } from '@/types/product'

export function useOrderToasts() {
  const toast = useToast()

  function lineIncremented(quantity: number) {
    toast.add({
      severity: 'info',
      summary: UI_MESSAGES.toasts.incrementedSummary,
      detail: UI_MESSAGES.toasts.incrementedDetail(quantity),
      life: 4000,
    })
  }

  function lineAdded(result: ProductSearchResult) {
    toast.add({
      severity: 'success',
      summary: UI_MESSAGES.toasts.addedSummary,
      detail: UI_MESSAGES.toasts.addedDetail(result.productName, result.variantName),
      life: 3000,
    })
  }

  function orderCreated() {
    toast.add({
      severity: 'success',
      summary: UI_MESSAGES.toasts.createdSummary,
      detail: UI_MESSAGES.toasts.createdDetail,
      life: 3000,
    })
  }

  function orderRejected() {
    toast.add({
      severity: 'warn',
      summary: UI_MESSAGES.toasts.rejectedSummary,
      detail: UI_MESSAGES.order.submitRejected,
      life: 5000,
    })
  }

  return { lineIncremented, lineAdded, orderCreated, orderRejected }
}

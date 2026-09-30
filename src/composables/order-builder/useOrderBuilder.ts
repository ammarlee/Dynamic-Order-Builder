import { computed, getCurrentScope, onMounted, onScopeDispose, ref } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import { calculateFinalTotal } from '@/services/orders/helpers/order-calculations'
import { buildOrderPayload } from '@/services/orders/helpers/order-mappers'
import {
  applySubmissionErrors,
  applyWarehouseValidation,
  lineKey,
  markLinesPending,
  markLinesUnverified,
  markLinesValidating,
} from '@/services/orders/helpers/order-validation'
import { useOrderDiscount } from '@/composables/order-builder/useOrderDiscount'
import { useOrderLines } from '@/composables/order-builder/useOrderLines'
import { useOrderSubmission } from '@/composables/order-builder/useOrderSubmission'
import { useOrderToasts } from '@/composables/order-builder/useOrderToasts'
import { useWarehouses } from '@/composables/order-builder/useWarehouses'
import { useWarehouseStock } from '@/composables/order-builder/useWarehouseStock'
import type { OrderTotals } from '@/types/order'
import type { ProductSearchResult } from '@/types/product'

export function useOrderBuilder() {
  const toasts = useOrderToasts()
  const warehouseList = useWarehouses()
  const lines = useOrderLines()
  const pricing = useOrderDiscount(lines.items)
  const warehouseStock = useWarehouseStock()
  const submission = useOrderSubmission()

  const warehouseId = ref<number | null>(null)

  const finalTotal = computed(() =>
    calculateFinalTotal(lines.subtotal.value, pricing.discount.value),
  )
  const totals = computed<OrderTotals>(() => ({
    subtotal: lines.subtotal.value,
    discount: pricing.discount.value,
    finalTotal: finalTotal.value,
  }))
  const isValidating = computed(() => warehouseStock.status.value === 'loading')

  const submitDisabledReason = computed(() => {
    if (!lines.hasItems.value || submission.submitting.value) return null
    if (warehouseId.value == null) return UI_MESSAGES.order.selectWarehouse
    if (warehouseStock.status.value === 'loading') return UI_MESSAGES.order.waitForValidation
    if (warehouseStock.status.value === 'error') return UI_MESSAGES.order.validationUnavailable
    if (pricing.discountError.value) return pricing.discountError.value
    if (!lines.allLinesReady.value) return UI_MESSAGES.order.resolveLineIssues
    return null
  })

  const canSubmit = computed(
    () =>
      lines.hasItems.value && !submission.submitting.value && submitDisabledReason.value == null,
  )

  async function validateCurrentItems() {
    const warehouse = warehouseId.value
    if (warehouse == null || !lines.hasItems.value) return

    const requestedKeys = new Set(
      lines.items.value.map((line) => lineKey(line.productId, line.variantId)),
    )
    lines.transform(markLinesValidating)
    submission.clearUnexpectedError()

    const result = await warehouseStock.validate(warehouse)
    if (!result) {
      if (warehouseStock.status.value === 'error') lines.transform(markLinesUnverified)
      return
    }

    lines.transform((items) => applyWarehouseValidation(items, result.items, requestedKeys))
  }

  async function addProduct(result: ProductSearchResult) {
    if (!result) return

    const outcome = lines.add(result, warehouseId.value != null)
    if (outcome.kind === 'blocked') return

    if (outcome.kind === 'incremented') {
      toasts.lineIncremented(outcome.quantity)
      return
    }

    toasts.lineAdded(result)
    await validateCurrentItems()
  }

  function removeItem(productId: number, variantId: number) {
    lines.remove(productId, variantId)
    if (!lines.hasItems.value) warehouseStock.cancel()
  }

  function updateQuantity(productId: number, variantId: number, quantity: number) {
    lines.updateQuantity(productId, variantId, quantity)
    if (!lines.hasItems.value) removeItem(productId, variantId)
  }

  async function selectWarehouse(nextId: number | null) {
    if (nextId === warehouseId.value) return

    warehouseId.value = nextId
    submission.clearUnexpectedError()

    if (nextId == null) {
      warehouseStock.cancel()
      lines.transform(markLinesPending)
      return
    }

    await validateCurrentItems()
  }

  async function submitOrder() {
    if (!canSubmit.value || warehouseId.value == null) return

    const payload = buildOrderPayload(warehouseId.value, lines.items.value)
    const result = await submission.submit(payload)
    if (!result) return

    if (result.ok) {
      lines.clear()
      toasts.orderCreated()
      return
    }

    lines.transform((items) => applySubmissionErrors(items, result.errors))
    toasts.orderRejected()
  }

  onMounted(() => {
    void warehouseList.load()
  })

  if (getCurrentScope()) {
    onScopeDispose(() => warehouseStock.cancel())
  }

  return {
    warehouses: warehouseList.warehouses,
    warehousesStatus: warehouseList.status,
    warehousesLoading: warehouseList.loading,
    warehousesError: warehouseList.error,
    warehouseId,
    items: lines.items,
    discount: pricing.discount,
    subtotal: lines.subtotal,
    finalTotal,
    totals,
    discountError: pricing.discountError,
    hasItems: lines.hasItems,
    hasPendingLines: lines.hasPendingLines,
    isValidating,
    canSubmit,
    submitDisabledReason,
    submitting: submission.submitting,
    submitError: submission.unexpectedError,
    warehouseValidationStatus: warehouseStock.status,
    warehouseValidationError: warehouseStock.errorMessage,
    loadWarehouses: warehouseList.load,
    selectWarehouse,
    addProduct,
    updateQuantity,
    acceptCurrentPrice: lines.acceptCurrentPrice,
    removeItem,
    updateDiscount: lines.updateDiscount,
    submitOrder,
    retryWarehouseValidation: validateCurrentItems,
  }
}

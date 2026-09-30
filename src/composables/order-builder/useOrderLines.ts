import { computed, ref } from 'vue'
import { roundMoney } from '@/helpers/format-money'
import { isPositiveInteger } from '@/helpers/number'
import { calculateSubtotal } from '@/services/orders/helpers/order-calculations'
import { createOrderLine } from '@/services/orders/helpers/order-mappers'
import {
  canAddVariant,
  isLineReady,
  withDerivedValidation,
} from '@/services/orders/helpers/order-validation'
import type { OrderLine } from '@/types/order'
import type { ProductSearchResult } from '@/types/product'

export type AddLineResult =
  | { kind: 'added' }
  | { kind: 'incremented'; quantity: number }
  | { kind: 'blocked' }

export function useOrderLines() {
  const items = ref<OrderLine[]>([])

  const subtotal = computed(() => calculateSubtotal(items.value))
  const hasItems = computed(() => items.value.length > 0)
  const hasPendingLines = computed(() =>
    items.value.some((line) => line.validationStatus === 'pending'),
  )
  const allLinesReady = computed(() => items.value.every(isLineReady))

  function isSame(line: OrderLine, productId: number, variantId: number) {
    return line.productId === productId && line.variantId === variantId
  }

  function findLine(productId: number, variantId: number) {
    return items.value.find((line) => isSame(line, productId, variantId))
  }

  function replaceLine(
    productId: number,
    variantId: number,
    updater: (line: OrderLine) => OrderLine,
  ) {
    items.value = items.value.map((line) =>
      isSame(line, productId, variantId) ? updater(line) : line,
    )
  }

  function add(result: ProductSearchResult, hasWarehouse: boolean): AddLineResult {
    const existing = findLine(result.productId, result.variantId)

    if (existing) {
      if (!canAddVariant(existing)) return { kind: 'blocked' }
      const quantity = existing.quantity + 1
      replaceLine(result.productId, result.variantId, (line) =>
        withDerivedValidation({ ...line, quantity }),
      )
      return { kind: 'incremented', quantity }
    }

    items.value = [...items.value, createOrderLine(result, hasWarehouse)]
    return { kind: 'added' }
  }

  function remove(productId: number, variantId: number) {
    items.value = items.value.filter((line) => !isSame(line, productId, variantId))
  }

  function updateQuantity(productId: number, variantId: number, quantity: number) {
    if (quantity === 0) {
      if (findLine(productId, variantId)?.unavailable) remove(productId, variantId)
      return
    }
    if (!isPositiveInteger(quantity)) return

    replaceLine(productId, variantId, (line) => withDerivedValidation({ ...line, quantity }))
  }

  function updateDiscount(productId: number, variantId: number, discount: number | null) {
    const value = discount ?? 0
    if (!Number.isFinite(value) || value < 0) return

    replaceLine(productId, variantId, (line) => ({ ...line, discount: roundMoney(value) }))
  }

  function acceptCurrentPrice(productId: number, variantId: number) {
    replaceLine(productId, variantId, (line) =>
      line.currentPrice == null
        ? line
        : withDerivedValidation({ ...line, unitPrice: line.currentPrice }),
    )
  }

  function transform(updater: (lines: OrderLine[]) => OrderLine[]) {
    items.value = updater(items.value)
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    subtotal,
    hasItems,
    hasPendingLines,
    allLinesReady,
    add,
    remove,
    updateQuantity,
    updateDiscount,
    acceptCurrentPrice,
    transform,
    clear,
  }
}

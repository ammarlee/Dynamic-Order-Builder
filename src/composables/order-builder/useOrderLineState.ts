import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { formatMoney } from '@/helpers/format-money'
import { ORDER_ERROR_CODES } from '@/services/orders/errors/error-codes'
import {
  isLineDiscountValid,
  lineNetTotal,
  lineTotal,
} from '@/services/orders/helpers/order-calculations'
import {
  isLineInvalid,
  isLinePending,
  isLineUnverified,
  isLineValidating,
  lineHasError,
} from '@/services/orders/helpers/order-validation'
import type { OrderLine } from '@/types/order'

export function useOrderLineState(source: MaybeRefOrGetter<OrderLine>) {
  const line = computed(() => toValue(source))

  const isPending = computed(() => isLinePending(line.value))
  const isValidating = computed(() => isLineValidating(line.value))
  const isInvalid = computed(() => isLineInvalid(line.value))
  const isUnverified = computed(() => isLineUnverified(line.value))
  const isUnavailable = computed(() => lineHasError(line.value, ORDER_ERROR_CODES.UNAVAILABLE))
  const hasStockChange = computed(() => lineHasError(line.value, ORDER_ERROR_CODES.STOCK_CHANGED))
  const hasPriceChange = computed(
    () => lineHasError(line.value, ORDER_ERROR_CODES.PRICE_CHANGED) && line.value.currentPrice != null,
  )

  const itemTotal = computed(() => lineTotal(line.value.quantity, line.value.unitPrice))
  const netTotal = computed(() =>
    lineNetTotal(line.value.quantity, line.value.unitPrice, line.value.discount),
  )
  const isDiscountValid = computed(() => isLineDiscountValid(line.value))
  const hasDiscount = computed(() => line.value.discount > 0 && isDiscountValid.value)

  const unitPriceLabel = computed(() => formatMoney(line.value.unitPrice))
  const currentPriceLabel = computed(() => formatMoney(line.value.currentPrice ?? 0))
  const lineTotalLabel = computed(() => formatMoney(itemTotal.value))
  const netTotalLabel = computed(() => formatMoney(netTotal.value))

  return {
    isPending,
    isValidating,
    isInvalid,
    isUnverified,
    isUnavailable,
    hasStockChange,
    hasPriceChange,
    itemTotal,
    isDiscountValid,
    hasDiscount,
    unitPriceLabel,
    currentPriceLabel,
    lineTotalLabel,
    netTotalLabel,
  }
}

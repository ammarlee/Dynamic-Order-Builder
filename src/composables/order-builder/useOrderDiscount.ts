import { computed, type Ref } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import {
  calculateTotalDiscount,
  isLineDiscountValid,
} from '@/services/orders/helpers/order-calculations'
import type { OrderLine } from '@/types/order'

export function useOrderDiscount(items: Readonly<Ref<OrderLine[]>>) {
  const discount = computed(() => calculateTotalDiscount(items.value))

  const discountError = computed(() => {
    if (items.value.some((line) => !isLineDiscountValid(line))) {
      return UI_MESSAGES.order.discountExceedsTotal
    }
    return null
  })

  return { discount, discountError }
}

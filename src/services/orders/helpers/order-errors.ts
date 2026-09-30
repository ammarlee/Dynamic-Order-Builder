import { isRecord } from '@/helpers/async'
import { ORDER_ERROR_CODES } from '../errors/error-codes'
import type { OrderValidationErrorDto } from '../types/dto'
import type { OrderLineError } from '../types/order'

function mapOrderError(value: OrderValidationErrorDto): OrderLineError | null {
  if (value.type === ORDER_ERROR_CODES.STOCK_CHANGED) {
    return {
      type: ORDER_ERROR_CODES.STOCK_CHANGED,
      productId: value.product_id,
      variantId: value.variant_id,
      requestedQuantity: value.requested_quantity,
      availableQuantity: value.available_quantity,
    }
  }

  if (value.type === ORDER_ERROR_CODES.PRICE_CHANGED) {
    return {
      type: ORDER_ERROR_CODES.PRICE_CHANGED,
      productId: value.product_id,
      variantId: value.variant_id,
      oldPrice: value.old_price,
      newPrice: value.new_price,
    }
  }

  if (value.type === ORDER_ERROR_CODES.UNAVAILABLE) {
    return {
      type: ORDER_ERROR_CODES.UNAVAILABLE,
      productId: value.product_id,
      variantId: value.variant_id,
    }
  }

  return null
}

export function readValidationErrors(details: unknown): OrderLineError[] {
  if (!isRecord(details) || !Array.isArray(details.errors)) return []

  return details.errors.flatMap((error) => {
    if (!isRecord(error) || typeof error.type !== 'string') return []
    if (typeof error.product_id !== 'number' || typeof error.variant_id !== 'number') return []

    const mapped = mapOrderError({
      type: error.type as OrderValidationErrorDto['type'],
      product_id: error.product_id,
      variant_id: error.variant_id,
      requested_quantity:
        typeof error.requested_quantity === 'number' ? error.requested_quantity : undefined,
      available_quantity:
        typeof error.available_quantity === 'number' ? error.available_quantity : undefined,
      old_price: typeof error.old_price === 'number' ? error.old_price : undefined,
      new_price: typeof error.new_price === 'number' ? error.new_price : undefined,
    })

    return mapped ? [mapped] : []
  })
}

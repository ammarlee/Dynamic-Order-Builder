import { describe, expect, it } from 'vitest'
import { ORDER_ERROR_CODES } from '@/services/orders/errors/error-codes'
import { ORDER_ERROR_MESSAGES } from '@/services/orders/errors/error-messages'
import { readValidationErrors } from '@/services/orders/helpers/order-errors'

describe('order API errors', () => {
  it('keeps structured stock, price, and unavailable errors', () => {
    const errors = readValidationErrors({
      errors: [
        {
          type: ORDER_ERROR_CODES.STOCK_CHANGED,
          product_id: 1,
          variant_id: 2,
          requested_quantity: 5,
          available_quantity: 2,
        },
        {
          type: ORDER_ERROR_CODES.PRICE_CHANGED,
          product_id: 1,
          variant_id: 2,
          old_price: 4.5,
          new_price: 5,
        },
        {
          type: ORDER_ERROR_CODES.UNAVAILABLE,
          product_id: 3,
          variant_id: 4,
        },
        {
          type: 'unknown',
          product_id: 9,
          variant_id: 9,
        },
      ],
    })

    expect(errors).toEqual([
      {
        type: 'stock_changed',
        productId: 1,
        variantId: 2,
        requestedQuantity: 5,
        availableQuantity: 2,
      },
      {
        type: 'price_changed',
        productId: 1,
        variantId: 2,
        oldPrice: 4.5,
        newPrice: 5,
      },
      {
        type: 'unavailable',
        productId: 3,
        variantId: 4,
      },
    ])
    expect(ORDER_ERROR_MESSAGES.stock_changed).toBe('The available stock has changed.')
    expect(ORDER_ERROR_MESSAGES.price_changed).toBe('The product price has changed.')
    expect(ORDER_ERROR_MESSAGES.unavailable).toBe('The product is no longer available.')
  })
})

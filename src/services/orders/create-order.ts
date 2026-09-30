import { ApiError } from '@/services/api'
import { createOrderRequest } from './api/orders.api'
import { readValidationErrors } from './helpers/order-errors'
import type { CreateOrderPayload, CreateOrderResult } from './types/order'

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  try {
    const order = await createOrderRequest(payload)

    return {
      ok: true,
      orderId: order.id,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return {
        ok: false,
        kind: 'validation',
        errors: readValidationErrors(error.details),
      }
    }

    throw error
  }
}

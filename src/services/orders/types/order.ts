import type { OrderErrorCode } from '../errors/error-codes'

export interface OrderLineError {
  productId: number
  variantId: number
  type: OrderErrorCode
  requestedQuantity?: number
  availableQuantity?: number
  oldPrice?: number
  newPrice?: number
}

export interface CreateOrderItemPayload {
  product_id: number
  variant_id: number
  quantity: number
  unit_price: number
  discount: number
}

export interface CreateOrderPayload {
  warehouse_id: number
  discount: number
  items: CreateOrderItemPayload[]
}

export type CreateOrderResult =
  { ok: true; orderId: number } | { ok: false; kind: 'validation'; errors: OrderLineError[] }

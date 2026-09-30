import type { OrderErrorCode } from '../errors/error-codes'

export interface OrderValidationErrorDto {
  product_id: number
  variant_id: number
  type: OrderErrorCode
  requested_quantity?: number
  available_quantity?: number
  old_price?: number
  new_price?: number
}

export interface OrderValidationFailureDto {
  message: string
  errors: OrderValidationErrorDto[]
}

export interface CreateOrderResponseDto {
  id: number
  warehouse_id: number
  discount: number
  items: Array<{
    product_id: number
    variant_id: number
    quantity: number
    unit_price: number
    discount: number
  }>
}

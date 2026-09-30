import type { OrderErrorCode } from '@/services/orders/errors/error-codes'

export type OrderItemValidationState = 'pending' | 'valid' | 'validating' | 'invalid'

export type ValidationErrorType = OrderErrorCode

export interface OrderTotals {
  subtotal: number
  discount: number
  finalTotal: number
}

export interface OrderLine {
  productId: number
  variantId: number
  productName: string
  variantName: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  currentPrice: number | null
  priceAccepted: boolean
  availableQuantity: number | null
  unavailable: boolean
  validationStatus: OrderItemValidationState
  validationErrors: ValidationErrorType[]
}

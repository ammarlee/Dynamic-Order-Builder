export const ORDER_ERROR_CODES = {
  STOCK_CHANGED: 'stock_changed',
  PRICE_CHANGED: 'price_changed',
  UNAVAILABLE: 'unavailable',
} as const

export type OrderErrorCode = (typeof ORDER_ERROR_CODES)[keyof typeof ORDER_ERROR_CODES]

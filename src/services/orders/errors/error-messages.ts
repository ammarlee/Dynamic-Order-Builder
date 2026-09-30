import { ORDER_ERROR_CODES, type OrderErrorCode } from './error-codes'

export const ORDER_ERROR_MESSAGES: Record<OrderErrorCode, string> = {
  [ORDER_ERROR_CODES.STOCK_CHANGED]: 'The available stock has changed.',
  [ORDER_ERROR_CODES.PRICE_CHANGED]: 'The product price has changed.',
  [ORDER_ERROR_CODES.UNAVAILABLE]: 'The product is no longer available.',
}

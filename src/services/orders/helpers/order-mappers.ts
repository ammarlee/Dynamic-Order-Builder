import { roundMoney } from '@/helpers/format-money'
import { calculateTotalDiscount } from './order-calculations'
import type { CreateOrderPayload } from '../types/order'
import type { OrderLine } from '@/types/order'
import type { ProductSearchResult } from '@/types/product'

export function createOrderLine(result: ProductSearchResult, hasWarehouse = false): OrderLine {
  return {
    productId: result.productId,
    variantId: result.variantId,
    productName: result.productName,
    variantName: result.variantName,
    sku: result.sku,
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    currentPrice: null,
    priceAccepted: false,
    availableQuantity: null,
    unavailable: false,
    validationStatus: hasWarehouse ? 'validating' : 'pending',
    validationErrors: [],
  }
}

export function buildOrderPayload(warehouseId: number, items: OrderLine[]): CreateOrderPayload {
  return {
    warehouse_id: warehouseId,
    discount: roundMoney(calculateTotalDiscount(items)),
    items: items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: roundMoney(item.unitPrice),
      discount: roundMoney(item.discount),
    })),
  }
}

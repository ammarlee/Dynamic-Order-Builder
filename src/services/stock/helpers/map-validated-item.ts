import type { WarehouseStockItemDto } from '@/services/stock/types/dto'
import type { ValidatedStockItem } from '@/types/stock'

export function mapStockItem(item: WarehouseStockItemDto): ValidatedStockItem {
  return {
    productId: item.product_id,
    variantId: item.variant_id,
    availableQuantity: item.available_quantity,
    price: item.price,
    unavailable: false,
  }
}

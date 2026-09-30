import { getWarehouseStockRequest } from '@/services/stock/api/stock.api'
import { mapStockItem } from '@/services/stock/helpers/map-validated-item'
import type { WarehouseValidationResult } from '@/types/stock'

export async function validateWarehouseStock(
  warehouseId: number,
  signal?: AbortSignal,
): Promise<WarehouseValidationResult> {
  const items = await getWarehouseStockRequest(warehouseId, signal)

  return {
    warehouseId,
    items: items.map(mapStockItem),
  }
}

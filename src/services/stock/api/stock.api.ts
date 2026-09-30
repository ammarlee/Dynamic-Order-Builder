import { apiRequest } from '@/services/api'
import type { WarehouseStockItemDto } from '@/services/stock/types/dto'
import type { WarehouseStockRecord } from '@/types/stock'

export async function getWarehouseStockRequest(
  warehouseId: number,
  signal?: AbortSignal,
): Promise<WarehouseStockItemDto[]> {
  return apiRequest<WarehouseStockItemDto[]>(`/warehouses/${warehouseId}/stock`, { signal })
}

export async function findWarehouseStock(
  warehouseId: number,
  productId: number,
  variantId: number,
  signal?: AbortSignal,
): Promise<WarehouseStockRecord | null> {
  const params = new URLSearchParams({
    warehouse_id: String(warehouseId),
    product_id: String(productId),
    variant_id: String(variantId),
  })
  const records = await apiRequest<WarehouseStockRecord[]>(`/warehouseStock?${params.toString()}`, {
    signal,
  })
  return records[0] ?? null
}

export async function updateWarehouseStock(
  id: number,
  patch: Pick<WarehouseStockRecord, 'available_quantity' | 'price'>,
): Promise<WarehouseStockRecord> {
  return apiRequest<WarehouseStockRecord>(`/warehouseStock/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export async function createWarehouseStock(
  record: Omit<WarehouseStockRecord, 'id'>,
): Promise<WarehouseStockRecord> {
  return apiRequest<WarehouseStockRecord>('/warehouseStock', {
    method: 'POST',
    body: JSON.stringify(record),
  })
}

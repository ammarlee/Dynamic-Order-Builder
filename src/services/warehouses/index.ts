import { apiRequest } from '@/services/api'
import type { Warehouse } from '@/types/warehouse'

export async function getWarehouses(signal?: AbortSignal): Promise<Warehouse[]> {
  return apiRequest<Warehouse[]>('/warehouses', { signal })
}

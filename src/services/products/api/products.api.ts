import { apiRequest } from '@/services/api'
import type { ProductSearchItemDto } from '@/services/products/types/dto'
import type { CatalogProduct } from '@/types/product'

export async function searchProductsRequest(
  search: string,
  signal?: AbortSignal,
): Promise<ProductSearchItemDto[]> {
  const params = new URLSearchParams({ search })

  return apiRequest<ProductSearchItemDto[]>(`/products?${params.toString()}`, { signal })
}

export async function getCatalog(signal?: AbortSignal): Promise<CatalogProduct[]> {
  return apiRequest<CatalogProduct[]>('/catalog', { signal })
}

import { searchProductsRequest } from '@/services/products/api/products.api'
import { mapSearchProduct } from '@/services/products/helpers/map-search-item'
import { matchesProductName } from '@/services/products/helpers/matches-product-name'
import type { CatalogProduct } from '@/types/product'

export async function searchProducts(
  search: string,
  signal?: AbortSignal,
): Promise<CatalogProduct[]> {
  const products = (await searchProductsRequest(search, signal)) ?? []
  return products
    .map(mapSearchProduct)
    .filter((product) => matchesProductName(product.name, search))
}

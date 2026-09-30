import type { ProductSearchItemDto } from '@/services/products/types/dto'
import type { CatalogProduct } from '@/types/product'

export function mapSearchProduct(product: ProductSearchItemDto): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    variants: (product.variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
    })),
  }
}

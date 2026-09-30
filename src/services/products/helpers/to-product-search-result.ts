import type { CatalogProduct, ProductSearchResult, ProductVariant } from '@/types/product'

export function toProductSearchResult(
  product: CatalogProduct,
  variant: ProductVariant,
): ProductSearchResult {
  return {
    productId: product.id,
    variantId: variant.id,
    productName: product.name,
    variantName: variant.name,
    sku: product.sku,
  }
}

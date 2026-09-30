export interface ProductVariant {
  id: number
  name: string
}

export interface CatalogProduct {
  id: number
  name: string
  sku: string
  variants: ProductVariant[]
}

export interface ProductSearchResult {
  productId: number
  variantId: number
  productName: string
  variantName: string
  sku: string
}

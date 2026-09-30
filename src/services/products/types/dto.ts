export interface ProductVariantDto {
  id: number
  name: string
}

export interface ProductSearchItemDto {
  id: number
  name: string
  sku: string
  variants: ProductVariantDto[]
}

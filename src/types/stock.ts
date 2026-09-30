export interface WarehouseStockRecord {
  id: number
  warehouse_id: number
  product_id: number
  variant_id: number
  available_quantity: number
  price: number
}

export interface ValidatedStockItem {
  productId: number
  variantId: number
  availableQuantity: number | null
  price: number | null
  unavailable: boolean
}

export interface WarehouseValidationResult {
  warehouseId: number
  items: ValidatedStockItem[]
}

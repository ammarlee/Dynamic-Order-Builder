import { computed, ref, watch, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { createWarehouseStock, findWarehouseStock, updateWarehouseStock } from '@/services/stock'
import { UI_MESSAGES } from '@/constants/messages'
import type { CatalogProduct } from '@/types/product'

export function useWarehouseStockEditor(products: Readonly<Ref<CatalogProduct[]>>) {
  const toast = useToast()

  const warehouseId = ref<number | null>(null)
  const productId = ref<number | null>(null)
  const variantId = ref<number | null>(null)
  const availableQuantity = ref<number | null>(0)
  const price = ref<number | null>(0)
  const stockId = ref<number | null>(null)
  const saving = ref(false)
  const saveError = ref<string | null>(null)

  let stockRequestId = 0

  const variants = computed(
    () => products.value.find((product) => product.id === productId.value)?.variants ?? [],
  )

  const canUpdate = computed(
    () =>
      warehouseId.value != null &&
      productId.value != null &&
      variantId.value != null &&
      availableQuantity.value != null &&
      availableQuantity.value >= 0 &&
      Number.isInteger(availableQuantity.value) &&
      price.value != null &&
      price.value >= 0 &&
      !saving.value,
  )

  async function loadSelectedStock() {
    const warehouse = warehouseId.value
    const product = productId.value
    const variant = variantId.value
    const requestId = ++stockRequestId

    if (warehouse == null || product == null || variant == null) {
      stockId.value = null
      return
    }

    try {
      const record = await findWarehouseStock(warehouse, product, variant)
      if (requestId !== stockRequestId) return

      if (!record) {
        stockId.value = null
        availableQuantity.value = 0
        price.value = 0
        return
      }

      stockId.value = record.id
      availableQuantity.value = record.available_quantity
      price.value = record.price
    } catch {
      if (requestId !== stockRequestId) return
      saveError.value = UI_MESSAGES.serverControls.stockLoadFailed
    }
  }

  watch(productId, () => {
    variantId.value = null
    stockId.value = null
  })

  watch([warehouseId, productId, variantId], () => {
    void loadSelectedStock()
  })

  async function updateServerState() {
    const warehouse = warehouseId.value
    const product = productId.value
    const variant = variantId.value
    const quantity = availableQuantity.value
    const nextPrice = price.value
    if (
      !canUpdate.value ||
      warehouse == null ||
      product == null ||
      variant == null ||
      quantity == null ||
      nextPrice == null
    ) {
      return
    }

    saving.value = true
    saveError.value = null

    try {
      const patch = { available_quantity: quantity, price: nextPrice }

      if (stockId.value == null) {
        const created = await createWarehouseStock({
          warehouse_id: warehouse,
          product_id: product,
          variant_id: variant,
          ...patch,
        })
        stockId.value = created.id
      } else {
        await updateWarehouseStock(stockId.value, patch)
      }

      toast.add({
        severity: 'success',
        summary: UI_MESSAGES.serverControls.savedSummary,
        detail: UI_MESSAGES.serverControls.savedDetail,
        life: 3000,
      })
    } catch {
      saveError.value = UI_MESSAGES.serverControls.saveFailed
    } finally {
      saving.value = false
    }
  }

  return {
    warehouseId,
    productId,
    variantId,
    availableQuantity,
    price,
    variants,
    canUpdate,
    saving,
    saveError,
    loadSelectedStock,
    updateServerState,
  }
}

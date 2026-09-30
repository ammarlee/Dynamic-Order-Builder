import { computed, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getCatalog } from '@/services/products'
import { createWarehouseStock, findWarehouseStock, updateWarehouseStock } from '@/services/stock'
import { getWarehouses } from '@/services/warehouses'
import { getDevSettings, updateDevSettings } from '@/services/dev-settings'
import type { DevSettings } from '@/types/dev-settings'
import type { CatalogProduct } from '@/types/product'
import type { Warehouse } from '@/types/warehouse'

const emptySettings = (): DevSettings => ({
  failProductSearch: false,
  failWarehouseValidation: false,
  failOrderSubmit: false,
})

export function useServerControls() {
  const toast = useToast()

  const visible = ref(false)
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  const saving = ref(false)
  const saveError = ref<string | null>(null)

  const warehouses = ref<Warehouse[]>([])
  const products = ref<CatalogProduct[]>([])
  const settings = ref<DevSettings>(emptySettings())

  const warehouseId = ref<number | null>(null)
  const productId = ref<number | null>(null)
  const variantId = ref<number | null>(null)
  const availableQuantity = ref<number | null>(0)
  const price = ref<number | null>(0)
  const stockId = ref<number | null>(null)

  let stockRequestId = 0

  const variants = computed(
    () => products.value?.find((product) => product?.id === productId.value)?.variants ?? [],
  )
  const hasLoadError = computed(() => Boolean(loadError.value))
  const showForm = computed(() => !loading.value && !hasLoadError.value)

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

  async function load() {
    loading.value = true
    loadError.value = null

    try {
      const [warehouseList, productList, devSettings] = await Promise.all([
        getWarehouses(),
        getCatalog(),
        getDevSettings(),
      ])
      warehouses.value = warehouseList
      products.value = productList
      settings.value = devSettings
      await loadSelectedStock()
    } catch {
      loadError.value = "We couldn't load server controls."
    } finally {
      loading.value = false
    }
  }

  function open() {
    visible.value = true
    void load()
  }

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
      saveError.value = 'Unable to load the current server state.'
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
    if (
      !canUpdate.value ||
      warehouseId.value == null ||
      productId.value == null ||
      variantId.value == null
    ) {
      return
    }
    if (availableQuantity.value == null || price.value == null) return

    saving.value = true
    saveError.value = null

    try {
      const patch = {
        available_quantity: availableQuantity.value,
        price: price.value,
      }

      if (stockId.value == null) {
        const created = await createWarehouseStock({
          warehouse_id: warehouseId.value,
          product_id: productId.value,
          variant_id: variantId.value,
          ...patch,
        })
        stockId.value = created.id
      } else {
        await updateWarehouseStock(stockId.value, patch)
      }

      toast.add({
        severity: 'success',
        summary: 'Server updated',
        detail: 'Server state updated.',
        life: 3000,
      })
    } catch {
      saveError.value = 'Unable to update server state.'
    } finally {
      saving.value = false
    }
  }

  async function setFailureFlag(key: keyof DevSettings, enabled: boolean) {
    const previous = settings.value[key]
    settings.value = { ...settings.value, [key]: enabled }

    try {
      settings.value = await updateDevSettings({ [key]: enabled })
    } catch {
      settings.value = { ...settings.value, [key]: previous }
      saveError.value = 'Unable to update failure simulation.'
    }
  }

  return {
    visible,
    loading,
    loadError,
    hasLoadError,
    showForm,
    saving,
    saveError,
    warehouses,
    products,
    variants,
    settings,
    warehouseId,
    productId,
    variantId,
    availableQuantity,
    price,
    canUpdate,
    open,
    load,
    updateServerState,
    setFailureFlag,
  }
}

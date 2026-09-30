import { ref } from 'vue'
import { getCatalog } from '@/services/products'
import { getWarehouses } from '@/services/warehouses'
import type { CatalogProduct } from '@/types/product'
import type { Warehouse } from '@/types/warehouse'

export function useServerControlsCatalog() {
  const warehouses = ref<Warehouse[]>([])
  const products = ref<CatalogProduct[]>([])

  async function load() {
    const [warehouseList, productList] = await Promise.all([getWarehouses(), getCatalog()])
    warehouses.value = warehouseList
    products.value = productList
  }

  return { warehouses, products, load }
}

<template>
  <div class="order-builder">
    <header class="order-builder__header">
      <div>
        <p class="order-builder__eyebrow">Admin</p>
        <h1>Create Order</h1>
      </div>
      <ServerControlsIndex />
    </header>

    <div class="order-builder__main">
      <SearchIndex :warehouse-id="warehouseId" :items="items" @add="addProduct" />

      <WarehouseIndex
        :warehouses="warehouses"
        :selected-id="warehouseId"
        :loading="warehousesLoading"
        :error="warehousesError"
        :validation-error="warehouseValidationError"
        @update:selected-id="selectWarehouse"
        @retry="loadWarehouses"
        @retry-validation="retryWarehouseValidation"
      />

      <OrderListIndex
        :items="items"
        :validating="isValidating"
        :warehouse-selected="warehouseId != null"
        @update-quantity="updateQuantity"
        @update-discount="updateDiscount"
        @remove="removeItem"
        @accept-price="acceptCurrentPrice"
      />

      <div class="order-builder__summary">
        <OrderSummaryIndex
          :data="totals"
          :is-disabled="!canSubmit"
          :submit-error="submitError"
          @submit="submitOrder"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OrderListIndex from '@/components/pages/orders/create/order-list/OrderListIndex.vue'
import OrderSummaryIndex from '@/components/pages/orders/create/summary/OrderSummaryIndex.vue'
import SearchIndex from '@/components/pages/orders/create/search/SearchIndex.vue'
import ServerControlsIndex from '@/components/pages/orders/create/server-controls/ServerControlsIndex.vue'
import WarehouseIndex from '@/components/pages/orders/create/warehouse/WarehouseIndex.vue'
import { useOrderBuilder } from '@/composables/order-builder/useOrderBuilder'

defineOptions({ name: 'OrderBuilderIndex' })

const {
  warehouses,
  warehousesLoading,
  warehousesError,
  warehouseId,
  items,
  totals,
  isValidating,
  canSubmit,
  submitError,
  warehouseValidationError,
  loadWarehouses,
  selectWarehouse,
  addProduct,
  updateQuantity,
  acceptCurrentPrice,
  removeItem,
  updateDiscount,
  submitOrder,
  retryWarehouseValidation,
} = useOrderBuilder()
</script>

<style scoped>
.order-builder__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.order-builder__eyebrow {
  margin-bottom: 0.25rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.order-builder__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.order-builder__summary {
  width: min(100%, 22rem);
  margin-left: auto;
}

@media (max-width: 960px) {
  .order-builder__summary {
    width: 100%;
    margin-left: 0;
  }
}
</style>

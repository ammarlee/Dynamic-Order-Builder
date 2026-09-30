<template>
  <div class="stack">
    <label class="stack">
      <span>Warehouse</span>
      <Select
        v-model="warehouseId"
        :options="warehouses"
        option-label="name"
        option-value="id"
        placeholder="Select a warehouse"
        fluid
      />
    </label>

    <label class="stack">
      <span>Product</span>
      <Select
        v-model="productId"
        :options="products"
        option-label="name"
        option-value="id"
        placeholder="Select a product"
        filter
        fluid
      />
    </label>

    <label class="stack">
      <span>Variant</span>
      <Select
        v-model="variantId"
        :options="variants"
        option-label="name"
        option-value="id"
        placeholder="Select a variant"
        :disabled="productId == null"
        fluid
      />
    </label>

    <label class="stack">
      <span>Available Quantity</span>
      <InputNumber
        v-model="availableQuantity"
        :min="0"
        :step="1"
        :use-grouping="false"
        show-buttons
        fluid
      />
    </label>

    <label class="stack">
      <span>Price</span>
      <InputNumber
        v-model="price"
        mode="currency"
        currency="USD"
        locale="en-US"
        :min="0"
        :min-fraction-digits="2"
        :max-fraction-digits="2"
        fluid
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import type { CatalogProduct, ProductVariant } from '@/types/product'
import type { Warehouse } from '@/types/warehouse'

defineOptions({ name: 'ServerControlsFields' })

defineProps<{
  warehouses: Warehouse[]
  products: CatalogProduct[]
  variants: ProductVariant[]
}>()

const warehouseId = defineModel<number | null>('warehouseId', { required: true })
const productId = defineModel<number | null>('productId', { required: true })
const variantId = defineModel<number | null>('variantId', { required: true })
const availableQuantity = defineModel<number | null>('availableQuantity', { required: true })
const price = defineModel<number | null>('price', { required: true })
</script>

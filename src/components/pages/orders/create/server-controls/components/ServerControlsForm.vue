<template>
  <form class="stack" @submit.prevent="onSave">
    <ServerControlsFields
      v-model:warehouse-id="warehouseId"
      v-model:product-id="productId"
      v-model:variant-id="variantId"
      v-model:available-quantity="availableQuantity"
      v-model:price="price"
      :warehouses="warehouses"
      :products="products"
      :variants="variants"
    />

    <Message v-if="saveError" severity="error" :closable="false">{{ saveError }}</Message>

    <Button type="submit" label="Update Server State" :loading="saving" :disabled="!canUpdate" />

    <ServerControlsFailure
      :settings="settings"
      :error="failureError"
      @update-failure="onUpdateFailure"
    />
  </form>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import ServerControlsFailure from '@/components/pages/orders/create/server-controls/components/failure/ServerControlsFailure.vue'
import ServerControlsFields from '@/components/pages/orders/create/server-controls/components/fields/ServerControlsFields.vue'
import type { DevSettings } from '@/types/dev-settings'
import type { CatalogProduct, ProductVariant } from '@/types/product'
import type { Warehouse } from '@/types/warehouse'

defineOptions({ name: 'ServerControlsForm' })

defineProps<{
  warehouses: Warehouse[]
  products: CatalogProduct[]
  variants: ProductVariant[]
  settings: DevSettings
  saving: boolean
  canUpdate: boolean
  saveError: string | null
  failureError: string | null
}>()

const warehouseId = defineModel<number | null>('warehouseId', { required: true })
const productId = defineModel<number | null>('productId', { required: true })
const variantId = defineModel<number | null>('variantId', { required: true })
const availableQuantity = defineModel<number | null>('availableQuantity', { required: true })
const price = defineModel<number | null>('price', { required: true })

const emit = defineEmits<{
  'update-failure': [key: keyof DevSettings, enabled: boolean]
  save: []
}>()

function onSave() {
  emit('save')
}

function onUpdateFailure(key: keyof DevSettings, enabled: boolean) {
  emit('update-failure', key, enabled)
}
</script>

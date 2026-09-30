<template>
  <SectionCard class="order-list-card" title="Order Items" heading-id="order-items-heading">
    <template #prepend>
      <slot />
    </template>

    <Message
      v-if="!warehouseSelected && !isEmpty"
      severity="info"
      :closable="false"
      class="warehouse-notice"
    >
      Select a warehouse to load prices and stock for the items below.
    </Message>

    <p v-if="isEmpty">No products added yet.</p>

    <OrderListResult
      v-else
      :items="items"
      :validating="validating"
      @update-quantity="onUpdateQuantity"
      @update-discount="onUpdateDiscount"
      @remove="onRemove"
      @accept-price="onAcceptPrice"
    />
  </SectionCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Message from 'primevue/message'
import SectionCard from '@/components/ui/SectionCard.vue'
import OrderListResult from '@/components/pages/orders/create/order-list/components/result/OrderListResult.vue'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderListIndex' })

const props = defineProps<{
  items: OrderLine[]
  validating: boolean
  warehouseSelected: boolean
}>()

const isEmpty = computed(() => props.items.length === 0 && !props.validating)

const emit = defineEmits<{
  'update-quantity': [productId: number, variantId: number, quantity: number]
  'update-discount': [productId: number, variantId: number, discount: number | null]
  remove: [productId: number, variantId: number]
  'accept-price': [productId: number, variantId: number]
}>()

function onUpdateQuantity(productId: number, variantId: number, quantity: number) {
  emit('update-quantity', productId, variantId, quantity)
}

function onUpdateDiscount(productId: number, variantId: number, discount: number | null) {
  emit('update-discount', productId, variantId, discount)
}

function onRemove(productId: number, variantId: number) {
  emit('remove', productId, variantId)
}

function onAcceptPrice(productId: number, variantId: number) {
  emit('accept-price', productId, variantId)
}
</script>

<style scoped>
.order-list-card :deep(.section-title) {
  margin-bottom: 0.85rem;
}

.warehouse-notice {
  margin-bottom: 0.5rem;
}
</style>

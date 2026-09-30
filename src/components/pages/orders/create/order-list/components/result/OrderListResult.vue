<template>
  <div class="order-items">
    <div class="order-columns" aria-hidden="true">
      <span>Product</span>
      <span>Variant</span>
      <span>Qty</span>
      <span>Unit price</span>
      <span>Discount</span>
      <span>Line total</span>
      <span>Stock</span>
    </div>

    <OrderListSkeleton v-if="validating" :count="skeletonCount" />

    <div v-else class="stack">
      <OrderItem
        v-for="item in items"
        :key="lineKey(item.productId, item.variantId)"
        :item="item"
        @update-quantity="onUpdateQuantity(item, $event)"
        @update-discount="onUpdateDiscount(item, $event)"
        @remove="onRemove(item)"
        @accept-price="onAcceptPrice(item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderItem from '@/components/pages/orders/create/order-list/components/item/OrderItem.vue'
import OrderListSkeleton from '@/components/pages/orders/create/order-list/components/skeleton/OrderListSkeleton.vue'
import { lineKey } from '@/services/orders/helpers/order-validation'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderListResult' })

const props = defineProps<{
  items: OrderLine[]
  validating: boolean
}>()

const skeletonCount = computed(() => Math.max(props.items.length, 1))

const emit = defineEmits<{
  'update-quantity': [productId: number, variantId: number, quantity: number]
  'update-discount': [productId: number, variantId: number, discount: number | null]
  remove: [productId: number, variantId: number]
  'accept-price': [productId: number, variantId: number]
}>()

function onUpdateQuantity(item: OrderLine, quantity: number) {
  emit('update-quantity', item.productId, item.variantId, quantity)
}

function onUpdateDiscount(item: OrderLine, discount: number | null) {
  emit('update-discount', item.productId, item.variantId, discount)
}

function onRemove(item: OrderLine) {
  emit('remove', item.productId, item.variantId)
}

function onAcceptPrice(item: OrderLine) {
  emit('accept-price', item.productId, item.variantId)
}
</script>

<style scoped>
.order-columns {
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: var(--order-line-columns);
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 0 calc(1rem + 1px) 0.5rem;
  background: var(--surface-card);
  color: var(--faint);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.order-columns span:nth-child(3) {
  text-align: center;
}

.order-columns span:nth-child(n + 4) {
  text-align: right;
}

@media (max-width: 960px) {
  .order-columns {
    display: none;
  }
}
</style>

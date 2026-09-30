<template>
  <article
    class="order-line"
    :class="{ 'order-line--invalid': isInvalid, 'order-line--pending': isPending }"
  >
    <div class="order-line__row">
      <OrderItemDetails :item="item" />
      <OrderItemQuantity :item="item" @update-quantity="onUpdateQuantity" />
      <OrderItemValues :item="item" @update-discount="onUpdateDiscount" />
    </div>

    <OrderItemAlerts
      v-if="showAlerts"
      :item="item"
      @accept-price="onAcceptPrice"
    />

    <OrderItemRemove :item="item" @remove="onRemove" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOrderLineState } from '@/composables/order-builder/useOrderLineState'
import OrderItemAlerts from '@/components/pages/orders/create/order-list/components/item/components/alerts/OrderItemAlerts.vue'
import OrderItemDetails from '@/components/pages/orders/create/order-list/components/item/components/details/OrderItemDetails.vue'
import OrderItemQuantity from '@/components/pages/orders/create/order-list/components/item/components/quantity/OrderItemQuantity.vue'
import OrderItemRemove from '@/components/pages/orders/create/order-list/components/item/components/remove/OrderItemRemove.vue'
import OrderItemValues from '@/components/pages/orders/create/order-list/components/item/components/values/OrderItemValues.vue'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItem' })

const props = defineProps<{
  item: OrderLine
}>()

const emit = defineEmits<{
  'update-quantity': [quantity: number]
  'update-discount': [discount: number | null]
  remove: []
  'accept-price': []
}>()

function onUpdateQuantity(quantity: number) {
  emit('update-quantity', quantity)
}

function onUpdateDiscount(discount: number | null) {
  emit('update-discount', discount)
}

function onAcceptPrice() {
  emit('accept-price')
}

function onRemove() {
  emit('remove')
}

const { isPending, isInvalid } = useOrderLineState(() => props.item)
const showAlerts = computed(() => isPending.value || isInvalid.value)
</script>

<style scoped>
.order-line {
  min-width: 0;
  padding: 0.9rem 1rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface-raised);
}

.order-line--invalid {
  border-color: var(--warn-border);
  background: #fdf6ee;
}

.order-line--pending {
  border-color: #d6d3d1;
  background: #fafaf9;
}

.order-line__row {
  display: grid;
  grid-template-columns: var(--order-line-columns);
  gap: 0.75rem 1rem;
  align-items: center;
}

@media (max-width: 960px) {
  .order-line__row {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
}
</style>

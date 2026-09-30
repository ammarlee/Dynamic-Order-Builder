<template>
  <div class="order-line__details">
    <div class="order-line__product">
      <strong class="order-line__name">{{ item.productName }}</strong>
      <span class="order-line__sku">SKU: {{ item.sku }}</span>
    </div>

    <div class="order-line__variant">{{ item.variantName }}</div>
  </div>
</template>

<script setup lang="ts">
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItemDetails' })

defineProps<{
  item: OrderLine
}>()
</script>

<style scoped>
.order-line__details {
  display: contents;
}

.order-line__product {
  min-width: 0;
}

.order-line__name {
  display: block;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.order-line__sku,
.order-line__variant {
  color: var(--muted);
}

.order-line__sku {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.85rem;
}

@media (max-width: 960px) {
  .order-line__product,
  .order-line__variant {
    grid-column: 1 / -1;
  }
}
</style>

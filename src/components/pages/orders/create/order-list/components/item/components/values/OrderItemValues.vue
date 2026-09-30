<template>
  <div class="order-line__values">
    <div class="order-line__price order-cell" data-label="Unit price">
      <span v-if="isPending">—</span>
      <span v-else>{{ unitPriceLabel }}</span>
    </div>

    <OrderItemDiscount :item="item" @update-discount="onUpdateDiscount" />

    <div class="order-line__total order-cell" data-label="Line total">
      <span v-if="isPending">—</span>
      <span v-else class="order-line__total-value">
        <span>{{ hasDiscount ? netTotalLabel : lineTotalLabel }}</span>
        <s v-if="hasDiscount" class="order-line__total-original">{{ lineTotalLabel }}</s>
      </span>
    </div>

    <div class="order-line__stock order-cell" data-label="Stock">
      <span v-if="isPending">—</span>
      <span v-else-if="isUnavailable" class="stock-out">Unavailable</span>
      <span v-else-if="isUnverified">—</span>
      <span v-else>{{ item.availableQuantity ?? '—' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import OrderItemDiscount from '@/components/pages/orders/create/order-list/components/item/components/discount/OrderItemDiscount.vue'
import { useOrderLineState } from '@/composables/order-builder/useOrderLineState'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItemValues' })

const props = defineProps<{
  item: OrderLine
}>()

const emit = defineEmits<{
  'update-discount': [discount: number | null]
}>()

function onUpdateDiscount(discount: number | null) {
  emit('update-discount', discount)
}

const {
  isPending,
  isUnavailable,
  isUnverified,
  hasDiscount,
  unitPriceLabel,
  lineTotalLabel,
  netTotalLabel,
} = useOrderLineState(() => props.item)
</script>

<style scoped>
.order-line__values {
  display: contents;
}

.order-line__price,
.order-line__stock,
.order-line__total {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.order-line__total {
  font-weight: 700;
}

.order-line__total-value {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.order-line__total-original {
  color: var(--faint);
  font-size: 0.78rem;
  font-weight: 400;
}

.stock-out {
  color: var(--danger);
}
</style>

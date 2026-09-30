<template>
  <div class="stack" role="status" aria-label="Checking stock and prices">
    <OrderItemSkeleton v-for="row in count" :key="row" />
  </div>
</template>

<script setup lang="ts">
import OrderItemSkeleton from '@/components/pages/orders/create/order-list/components/skeleton/OrderItemSkeleton.vue'

defineOptions({ name: 'OrderListSkeleton' })

withDefaults(
  defineProps<{
    count?: number
  }>(),
  { count: 2 },
)
</script>

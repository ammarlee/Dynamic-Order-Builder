<template>
  <div class="stack">
    <div class="summary-row">
      <span>Subtotal</span>
      <span>{{ formatMoney(data.subtotal) }}</span>
    </div>

    <div class="summary-row">
      <span>Total discount</span>
      <span>{{ formatMoney(data.discount) }}</span>
    </div>

    <div class="summary-row summary-row--total">
      <span>Final total</span>
      <span>{{ formatMoney(data.finalTotal) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatMoney } from '@/helpers/format-money'
import type { OrderTotals } from '@/types/order'

defineOptions({ name: 'OrderSummaryTotals' })

defineProps<{
  data: OrderTotals
}>()
</script>

<style scoped>
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
  color: var(--ink-soft);
}

.summary-row--total {
  margin-top: 0.25rem;
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink);
}
</style>

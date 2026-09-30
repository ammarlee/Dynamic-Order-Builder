<template>
  <SectionCard class="order-summary-card" title="Summary" heading-id="summary-heading">
    <div class="stack">
      <OrderSummaryTotals :data="data" />

      <OrderSummaryActions
        :is-disabled="isDisabled"
        :submit-error="submitError"
        @submit="onSubmit"
      />
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import SectionCard from '@/components/ui/SectionCard.vue'
import OrderSummaryActions from '@/components/pages/orders/create/summary/components/actions/OrderSummaryActions.vue'
import OrderSummaryTotals from '@/components/pages/orders/create/summary/components/totals/OrderSummaryTotals.vue'
import type { OrderTotals } from '@/types/order'

defineOptions({ name: 'OrderSummaryIndex' })

defineProps<{
  data: OrderTotals
  isDisabled: boolean
  submitError: string | null
}>()

const emit = defineEmits<{
  submit: []
}>()

function onSubmit() {
  emit('submit')
}
</script>

<style scoped>
.order-summary-card {
  position: sticky;
  top: 1.25rem;
}

.order-summary-card.section-card :deep(.p-card-body) {
  padding: var(--p-card-body-padding);
}

@media (max-width: 960px) {
  .order-summary-card {
    position: static;
  }
}
</style>

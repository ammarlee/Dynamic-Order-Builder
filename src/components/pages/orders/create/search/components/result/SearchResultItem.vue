<template>
  <div class="variant-row">
    <div class="variant-row__name">{{ item.variantName }}</div>

    <span v-tooltip.top="disabledReason">
      <Button
        class="variant-row__action"
        :label="actionLabel"
        size="small"
        rounded
        severity="secondary"
        :disabled="!canAdd"
        @click="onAdd"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { stockAvailabilityMessage } from '@/helpers/stock-message'
import { canAddVariant } from '@/services/orders/helpers/order-validation'
import type { OrderLine } from '@/types/order'
import type { ProductSearchResult } from '@/types/product'

defineOptions({ name: 'SearchResultItem' })

const props = defineProps<{
  item: ProductSearchResult
  line?: OrderLine
}>()

const emit = defineEmits<{
  add: [item: ProductSearchResult]
}>()

function onAdd() {
  emit('add', props.item)
}

const inOrder = computed(() => (props.line?.quantity ?? 0) > 0)

const actionLabel = computed(() => (inOrder.value ? 'In order' : 'Add'))

const canAdd = computed(() => canAddVariant(props.line))

const disabledReason = computed(() => {
  if (canAdd.value) return undefined
  const line = props.line
  if (!line) return undefined
  if (line.unavailable) return 'Unavailable in this warehouse'
  if (line.availableQuantity != null && line.quantity >= line.availableQuantity) {
    return stockAvailabilityMessage(line.availableQuantity)
  }
  return undefined
})
</script>

<style scoped>
.variant-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 0.75rem 1rem 0.85rem;
  border-top: 1px solid #efeae0;
  background: transparent;
  transition: background-color 0.15s ease;
}

.variant-row__name {
  color: var(--ink);
  overflow-wrap: anywhere;
}

.variant-row__action {
  --p-button-secondary-background: #f7f3ea;
  --p-button-secondary-hover-background: #fff;
  --p-button-secondary-active-background: #f7f3ea;
  --p-button-secondary-border-color: #e6e0d4;
  --p-button-secondary-hover-border-color: #d9d2c4;
  --p-button-secondary-active-border-color: #d9d2c4;
  --p-button-secondary-color: var(--ink-soft);
  --p-button-secondary-hover-color: var(--ink);
  --p-button-secondary-active-color: var(--ink);
  border: 1px solid #e6e0d4;
  border-radius: 999px;
  background: #f7f3ea;
  color: var(--ink-soft);
  font-weight: 500;
  box-shadow: none;
}

.variant-row__action:not(:disabled):hover,
.variant-row__action:not(:disabled):active {
  border-color: #d9d2c4;
  background: #fff;
  color: var(--ink);
}

@media (max-width: 640px) {
  .variant-row {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
</style>

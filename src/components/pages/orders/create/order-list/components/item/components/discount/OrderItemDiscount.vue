<template>
  <div class="line-discount order-cell" data-label="Discount">
    <InputNumber
      :model-value="item.discount"
      :min="0"
      :min-fraction-digits="0"
      :max-fraction-digits="2"
      :disabled="discountDisabled"
      :invalid="hasError"
      aria-label="Item discount"
      fluid
      @update:model-value="onUpdateDiscount"
    />
    <p
      class="line-discount__error"
      :class="{ 'line-discount__error--visible': hasError }"
      role="alert"
      :aria-hidden="!hasError"
    >
      Max {{ lineTotalLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputNumber from 'primevue/inputnumber'
import { useOrderLineState } from '@/composables/order-builder/useOrderLineState'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItemDiscount' })

const props = defineProps<{
  item: OrderLine
}>()

const emit = defineEmits<{
  'update-discount': [discount: number | null]
}>()

function onUpdateDiscount(discount: number | null) {
  emit('update-discount', discount)
}

const { isPending, isValidating, isDiscountValid, itemTotal, lineTotalLabel } = useOrderLineState(
  () => props.item,
)

const discountDisabled = computed(
  () => isPending.value || isValidating.value || props.item.unavailable || itemTotal.value <= 0,
)

const hasError = computed(() => !isDiscountValid.value)
</script>

<style scoped>
.line-discount {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
}

.line-discount__error {
  min-height: 1.2em;
  margin: 0;
  color: var(--danger);
  font-size: 0.72rem;
  line-height: 1.2;
  text-align: right;
  visibility: hidden;
}

.line-discount__error--visible {
  visibility: visible;
}

.line-discount :deep(input) {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  text-align: right;
}

.line-discount :deep(input.p-invalid),
.line-discount :deep(.p-invalid input) {
  border-color: var(--warn-border);
}

.line-discount :deep(input:disabled) {
  background: var(--input-bg-disabled);
  color: var(--faint);
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .line-discount {
    display: grid;
    grid-template-columns: 1fr 8rem;
    align-items: center;
    column-gap: 1rem;
    row-gap: 0.25rem;
  }

  .line-discount > * {
    grid-column: 2;
  }

  .line-discount::before {
    grid-column: 1;
  }

  .line-discount__error:not(.line-discount__error--visible) {
    display: none;
  }
}
</style>

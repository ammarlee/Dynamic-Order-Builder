<template>
  <div class="qty-control order-cell" data-label="Qty">
    <div class="qty-control__steps">
      <span
        class="qty-control__step"
        :class="{ 'qty-control__step--disabled': cannotDecrease }"
        @click="decreaseQuantity"
      >
        <Button
          icon="pi pi-minus"
          severity="secondary"
          outlined
          aria-label="Decrease quantity"
          :disabled="cannotDecrease"
        />
      </span>
      <InputNumber
        :key="quantityInputKey"
        :model-value="item.quantity"
        :min="1"
        :step="1"
        :use-grouping="false"
        aria-label="Quantity"
        @update:model-value="onQuantityInput"
      />
      <span
        class="qty-control__step"
        :class="{ 'qty-control__step--disabled': cannotIncrease }"
        @click="increaseQuantity"
      >
        <Button
          icon="pi pi-plus"
          severity="secondary"
          outlined
          aria-label="Increase quantity"
          :disabled="cannotIncrease"
        />
      </span>
    </div>
    <p
      class="qty-control__hint"
      :class="{ 'qty-control__hint--visible': stockHintVisible }"
      role="status"
      :aria-hidden="!stockHintVisible"
    >
      {{ stockHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import { isPositiveInteger } from '@/helpers/number'
import { stockAvailabilityMessage } from '@/helpers/stock-message'
import { useOrderLineState } from '@/composables/order-builder/useOrderLineState'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItemQuantity' })

const props = defineProps<{
  item: OrderLine
}>()

const emit = defineEmits<{
  'update-quantity': [quantity: number]
}>()

const STOCK_HINT_MS = 3000

const quantityInputKey = ref(0)
const stockHintVisible = ref(false)
let stockHintTimer: ReturnType<typeof setTimeout> | undefined

const { isPending } = useOrderLineState(() => props.item)

const stockHint = computed(() => {
  const stock = props.item.availableQuantity
  if (stock == null) return ''
  return stockAvailabilityMessage(stock)
})

const cannotDecrease = computed(() => {
  if (props.item.unavailable) return props.item.quantity <= 0
  return props.item.quantity <= 1
})

const cannotIncrease = computed(() => {
  if (isPending.value) return false
  const stock = props.item.availableQuantity
  if (props.item.unavailable) return true
  if (stock == null) return false
  return props.item.quantity >= stock
})

function showStockHint() {
  if (props.item.availableQuantity == null) return
  stockHintVisible.value = true
  clearTimeout(stockHintTimer)
  stockHintTimer = setTimeout(() => {
    stockHintVisible.value = false
  }, STOCK_HINT_MS)
}

function revertQuantityInput() {
  quantityInputKey.value += 1
}

function decreaseQuantity() {
  if (cannotDecrease.value) return
  emit('update-quantity', props.item.quantity - 1)
}

function increaseQuantity() {
  if (cannotIncrease.value) return
  emit('update-quantity', props.item.quantity + 1)
}

function onQuantityInput(value: number | null) {
  const current = props.item.quantity
  const stock = props.item.availableQuantity

  if (value != null && stock != null && value > stock) {
    revertQuantityInput()
    showStockHint()
    return
  }

  if (value == null || !isPositiveInteger(value) || value === current) {
    if (value !== current) revertQuantityInput()
    return
  }

  emit('update-quantity', value)
}

onBeforeUnmount(() => clearTimeout(stockHintTimer))
</script>

<style scoped>
.qty-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.qty-control__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.qty-control__step {
  display: inline-flex;
  cursor: pointer;
}

.qty-control__step--disabled {
  cursor: not-allowed;
}

.qty-control__step :deep(.p-button) {
  pointer-events: none;
}

.qty-control__hint {
  min-height: 1.2em;
  margin: 0;
  color: var(--danger);
  font-size: 0.75rem;
  line-height: 1.2;
  text-align: center;
  visibility: hidden;
}

.qty-control__hint--visible {
  visibility: visible;
}

.qty-control :deep(.p-button) {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-color: var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--ink-soft);
}

.qty-control :deep(.p-inputnumber) {
  width: 3.75rem;
}

.qty-control :deep(input) {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.35rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  text-align: center;
}

@media (max-width: 960px) {
  .qty-control {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    column-gap: 1rem;
    row-gap: 0.25rem;
  }

  .qty-control > * {
    grid-column: 2;
  }

  .qty-control::before {
    grid-column: 1;
  }

  .qty-control__hint {
    text-align: right;
  }

  .qty-control__hint:not(.qty-control__hint--visible) {
    display: none;
  }
}
</style>

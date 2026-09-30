<template>
  <div class="order-line__alerts">
    <p v-if="isPending" class="order-line__notice order-line__notice--pending">
      <i class="pi pi-clock" aria-hidden="true" />
      Awaiting warehouse — select a warehouse to load price and stock.
    </p>

    <template v-else-if="isInvalid">
      <div v-if="hasPriceChange" class="order-line__notice">
        <p class="order-line__notice-title">
          <i class="pi pi-exclamation-circle" aria-hidden="true" />
          Price changed
        </p>
        <p>
          Price changed from {{ unitPriceLabel }} to
          {{ currentPriceLabel }}.
        </p>
        <p>Order price: {{ unitPriceLabel }}</p>
        <p>Current server price: {{ currentPriceLabel }}</p>
        <Button
          :label="acceptPriceLabel"
          size="small"
          rounded
          outlined
          severity="secondary"
          @click="onAcceptPrice"
        />
      </div>
      <p v-if="hasStockChange" class="order-line__notice">
        {{ stockMessage }}
      </p>
      <p v-if="isUnavailable" class="order-line__notice">Unavailable in this warehouse.</p>
      <p v-if="isUnverified" class="order-line__notice">Stock and price could not be verified.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { stockAvailabilityMessage } from '@/helpers/stock-message'
import { useOrderLineState } from '@/composables/order-builder/useOrderLineState'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItemAlerts' })

const props = defineProps<{
  item: OrderLine
}>()

const emit = defineEmits<{
  'accept-price': []
}>()

function onAcceptPrice() {
  emit('accept-price')
}

const {
  isPending,
  isInvalid,
  hasPriceChange,
  hasStockChange,
  isUnavailable,
  isUnverified,
  unitPriceLabel,
  currentPriceLabel,
} = useOrderLineState(() => props.item)

const stockMessage = computed(() => stockAvailabilityMessage(props.item.availableQuantity ?? 0))

const acceptPriceLabel = computed(() => `Use ${currentPriceLabel.value}`)
</script>

<style scoped>
.order-line__alerts {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.85rem;
  color: var(--danger);
}

.order-line__notice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}

.order-line__notice-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
}

.order-line__notice--pending {
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  color: var(--muted);
  font-size: 0.88rem;
}

.order-line__notice :deep(.p-button) {
  margin-top: 0.45rem;
  border-color: #d6d3d1;
  background: #fff;
  color: var(--ink-soft);
}
</style>

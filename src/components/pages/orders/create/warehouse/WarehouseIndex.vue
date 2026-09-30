<template>
  <SectionCard
    title="Warehouse"
    heading-id="warehouse-heading"
    lead="Stock and price follow the warehouse you select."
  >
    <WarehouseSkeleton v-if="loading" />

    <div v-else class="field">
      <ApiFailureNotice v-if="error" :message="error" @retry="onRetry" />

      <label class="field-label" for="selected-warehouse">Selected warehouse</label>
      <div class="field-control">
        <Select
          :model-value="selectedId"
          :options="warehouses"
          option-label="name"
          option-value="id"
          input-id="selected-warehouse"
          placeholder="Select a warehouse"
          overlay-class="warehouse-select-overlay"
          @update:model-value="onSelect"
        />
      </div>
      <p class="field-hint">Changing warehouse revalidates every line already in the order.</p>

      <ApiFailureNotice
        v-if="validationError"
        :message="validationError"
        @retry="onRetryValidation"
      />
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import Select from 'primevue/select'
import ApiFailureNotice from '@/components/ui/ApiFailureNotice.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import WarehouseSkeleton from '@/components/pages/orders/create/warehouse/components/skeleton/WarehouseSkeleton.vue'
import type { Warehouse } from '@/types/warehouse'

defineOptions({ name: 'WarehouseIndex' })

defineProps<{
  warehouses: Warehouse[]
  selectedId: number | null
  loading: boolean
  error: string | null
  validationError: string | null
}>()

const emit = defineEmits<{
  'update:selectedId': [warehouseId: number | null]
  retry: []
  retryValidation: []
}>()

function onSelect(warehouseId: number | null) {
  emit('update:selectedId', warehouseId)
}

function onRetry() {
  emit('retry')
}

function onRetryValidation() {
  emit('retryValidation')
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}

.field-label {
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 700;
}

.field-control {
  width: min(100%, 20.5rem);
}

.field-control :deep(.p-select) {
  width: 100%;
  border: 1px solid var(--border-input);
  border-radius: 10px;
  background: #fff;
  box-shadow: none;
  color: var(--ink);
}

.field-hint {
  color: var(--faint);
  font-size: 0.84rem;
  line-height: 1.4;
}
</style>

<style>
.warehouse-select-overlay {
  --p-select-option-color: var(--ink);
  --p-select-option-focus-color: var(--ink);
  --p-select-option-focus-background: var(--surface-hover);
  --p-select-option-selected-color: var(--ink);
  --p-select-option-selected-focus-color: var(--ink);
  --p-select-option-selected-background: var(--surface-hover);
  --p-select-option-selected-focus-background: var(--surface-hover);
}

.warehouse-select-overlay .p-select-option.p-select-option-selected,
.warehouse-select-overlay .p-select-option.p-select-option-selected.p-focus {
  background: var(--surface-hover);
  color: var(--ink);
}
</style>

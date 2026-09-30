<template>
  <fieldset class="stack">
    <legend>Failure simulation</legend>
    <p class="muted">
      These switches affect the next API request. They are not part of creating an order.
    </p>

    <label class="failure-toggle">
      <Checkbox
        :model-value="settings.failProductSearch"
        binary
        input-id="fail-search"
        @update:model-value="onToggle('failProductSearch', $event)"
      />
      <span>Fail product search</span>
    </label>

    <label class="failure-toggle">
      <Checkbox
        :model-value="settings.failWarehouseValidation"
        binary
        input-id="fail-validation"
        @update:model-value="onToggle('failWarehouseValidation', $event)"
      />
      <span>Fail warehouse validation</span>
    </label>

    <label class="failure-toggle">
      <Checkbox
        :model-value="settings.failOrderSubmit"
        binary
        input-id="fail-submit"
        @update:model-value="onToggle('failOrderSubmit', $event)"
      />
      <span>Fail order submission</span>
    </label>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
  </fieldset>
</template>

<script setup lang="ts">
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import type { DevSettings } from '@/types/dev-settings'

defineOptions({ name: 'ServerControlsFailure' })

defineProps<{
  settings: DevSettings
  error?: string | null
}>()

const emit = defineEmits<{
  'update-failure': [key: keyof DevSettings, enabled: boolean]
}>()

function onToggle(key: keyof DevSettings, value: unknown) {
  emit('update-failure', key, Boolean(value))
}
</script>

<style scoped>
fieldset {
  margin: 0;
  padding: 0.75rem 0 0;
  border: 0;
  border-top: 1px solid var(--p-content-border-color, #e5e7eb);
}

legend {
  padding: 0;
  font-weight: 600;
}

.failure-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

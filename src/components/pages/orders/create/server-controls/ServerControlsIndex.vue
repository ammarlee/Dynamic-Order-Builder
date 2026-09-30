<template>
  <Button label="Server Controls" icon="pi pi-wrench" severity="secondary" @click="open" />

  <Dialog
    v-model:visible="visible"
    header="Server Controls"
    modal
    :style="{ width: '34rem' }"
    :breakpoints="{ '640px': '95vw' }"
  >
    <p class="intro">
      Development tool for changing warehouse stock and price, or forcing the next request to fail.
    </p>

    <ServerControlsSkeleton v-if="loading" />

    <ApiFailureNotice v-else-if="loadError" :message="loadError" @retry="load" />

    <ServerControlsForm
      v-else-if="showForm"
      v-model:warehouse-id="warehouseId"
      v-model:product-id="productId"
      v-model:variant-id="variantId"
      v-model:available-quantity="availableQuantity"
      v-model:price="price"
      :warehouses="warehouses"
      :products="products"
      :variants="variants"
      :settings="settings"
      :saving="saving"
      :can-update="canUpdate"
      :save-error="saveError"
      :failure-error="failureError"
      @update-failure="setFailureFlag"
      @save="updateServerState"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ApiFailureNotice from '@/components/ui/ApiFailureNotice.vue'
import ServerControlsSkeleton from '@/components/pages/orders/create/server-controls/components/ServerControlsSkeleton.vue'
import { useServerControls } from '@/composables/server-controls/useServerControls'

defineOptions({ name: 'ServerControlsIndex' })

const ServerControlsForm = defineAsyncComponent(
  () => import('@/components/pages/orders/create/server-controls/components/ServerControlsForm.vue'),
)

const {
  visible,
  loading,
  loadError,
  showForm,
  saving,
  saveError,
  failureError,
  warehouses,
  products,
  variants,
  settings,
  warehouseId,
  productId,
  variantId,
  availableQuantity,
  price,
  canUpdate,
  open,
  load,
  updateServerState,
  setFailureFlag,
} = useServerControls()
</script>

<style scoped>
.intro {
  margin-bottom: 1rem;
  color: var(--muted);
}
</style>

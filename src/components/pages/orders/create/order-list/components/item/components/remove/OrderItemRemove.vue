<template>
  <button
    type="button"
    class="order-line__remove"
    aria-label="Remove item"
    @click="requestRemove"
  >
    Remove
  </button>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import type { OrderLine } from '@/types/order'

defineOptions({ name: 'OrderItemRemove' })

const props = defineProps<{
  item: OrderLine
}>()

const emit = defineEmits<{
  remove: []
}>()

const confirm = useConfirm()

function requestRemove() {
  confirm.require({
    header: 'Remove item',
    message: `Remove ${props.item.productName} / ${props.item.variantName} from this order?`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Remove',
    rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Remove', severity: 'danger' },
    accept: () => emit('remove'),
  })
}
</script>

<style scoped>
.order-line__remove {
  display: block;
  margin: 0.35rem 0 0 auto;
  padding: 0;
  border: 0;
  background: none;
  color: var(--danger);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>

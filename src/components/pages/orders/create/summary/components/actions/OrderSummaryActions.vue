<template>
  <div class="summary-actions">
    <Button label="Create Order" :disabled="isDisabled" @click="onSubmit" />
    <ApiFailureNotice v-if="submitError" :message="submitError" :show-retry="false" />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import ApiFailureNotice from '@/components/ui/ApiFailureNotice.vue'

defineOptions({ name: 'OrderSummaryActions' })

defineProps<{
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
.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>

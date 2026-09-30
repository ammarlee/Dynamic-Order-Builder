<template>
  <ApiFailureNotice v-if="warehouseError" :message="warehouseError" @retry="onRetry" />
</template>

<script setup lang="ts">
import ApiFailureNotice from '@/components/ui/ApiFailureNotice.vue'

defineOptions({ name: 'OrderValidationIndex' })

defineProps<{
  warehouseError: string | null
}>()

const emit = defineEmits<{
  retry: []
}>()

function onRetry() {
  emit('retry')
}
</script>

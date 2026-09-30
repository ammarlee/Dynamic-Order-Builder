<template>
  <Message class="api-failure" severity="error" :closable="false">
    <p class="api-failure__message">{{ message }}</p>
    <button v-if="showRetry" type="button" class="api-failure__retry" @click="onRetry">
      <i class="pi pi-refresh" aria-hidden="true" />
      Try again
    </button>
  </Message>
</template>

<script setup lang="ts">
import Message from 'primevue/message'

defineOptions({ name: 'ApiFailureNotice' })

withDefaults(
  defineProps<{
    message: string
    showRetry?: boolean
  }>(),
  { showRetry: true },
)

const emit = defineEmits<{
  retry: []
}>()

function onRetry() {
  emit('retry')
}
</script>

<style scoped>
.api-failure :deep(.p-message-text) {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
}

.api-failure__message {
  margin: 0;
  line-height: 1.45;
}

.api-failure__retry {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: underline;
  text-underline-offset: 0.18em;
  cursor: pointer;
}

.api-failure__retry .pi {
  font-size: 0.85em;
}

.api-failure__retry:hover {
  opacity: 0.8;
}

.api-failure__retry:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 2px;
}
</style>

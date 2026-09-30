<template>
  <div class="stack" aria-hidden="true">
    <div class="summary-row">
      <Skeleton width="5rem" height="1rem" />
      <Skeleton width="4rem" height="1rem" />
    </div>
    <div class="summary-row">
      <Skeleton width="5rem" height="1rem" />
      <Skeleton width="4rem" height="1rem" />
    </div>
    <div class="summary-row">
      <Skeleton width="6rem" height="1.25rem" />
      <Skeleton width="4.5rem" height="1.25rem" />
    </div>
    <Skeleton width="100%" height="2.75rem" />
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

defineOptions({ name: 'OrderSummarySkeleton' })
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
}
</style>

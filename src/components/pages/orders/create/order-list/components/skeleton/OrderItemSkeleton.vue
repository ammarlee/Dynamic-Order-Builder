<template>
  <div class="order-line" aria-hidden="true">
    <div class="order-line__row">
      <div class="stack">
        <Skeleton width="9rem" height="1rem" />
        <Skeleton width="5rem" height="0.8rem" />
      </div>
      <Skeleton width="6rem" height="1rem" />
      <Skeleton width="9.5rem" height="2.5rem" />
      <Skeleton width="3.5rem" height="1rem" />
      <Skeleton width="6rem" height="2.5rem" />
      <Skeleton width="4rem" height="1rem" />
      <Skeleton width="2rem" height="1rem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

defineOptions({ name: 'OrderItemSkeleton' })
</script>

<style scoped>
.order-line {
  min-width: 0;
  padding: 0.9rem 1rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface-raised);
}

.order-line__row {
  display: grid;
  grid-template-columns: var(--order-line-columns);
  gap: 0.75rem 1rem;
  align-items: center;
}

@media (max-width: 960px) {
  .order-line__row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

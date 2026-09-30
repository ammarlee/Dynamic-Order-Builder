<template>
  <div class="product-results" role="status" aria-label="Loading products">
    <div class="product-card">
      <div class="product-card__header">
        <Skeleton width="10rem" height="1rem" />
        <Skeleton width="5rem" height="0.8rem" />
        <Skeleton width="4.5rem" height="0.8rem" />
      </div>
      <div v-for="row in 2" :key="row" class="variant-row">
        <Skeleton width="8rem" height="1rem" />
        <Skeleton width="4.5rem" height="2.25rem" border-radius="999px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

defineOptions({ name: 'SearchSkeleton' })
</script>

<style scoped>
.product-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: min(22rem, 50vh);
  overflow: auto;
  overscroll-behavior: contain;
}

.product-card {
  min-width: 0;
  border: 1px solid #e6e1d6;
  border-radius: 14px;
  background: #fff;
}

.product-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.7rem;
  padding: 0.85rem 1rem 0.7rem;
}

.variant-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 0.75rem 1rem 0.85rem;
  border-top: 1px solid #efeae0;
}

@media (max-width: 640px) {
  .variant-row {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
</style>

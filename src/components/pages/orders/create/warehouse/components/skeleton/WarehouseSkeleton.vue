<template>
  <div class="field" aria-hidden="true">
    <Skeleton width="8.5rem" height="0.9rem" />
    <Skeleton width="20rem" height="2.6rem" border-radius="10px" />
    <Skeleton width="18rem" height="0.75rem" />
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

defineOptions({ name: 'WarehouseSkeleton' })
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}
</style>

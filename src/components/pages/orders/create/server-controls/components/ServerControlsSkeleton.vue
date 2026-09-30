<template>
  <div class="stack" aria-hidden="true">
    <Skeleton width="8rem" height="1rem" />
    <Skeleton width="100%" height="2.75rem" />
    <Skeleton width="8rem" height="1rem" />
    <Skeleton width="100%" height="2.75rem" />
    <Skeleton width="8rem" height="1rem" />
    <Skeleton width="100%" height="2.75rem" />
    <Skeleton width="100%" height="2.75rem" />
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

defineOptions({ name: 'ServerControlsSkeleton' })
</script>

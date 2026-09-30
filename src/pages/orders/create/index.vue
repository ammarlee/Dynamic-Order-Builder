<template>
  <main class="page">
    <OrderBuilderIndex />
  </main>
</template>

<script setup lang="ts">
import OrderBuilderIndex from '@/components/pages/orders/create/OrderBuilderIndex.vue'

defineOptions({ name: 'CreateOrderPage' })
</script>

<style scoped>
.page {
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}
</style>

<template>
  <div class="product-results">
    <article v-for="product in products" :key="product.id" class="product-card">
      <header class="product-card__header">
        <strong class="product-card__name">{{ product.name }}</strong>
        <span class="product-card__meta">SKU: {{ product.sku }}</span>
        <span class="product-card__meta">{{ variantLabel(product) }}</span>
      </header>

      <SearchResultItem
        v-for="variant in product.variants"
        :key="`${product.id}:${variant.id}`"
        :item="toProductSearchResult(product, variant)"
        :line="lineFor(product.id, variant.id)"
        @add="onAdd"
      />
    </article>
  </div>
</template>

<script setup lang="ts">
import SearchResultItem from '@/components/pages/orders/create/search/components/result/SearchResultItem.vue'
import { toProductSearchResult } from '@/services/products/helpers/to-product-search-result'
import type { OrderLine } from '@/types/order'
import type { CatalogProduct, ProductSearchResult } from '@/types/product'

defineOptions({ name: 'SearchResultList' })

const props = defineProps<{
  products: CatalogProduct[]
  orderItems: OrderLine[]
}>()

const emit = defineEmits<{
  add: [item: ProductSearchResult]
}>()

function onAdd(item: ProductSearchResult) {
  emit('add', item)
}

function lineFor(productId: number, variantId: number) {
  return props.orderItems.find(
    (line) => line.productId === productId && line.variantId === variantId,
  )
}

function variantLabel(product: CatalogProduct) {
  const count = product.variants.length
  return count === 1 ? '1 variant' : `${count} variants`
}
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

.product-card__name {
  color: var(--ink);
  overflow-wrap: anywhere;
}

.product-card__meta {
  color: var(--faint);
  font-size: 0.85rem;
}

.product-card :deep(.variant-row:hover) {
  background: var(--surface-hover);
}
</style>

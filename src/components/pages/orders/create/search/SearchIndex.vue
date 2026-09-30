<template>
  <SectionCard
    class="search-card"
    title="Search products"
    heading-id="search-heading"
    lead="Search by product name, then add a variant."
  >
    <div class="field">
      <label class="field-label" for="product-search">Product search</label>
      <div
        ref="searchRoot"
        class="search-anchor field-control"
        @pointerdown="openDropdown"
        @focusin="openDropdown"
      >
        <SearchInput id="product-search" v-model="query" />

        <div v-if="dropdownVisible" class="search-dropdown" role="region" aria-label="Search results">
          <SearchSuggestions
            v-if="!hasQuery"
            :suggestions="SEARCH_SUGGESTIONS"
            @select="onSuggestionSelect"
          />

          <SearchSkeleton v-else-if="isLoading" />

          <ApiFailureNotice
            v-else-if="isError && errorMessage"
            :message="errorMessage"
            @retry="retry"
          />

          <p v-else-if="isEmpty" class="muted">No products found.</p>

          <SearchResultList
            v-else-if="isSuccess"
            :products="results"
            :order-items="items"
            @add="onAdd"
          />
        </div>
      </div>
      <p v-if="!warehouseSelected" class="field-notice">
        Prices and stock load after you select a warehouse.
      </p>
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import ApiFailureNotice from '@/components/ui/ApiFailureNotice.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import SearchInput from '@/components/pages/orders/create/search/components/input/SearchInput.vue'
import SearchSkeleton from '@/components/pages/orders/create/search/components/skeleton/SearchSkeleton.vue'
import SearchSuggestions from '@/components/pages/orders/create/search/components/suggestions/SearchSuggestions.vue'
import { SEARCH_SUGGESTIONS } from '@/constants/search'
import { useClickOutside } from '@/composables/useClickOutside'
import { useProductSearch } from '@/composables/useProductSearch'
import type { OrderLine } from '@/types/order'
import type { ProductSearchResult } from '@/types/product'

defineOptions({ name: 'SearchIndex' })

const SearchResultList = defineAsyncComponent(
  () => import('@/components/pages/orders/create/search/components/result/SearchResultList.vue'),
)

const props = withDefaults(
  defineProps<{
    warehouseId: number | null
    items?: OrderLine[]
  }>(),
  { items: () => [] },
)

const emit = defineEmits<{
  add: [item: ProductSearchResult]
}>()

function onAdd(item: ProductSearchResult) {
  emit('add', item)
}

const warehouseSelected = computed(() => props.warehouseId != null)
const searchRoot = ref<HTMLElement | null>(null)
const dropdownOpen = ref(false)
const {
  query,
  results,
  errorMessage,
  showResults,
  isLoading,
  isError,
  isEmpty,
  isSuccess,
  retry,
  clear,
} = useProductSearch()
const hasQuery = computed(() => query.value.trim().length > 0)
const dropdownVisible = computed(
  () => dropdownOpen.value && (!hasQuery.value || showResults.value),
)

function openDropdown() {
  dropdownOpen.value = true
}

function onSuggestionSelect(suggestion: string) {
  query.value = suggestion
  searchRoot.value?.querySelector('input')?.focus()
}

useClickOutside(searchRoot, () => {
  dropdownOpen.value = false
  clear()
})

watch(hasQuery, (value) => {
  if (value) dropdownOpen.value = true
})
</script>

<style scoped>
.search-card {
  position: relative;
  z-index: 3;
  overflow: visible;
}

.search-card :deep(.p-card-body),
.search-card :deep(.p-card-content) {
  overflow: visible;
}

.field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}

.field-label {
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 700;
}

.field-control {
  width: 100%;
}

.field-notice {
  color: var(--faint);
  font-size: 0.84rem;
  line-height: 1.4;
}

.search-anchor {
  position: relative;
}

.search-dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.4rem);
  left: 0;
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #e6e1d6;
  border-radius: 14px;
  background: var(--surface-raised);
  box-shadow: 0 16px 40px rgba(28, 25, 23, 0.14);
}
</style>

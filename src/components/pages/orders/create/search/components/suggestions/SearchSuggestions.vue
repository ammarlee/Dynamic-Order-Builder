<template>
  <div class="search-suggestions">
    <p class="search-suggestions__label">Try searching for</p>
    <ul class="search-suggestions__list">
      <li v-for="suggestion in suggestions" :key="suggestion">
        <button type="button" class="search-suggestions__badge" @click="emit('select', suggestion)">
          <i class="pi pi-search" aria-hidden="true" />
          {{ suggestion }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SearchSuggestions' })

defineProps<{
  suggestions: readonly string[]
}>()

const emit = defineEmits<{
  select: [suggestion: string]
}>()
</script>

<style scoped>
.search-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.2rem 0.25rem;
}

.search-suggestions__label {
  margin: 0;
  color: var(--faint);
  font-size: 0.84rem;
}

.search-suggestions__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.search-suggestions__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid #e6e1d6;
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
}

.search-suggestions__badge .pi {
  color: var(--muted);
  font-size: 0.75rem;
}

.search-suggestions__badge:hover {
  background: var(--surface-hover);
}

.search-suggestions__badge:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
</style>

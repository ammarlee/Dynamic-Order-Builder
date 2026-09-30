<template>
  <Card class="section-card">
    <template #content>
      <div :class="{ stack: $slots.prepend }">
        <slot name="prepend" />
        <section :aria-labelledby="headingId">
          <h2 :id="headingId" class="section-title">{{ title }}</h2>
          <p v-if="lead" class="section-lead">{{ lead }}</p>
          <slot />
        </section>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'

defineOptions({ name: 'SectionCard' })

defineProps<{
  title: string
  headingId: string
  lead?: string
}>()
</script>

<style scoped>
.section-card {
  border: 1px solid var(--border-card);
  border-radius: 18px;
  background: var(--surface-card);
  box-shadow: none;
  color: var(--ink);
}

.section-card :deep(.p-card-body) {
  padding: 1.35rem 1.45rem 1.3rem;
}

.section-card :deep(.p-card-content) {
  color: var(--ink);
}
</style>

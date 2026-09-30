<template>
  <div class="search-input">
    <InputText
      v-bind="$attrs"
      :class="{ 'search-input__field--clearable': hasQuery }"
      :model-value="modelValue"
      type="text"
      placeholder="Search by name"
      aria-label="Product search"
      autocomplete="off"
      :disabled="disabled"
      @update:model-value="onInput"
    />
    <button
      v-if="hasQuery"
      type="button"
      class="search-input__clear"
      aria-label="Clear search"
      :disabled="disabled"
      @click="onClear"
    >
      <i class="pi pi-times" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'

defineOptions({ name: 'SearchInput', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const hasQuery = computed(() => props.modelValue.length > 0)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(value: string | undefined) {
  emit('update:modelValue', String(value ?? ''))
}

function onClear() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.search-input {
  position: relative;
  width: 100%;
}

.search-input :deep(.p-inputtext) {
  width: 100%;
  border: 1px solid var(--border-input);
  border-radius: 10px;
  background: #fff;
  box-shadow: none;
  color: var(--ink);
}

.search-input :deep(.p-inputtext:-webkit-autofill),
.search-input :deep(.p-inputtext:-webkit-autofill:hover),
.search-input :deep(.p-inputtext:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0 1000px #fff inset;
  -webkit-text-fill-color: var(--ink);
  caret-color: var(--ink);
}

.search-input :deep(.p-inputtext:disabled) {
  border-color: var(--border);
  background: var(--input-bg-disabled);
  color: var(--faint);
  opacity: 0.7;
  cursor: not-allowed;
}

.search-input :deep(.search-input__field--clearable) {
  padding-right: 2.35rem;
}

.search-input__clear {
  position: absolute;
  top: 50%;
  right: 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  transform: translateY(-50%);
  cursor: pointer;
}

.search-input__clear:hover {
  background: var(--surface-page);
  color: var(--ink);
}
</style>

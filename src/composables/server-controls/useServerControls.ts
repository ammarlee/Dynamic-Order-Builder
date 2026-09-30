import { computed, ref } from 'vue'
import { UI_MESSAGES } from '@/constants/messages'
import { useFailureFlags } from '@/composables/server-controls/useFailureFlags'
import { useServerControlsCatalog } from '@/composables/server-controls/useServerControlsCatalog'
import { useWarehouseStockEditor } from '@/composables/server-controls/useWarehouseStockEditor'

export function useServerControls() {
  const catalog = useServerControlsCatalog()
  const failureFlags = useFailureFlags()
  const editor = useWarehouseStockEditor(catalog.products)

  const visible = ref(false)
  const loading = ref(false)
  const loadError = ref<string | null>(null)

  const hasLoadError = computed(() => Boolean(loadError.value))
  const showForm = computed(() => !loading.value && !hasLoadError.value)

  async function load() {
    loading.value = true
    loadError.value = null

    try {
      await Promise.all([catalog.load(), failureFlags.load()])
      await editor.loadSelectedStock()
    } catch {
      loadError.value = UI_MESSAGES.serverControls.loadFailed
    } finally {
      loading.value = false
    }
  }

  function open() {
    visible.value = true
    void load()
  }

  return {
    visible,
    loading,
    loadError,
    hasLoadError,
    showForm,
    warehouses: catalog.warehouses,
    products: catalog.products,
    settings: failureFlags.settings,
    failureError: failureFlags.error,
    setFailureFlag: failureFlags.setFailureFlag,
    ...editor,
    open,
    load,
  }
}

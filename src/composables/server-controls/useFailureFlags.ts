import { ref } from 'vue'
import { getDevSettings, updateDevSettings } from '@/services/dev-settings'
import { UI_MESSAGES } from '@/constants/messages'
import type { DevSettings } from '@/types/dev-settings'

const emptySettings = (): DevSettings => ({
  failProductSearch: false,
  failWarehouseValidation: false,
  failOrderSubmit: false,
})

export function useFailureFlags() {
  const settings = ref<DevSettings>(emptySettings())
  const error = ref<string | null>(null)

  async function load() {
    settings.value = await getDevSettings()
  }

  async function setFailureFlag(key: keyof DevSettings, enabled: boolean) {
    const previous = settings.value[key]
    settings.value = { ...settings.value, [key]: enabled }
    error.value = null

    try {
      settings.value = await updateDevSettings({ [key]: enabled })
    } catch {
      settings.value = { ...settings.value, [key]: previous }
      error.value = UI_MESSAGES.serverControls.failureFlagFailed
    }
  }

  return { settings, error, load, setFailureFlag }
}

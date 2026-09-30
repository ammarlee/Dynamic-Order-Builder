import { apiRequest } from '@/services/api'
import type { DevSettings } from '@/types/dev-settings'

export async function getDevSettings(signal?: AbortSignal): Promise<DevSettings> {
  return apiRequest<DevSettings>('/dev-settings', { signal })
}

export async function updateDevSettings(patch: Partial<DevSettings>): Promise<DevSettings> {
  return apiRequest<DevSettings>('/dev-settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

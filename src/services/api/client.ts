import { isRecord } from '@/helpers/async'
import { ApiError } from '@/services/api/errors'

const API_BASE = '/api'

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const body = await readBody(response)

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === 'string' ? body.message : 'Request failed'
    throw new ApiError(message, response.status, body)
  }

  return body as T
}

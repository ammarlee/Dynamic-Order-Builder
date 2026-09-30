import { apiRequest } from '@/services/api'
import type { CreateOrderResponseDto } from '../types/dto'
import type { CreateOrderPayload } from '../types/order'

export async function createOrderRequest(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponseDto> {
  return apiRequest<CreateOrderResponseDto>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useOrderBuilder } from '@/composables/order-builder/useOrderBuilder'
import { UI_MESSAGES } from '@/constants/messages'
import type { ProductSearchResult } from '@/types/product'
import type { WarehouseValidationResult } from '@/types/stock'
import type { CreateOrderPayload, CreateOrderResult } from '@/services/orders'

const toastAdd = vi.fn<(message: { detail?: string }) => void>()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: toastAdd }),
}))

vi.mock('@/services/warehouses', () => ({
  getWarehouses: vi.fn<() => Promise<Array<{ id: number; name: string }>>>().mockResolvedValue([
    { id: 1, name: 'Warehouse A' },
    { id: 2, name: 'Warehouse B' },
    { id: 3, name: 'Warehouse C' },
  ]),
}))

vi.mock('@/services/stock', () => ({
  validateWarehouseStock:
    vi.fn<
      (warehouseId: number, signal?: AbortSignal) => Promise<WarehouseValidationResult>
    >(),
}))

vi.mock('@/services/orders', () => ({
  createOrder: vi.fn<(payload: CreateOrderPayload) => Promise<CreateOrderResult>>(),
}))

import { validateWarehouseStock } from '@/services/stock'
import { createOrder } from '@/services/orders'

const validateMock = vi.mocked(validateWarehouseStock)
const createOrderMock = vi.mocked(createOrder)

function variant(overrides: Partial<ProductSearchResult> = {}): ProductSearchResult {
  return {
    productId: 1,
    variantId: 2,
    productName: 'Premium Bag',
    variantName: 'Large',
    sku: 'BAG-100',
    ...overrides,
  }
}

function validation(
  warehouseId: number,
  price = 4.5,
  availableQuantity = 12,
): WarehouseValidationResult {
  return {
    warehouseId,
    items: [
      { productId: 1, variantId: 2, price, availableQuantity, unavailable: false },
      { productId: 2, variantId: 3, price, availableQuantity, unavailable: false },
    ],
  }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

async function builderWithLine(warehouseId = 1) {
  const builder = useOrderBuilder()
  await builder.selectWarehouse(warehouseId)
  await builder.addProduct(variant())
  return builder
}

describe('useOrderBuilder', () => {
  beforeEach(() => {
    toastAdd.mockReset()
    validateMock.mockReset()
    createOrderMock.mockReset()
    validateMock.mockImplementation(async (warehouseId) => validation(warehouseId))
  })

  describe('adding products', () => {
    it('increases quantity when the same variant is added again', async () => {
      const builder = await builderWithLine()
      await builder.addProduct(variant())

      expect(builder.items.value).toHaveLength(1)
      expect(builder.items.value[0]?.quantity).toBe(2)
      expect(builder.items.value[0]?.unitPrice).toBe(4.5)
      expect(toastAdd).toHaveBeenLastCalledWith(
        expect.objectContaining({ detail: UI_MESSAGES.toasts.incrementedDetail(2) }),
      )
    })

    it('stops adding a variant once the ordered quantity reaches stock', async () => {
      validateMock.mockImplementation(async (warehouseId) => validation(warehouseId, 4.5, 2))
      const builder = await builderWithLine()
      await builder.addProduct(variant())
      await builder.addProduct(variant())

      expect(builder.items.value[0]?.quantity).toBe(2)
      expect(toastAdd).toHaveBeenCalledTimes(2)
    })
  })

  describe('editing lines', () => {
    it('updates quantity, ignores zero and negative values, and removes a line', async () => {
      const builder = await builderWithLine()

      builder.updateQuantity(1, 2, 4)
      expect(builder.items.value[0]?.quantity).toBe(4)

      builder.updateQuantity(1, 2, 0)
      builder.updateQuantity(1, 2, -3)
      expect(builder.items.value[0]?.quantity).toBe(4)

      builder.removeItem(1, 2)
      expect(builder.items.value).toEqual([])
      expect(builder.canSubmit.value).toBe(false)
    })

    it('applies a line discount to the totals and blocks a discount above the line total', async () => {
      const builder = await builderWithLine()
      builder.updateQuantity(1, 2, 2)

      builder.updateDiscount(1, 2, 1)
      expect(builder.totals.value).toEqual({ subtotal: 9, discount: 1, finalTotal: 8 })
      expect(builder.canSubmit.value).toBe(true)

      builder.updateDiscount(1, 2, 20)
      expect(builder.discountError.value).toBe(UI_MESSAGES.order.discountExceedsTotal)
      expect(builder.submitDisabledReason.value).toBe(UI_MESSAGES.order.discountExceedsTotal)
      expect(builder.canSubmit.value).toBe(false)
    })
  })

  describe('warehouse selection', () => {
    it('adds lines as pending until a warehouse is selected', async () => {
      const builder = useOrderBuilder()
      await builder.addProduct(variant())

      expect(builder.items.value[0]?.validationStatus).toBe('pending')
      expect(validateMock).not.toHaveBeenCalled()
      expect(builder.submitDisabledReason.value).toBe(UI_MESSAGES.order.selectWarehouse)
      expect(builder.canSubmit.value).toBe(false)

      await builder.selectWarehouse(1)

      expect(builder.items.value[0]?.validationStatus).toBe('valid')
      expect(builder.items.value[0]?.unitPrice).toBe(4.5)
      expect(builder.canSubmit.value).toBe(true)
    })

    it('resets lines to pending when the warehouse is cleared', async () => {
      const builder = await builderWithLine()
      builder.updateDiscount(1, 2, 1)

      await builder.selectWarehouse(null)

      const [line] = builder.items.value
      expect(line?.validationStatus).toBe('pending')
      expect(line?.unitPrice).toBe(0)
      expect(line?.discount).toBe(0)
      expect(builder.canSubmit.value).toBe(false)
    })

    it('flags a price change on warehouse switch and keeps the accepted price until chosen', async () => {
      const builder = await builderWithLine()
      validateMock.mockResolvedValue(validation(2, 5, 12))

      await builder.selectWarehouse(2)

      expect(builder.items.value[0]?.unitPrice).toBe(4.5)
      expect(builder.items.value[0]?.currentPrice).toBe(5)
      expect(builder.items.value[0]?.validationErrors).toContain('price_changed')
      expect(builder.canSubmit.value).toBe(false)

      builder.acceptCurrentPrice(1, 2)

      expect(builder.items.value[0]?.unitPrice).toBe(5)
      expect(builder.items.value[0]?.validationStatus).toBe('valid')
      expect(builder.canSubmit.value).toBe(true)
    })

    it('ignores an older warehouse response that arrives late', async () => {
      const warehouseB = deferred<WarehouseValidationResult>()
      const warehouseC = deferred<WarehouseValidationResult>()
      const builder = await builderWithLine()
      validateMock
        .mockImplementationOnce(() => warehouseB.promise)
        .mockImplementationOnce(() => warehouseC.promise)

      const pendingB = builder.selectWarehouse(2)
      const pendingC = builder.selectWarehouse(3)

      warehouseC.resolve(validation(3, 4, 8))
      await pendingC
      warehouseB.resolve(validation(2, 5, 2))
      await pendingB

      expect(builder.items.value[0]?.currentPrice).toBe(4)
      expect(builder.items.value[0]?.availableQuantity).toBe(8)
    })

    it('keeps the order and blocks submit when warehouse validation fails', async () => {
      const builder = await builderWithLine()
      builder.updateQuantity(1, 2, 3)
      validateMock.mockRejectedValue(new Error('offline'))

      await builder.selectWarehouse(2)

      expect(builder.items.value[0]?.quantity).toBe(3)
      expect(builder.warehouseValidationError.value).toBe(
        UI_MESSAGES.warehouses.validationFailed,
      )
      expect(builder.canSubmit.value).toBe(false)
    })
  })

  describe('submitting', () => {
    it('sends the accepted price and line discount, then resets the order', async () => {
      createOrderMock.mockResolvedValue({ ok: true, orderId: 10 })
      const builder = await builderWithLine()
      builder.updateDiscount(1, 2, 0.5)

      await builder.submitOrder()

      expect(createOrderMock).toHaveBeenCalledWith({
        warehouse_id: 1,
        discount: 0.5,
        items: [{ product_id: 1, variant_id: 2, quantity: 1, unit_price: 4.5, discount: 0.5 }],
      })
      expect(builder.items.value).toEqual([])
      expect(builder.warehouseId.value).toBe(1)
      expect(toastAdd).toHaveBeenLastCalledWith(
        expect.objectContaining({ severity: 'success', detail: UI_MESSAGES.toasts.createdDetail }),
      )
    })

    it('maps server validation errors onto the matching lines and keeps the order', async () => {
      createOrderMock.mockResolvedValue({
        ok: false,
        kind: 'validation',
        errors: [
          {
            productId: 1,
            variantId: 2,
            type: 'stock_changed',
            requestedQuantity: 2,
            availableQuantity: 1,
          },
          { productId: 1, variantId: 2, type: 'price_changed', oldPrice: 4.5, newPrice: 5.5 },
          { productId: 2, variantId: 3, type: 'unavailable' },
        ],
      })
      const builder = await builderWithLine()
      builder.updateQuantity(1, 2, 2)
      await builder.addProduct(
        variant({ productId: 2, variantId: 3, productName: 'Canvas Tote', variantName: 'Medium' }),
      )

      await builder.submitOrder()

      const bag = builder.items.value.find((line) => line.variantId === 2)
      const tote = builder.items.value.find((line) => line.variantId === 3)
      expect(bag?.quantity).toBe(2)
      expect(bag?.availableQuantity).toBe(1)
      expect(bag?.currentPrice).toBe(5.5)
      expect(bag?.validationErrors).toEqual(['stock_changed', 'price_changed'])
      expect(tote?.validationErrors).toEqual(['unavailable'])
      expect(builder.canSubmit.value).toBe(false)
      expect(toastAdd).toHaveBeenLastCalledWith(
        expect.objectContaining({ severity: 'warn', detail: UI_MESSAGES.order.submitRejected }),
      )
    })

    it('keeps the order and shows an error when submission fails unexpectedly', async () => {
      createOrderMock.mockRejectedValue(new Error('boom'))
      const builder = await builderWithLine()

      await builder.submitOrder()

      expect(builder.items.value).toHaveLength(1)
      expect(builder.submitError.value).toBe(UI_MESSAGES.order.submitFailed)
    })

    it('ignores a second submit while the first is in flight', async () => {
      const order = deferred<CreateOrderResult>()
      createOrderMock.mockImplementation(() => order.promise)
      const builder = await builderWithLine()

      const first = builder.submitOrder()
      const second = builder.submitOrder()
      expect(builder.submitting.value).toBe(true)

      order.resolve({ ok: true, orderId: 4 })
      await Promise.all([first, second])

      expect(createOrderMock).toHaveBeenCalledTimes(1)
    })
  })
})

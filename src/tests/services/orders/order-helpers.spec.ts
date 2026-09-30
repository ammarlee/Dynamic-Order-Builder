import { describe, expect, it } from 'vitest'
import {
  calculateFinalTotal,
  calculateSubtotal,
  isDiscountValid,
  lineTotal,
} from '@/services/orders/helpers/order-calculations'
import { buildOrderPayload, createOrderLine } from '@/services/orders/helpers/order-mappers'
import {
  applySubmissionErrors,
  applyWarehouseValidation,
  canAddVariant,
  isLineReady,
  lineKey,
  markLinesPending,
  markLinesValidating,
} from '@/services/orders/helpers/order-validation'
import type { OrderLine } from '@/types/order'
import type { ProductSearchResult } from '@/types/product'

function result(overrides: Partial<ProductSearchResult> = {}): ProductSearchResult {
  return {
    productId: 1,
    variantId: 2,
    productName: 'Premium Bag',
    variantName: 'Large',
    sku: 'BAG-100',
    ...overrides,
  }
}

function acceptedLine(overrides: Partial<OrderLine> = {}): OrderLine {
  return {
    ...createOrderLine(result()),
    unitPrice: 4.5,
    currentPrice: 4.5,
    availableQuantity: 12,
    priceAccepted: true,
    validationStatus: 'valid',
    validationErrors: [],
    ...overrides,
  }
}

describe('order calculations', () => {
  it('sums line totals in cents', () => {
    expect(lineTotal(2, 4.5)).toBe(9)
    expect(
      calculateSubtotal([
        { quantity: 1, unitPrice: 0.1 },
        { quantity: 1, unitPrice: 0.2 },
      ]),
    ).toBe(0.3)
  })

  it('subtracts an order-level discount and never goes negative', () => {
    expect(calculateFinalTotal(100, 10)).toBe(90)
    expect(calculateFinalTotal(9, 10)).toBe(0)
    expect(isDiscountValid(10, 100)).toBe(true)
    expect(isDiscountValid(10, 9)).toBe(false)
    expect(isDiscountValid(-1, 9)).toBe(false)
  })
})

describe('order validation helpers', () => {
  it('blocks another add once the ordered quantity reaches stock', () => {
    expect(canAddVariant(undefined)).toBe(true)
    expect(canAddVariant(acceptedLine({ quantity: 1, availableQuantity: 2 }))).toBe(true)
    expect(canAddVariant(acceptedLine({ quantity: 2, availableQuantity: 2 }))).toBe(false)
    expect(canAddVariant(acceptedLine({ quantity: 0, availableQuantity: 0 }))).toBe(false)
    expect(canAddVariant(acceptedLine({ unavailable: true, availableQuantity: 4 }))).toBe(false)
  })

  it('accepts the warehouse price the first time a line is validated', () => {
    const [updated] = applyWarehouseValidation(
      [createOrderLine(result())],
      [
        {
          productId: 1,
          variantId: 2,
          availableQuantity: 12,
          price: 4.5,
          unavailable: false,
        },
      ],
      new Set([lineKey(1, 2)]),
    )

    expect(updated?.unitPrice).toBe(4.5)
    expect(updated?.currentPrice).toBe(4.5)
    expect(updated?.priceAccepted).toBe(true)
    expect(updated?.validationStatus).toBe('valid')
  })

  it('keeps the accepted price when the warehouse price changes', () => {
    const line = acceptedLine()
    const requested = new Set([lineKey(line.productId, line.variantId)])
    const [updated] = applyWarehouseValidation(
      [line],
      [
        {
          productId: 1,
          variantId: 2,
          availableQuantity: 2,
          price: 5,
          unavailable: false,
        },
      ],
      requested,
    )

    expect(updated?.unitPrice).toBe(4.5)
    expect(updated?.quantity).toBe(1)
    expect(updated?.currentPrice).toBe(5)
    expect(updated?.availableQuantity).toBe(2)
    expect(updated?.validationErrors).toEqual(['price_changed'])
    expect(updated?.validationStatus).toBe('invalid')
  })

  it('keeps the requested quantity when stock is lower', () => {
    const line = acceptedLine({ quantity: 5 })
    const [updated] = applyWarehouseValidation(
      [line],
      [
        {
          productId: 1,
          variantId: 2,
          availableQuantity: 2,
          price: 4.5,
          unavailable: false,
        },
      ],
      new Set([lineKey(1, 2)]),
    )

    expect(updated?.quantity).toBe(5)
    expect(updated?.validationErrors).toEqual(['stock_changed'])
  })

  it('marks a missing stock record unavailable without removing the line', () => {
    const line = createOrderLine(result())
    const [updated] = applyWarehouseValidation([line], [], new Set([lineKey(1, 2)]))

    expect(updated).toBeDefined()
    expect(updated?.unavailable).toBe(true)
    expect(updated?.validationErrors).toEqual(['unavailable'])
  })

  it('records stock and price conflicts on the same line', () => {
    const line = acceptedLine()
    const [updated] = applySubmissionErrors(
      [{ ...line, quantity: 5 }],
      [
        {
          productId: 1,
          variantId: 2,
          type: 'stock_changed',
          requestedQuantity: 5,
          availableQuantity: 2,
        },
        {
          productId: 1,
          variantId: 2,
          type: 'price_changed',
          oldPrice: 4.5,
          newPrice: 5,
        },
      ],
    )

    expect(updated?.quantity).toBe(5)
    expect(updated?.unitPrice).toBe(4.5)
    expect(updated?.currentPrice).toBe(5)
    expect(updated?.availableQuantity).toBe(2)
    expect(updated?.validationErrors).toEqual(['stock_changed', 'price_changed'])
  })

  it('ignores a validation result for lines that were not in the request', () => {
    const existing = acceptedLine()
    const addedLater = acceptedLine({
      productId: 2,
      variantId: 3,
      productName: 'Canvas Tote',
      unitPrice: 12,
      currentPrice: 12,
    })
    const [first, second] = applyWarehouseValidation(
      markLinesValidating([existing, addedLater]).map((line, index) =>
        index === 1 ? addedLater : line,
      ),
      [
        {
          productId: 1,
          variantId: 2,
          availableQuantity: 2,
          price: 5,
          unavailable: false,
        },
      ],
      new Set([lineKey(1, 2)]),
    )

    expect(first?.currentPrice).toBe(5)
    expect(second?.unitPrice).toBe(12)
    expect(second?.validationStatus).toBe('valid')
  })

  it('builds a payload that includes the accepted unit price', () => {
    const line = acceptedLine()
    expect(buildOrderPayload(1, 1.5, [line])).toEqual({
      warehouse_id: 1,
      discount: 1.5,
      items: [
        {
          product_id: 1,
          variant_id: 2,
          quantity: 1,
          unit_price: 4.5,
        },
      ],
    })
  })

  it('does not include lines that were removed', () => {
    const lines: OrderLine[] = []
    expect(buildOrderPayload(1, 0, lines).items).toEqual([])
  })
})

describe('pending-warehouse flow helpers', () => {
  it('creates a pending line when no warehouse is provided', () => {
    const line = createOrderLine(result(), false)
    expect(line.validationStatus).toBe('pending')
    expect(line.unitPrice).toBe(0)
    expect(line.priceAccepted).toBe(false)
    expect(line.availableQuantity).toBeNull()
  })

  it('creates a validating line when a warehouse is provided', () => {
    const line = createOrderLine(result(), true)
    expect(line.validationStatus).toBe('validating')
  })

  it('isLineReady returns false for a pending line', () => {
    const line = createOrderLine(result(), false)
    expect(isLineReady(line)).toBe(false)
  })

  it('markLinesPending resets price, stock and status on every line', () => {
    const lines = [acceptedLine(), acceptedLine({ productId: 2, variantId: 3 })]
    const pending = markLinesPending(lines)

    for (const line of pending) {
      expect(line.validationStatus).toBe('pending')
      expect(line.unitPrice).toBe(0)
      expect(line.priceAccepted).toBe(false)
      expect(line.currentPrice).toBeNull()
      expect(line.availableQuantity).toBeNull()
      expect(line.unavailable).toBe(false)
      expect(line.validationErrors).toEqual([])
    }
  })

  it('canAddVariant always returns true for a pending line', () => {
    const line = createOrderLine(result(), false)
    expect(canAddVariant(line)).toBe(true)

    const pendingWithQuantity = { ...line, quantity: 999 }
    expect(canAddVariant(pendingWithQuantity)).toBe(true)
  })
})

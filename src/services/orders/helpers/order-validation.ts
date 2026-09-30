import { toCents } from '@/helpers/format-money'
import { ORDER_ERROR_CODES } from '../errors/error-codes'
import type { OrderLineError } from '../types/order'
import type { OrderLine, ValidationErrorType } from '@/types/order'
import type { ValidatedStockItem } from '@/types/stock'

export function lineKey(productId: number, variantId: number): string {
  return `${productId}:${variantId}`
}

type LineStatusFields = Pick<OrderLine, 'validationStatus'>

export function isLinePending(line: LineStatusFields): boolean {
  return line.validationStatus === 'pending'
}

export function isLineValidating(line: LineStatusFields): boolean {
  return line.validationStatus === 'validating'
}

export function isLineInvalid(line: LineStatusFields): boolean {
  return line.validationStatus === 'invalid'
}

export function lineHasError(
  line: Pick<OrderLine, 'validationErrors'>,
  code: ValidationErrorType,
): boolean {
  return line.validationErrors.includes(code)
}

export function isLineUnverified(
  line: Pick<OrderLine, 'validationStatus' | 'validationErrors' | 'availableQuantity'>,
): boolean {
  return (
    isLineInvalid(line) && line.validationErrors.length === 0 && line.availableQuantity == null
  )
}

export function canAddVariant(
  line?: Pick<OrderLine, 'unavailable' | 'availableQuantity' | 'quantity' | 'validationStatus'>,
): boolean {
  if (!line) return true
  if (line.validationStatus === 'pending') return true
  if (line.unavailable) return false
  if (line.availableQuantity == null) return true
  return line.quantity < line.availableQuantity
}

export function deriveLineIssues(
  line: Pick<
    OrderLine,
    'quantity' | 'unitPrice' | 'currentPrice' | 'availableQuantity' | 'unavailable'
  >,
): ValidationErrorType[] {
  if (line.unavailable) return [ORDER_ERROR_CODES.UNAVAILABLE]
  if (line.availableQuantity == null || line.currentPrice == null) return []

  const errors: ValidationErrorType[] = []
  if (line.quantity > line.availableQuantity) errors.push(ORDER_ERROR_CODES.STOCK_CHANGED)
  if (toCents(line.unitPrice) !== toCents(line.currentPrice)) {
    errors.push(ORDER_ERROR_CODES.PRICE_CHANGED)
  }
  return errors
}

export function withDerivedValidation(line: OrderLine): OrderLine {
  if (line.validationStatus === 'validating' || line.validationStatus === 'pending') return line

  if (!line.unavailable && (line.availableQuantity == null || line.currentPrice == null)) {
    return {
      ...line,
      validationStatus: 'invalid',
      validationErrors: [],
    }
  }

  const validationErrors = deriveLineIssues(line)
  return {
    ...line,
    validationErrors,
    validationStatus: validationErrors.length > 0 ? 'invalid' : 'valid',
  }
}

export function isLineReady(line: OrderLine): boolean {
  return (
    line.validationStatus === 'valid' && line.validationErrors.length === 0 && !line.unavailable
  )
}

export function markLinesValidating(lines: OrderLine[]): OrderLine[] {
  return lines.map((line) => ({
    ...line,
    validationStatus: 'validating',
    validationErrors: [],
    currentPrice: null,
    availableQuantity: null,
    unavailable: false,
  }))
}

export function markLinesUnverified(lines: OrderLine[]): OrderLine[] {
  return lines.map((line) => ({
    ...line,
    validationStatus: 'invalid',
    validationErrors: [],
    currentPrice: null,
    availableQuantity: null,
    unavailable: false,
  }))
}

export function markLinesPending(lines: OrderLine[]): OrderLine[] {
  return lines.map((line) => ({
    ...line,
    validationStatus: 'pending',
    validationErrors: [],
    currentPrice: null,
    availableQuantity: null,
    unavailable: false,
    unitPrice: 0,
    discount: 0,
    priceAccepted: false,
  }))
}

function unavailableLine(line: OrderLine): OrderLine {
  return {
    ...line,
    unavailable: true,
    currentPrice: null,
    availableQuantity: null,
    validationStatus: 'invalid',
    validationErrors: [ORDER_ERROR_CODES.UNAVAILABLE],
  }
}

export function applyWarehouseValidation(
  lines: OrderLine[],
  serverItems: ValidatedStockItem[],
  requestedKeys: ReadonlySet<string>,
): OrderLine[] {
  return lines.map((line) => {
    const key = lineKey(line.productId, line.variantId)
    if (!requestedKeys.has(key)) return line

    const match = serverItems.find(
      (item) => item.productId === line.productId && item.variantId === line.variantId,
    )

    if (!match || match.unavailable || match.price == null || match.availableQuantity == null) {
      return unavailableLine(line)
    }

    const unitPrice = line.priceAccepted ? line.unitPrice : match.price

    return withDerivedValidation({
      ...line,
      unavailable: false,
      unitPrice,
      priceAccepted: true,
      currentPrice: match.price,
      availableQuantity: match.availableQuantity,
      validationStatus: 'valid',
      validationErrors: [],
    })
  })
}

export function applySubmissionErrors(lines: OrderLine[], errors: OrderLineError[]): OrderLine[] {
  const grouped = new Map<string, OrderLineError[]>()

  for (const error of errors) {
    const key = lineKey(error.productId, error.variantId)
    const current = grouped.get(key) ?? []
    current.push(error)
    grouped.set(key, current)
  }

  return lines.map((line) => {
    const lineErrors = grouped.get(lineKey(line.productId, line.variantId))
    if (!lineErrors || lineErrors.length === 0) return line

    if (lineErrors.some((error) => error.type === ORDER_ERROR_CODES.UNAVAILABLE)) {
      return unavailableLine(line)
    }

    let next: OrderLine = { ...line, unavailable: false }

    for (const error of lineErrors) {
      if (error.type === ORDER_ERROR_CODES.STOCK_CHANGED && error.availableQuantity != null) {
        next = { ...next, availableQuantity: error.availableQuantity }
      }
      if (error.type === ORDER_ERROR_CODES.PRICE_CHANGED && error.newPrice != null) {
        next = { ...next, currentPrice: error.newPrice }
      }
    }

    return withDerivedValidation({
      ...next,
      validationStatus: 'valid',
    })
  })
}

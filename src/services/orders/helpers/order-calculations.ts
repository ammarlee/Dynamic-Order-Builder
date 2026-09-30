import { toCents } from '@/helpers/format-money'

export function lineTotal(quantity: number, unitPrice: number): number {
  return (quantity * toCents(unitPrice)) / 100
}

export function lineNetTotal(quantity: number, unitPrice: number, discount: number): number {
  return Math.max(0, quantity * toCents(unitPrice) - toCents(discount)) / 100
}

export function calculateSubtotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  const cents = items.reduce((sum, item) => sum + item.quantity * toCents(item.unitPrice), 0)
  return cents / 100
}

export function calculateTotalDiscount(items: Array<{ discount: number }>): number {
  const cents = items.reduce((sum, item) => sum + toCents(item.discount), 0)
  return cents / 100
}

export function calculateFinalTotal(subtotal: number, discount: number): number {
  return Math.max(0, toCents(subtotal) - toCents(discount)) / 100
}

export function isDiscountValid(discount: number, subtotal: number): boolean {
  return Number.isFinite(discount) && discount >= 0 && toCents(discount) <= toCents(subtotal)
}

export function isLineDiscountValid(line: {
  quantity: number
  unitPrice: number
  discount: number
}): boolean {
  return isDiscountValid(line.discount, lineTotal(line.quantity, line.unitPrice))
}

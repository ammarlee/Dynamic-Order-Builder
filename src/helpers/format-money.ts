const MONEY_SCALE = 100

export function toCents(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * MONEY_SCALE)
}

export function roundMoney(value: number): number {
  return toCents(value) / MONEY_SCALE
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(roundMoney(value))
}

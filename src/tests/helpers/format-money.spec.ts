import { describe, expect, it } from 'vitest'
import { formatMoney, roundMoney } from '@/helpers/format-money'

describe('money helpers', () => {
  it('rounds to cents', () => {
    expect(roundMoney(10.126)).toBe(10.13)
    expect(roundMoney(4.5)).toBe(4.5)
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
  })

  it('formats USD', () => {
    expect(formatMoney(4.5)).toBe('$4.50')
    expect(formatMoney(0)).toBe('$0.00')
    expect(formatMoney(1000)).toBe('$1,000.00')
  })
})

import { describe, expect, it } from 'vitest'
import { stockAvailabilityMessage } from '@/helpers/stock-message'

describe('stockAvailabilityMessage', () => {
  it('keeps a count when stock remains', () => {
    expect(stockAvailabilityMessage(12)).toBe('Only 12 available.')
  })

  it('uses an out-of-stock message when nothing is left', () => {
    expect(stockAvailabilityMessage(0)).toBe('This item is out of stock.')
  })
})

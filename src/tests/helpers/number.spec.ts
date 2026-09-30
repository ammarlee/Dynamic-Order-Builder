import { describe, expect, it } from 'vitest'
import { isPositiveInteger } from '@/helpers/number'

describe('isPositiveInteger', () => {
  it('accepts positive whole numbers only', () => {
    expect(isPositiveInteger(1)).toBe(true)
    expect(isPositiveInteger(0)).toBe(false)
    expect(isPositiveInteger(-2)).toBe(false)
    expect(isPositiveInteger(1.5)).toBe(false)
  })
})

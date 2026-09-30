import { afterEach, describe, expect, it, vi } from 'vitest'
import { debounce } from '@/helpers/debounce'

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits until typing pauses before calling the function', () => {
    vi.useFakeTimers()
    const fn = vi.fn<(value: string) => void>()
    const debounced = debounce(fn, 300)

    debounced('b')
    debounced('ba')
    debounced('bag')

    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('bag')
  })

  it('cancel drops a pending call', () => {
    vi.useFakeTimers()
    const fn = vi.fn<(value: string) => void>()
    const debounced = debounce(fn, 300)

    debounced('bag')
    debounced.cancel()
    vi.advanceTimersByTime(300)

    expect(fn).not.toHaveBeenCalled()
  })
})

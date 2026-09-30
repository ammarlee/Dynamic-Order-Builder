import { effectScope, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SEARCH_DEBOUNCE_MS, useProductSearch } from '@/composables/useProductSearch'
import type { CatalogProduct } from '@/types/product'

vi.mock('@/services/products', () => ({
  searchProducts: vi.fn<(search: string, signal?: AbortSignal) => Promise<CatalogProduct[]>>(),
}))

import { searchProducts } from '@/services/products'

const searchProductsMock = vi.mocked(searchProducts)

function bag(name = 'Premium Bag'): CatalogProduct {
  return {
    id: 1,
    name,
    sku: 'BAG-100',
    variants: [
      { id: 1, name: 'Small' },
      { id: 2, name: 'Large' },
    ],
  }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  let reject: (reason?: unknown) => void = () => {}
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useProductSearch', () => {
  beforeEach(() => {
    searchProductsMock.mockReset()
    vi.useFakeTimers()
  })

  it('debounces requests and shows a loading state', async () => {
    searchProductsMock.mockResolvedValue([bag()])
    const scope = effectScope()
    const search = scope.run(() => useProductSearch())
    if (!search) throw new Error('search scope failed')

    search.query.value = 'b'
    await nextTick()
    search.query.value = 'bag'
    await nextTick()

    expect(search.status.value).toBe('loading')
    expect(searchProductsMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)
    expect(searchProductsMock).toHaveBeenCalledTimes(1)
    expect(searchProductsMock).toHaveBeenCalledWith('bag', expect.any(AbortSignal))
    expect(search.results.value).toEqual([bag()])
    expect(search.status.value).toBe('success')

    scope.stop()
  })

  it('shows an empty state when nothing matches', async () => {
    searchProductsMock.mockResolvedValue([])
    const scope = effectScope()
    const search = scope.run(() => useProductSearch())
    if (!search) throw new Error('search scope failed')

    search.query.value = 'missing'
    await nextTick()
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)

    expect(search.status.value).toBe('empty')
    expect(search.results.value).toEqual([])
    scope.stop()
  })

  it('exposes an error and retries', async () => {
    searchProductsMock.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([bag()])
    const scope = effectScope()
    const search = scope.run(() => useProductSearch())
    if (!search) throw new Error('search scope failed')

    search.query.value = 'bag'
    await nextTick()
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)

    expect(search.status.value).toBe('error')
    expect(search.errorMessage.value).toBe("We couldn't load products.")

    search.retry()
    await vi.advanceTimersByTimeAsync(0)
    await Promise.resolve()

    expect(search.status.value).toBe('success')
    expect(search.results.value).toHaveLength(1)
    scope.stop()
  })

  it('ignores a stale response', async () => {
    const first = deferred<CatalogProduct[]>()
    const second = deferred<CatalogProduct[]>()
    searchProductsMock
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)

    const scope = effectScope()
    const search = scope.run(() => useProductSearch())
    if (!search) throw new Error('search scope failed')

    search.query.value = 'bag'
    await nextTick()
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)

    search.query.value = 'bags'
    await nextTick()
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)

    second.resolve([bag('Canvas Bags')])
    await Promise.resolve()
    await nextTick()

    expect(search.results.value[0]?.name).toBe('Canvas Bags')

    first.resolve([bag('Premium Bag')])
    await Promise.resolve()
    await nextTick()

    expect(search.results.value[0]?.name).toBe('Canvas Bags')
    scope.stop()
  })
})

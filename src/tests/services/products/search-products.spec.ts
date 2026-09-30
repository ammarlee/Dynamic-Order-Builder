import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchProductsRequest } from '@/services/products/api/products.api'
import { matchesProductName } from '@/services/products/helpers/matches-product-name'
import { searchProducts } from '@/services/products/search-products'
import type { ProductSearchItemDto } from '@/services/products/types/dto'

vi.mock('@/services/products/api/products.api', () => ({
  searchProductsRequest: vi.fn<() => Promise<ProductSearchItemDto[]>>(),
}))

const searchProductsRequestMock = vi.mocked(searchProductsRequest)

function product(overrides: Partial<ProductSearchItemDto> = {}): ProductSearchItemDto {
  return {
    id: 1,
    name: 'Premium Bag',
    sku: 'BAG-100',
    variants: [
      { id: 1, name: 'Small' },
      { id: 2, name: 'Large' },
    ],
    ...overrides,
  }
}

describe('matchesProductName', () => {
  it('matches the product name and ignores sku and variant text', () => {
    expect(matchesProductName('Premium Bag', 'bag')).toBe(true)
    expect(matchesProductName('Premium Bag', 'BAG-100')).toBe(false)
    expect(matchesProductName('Premium Bag', 'Large')).toBe(false)
  })
})

describe('searchProducts', () => {
  beforeEach(() => {
    searchProductsRequestMock.mockReset()
  })

  it('keeps products whose name matches and drops price and stock fields', async () => {
    searchProductsRequestMock.mockResolvedValue([
      product(),
      product({
        id: 2,
        name: 'Canvas Tote',
        sku: 'TOTE-200',
        variants: [{ id: 3, name: 'Medium' }],
      }),
    ])

    const results = await searchProducts('bag')

    expect(searchProductsRequestMock).toHaveBeenCalledWith('bag', undefined)
    expect(results).toEqual([
      {
        id: 1,
        name: 'Premium Bag',
        sku: 'BAG-100',
        variants: [
          { id: 1, name: 'Small' },
          { id: 2, name: 'Large' },
        ],
      },
    ])
  })
})

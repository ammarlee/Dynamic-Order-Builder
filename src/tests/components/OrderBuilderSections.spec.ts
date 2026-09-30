import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderListIndex from '@/components/pages/orders/create/order-list/OrderListIndex.vue'
import OrderSummaryIndex from '@/components/pages/orders/create/summary/OrderSummaryIndex.vue'
import SearchIndex from '@/components/pages/orders/create/search/SearchIndex.vue'
import SearchResultItem from '@/components/pages/orders/create/search/components/result/SearchResultItem.vue'
import { SEARCH_DEBOUNCE_MS } from '@/composables/useProductSearch'
import type { OrderLine } from '@/types/order'
import type { CatalogProduct, ProductSearchResult } from '@/types/product'

vi.mock('@/services/products', () => ({
  searchProducts: vi.fn<(search: string, signal?: AbortSignal) => Promise<CatalogProduct[]>>(),
}))

import { searchProducts } from '@/services/products'

const searchProductsMock = vi.mocked(searchProducts)

const searchItem: ProductSearchResult = {
  productId: 1,
  variantId: 2,
  productName: 'Premium Bag',
  variantName: 'Large',
  sku: 'BAG-100',
}

function line(overrides: Partial<OrderLine> = {}): OrderLine {
  return {
    ...searchItem,
    quantity: 2,
    unitPrice: 4.5,
    discount: 0,
    currentPrice: 4.5,
    priceAccepted: true,
    availableQuantity: 12,
    unavailable: false,
    validationStatus: 'valid',
    validationErrors: [],
    ...overrides,
  }
}

describe('OrderListIndex', () => {
  it('shows the empty cart state', () => {
    const wrapper = mount(OrderListIndex, {
      props: { items: [], validating: false, warehouseSelected: false },
    })

    expect(wrapper.text()).toContain('No products added yet.')
  })

  it('asks for a warehouse when lines exist without one', () => {
    const wrapper = mount(OrderListIndex, {
      props: {
        items: [line({ validationStatus: 'pending' })],
        validating: false,
        warehouseSelected: false,
      },
    })

    expect(wrapper.text()).toContain('Select a warehouse to load prices and stock')
  })

  it('shows a skeleton while warehouse validation is running', () => {
    const wrapper = mount(OrderListIndex, {
      props: {
        items: [line({ validationStatus: 'validating', currentPrice: null })],
        validating: true,
        warehouseSelected: true,
      },
    })

    expect(wrapper.find('[aria-label="Checking stock and prices"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Premium Bag')
  })
})

describe('OrderSummaryIndex', () => {
  const data = { subtotal: 10, discount: 1, finalTotal: 9 }

  it('renders the totals and emits submit when enabled', async () => {
    const wrapper = mount(OrderSummaryIndex, {
      props: { data, isDisabled: false, submitError: null },
    })

    expect(wrapper.text()).toContain('$10.00')
    expect(wrapper.text()).toContain('$1.00')
    expect(wrapper.text()).toContain('$9.00')

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('disables submit when isDisabled is set', () => {
    const wrapper = mount(OrderSummaryIndex, {
      props: { data, isDisabled: true, submitError: null },
    })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('shows a create failure', () => {
    const wrapper = mount(OrderSummaryIndex, {
      props: { data, isDisabled: false, submitError: "We couldn't create the order." },
    })

    expect(wrapper.get('.api-failure').text()).toContain("We couldn't create the order.")
  })
})

describe('SearchIndex', () => {
  it('lets the admin search before a warehouse is selected', () => {
    const wrapper = mount(SearchIndex, {
      props: { warehouseId: null },
    })

    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Prices and stock load after you select a warehouse.')
  })

  it('shows results, adds a variant, and clears on click outside', async () => {
    vi.useFakeTimers()
    searchProductsMock.mockResolvedValue([
      { id: 1, name: 'Premium Bag', sku: 'BAG-100', variants: [{ id: 2, name: 'Large' }] },
    ])

    const wrapper = mount(SearchIndex, {
      props: { warehouseId: 1 },
      attachTo: document.body,
    })

    try {
      await wrapper.get('input').setValue('bag')
      await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)
      await vi.dynamicImportSettled()
      await nextTick()

      expect(wrapper.text()).toContain('Premium Bag')

      const add = wrapper.findAll('button').find((button) => button.text() === 'Add')
      await add?.trigger('click')
      expect(wrapper.emitted('add')).toEqual([[searchItem]])

      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await nextTick()

      expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
      expect(wrapper.find('.search-dropdown').exists()).toBe(false)
    } finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })
})

describe('SearchResultItem', () => {
  it('shows "In order" for a variant that is already in the order', () => {
    const wrapper = mount(SearchResultItem, { props: { item: searchItem, line: line() } })

    const button = wrapper.get('button')
    expect(button.text()).toBe('In order')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('blocks adding once the order reaches available stock', async () => {
    const wrapper = mount(SearchResultItem, {
      props: { item: searchItem, line: line({ quantity: 2, availableQuantity: 2 }) },
    })

    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    await button.trigger('click')
    expect(wrapper.emitted('add')).toBeUndefined()
  })

  it('blocks adding a variant unavailable in the warehouse', () => {
    const wrapper = mount(SearchResultItem, {
      props: { item: searchItem, line: line({ unavailable: true }) },
    })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
})

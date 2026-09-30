import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import OrderItem from '@/components/pages/orders/create/order-list/components/item/OrderItem.vue'
import type { OrderLine } from '@/types/order'

function line(overrides: Partial<OrderLine> = {}): OrderLine {
  return {
    productId: 1,
    variantId: 2,
    productName: 'Heritage Merino Wool Scarf',
    variantName: 'Midnight Navy',
    sku: 'SCARF-400',
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

function numberInput(wrapper: VueWrapper, ariaLabel: string) {
  const input = wrapper
    .findAllComponents(InputNumber)
    .find((component) => component.props('ariaLabel') === ariaLabel)
  if (!input) throw new Error(`${ariaLabel} input not found`)
  return input
}

function isHintVisible(wrapper: VueWrapper) {
  return wrapper.get('.qty-control__hint').classes('qty-control__hint--visible')
}

async function whenAlertsReady(wrapper: VueWrapper) {
  await vi.waitFor(() => {
    expect(wrapper.find('.order-line__alerts').exists()).toBe(true)
  })
}

describe('OrderItem', () => {
  it('renders product, variant, price, line total, and stock', () => {
    const wrapper = mount(OrderItem, { props: { item: line() } })

    expect(wrapper.text()).toContain('Heritage Merino Wool Scarf')
    expect(wrapper.text()).toContain('Midnight Navy')
    expect(wrapper.text()).toContain('SCARF-400')
    expect(wrapper.text()).toContain('$4.50')
    expect(wrapper.text()).toContain('$9.00')
    expect(wrapper.text()).toContain('12')
  })

  describe('quantity', () => {
    it('emits step changes and never goes below 1', async () => {
      const wrapper = mount(OrderItem, { props: { item: line() } })

      await wrapper.get('[aria-label="Increase quantity"]').trigger('click')
      await wrapper.get('[aria-label="Decrease quantity"]').trigger('click')
      expect(wrapper.emitted('update-quantity')).toEqual([[3], [1]])

      await wrapper.setProps({ item: line({ quantity: 1 }) })
      const decrease = wrapper.get('[aria-label="Decrease quantity"]')
      expect(decrease.attributes('disabled')).toBeDefined()
      await decrease.trigger('click')
      expect(wrapper.emitted('update-quantity')).toHaveLength(2)
    })

    it('disables increase at available stock', async () => {
      const wrapper = mount(OrderItem, {
        props: { item: line({ quantity: 12, availableQuantity: 12 }) },
      })

      expect(wrapper.get('[aria-label="Increase quantity"]').attributes('disabled')).toBeDefined()
      await wrapper.findAll('.qty-control__step')[1]?.trigger('click')
      expect(wrapper.emitted('update-quantity')).toBeUndefined()
    })

    it('accepts a typed quantity within stock', async () => {
      const wrapper = mount(OrderItem, { props: { item: line() } })

      await numberInput(wrapper, 'Quantity').vm.$emit('update:modelValue', 5)

      expect(wrapper.emitted('update-quantity')).toEqual([[5]])
      expect(isHintVisible(wrapper)).toBe(false)
    })

    it('reverts a typed quantity above stock and hides the hint after a few seconds', async () => {
      vi.useFakeTimers()
      try {
        const wrapper = mount(OrderItem, { props: { item: line() } })

        await numberInput(wrapper, 'Quantity').vm.$emit('update:modelValue', 30)
        await nextTick()

        expect(wrapper.emitted('update-quantity')).toBeUndefined()
        expect(isHintVisible(wrapper)).toBe(true)
        expect(wrapper.get('.qty-control__hint').text()).toBe('Only 12 available.')
        expect(wrapper.get('[aria-label="Quantity"]').element).toHaveProperty('value', '2')

        await vi.advanceTimersByTimeAsync(3000)
        expect(isHintVisible(wrapper)).toBe(false)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('discount', () => {
    it('emits discount changes and shows the discounted total', async () => {
      const wrapper = mount(OrderItem, { props: { item: line() } })

      await numberInput(wrapper, 'Item discount').vm.$emit('update:modelValue', 1)
      expect(wrapper.emitted('update-discount')).toEqual([[1]])

      await wrapper.setProps({ item: line({ discount: 1 }) })
      expect(wrapper.get('.order-line__total').text()).toContain('$8.00')
      expect(wrapper.get('.order-line__total-original').text()).toBe('$9.00')
    })

    it('shows the max allowed discount when it exceeds the line total', () => {
      const wrapper = mount(OrderItem, { props: { item: line({ discount: 20 }) } })

      const error = wrapper.get('.line-discount__error')
      expect(error.classes()).toContain('line-discount__error--visible')
      expect(error.text()).toBe('Max $9.00')
      expect(wrapper.find('.order-line__total-original').exists()).toBe(false)
    })
  })

  describe('validation states', () => {
    it('shows stock and price warnings and emits accept price', async () => {
      const wrapper = mount(OrderItem, {
        props: {
          item: line({
            quantity: 5,
            currentPrice: 5,
            availableQuantity: 2,
            validationStatus: 'invalid',
            validationErrors: ['stock_changed', 'price_changed'],
          }),
        },
      })
      await whenAlertsReady(wrapper)

      expect(wrapper.text()).toContain('Only 2 available')
      expect(wrapper.text()).toContain('Price changed from $4.50 to $5.00.')

      const accept = wrapper.findAll('button').find((button) => button.text() === 'Use $5.00')
      await accept?.trigger('click')
      expect(wrapper.emitted('accept-price')).toHaveLength(1)
    })

    it('says the item is out of stock when none is available', async () => {
      const wrapper = mount(OrderItem, {
        props: {
          item: line({
            quantity: 1,
            availableQuantity: 0,
            validationStatus: 'invalid',
            validationErrors: ['stock_changed'],
          }),
        },
      })
      await whenAlertsReady(wrapper)

      expect(wrapper.text()).toContain('This item is out of stock.')
      expect(wrapper.text()).not.toContain('Only 0 available')
    })

    it('shows an unavailable line', async () => {
      const wrapper = mount(OrderItem, {
        props: {
          item: line({
            unavailable: true,
            currentPrice: null,
            availableQuantity: null,
            validationStatus: 'invalid',
            validationErrors: ['unavailable'],
          }),
        },
      })
      await whenAlertsReady(wrapper)

      expect(wrapper.text()).toContain('Unavailable in this warehouse')
      expect(wrapper.get('[aria-label="Increase quantity"]').attributes('disabled')).toBeDefined()
    })

    it('shows an awaiting-warehouse notice for a pending line and locks the discount', async () => {
      const wrapper = mount(OrderItem, {
        props: {
          item: line({
            unitPrice: 0,
            currentPrice: null,
            availableQuantity: null,
            priceAccepted: false,
            validationStatus: 'pending',
          }),
        },
      })
      await whenAlertsReady(wrapper)

      expect(wrapper.text()).toContain('Awaiting warehouse')
      expect(wrapper.text()).not.toContain('Price changed')
      expect(wrapper.get('[aria-label="Increase quantity"]').attributes('disabled')).toBeUndefined()
      expect(wrapper.get('[aria-label="Item discount"]').attributes('disabled')).toBeDefined()
    })
  })

  it('removes the item only after confirmation', async () => {
    const Host = defineComponent({
      components: { OrderItem, ConfirmDialog },
      setup() {
        return { item: line() }
      },
      template:
        '<div><ConfirmDialog /><OrderItem :item="item" @remove="$emit(\'remove\')" /></div>',
      emits: ['remove'],
    })
    const wrapper = mount(Host)

    function dialogButton(label: string) {
      const dialog = document.querySelector('.p-confirmdialog')
      return [...(dialog?.querySelectorAll('button') ?? [])].find(
        (button) => button.textContent?.trim() === label,
      )
    }

    await wrapper.get('[aria-label="Remove item"]').trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain(
      'Remove Heritage Merino Wool Scarf / Midnight Navy from this order?',
    )
    dialogButton('Cancel')?.click()
    await nextTick()
    expect(wrapper.emitted('remove')).toBeUndefined()

    await wrapper.get('[aria-label="Remove item"]').trigger('click')
    await nextTick()
    dialogButton('Remove')?.click()
    await nextTick()
    expect(wrapper.emitted('remove')).toHaveLength(1)

    wrapper.unmount()
  })
})

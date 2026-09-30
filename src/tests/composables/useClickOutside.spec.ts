import { defineComponent, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useClickOutside } from '@/composables/useClickOutside'

describe('useClickOutside', () => {
  it('runs the handler only when the pointer lands outside the target', async () => {
    const onOutside = vi.fn<() => void>()
    const Host = defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        useClickOutside(target, onOutside)
        return { target }
      },
      template:
        '<div><div ref="target" class="inside">in</div><button class="outside" type="button">out</button></div>',
    })
    const wrapper = mount(Host, { attachTo: document.body })

    await wrapper.get('.inside').trigger('pointerdown')
    expect(onOutside).not.toHaveBeenCalled()

    await wrapper.get('.outside').trigger('pointerdown')
    expect(onOutside).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})

import { getCurrentScope, onMounted, onScopeDispose, type Ref } from 'vue'

function isEventInside(elements: HTMLElement[], event: Event) {
  const node = event.target
  if (!(node instanceof Node)) return false
  return elements.some((element) => element.contains(node))
}

export function useClickOutside(
  target: Ref<HTMLElement | null> | Array<Ref<HTMLElement | null>>,
  handler: () => void,
) {
  const targets = Array.isArray(target) ? target : [target]

  function onPointerDown(event: Event) {
    const elements = targets.flatMap((item) => (item.value ? [item.value] : []))
    if (elements.length === 0 || isEventInside(elements, event)) return
    handler()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onPointerDown, true)
  })

  if (getCurrentScope()) {
    onScopeDispose(() => {
      document.removeEventListener('pointerdown', onPointerDown, true)
    })
  }
}

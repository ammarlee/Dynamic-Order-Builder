export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void
  cancel: () => void
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, wait)
  }

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  return debounced
}

export function stockAvailabilityMessage(availableQuantity: number): string {
  if (availableQuantity <= 0) return 'This item is out of stock.'
  return `Only ${availableQuantity} available.`
}

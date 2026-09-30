export function matchesProductName(productName: string, search: string) {
  const term = search.trim().toLowerCase()
  if (!term) return true
  return productName.toLowerCase().includes(term)
}

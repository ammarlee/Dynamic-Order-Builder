export const UI_MESSAGES = {
  products: {
    loadFailed: "We couldn't load products.",
  },
  warehouses: {
    loadFailed: "We couldn't load warehouses.",
    validationFailed: "We couldn't check stock and prices for this warehouse.",
  },
  order: {
    selectWarehouse: 'Select a warehouse to load prices and stock.',
    waitForValidation: 'Wait until warehouse validation finishes.',
    validationUnavailable: "We couldn't check stock and prices. Try again before creating the order.",
    resolveLineIssues: 'Resolve stock and price issues before creating the order.',
    discountExceedsTotal: 'Item discount cannot exceed the item total.',
    submitFailed: "We couldn't create the order. Please try again.",
    submitRejected: 'Order validation failed. Update the highlighted lines, then submit again.',
  },
  toasts: {
    incrementedSummary: 'Already in the order',
    incrementedDetail: (quantity: number) =>
      `This product is already in the order. Quantity increased to ${quantity}.`,
    addedSummary: 'Added to order',
    addedDetail: (productName: string, variantName: string) =>
      `${productName} / ${variantName} added to the order.`,
    createdSummary: 'Order created',
    createdDetail: 'Order created successfully.',
    rejectedSummary: 'Order not created',
  },
  serverControls: {
    loadFailed: "We couldn't load server controls.",
    stockLoadFailed: 'Unable to load the current server state.',
    saveFailed: 'Unable to update server state.',
    savedSummary: 'Server updated',
    savedDetail: 'Server state updated.',
    failureFlagFailed: 'Unable to update failure simulation.',
  },
} as const

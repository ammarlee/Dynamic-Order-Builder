const path = require('node:path')
const jsonServer = require('json-server')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

const devSettings = {
  failProductSearch: false,
  failWarehouseValidation: false,
  failOrderSubmit: false,
}

function delay(min, max) {
  const ms = min + Math.floor(Math.random() * (max - min + 1))
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

function readStock() {
  return router.db.get('warehouseStock').value()
}

function findStock(warehouseId, productId, variantId) {
  return readStock().find(
    (row) =>
      row.warehouse_id === warehouseId &&
      row.product_id === productId &&
      row.variant_id === variantId,
  )
}

function matchesProductName(productName, search) {
  if (!search) return true
  return String(productName).toLowerCase().includes(search)
}

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.get('/dev-settings', (_req, res) => {
  res.json(devSettings)
})

server.patch('/dev-settings', (req, res) => {
  const body = req.body ?? {}
  if (typeof body.failProductSearch === 'boolean') {
    devSettings.failProductSearch = body.failProductSearch
  }
  if (typeof body.failWarehouseValidation === 'boolean') {
    devSettings.failWarehouseValidation = body.failWarehouseValidation
  }
  if (typeof body.failOrderSubmit === 'boolean') {
    devSettings.failOrderSubmit = body.failOrderSubmit
  }
  res.json(devSettings)
})

server.get('/catalog', (_req, res) => {
  res.json(router.db.get('products').value())
})

server.get('/products', async (req, res) => {
  await delay(500, 1000)

  if (devSettings.failProductSearch) {
    res.status(500).json({ message: 'Unable to load products.' })
    return
  }

  const search = String(req.query.search ?? '')
    .trim()
    .toLowerCase()
  const products = router.db.get('products').value()
  const items = products
    .filter((product) => matchesProductName(product.name, search))
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
      })),
    }))

  res.json(items)
})

server.get('/warehouses/:id/stock', async (req, res) => {
  await delay(700, 1200)

  if (devSettings.failWarehouseValidation) {
    res.status(500).json({ message: 'Unable to validate products for this warehouse.' })
    return
  }

  const warehouseId = Number(req.params.id)
  const stock = readStock().filter((row) => row.warehouse_id === warehouseId)

  res.json(
    stock.map((row) => ({
      product_id: row.product_id,
      variant_id: row.variant_id,
      available_quantity: row.available_quantity,
      price: row.price,
    })),
  )
})

server.post('/orders', async (req, res) => {
  await delay(800, 1500)

  if (devSettings.failOrderSubmit) {
    res.status(500).json({ message: 'Unable to create order.' })
    return
  }

  const warehouseId = Number(req.body?.warehouse_id)
  const discount = Number(req.body?.discount ?? 0)
  const items = Array.isArray(req.body?.items) ? req.body.items : []

  if (items.length === 0) {
    res.status(400).json({ message: 'Order must include at least one item.' })
    return
  }

  const invalidItemDiscount = items.some((item) => {
    const itemDiscount = Number(item.discount ?? 0)
    const itemTotal = Number(item.quantity) * Number(item.unit_price)
    return (
      !Number.isFinite(itemDiscount) ||
      itemDiscount < 0 ||
      roundMoney(itemDiscount) > roundMoney(itemTotal)
    )
  })

  if (invalidItemDiscount) {
    res.status(400).json({ message: 'Item discount cannot exceed the item total.' })
    return
  }

  const itemsDiscount = items.reduce((sum, item) => sum + Number(item.discount ?? 0), 0)
  if (roundMoney(itemsDiscount) !== roundMoney(discount)) {
    res.status(400).json({ message: 'Order discount must equal the sum of item discounts.' })
    return
  }

  const errors = []

  for (const item of items) {
    const productId = Number(item.product_id)
    const variantId = Number(item.variant_id)
    const quantity = Number(item.quantity)
    const unitPrice = Number(item.unit_price)
    const record = findStock(warehouseId, productId, variantId)

    if (!record) {
      errors.push({
        product_id: productId,
        variant_id: variantId,
        type: 'unavailable',
      })
      continue
    }

    if (quantity > record.available_quantity) {
      errors.push({
        product_id: productId,
        variant_id: variantId,
        type: 'stock_changed',
        requested_quantity: quantity,
        available_quantity: record.available_quantity,
      })
    }

    if (roundMoney(unitPrice) !== roundMoney(record.price)) {
      errors.push({
        product_id: productId,
        variant_id: variantId,
        type: 'price_changed',
        old_price: unitPrice,
        new_price: record.price,
      })
    }
  }

  if (errors.length > 0) {
    res.status(409).json({
      message: 'Order validation failed',
      errors,
    })
    return
  }

  const order = {
    id: Date.now(),
    warehouse_id: warehouseId,
    discount: roundMoney(discount),
    items,
    created_at: new Date().toISOString(),
  }

  router.db.get('orders').push(order).write()
  res.status(201).json(order)
})

server.use(router)

const port = Number(process.env.PORT) || 3001
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`)
})

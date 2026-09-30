# Order Builder

Admin page for building an order against one warehouse. The admin chooses products, a warehouse, quantities, and a discount on each line. The page keeps the accepted unit price and quantity separate from the latest server stock and price, and asks the admin to resolve conflicts before the order is created.

There is no authentication, customer form, or dashboard. The only route is `/`.

## Assumptions

The brief leaves a few behaviors unspecified. These are the choices this implementation makes.

**A warehouse is not required before search or add.** Product search is catalog-only (`GET /products?search=`). It returns the product and its variants, with no warehouse, price, or stock. The admin can add a variant before choosing a warehouse. That line stays on the order as pending: unit price, line total, and stock show `—`, and the line discount is disabled. Quantity is still shown and starts at `1`. Price and stock are applied only after a warehouse is selected.

**Search is not stock validation.** Because search has no warehouse context, it is not treated as proof that a variant is in stock or that the price is current. Stock and price are loaded from `GET /warehouses/:id/stock` when a warehouse is selected, and again when a variant is added after a warehouse is already selected. `POST /orders` checks them once more at submit time, so a change on the server between add and submit can still fail the order.

**Quantity cannot go above the known stock.** Once a line has a stock figure, the quantity cannot be typed or stepped above that available quantity. Pending lines have no stock cap, because no warehouse stock exists yet. If stock later drops below the quantity already on the line, the quantity is not reduced automatically. The line stays, shows that only the lower amount is available, and Create Order stays disabled until the admin fixes it.

**The submitted unit price is the price the admin accepted.** The sample order body only sends `product_id`, `variant_id`, and `quantity`. This implementation also sends `unit_price` on each item. The server compares that value with the current warehouse price. If they differ, it returns `price_changed` with the submitted price and the new price. The line is kept. The new price is not applied until the admin accepts it.

**Discount is a fixed amount, on each line and on the order.** The sample payload shows an order-level `discount` such as `1.000`, which is a number, not a percentage. Each line has its own discount, from `0` up to that line’s total (`quantity × unit price`). The order `discount` is the sum of those line discounts, not a separate percentage and not a second amount typed in the summary. The payload sends both: each item’s `discount`, and the order `discount` equal to their sum. A line discount above that line’s total blocks submit.

**The same variant is one line.** A product and variant already on the order are not added again as a second line. Adding it again increases that line’s quantity by 1, as long as stock allows it.

**A warehouse change does not remove lines.** Every existing line is rechecked against the new warehouse. A line with no stock row stays and is marked unavailable. A lower stock level or a different price is shown on the line. The previous quantity and the accepted unit price stay until the admin changes them. Clearing the warehouse puts every line back to pending and drops the accepted price, discount, and stock.

**Money is USD, rounded to cents.** Prices in the brief use three decimal places (for example `4.500`). Amounts here are US dollars, rounded to two decimal places.

## Run

Use two terminals. Node `^22.18.0` or `>=24.12.0` is required.

```sh
npm install
npm run server
```

```sh
npm run dev
```

| Process | Address |
| --- | --- |
| Vue app (Vite) | http://localhost:5173 |
| JSON Server | http://localhost:3001 |

The UI calls `/api`. Vite strips that prefix and proxies the request to JSON Server.

```sh
npm run test:unit -- --run
npm run type-check
npm run lint
npm run build
```

## Page

The create-order page is five sections plus a development dialog.

```text
pages/orders/create/index.vue
  └── components/pages/orders/create/OrderBuilderIndex.vue
        ├── SearchIndex
        ├── WarehouseIndex
        ├── OrderListIndex
        │     └── OrderValidationIndex
        ├── OrderSummaryIndex
        └── ServerControlsIndex
```

**Search** looks up products by name. Results are products and variants only: no warehouse, price, or stock. Typing waits 300ms, then the request runs. Suggestions are Premium Bag, Canvas Tote, and Travel Backpack. Add is available before a warehouse is selected.

**Warehouse** loads the warehouse list on mount. Stock and price follow the selected warehouse. Changing it revalidates every line already on the order.

**Order items** is the current order. Each line shows quantity, unit price, a line discount, line total, and available stock. Removing a line asks for confirmation.

**Summary** shows subtotal, the sum of line discounts, and the final total in USD. **Create Order** stays disabled until the order can be submitted.

**Server Controls** edits a stock row's available quantity and price, or creates the row when one does not exist. It can also force the next product search, warehouse stock check, or order submission to fail. Those flags live in memory on the server and reset when the server restarts.

## How an order is built

A line is unique by `productId` and `variantId`. Adding the same variant again increases its quantity by 1.

### Pending lines

A product added before a warehouse is selected is **pending**. Unit price, stock, and line total show `—`, the discount input is disabled, and the line says it is awaiting a warehouse. The order list also asks for a warehouse. Pending lines have no stock cap.

Selecting a warehouse loads that warehouse's stock and applies it to every current line. The first price returned for a line becomes its accepted unit price.

### After a warehouse is selected

Search still does not send a warehouse id. Adding a new variant loads stock for the selected warehouse and matches it to the lines on the order.

- The accepted unit price stays as the admin left it when the warehouse changes. A different server price is shown beside it and is applied only after **Use {price}**.
- Quantity is not reduced when stock is lower. The line shows `Only N available` or `This item is out of stock.` Create Order stays disabled until the quantity is within stock.
- Quantity cannot be typed or stepped above the known available stock. A hint appears for a few seconds if the typed value is too high.
- A variant with no stock row is marked unavailable and stays on the order. Add is disabled for that variant. Decreasing an unavailable line to 0 removes it.
- Add is disabled when the line is already at the available quantity, with the stock message as the tooltip.

Clearing the warehouse returns every line to pending: accepted price, discount, and stock are dropped.

### Discounts

Each line has its own discount, a currency amount from `0` up to that line's total (`quantity × unit price`). The discount input is disabled while the line is pending, validating, unavailable, or has a zero total. A discount above the line total is marked invalid and blocks Create Order.

The summary discount is the sum of the line discounts. The final total is `subtotal − discount` and never goes below `$0.00`. Money is rounded to cents.

### Create Order

Create Order is enabled only when all of these are true:

- the order has at least one line
- a warehouse is selected
- warehouse stock has loaded without error
- every line is valid (known stock, accepted price matches the server, quantity within stock, not unavailable)
- every line discount is within that line's total
- a submission is not already in progress

`POST /orders` compares each line's `unit_price` and `quantity` with the current stock row. The server price is authoritative. A `409` can include `stock_changed`, `price_changed`, and `unavailable` for the same line, matched by product and variant. The lines stay on the order with the admin's quantity and accepted price. A failed request does not clear the order. A successful create clears the lines and shows a confirmation toast. The warehouse selection stays.

## Stale requests

Product search and warehouse stock each keep an `AbortController` and a request id. A newer search or warehouse selection aborts the previous request. A late response whose id no longer matches is ignored. Changing or clearing the warehouse drops the previous price and stock immediately, so they cannot leak into the next selection.

## API

The browser calls these paths under `/api`. Delays are applied on the server.

| Method | Path | Delay | Purpose |
| --- | --- | --- | --- |
| GET | `/warehouses` | — | Warehouse list |
| GET | `/products?search=` | 500–1000ms | Catalog search. Name match only; no price or stock |
| GET | `/warehouses/:id/stock` | 700–1200ms | Stock and price rows for one warehouse |
| POST | `/orders` | 800–1500ms | Create an order. `409` when stock or price no longer matches |
| GET | `/catalog` | — | Full product catalog for Server Controls |
| GET, PATCH | `/dev-settings` | — | Read or toggle simulated API failures |
| GET | `/warehouseStock?warehouse_id=&product_id=&variant_id=` | — | One stock row for Server Controls |
| PATCH | `/warehouseStock/:id` | — | Update available quantity and price |
| POST | `/warehouseStock` | — | Create a stock row |

`GET /products` and `POST /orders` replace the default JSON Server handlers. `GET /warehouses/:id/stock` returns every stock row for that warehouse:

```json
[
  {
    "product_id": 1,
    "variant_id": 2,
    "available_quantity": 4,
    "price": 30
  }
]
```

The client keeps only the rows that match lines currently on the order. A line with no matching row is unavailable.

Order body:

```json
{
  "warehouse_id": 1,
  "discount": 2,
  "items": [
    {
      "product_id": 1,
      "variant_id": 2,
      "quantity": 1,
      "unit_price": 30,
      "discount": 2
    }
  ]
}
```

`discount` must equal the sum of item discounts. An item discount cannot exceed `quantity × unit_price`. Either violation returns `400`. An empty item list also returns `400`.

Conflict body (`409`):

```json
{
  "message": "Order validation failed",
  "errors": [
    {
      "product_id": 1,
      "variant_id": 2,
      "type": "stock_changed",
      "requested_quantity": 4,
      "available_quantity": 1
    },
    {
      "product_id": 1,
      "variant_id": 2,
      "type": "price_changed",
      "old_price": 30,
      "new_price": 5.5
    }
  ]
}
```

`unavailable` has `product_id`, `variant_id`, and `type` only. A successful create returns `201` and appends the order to `server/db.json`.

Simulated failures return `500` while the matching dev setting is on:

- product search: `Unable to load products.`
- warehouse stock: `Unable to validate products for this warehouse.`
- order submit: `Unable to create order.`

## Seed data

`server/db.json` ships three warehouses (A, B, and C) and five products. Premium Bag / Large is a useful conflict example:

| Warehouse | Available | Price |
| --- | ---: | ---: |
| A | 4 | $30.00 |
| B | 2 | $5.00 |
| C | 8 | $4.50 |

Premium Bag / Small exists in A (2 at $2.00) and B (0 at $3.50). Warehouse C has no Small row, so that variant is unavailable there.

1. Search `bag` and add Premium Bag / Large before choosing a warehouse. The line is pending.
2. Select Warehouse A. The line takes stock 4 and price $30.00.
3. Add the same variant again. Quantity becomes 2, and a toast says it was already in the order.
4. Switch to Warehouse B. Stock is still enough for quantity 2. The price difference ($5.00 versus the accepted $30.00) is shown, and Create Order stays disabled until that price is accepted.
5. Switch to Warehouse C. Stock is 8 and the server price is $4.50. The accepted $30.00 remains until the admin accepts $4.50.
6. Open Server Controls, choose Warehouse C / Premium Bag / Large, set quantity to 1 and price to $5.50, and update the server.
7. Submit. The API returns `stock_changed` and `price_changed`. The line stays.
8. Set quantity to 1, accept $5.50, and submit again. The order is created and the lines clear.

## Code layout

```text
src/pages/orders/create          route page
src/components/pages/orders      presentational sections
src/components/ui                shared card and API failure notice
src/composables/order-builder    order state, validation, submit
src/composables                  search, click-outside
src/composables/server-controls  stock editor and failure flags
src/services/<feature>           API, DTO mapping, feature errors
src/services/api                 shared fetch client
src/helpers                      money, debounce, stock copy
src/types                        shared domain types
server                           JSON Server, routes, seed data
```

`useOrderBuilder` is the boundary for the order. Section components take props and emit events. They do not call the API or change order state.

Services are grouped by feature (`products`, `warehouses`, `stock`, `orders`, `dev-settings`). Each feature exports its public functions from `index.ts`. Pricing, line validation, and the order payload live in `services/orders/helpers`. Generic helpers such as cent rounding and debounce stay in `src/helpers`.

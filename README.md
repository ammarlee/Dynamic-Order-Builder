# Order Builder

Admin page for creating an order against a selected warehouse. The frontend keeps the admin's accepted quantity and unit price separate from the latest server stock and price, then reconciles conflicts instead of overwriting them.

The task does not define customer information, so customer management is intentionally outside the scope of this implementation.

The task mentions line discounts but provides an order-level discount in the order payload. This implementation uses an order-level discount. Each line shows `—` in the discount column. The summary is the only place the discount is calculated.

## Run the app

Use two terminals.

```sh
pnpm install
pnpm server
```

```sh
pnpm dev
```

The Vue app runs on Vite (usually `http://localhost:5173`). JSON Server runs on `http://localhost:3001`. Vite proxies `/api` to JSON Server, so the UI never calls JSON Server directly.

```sh
pnpm test:unit -- --run
pnpm type-check
```

## Architecture

```text
pages/orders/create/index.vue
  └── components/pages/orders/create/OrderBuilderIndex.vue
        ├── WarehouseIndex
        ├── SearchIndex
        ├── OrderListIndex
        ├── OrderSummaryIndex
        ├── OrderValidationIndex
        └── ServerControlsIndex
```

Services (`src/services`) are grouped by feature. Each feature exposes its public functions from an `index.ts`. API calls, DTO mapping, and feature-specific error handling stay inside that feature. Shared HTTP access stays in `src/services/api`.

Composables (`src/composables`) own reactive behavior: search debounce, warehouse validation, submission, and the order itself. `useOrderBuilder` is the business-logic boundary. Presentational components receive props and emit events. They do not call the API or mutate order state.

Shared helpers (`src/helpers`) own generic utilities such as money rounding and debouncing. Order pricing, validation, and payload mapping live in `services/orders/helpers`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/warehouses` | Warehouse list |
| GET | `/products?search=` | Search the catalog. Returns products and variants only, with no warehouse, price, or stock |
| POST | `/warehouse-stock/validate` | Revalidate only the variants currently in the order |
| PATCH | `/warehouseStock/:id` | Update a stock row (development controls) |
| POST | `/warehouseStock` | Create a stock row when one does not exist yet |
| POST | `/orders` | Create an order. Returns `409` when stock or price no longer matches |
| GET | `/catalog` | Product catalog for Server Controls |
| GET/PATCH | `/dev-settings` | Toggle simulated API failures |

Artificial delays:

- Product search: 500–1000ms
- Warehouse validation: 700–1200ms
- Order submission: 800–1500ms

Server Controls can also force the next search, validation, or submit request to fail. Those switches are development-only and are hidden in production builds.

## Stale requests

Search and warehouse validation each keep an `AbortController` plus a request id. A newer search or warehouse selection aborts the previous request. If an older response still arrives, the request id does not match and the response is ignored. A previous warehouse's price and stock are cleared as soon as the selection changes, so they cannot leak into the new warehouse.

## Pending lines

Products can be added to the order before a warehouse is selected. Lines in this state are marked **pending**: they show `—` for price, stock, and total, and display an "Awaiting warehouse" notice. The discount input and the summary totals are hidden while any line is pending. Create Order is disabled with the message "Select a warehouse to load prices and stock."

As soon as a warehouse is selected, all pending lines are sent to `POST /warehouse-stock/validate` together. Clearing the warehouse resets every existing line back to pending.

## Warehouse revalidation

Search does not send a warehouse id. Adding a variant when a warehouse is already selected calls `POST /warehouse-stock/validate` for the lines in the order. The first price returned for a new line becomes the accepted unit price. Changing warehouse sends only the current order lines to the same endpoint. After that, the accepted `unitPrice` and `quantity` stay as the admin left them.

- Lower stock is shown as `Only N available`. Quantity is not reduced.
- A different price is shown next to the accepted price. It is not applied until the admin clicks **Use current price**.
- A variant with no stock row is marked unavailable and stays on the order.
- Create Order stays disabled until every line is valid, the discount is within the subtotal, and no validation request is in flight.

## Server validation

`POST /orders` compares each submitted `unit_price` and `quantity` with the current JSON Server stock row. The server price is authoritative. A `409` lists `stock_changed`, `price_changed`, and `unavailable` errors. The UI matches them by `productId + variantId`, leaves the lines in place, and keeps the admin's quantity and accepted price. After the admin corrects the line, they can submit again. A failed request never clears the order. The order resets only after a successful create.

## Seeded acceptance path

| Warehouse | Premium Bag / Large |
| --- | --- |
| Warehouse A | 12 available, $4.50 |
| Warehouse B | 2 available, $5.00 |
| Warehouse C | 8 available, $4.50 |

1. Search `bag` without selecting a warehouse. The Add button is enabled. Add Premium Bag / Large. The line appears in **pending** state — price, stock, and totals show `—` and the "Awaiting warehouse" notice is displayed.
2. Select Warehouse A. All pending lines are validated immediately. The line gains Warehouse A's stock (12) and price ($4.50). Add the same variant again — quantity becomes 2 and a toast says the item was already in the order.
3. Switch to Warehouse B. Only the existing line is revalidated. Stock stays sufficient; the price change to $5.00 is shown without replacing $4.50. Create Order is disabled until the price is accepted or the warehouse changes.
4. Switch to Warehouse C. The line is validated again. Warehouse B's $5.00 price does not remain. Warehouse C still matches the accepted $4.50, so the line is valid.
5. Clear the warehouse selection. The line returns to pending and the totals hide again. Re-select Warehouse C — the line validates back to valid.
6. Open Server Controls, choose Warehouse C / Premium Bag / Large, set available quantity to 1 and price to $5.50, then update server state.
7. Submit. The API returns `stock_changed` and `price_changed` on that line. The line stays visible.
8. Set quantity to 1 and click **Use current price**, then submit again. The order is created and the form resets.

## Other assumptions

- Search is warehouse-independent and can be used at any time. A line can be added before a warehouse is selected; it sits in **pending** state (no price or stock) until a warehouse is chosen. Add is disabled only when that variant is already at the warehouse's available quantity or is unavailable.
- Duplicate adds increment quantity by 1. While a line is pending there is no stock cap. Uniqueness is `productId + variantId`.
- Discount is a currency amount, defaults to 0, and must be between 0 and the subtotal. The displayed final total never goes below $0.00.
- The task mentions line discounts but the provided order payload only has an order-level `discount` field. This implementation uses an order-level discount. Each line shows `—` in the Discount column.
- Stock is fetched via `POST /warehouse-stock/validate` rather than the suggested `GET /warehouses/:id/stock`. This lets the server return only the variants currently in the order instead of the full warehouse catalog, which keeps the response small and avoids any client-side filtering.
- The order payload includes `unit_price` per line (not in the doc example). The server uses it to detect `price_changed` conflicts on submit.
- Money is rounded to cents in `format-money.ts` and `order.ts`.
- There is no authentication, customer form, or admin dashboard.

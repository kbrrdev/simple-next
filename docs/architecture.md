# Frontend Architecture

## Overview

This is the customer storefront, built with Next.js, React, and TypeScript, using the App Router. It sells through the `simple-express` API, and holds no business rules of its own.

Public pages are rendered on the server, so that search engines and first visits get real HTML. Personal pages, such as the cart, checkout, and account, run in the browser and call the API directly, the same way the `simple-vite` admin does.

Status: planned. Nothing below is built yet.

## Request Lifecycle

Public pages:

```text
Shopper or search engine
  |
  v
Next.js server (Server Component page)
  |
  v
Server API helper (cached for a short time)
  |
  v
simple-express API (public routes only)
  |
  v
HTML
```

Personal pages:

```text
Shopper
  |
  v
Client Component
  |
  v
Query or mutation hook (TanStack Query)
  |
  v
Browser API client (adds the access token, refreshes it on 401)
  |
  v
simple-express API
  |
  v
Rendered result, or loading, error, and empty states
```

The Next.js server never sees a shopper's tokens, so it only ever calls public routes.

## Application Structure

```text
src/
├── app/              Routes: pages, layouts, and loading, error, and not-found files
├── config/           Environment variables, validated at startup
├── lib/              Browser API client and access token, server API helpers, generated API types, money formatting
├── components/       Shared UI
│   └── ui/           shadcn/ui components
├── features/
│   └── <name>/       Components and hooks for one area, such as cart or checkout
├── styles/           Tailwind entry point
└── test/             Test setup and helpers
```

## Pages and Backend Modules

| Page               | Rendered | Backend routes                                                                                         |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------ |
| Home               | Server   | `GET /api/products`, `GET /api/categories/tree`                                                        |
| Category           | Server   | `GET /api/categories/:id`, `GET /api/products?categoryId=`                                             |
| Search             | Server   | `GET /api/products?search=`                                                                            |
| Product            | Server   | `GET /api/products/:id`                                                                                |
| Blog               | Server   | `GET /api/blogs`, `GET /api/blogs/:id`                                                                 |
| Cart               | Browser  | Guests: `POST /api/cart/preview`. Accounts: `GET`, `DELETE /api/cart`, `/api/cart/items`               |
| Checkout           | Browser  | `GET /api/payment-methods`, `POST /api/orders/preview`, `POST /api/orders` or `/api/orders/guest`      |
| Guest order link   | Browser  | `GET /api/orders/guest/:token`, `POST /api/orders/guest/:token/payment`                                |
| Login and register | Browser  | `POST /api/auth/login`, `/register`, `/refresh`, `/logout`, `GET /api/auth/me`, `POST /api/cart/merge` |
| Password reset     | Browser  | `POST /api/auth/forgot-password`, `/reset-password`                                                    |
| Account            | Browser  | `GET /api/auth/me`, `POST /api/auth/change-password`, `/logout-all`                                    |
| Addresses          | Browser  | `GET`, `POST /api/addresses`, `PATCH`, `DELETE /api/addresses/:id`, `POST /:id/default`                |
| Orders             | Browser  | `GET /api/orders`, `GET /api/orders/:id`, `POST /:id/payment`, `POST /:id/cancel`                      |

## Authentication

- Log in with `POST /api/auth/login` and `client: 'web'`. The response holds the user and an access token, and sets the refresh token as a cookie.
- Access tokens last 15 minutes. Keep them in memory only, and send them as `Authorization: Bearer <token>`.
- The refresh token is an `httpOnly` cookie named `refreshToken`, limited to the `/api/auth` path on the API's domain. JavaScript cannot read it, and the Next.js server never receives it.
- Call `POST /api/auth/refresh` with an empty body and `credentials: 'include'`. It returns a new access token and rotates the cookie.
- On page load, call refresh once to restore the session, as memory is cleared. A shopper who is not logged in gets a `401`, which is normal.
- On a `401`, refresh once and retry the request once. If that fails, go to the login page and come back afterwards.
- Log out with `POST /api/auth/logout`, which ends the session and clears the cookie.
- Staff accounts can shop like anyone else. Admin work belongs in `simple-vite`.
- Login and registration return `429` after repeated attempts. Show a "try again later" message.

## Cart

- A guest's cart lives in `localStorage`, as variant IDs and quantities only, with no prices or personal data.
- `POST /api/cart/preview` prices it. Prices are never stored in the browser.
- A logged-in shopper's cart lives in the API, at `/api/cart`.
- After login, `POST /api/cart/merge` moves the guest cart into the account, keeping the higher quantity for items in both. Then the guest cart is cleared.
- Preview and merge return `adjustments` for reduced quantities and unavailable items. Show them, so the shopper knows what changed.
- Carts do not hold stock. Stock is checked again when the order is placed.

## Checkout

- `GET /api/payment-methods` lists the methods to choose from, without account details. `cod` is cash on delivery.
- `POST /api/orders/preview` returns the total, including tax and shipping, for the shopper to confirm.
- Placing the order sends that total as `expectedTotalCents`. If prices changed in between, the API rejects the order, and the shopper sees the new total.
- Each checkout attempt has one `idempotencyKey`, created when the shopper reaches the final step. Retrying the same attempt reuses it, so a slow network never places two orders.
- Accounts check out with `POST /api/orders` and a saved address. Guests use `POST /api/orders/guest` with an email and address, and get a private order link.
- With a manual method, the order is `awaiting_payment`, and shows the account to pay and the deadline. The shopper pays outside the store, then submits the reference.
- Failed checkouts return `details` for the affected items, such as out of stock. Show them next to those items.

## Guest Orders

- A guest order is reached through a link holding a signed token, such as `/orders/guest/<token>`. Anyone with the link can see the order, so treat it like a password.
- Keep these pages out of search engines, and set `Referrer-Policy: no-referrer` on them, so that the token never leaks to another site.
- Never log the link or send it to analytics.
- Guest orders are never linked to accounts.

## Talking to the API

- In the browser, the API's address comes from `NEXT_PUBLIC_API_URL`. On the server, it comes from `API_URL`, which can be an internal address, and falls back to `NEXT_PUBLIC_API_URL`.
- Browser requests use `credentials: 'include'`, so that the refresh cookie travels with them.
- The backend only accepts origins listed in its `CORS_ORIGINS`, which must include the storefront's address.
- The refresh cookie is `SameSite=Lax`, so the storefront and the API must share a registrable domain, such as `your-store.com` and `api.your-store.com`. Different ports on `localhost` are fine.
- Every response has an `X-Request-Id` header.
- Lists take `page` and `limit`, with `limit` up to 100, and return `meta: { page, limit, total }`.
- Errors look like `{ error: { message, details?, requestId? } }`. `details` lists `{ field, message }` pairs, and `requestId` appears on `500` errors.
- Money is in integer cents, such as `priceCents` and `totalCents`. Format it for display only, for example with `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`.

## API Types

- Types are generated from the backend's OpenAPI document with `openapi-typescript`, into `src/lib/api-schema.d.ts`.
- `npm run api:types` regenerates the file from a running development API, at `/api-docs.json`. The backend does not serve the document in production.
- The file is committed, so that CI can type-check without a running backend.
- Regenerate it whenever the backend changes, and let TypeScript show what broke.

## Data Fetching and Caching

- Server pages fetch through the helpers in `src/lib/`, which are marked `server-only`.
- Public data is cached for a short time with `revalidate`, as prices and stock change. A product page shows availability from the API, and checkout checks it again.
- A product, category, or blog the API cannot find returns `notFound()`, so the page answers `404`.
- In the browser, each feature keeps its query and mutation hooks in `features/<name>/api.ts`.
- Query keys start with the feature name, such as `['cart']` or `['orders', filters]`.
- After a mutation, invalidate the queries it affects.

## Search Engines

- Every public page sets its title and description with the Metadata API, and product pages add their image.
- Personal pages, guest order links, and password reset pages are marked `noindex`.
- Images use `next/image`, and `next.config.ts` allows only the API's or the storage's image host.

## Styling

- Use Tailwind CSS utility classes. Move repeated markup into shared components rather than creating custom CSS classes.
- shadcn/ui components are copied into `src/components/ui`, and are this project's own code. Add each one only when a page needs it.

## Configuration

Configuration comes from environment variables, documented in `.env.example` and read only through `src/config/`.

- `NEXT_PUBLIC_API_URL` is the simple-express API, and is required.
- `API_URL` is the API's address for the Next.js server, if it differs. It stays on the server.
- `NEXT_PUBLIC_STORE_NAME` is shown in the header and page titles.

Variables starting with `NEXT_PUBLIC_` are built into the bundle, so they are public.

## Testing

Tests run with Vitest and React Testing Library. They render components as a user sees them, and mock the API clients rather than the network.

## Build and Deployment

- `npm run build` creates the production build, and `npm start` serves it.
- Run it on the same Ubuntu server setup as the backend, behind Caddy, which handles HTTPS.
- Set security headers, including a Content Security Policy. Its `img-src` must allow the origin of uploaded images, which is the API or the S3 public URL, and `connect-src` must allow the API.
- Never use the development server in production.

## Open Questions

- The API addresses products, categories, and blogs by UUID only, so their URLs would be `/products/<uuid>`. Readable URLs, such as `/products/classic-t-shirt`, need slugs added to the backend first.
- The store's logo and theme are not decided yet.

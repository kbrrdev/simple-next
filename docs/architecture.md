# Frontend Architecture

## Overview

This is the customer storefront, built with Next.js 16, React, and TypeScript, using the App Router with Cache Components. It sells through the `simple-express` API, and holds no business rules of its own.

Public pages are rendered on the server, so that search engines and first visits get real HTML. Personal pages, such as the cart, checkout, and account, run in the browser and call the API directly, the same way the `simple-vite` admin does.

Status: the public catalog is built: home, all products, categories, search, products, and blogs. Login, registration, the cart, checkout, orders, payment references, addresses, and account security are built.

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

| Page                                  | Rendered | Backend routes                                                                                                             |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Home `/`                              | Server   | `GET /api/banners`, `GET /api/products`, `?onSale=true`, `GET /api/categories/tree`                                        |
| All products `/products`              | Server   | `GET /api/products`                                                                                                        |
| Category `/categories/<id>`           | Server   | `GET /api/categories/tree`, `GET /api/products?categoryId=`                                                                |
| Search `/search?q=`                   | Server   | `GET /api/products?search=`                                                                                                |
| Product `/products/<id>`              | Server   | `GET /api/products/:id`, `GET /api/categories/tree`                                                                        |
| Blog `/blogs`, `/blogs/<id>`          | Server   | `GET /api/blogs`, `GET /api/blogs/:id`                                                                                     |
| Cart `/cart`                          | Browser  | Guests: `POST /api/cart/preview`. Accounts: `GET`, `DELETE /api/cart`, `/api/cart/items`. Both: `POST /api/orders/preview` |
| Checkout `/checkout`                  | Browser  | `GET /api/payment-methods`, `POST /api/orders/preview` with a coupon, `POST /api/orders` or `/guest`                       |
| Order `/orders/<id>`                  | Browser  | `GET /api/orders/:id`. It also confirms an account's new order                                                             |
| `/orders/guest#token=`                | Browser  | `GET /api/orders/guest/:token`, `POST /api/orders/guest/:token/payment`                                                    |
| `/login`, `/register`                 | Browser  | `POST /api/auth/login`, `/register`, `/refresh`, `/logout`, `GET /api/auth/me`, `POST /api/cart/merge`                     |
| `/forgot-password`, `/reset-password` | Browser  | `POST /api/auth/forgot-password`, `/reset-password`. See Password Reset                                                    |
| `/account`, `/account/security`       | Browser  | `GET /api/auth/me`, `POST /api/auth/change-password`, `/logout-all`                                                        |
| `/account/addresses`                  | Browser  | `GET`, `POST /api/addresses`, `PATCH`, `DELETE /api/addresses/:id`, `POST /:id/default`                                    |
| `/account/orders`, `/orders/<id>`     | Browser  | `GET /api/orders`, `GET /api/orders/:id`, `POST /:id/payment`, `POST /:id/cancel`                                          |

## Authentication

- Log in with `POST /api/auth/login` and `client: 'web'`. The response holds the user and an access token, and sets the refresh token as a cookie.
- Access tokens last 15 minutes. Keep them in memory only, and send them as `Authorization: Bearer <token>`.
- The refresh token is an `httpOnly` cookie named `refreshToken`, limited to the `/api/auth` path on the API's domain. JavaScript cannot read it, and the Next.js server never receives it.
- Call `POST /api/auth/refresh` with an empty body and `credentials: 'include'`. It returns a new access token and rotates the cookie.
- On page load, call refresh once to restore the session, as memory is cleared. A shopper who is not logged in gets a `401`, which is normal. The login, register, forgot password, and reset password pages skip it, as they do not need a session.
- The session lives in the `['session']` query, from `useSession` in `src/features/auth/session.ts`. The header's account menu reads it, so the session is restored on every page that shows the header.
- Parts of a page hydrate at different times, and the session can arrive in between. Until a part has hydrated, `useSession` reports the session as loading, as the server rendered it, so the browser's first render matches the server's HTML.
- On a `401`, refresh once and retry the request once. If that fails, the session ends, and `RequireAuth` sends the shopper to `/login?next=<page>`.
- After logging in, the shopper returns to `next`. Only paths on this site are accepted, starting with a single `/`, so that a link cannot send the shopper to another site.
- `POST /api/auth/register` returns the user but no session, so the storefront logs in with the same details right after.
- Log out with `POST /api/auth/logout`, which ends the session and clears the cookie. The storefront clears its token and cached personal data even if the request fails.
- Staff accounts can shop like anyone else. Admin work belongs in `simple-vite`.
- Login and registration return `429` after repeated attempts. Show a "try again later" message.

## Password Reset

The storefront has its own reset pages, linked from the login form as "Forgot your password?". They are static pages, so loading them calls no API.

- `/forgot-password` sends `POST /api/auth/forgot-password` with the email. It always answers `202`, so the page always shows "If that email has an account, we sent a link", which reveals nothing about which emails have accounts.
- The backend emails a link to `<PASSWORD_RESET_URL>#token=<token>`. The token is in the fragment, so it never reaches the Next.js server, Caddy's logs, or another site.
- `/reset-password` reads the token from `location.hash` once, keeps it in memory, and removes it from the address bar with `history.replaceState`. Without a token, it shows that the link is invalid, with a link to request a new one.
- The form checks the 8-character minimum as a hint, then sends `POST /api/auth/reset-password` with `{ token, newPassword }`. On success, the backend ends every session, and the page offers the login page. If the link has expired or was used, the API's message shows with a link to get a new one.
- Links expire after 30 minutes and work once, and only the newest one works. Both forms return `429` after repeated attempts.
- Both pages are `noindex`, and `next.config.ts` sends `Referrer-Policy: no-referrer` for them.

The backend's `PASSWORD_RESET_URL` must point at the storefront's `/reset-password`, such as `http://localhost:3001/reset-password`. The admin has no reset page, as staff do not reset their own passwords, so the backend only ever needs this one address.

## Cart

- A guest's cart lives in `localStorage`, as variant IDs and quantities only, with no prices or personal data.
- `POST /api/cart/preview` prices it. Prices are never stored in the browser.
- A logged-in shopper's cart lives in the API, at `/api/cart`.
- After login, `POST /api/cart/merge` moves the guest cart into the account, keeping the higher quantity for items in both. Then the guest cart is cleared.
- Preview and merge return `adjustments` for reduced quantities and unavailable items. Show them, so the shopper knows what changed.
- Carts do not hold stock. Stock is checked again when the order is placed.
- `src/features/cart/api.ts` hides the difference: `useCart` returns the same priced cart for guests and accounts, and the add, quantity, and remove hooks update whichever cart the shopper has. They wait for the session to load, so that an early click goes to the right cart.
- The guest cart is read back through `parseGuestCart`, which drops malformed lines, as stored data can be edited. Each line holds 1 to 99, the API's limit.
- The preview leaves out variants that no longer exist. The cart page removes them from the guest cart, and says so. Unavailable items stay listed, marked, with a Remove button.
- A guest cart over 10 items shows the guest order limit as a hint. The backend's error remains the authority at checkout.
- If the merge fails, the guest cart is kept, and the shopper is told. Logging in still succeeds.
- The cart's summary also asks `POST /api/orders/preview` for the promotions it earns and how far it is from free shipping, as a hint. Checkout shows the authoritative total.
- The header shows the number of items. A guest's count comes from the stored cart, and a logged-in shopper's from `GET /api/cart`, once per page load.

## Checkout

- `GET /api/payment-methods` lists the methods to choose from, without account details. `cod` is cash on delivery, and is offered to accounts only, as guests cannot use it.
- `POST /api/orders/preview` returns the total, including discounts, tax, and shipping, for the shopper to confirm.
- Discounts come from the API in this order: sale prices, then promotions such as buy X get Y, then the better of the typed coupon and any automatic one, then shipping and tax. The summary shows each promotion by name, and the coupon, as rows below the subtotal. Saved orders keep the promotion total, the coupon code, and each item's promotion.
- The coupon field checks the code's format as a hint, 3 to 32 letters, digits, `-` or `_`, as a malformed code would fail the whole preview, then sends it uppercased with the preview. A code that cannot be used comes back as `couponError`, shown under the field. Only a coupon the preview used is sent with the order, so the order's total matches the preview. When an automatic discount beats the typed code, the field says so.
- A guest's email goes to the preview once they leave the email field and it looks valid, so once-per-customer coupons are checked before the order.
- When the store ships free over an amount, the preview's `freeShippingRemainingCents` shows "Add ₱250.00 more for free shipping", in checkout and the cart.
- Placing the order sends that total as `expectedTotalCents`. If prices changed in between, the API rejects the order, and the shopper sees the new total.
- Each checkout attempt has one `idempotencyKey`, created when the shopper first presses "Place order". Retrying the same attempt reuses it, so a slow network never places two orders. Changing the items, address, payment method, email, coupon, or total is a new attempt, with a new key. The key lives in the page's memory, so reloading the page mid-attempt starts a new one.
- Accounts check out with `POST /api/orders` and a saved address, which orders the account's cart and empties it. A new address is saved with `POST /api/addresses` first, then chosen, so that a retry does not save it twice. Guests use `POST /api/orders/guest` with an email, an address that is not saved, and their cart's items, and get a private order link.
- The address form checks required fields, the Philippine mobile number, and the 4-digit postal code as hints. The backend's field errors, named `phone` or `address.phone`, show next to the fields.
- With a manual method, the order is `awaiting_payment`, and shows the account to pay and the deadline. The shopper pays outside the store, then submits the reference.
- Failed checkouts return `details` for the affected items, such as out of stock, named by `variantId`. They show next to those items. After any failure, the preview is loaded again, so the shopper sees the current total.
- After the order is placed, accounts go to `/orders/<id>`, and guests to `/orders/guest#token=<token>`. Both show the order through `OrderDetails`: the status, the items and totals, the account to pay and the deadline for a manual method, and the shipping address. The order page also takes the payment reference while a manual payment is unpaid, and offers cancelling while the API allows it.

## Guest Orders

- A guest order is reached through a link holding a signed token, at `/orders/guest#token=<token>`. Anyone with the link can see the order, so treat it like a password.
- The token is in the fragment, so it never reaches the Next.js server, Caddy's logs, or another site. The page reads it from `location.hash`.
- The backend returns `guestToken` only once, when the order is placed, and does not email it. The confirmation page shows the link with a copy button, and warns that it is the only way back to the order.
- The link is not kept in `localStorage`, which holds only the guest cart.
- Keep these pages out of search engines. `next.config.ts` sends `Referrer-Policy: no-referrer` for `/orders/guest`.
- The guest order page always shows the link with a copy button, as the shopper may open it again from the confirmation.
- Never log the link or send it to analytics.
- Guest orders are never linked to accounts.

## Account

- The account pages share a menu: Overview, Orders, Addresses, and Security. Each page guards itself with `RequireAuth`, rather than the layout, so that Next.js can check every page for instant navigation.
- `/account/orders` keeps the status filter and page number in the URL. An unknown status shows every order.
- The payment reference form checks for 4 to 100 letters, numbers, or hyphens as a hint, and shows the API's message, such as a reference already used. Guests send theirs from the guest order page, with the token.
- Cancelling is offered while the order is `pending`, or waiting for an unpaid payment, mirroring the API. Guests cannot cancel.
- Cancelling, deleting an address, and logging out everywhere ask first, in a dialog.
- Changing the password keeps this session, and the API ends the others. Logging out everywhere ends every session, then clears the local session and goes home. If it fails, the shopper stays logged in, to try again.
- An account can save up to 20 addresses. Deleting the default makes another one the default.

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

- Server pages fetch through `getPublic` in `src/lib/server-api.ts`, which is marked `server-only`.
- Public data is cached for 60 seconds with `'use cache'` and `cacheLife`, as prices and stock change. Cache Components replaces the `revalidate` segment option. Errors are never cached. A product page shows availability from the API, and checkout checks it again.
- Pages that depend on the URL, such as a product, a category, or search results, send their outline first, then stream in the content behind a `loading.tsx`. The first visit to a URL stores the finished page for the next visitors.
- A product, category, or blog that does not exist, or an ID that is not a UUID, calls `notFound()`. As the outline was already sent, the page shows "Page not found" and is marked `noindex`, but answers `200`, for search engines too. Search engines skip `noindex` pages, so they stay out of search results.
- Category pages find the category in the cached category tree, rather than calling `GET /api/categories/:id`, as the tree also holds its subcategories.
- Page numbers, sort orders, and search text in the URL are checked before use. Anything invalid falls back to the default.
- `npm run build` prerenders the home page and the sitemap, so the API must be reachable when building.
- In the browser, each feature keeps its query and mutation hooks in `features/<name>/api.ts`.
- Query keys start with the feature name, such as `['cart']` or `['orders', filters]`.
- After a mutation, invalidate the queries it affects.

## Search Engines

- Every public page sets its title and description with the Metadata API, and product and blog pages add their image.
- Search results are `noindex`, as they repeat the product and category pages.
- `sitemap.xml` lists the home page, all products, categories, products, and blogs, and `robots.txt` points to it.
- Personal pages, guest order links, and password reset pages are marked `noindex`.
- Images use `next/image`, and `next.config.ts` allows only the API's `/uploads` path and `NEXT_PUBLIC_IMAGE_URL`. Next.js refuses images from private addresses, so it allows them only when the API runs on `localhost`, as when developing.

## Styling

The layout follows Airbnb's site structure, and shopping conventions where shoppers expect them, as `DESIGN.md` sets out: a sticky header with the product search in the middle, a scrolling row of category tabs, a wide grid of large photo cards, and a footer band. Colour and type stay quiet, so that the products lead.

- The theme lives in `src/styles/globals.css`. `--brand` is the one accent colour, used for main buttons, the search button, the cart count, selected tabs, and focus rings. The rest is near-black text, greys, and thin lines. The font is Figtree, downloaded at build time by `next/font`.
- The logo is a file under `public/`, set in `src/config/brand.ts`. Without one, the store name shows as a wordmark.
- `page-x` sets the page's side margins, and `productGridClass` in `src/features/catalog/grid.ts` the product grid: two columns on phones, three on tablets, and four from laptops up.
- The header (`src/components/layout`) holds the logo, the product search, the cart, and the account menu. The cart and the account menu are round, light grey buttons, in `--control`, with the bag and profile icons. On phones it holds only the logo: search, the cart, and the account live in a tab bar along the bottom, which checkout hides.
- The home page shows the banners, then "Shop by category" with the top-level categories as large round images, then a row of products on sale, which is left out when nothing is, then a row of new arrivals, then a row for each top-level category, which includes its subcategories' products. Each row links to its full list, and the page ends with a link to `/products`. The sticky category tabs are left out of the home page, and show on the product lists, where their "All" tab is `/products`.
- `/products` is the list of every product, and `/products?onSale=true` the products a current sale covers, from `GET /api/products?onSale=true`. `/search` without search text or a category redirects there, keeping the sort and page, and an empty search goes there too.
- Banners (`src/features/banners`) come from `GET /api/banners`, which returns only the active ones within their dates, in order. They swipe on touch screens and step with arrows on hover, and never play by themselves. Phones get the banner's phone image when it has one, through `<picture>`, so only one image loads. A banner with a `linkUrl` is a link, and its title and subtitle show over the image as text. Without banners, the carousel is left out.
- The product search (`src/features/search`) suggests as the shopper types: up to five products from `GET /api/products?search=`, after a 250 ms pause and from two characters, plus matching categories from the cached category tree, and a link to all results. Before typing, it offers the top-level categories. It follows the combobox pattern, so the arrow keys, Enter, and Escape work, and screen readers hear the suggestions. Nothing is kept between visits, as `localStorage` holds only the guest cart.
- On phones, the tab bar's Search tab opens the search as a full screen, with the tab bar still above it. Tapping Search again, another tab, or any page change closes it.
- The product page (`ProductListing`) shows the photos the way shops do: one large photo with arrows, above a row of thumbnails, and opening a photo shows every photo full screen. Beside it, the title, price, options, and Add to cart stay in view. On phones the photos swipe with dots, and a bar above the tab bar keeps the price and Add to cart in reach. The chosen variant drives the price, stock, and photos: when it has its own photo (`assetId`), that photo shows large.
- Prices come from the API with any sale already applied. `compareAtPriceCents` is the price before the sale, and `Price` (`src/components/Price.tsx`) shows it struck through, in cards, the product page, and cart lines. The product page adds "Save 20%" and, from `saleEndsAt`, "Sale ends in", which counts down each second in the last day. It renders only in the browser, as the server does not know the shopper's clock. Promotions, such as buy X get Y, show by name on the card and the product page. The API applies them in the cart and at checkout.
- A category shows its `icon`, a Lucide icon name set in the admin, through `CategoryIcon` and Lucide's `DynamicIcon`, and otherwise its image. An unknown name falls back to the image.
- Product cards swipe through their photos on touch screens, and show arrows on hover. Photos that fail to load show a quiet placeholder through `FallbackImage`.
- `DESIGN.md` describes the visual system: colours, type, shapes, spacing, page patterns, and components. Follow it when adding or changing a page.
- Use Tailwind CSS utility classes. Move repeated markup into shared components rather than creating custom CSS classes.
- shadcn/ui components are copied into `src/components/ui`, and are this project's own code. Add each one only when a page needs it.
- Pages and sections show a skeleton from `src/components/skeletons.tsx` while they load, shaped like the content to come, so that nothing moves when it arrives. Each skeleton announces what is loading to screen readers through `role="status"`, and hides its blocks. The pulse stops for people who ask for less motion. Small inline waits, such as the checkout total, keep the `Loading` text.

## Configuration

Configuration comes from environment variables, documented in `.env.example` and read only through `src/config/`.

- `NEXT_PUBLIC_API_URL` is the simple-express API, and is required.
- `API_URL` is the API's address for the Next.js server, if it differs. It stays on the server.
- `NEXT_PUBLIC_SITE_URL` is the storefront's own address, used in the sitemap and in links shared on social media, and is required.
- `NEXT_PUBLIC_STORE_NAME` is shown in the header and page titles.
- `NEXT_PUBLIC_IMAGE_URL` is the public address of uploaded images when the API stores them in S3, matching its `S3_PUBLIC_URL`.

Variables starting with `NEXT_PUBLIC_` are built into the bundle, so they are public.

## Testing

Tests run with Vitest and React Testing Library. They render components as a user sees them, and mock the API clients rather than the network.

## Build and Deployment

- `npm run build` creates the production build, and `npm start` serves it. The build calls the API, so build where the API is reachable.
- Run it on the same Ubuntu server setup as the backend, behind Caddy, which handles HTTPS.
- Every page sends security headers, built by `src/config/security-headers.ts` from the API and image addresses, and set in `next.config.ts`:
  - A Content Security Policy. `script-src 'self' 'unsafe-inline'`, as Next.js needs inline scripts. A nonce would make every page render per request, and lose the cached public pages. React escapes API data and the app never inserts HTML, which keeps the risk low.
  - `img-src` allows `'self'`, for Next.js's image optimizer, and the origin of uploaded images, which is the API or the S3 public URL. `connect-src` allows only the API. Styles may be inline, as Next.js and `next/image` set them.
  - `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, and `object-src 'none'`.
  - The development server also gets `'unsafe-eval'` and WebSockets, for reloading.
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that turns off the camera, microphone, and location. Guest order links send `no-referrer` instead.
  - HTTPS, and so `Strict-Transport-Security`, belong to Caddy.
- Never use the development server in production.

## Open Questions

- The API addresses products, categories, and blogs by UUID only, so their URLs are `/products/<uuid>`. Readable URLs, such as `/products/classic-t-shirt`, need slugs added to the backend first.
- The store's logo and theme are not decided yet.

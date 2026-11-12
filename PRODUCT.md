# Product

## Platform

web

## Users

- **Shoppers** browse products, add them to a cart, and check out, mostly on a phone. Many check out as guests, and some create an account to save addresses and see past orders.
- **A developer or operator** sets up each store, points the storefront at its API, and sets the store name.

## Product Purpose

A reusable storefront for stores built on the `simple-express` API. It is cloned and deployed for each store, alongside the `simple-vite` admin. Success means a shopper can find a product, pay, and know what happens next, quickly and without confusion on a phone, and a developer can stand up a new store without changing the storefront.

## Positioning

The storefront holds no business rules. The backend owns prices, stock, tax, shipping, orders, and payments, and the storefront shows what the backend returns. That makes it easy to reuse for every store built on the same API.

## Operating Context

- Philippine stores. Money is shown in pesos (`en-PH`, PHP), and amounts are integer cents.
- Shipping is within the Philippines only, so addresses have no country.
- Payment is cash on delivery, or a manual method such as GCash, Maya, a bank, or PayPal. With a manual method, the shopper pays outside the store, then submits the payment reference for the store to confirm.
- Unpaid manual orders expire after the store's payment window, and their stock is released.
- Typical use is a short visit on a phone, often from a shared link to one product.

## Capabilities and Constraints

- Planned: browsing by category, product pages with up to two options, search, a cart, guest and account checkout, addresses, order history, payment reference submission, guest order links, password reset, and blogs.
- Guests keep their cart on their device, and it moves to their account when they log in.
- A guest can order at most 10 items, and has a limit on unpaid orders.
- Guest order links do not expire. Once an order is finished, its page hides the shipping address.
- Prices, totals, and stock come from the API at the time they are shown, and the total is checked again when the order is placed.
- The backend's error messages are shown as they are.

## Brand Commitments

White-label, with no store branding of its own.

Each deployment sets its store name with `NEXT_PUBLIC_STORE_NAME`. A per-store logo and theme are not decided yet.

## Evidence on Hand

None. There are no real store names, customers, or data. Future work must not invent store branding, sample customers, reviews, or sales figures.

## Product Principles

1. Fast on a phone. Product pages and checkout come first.
2. No surprises at checkout. The shopper sees the real total, including tax and shipping, before placing the order, and clear next steps after it.
3. The backend is the authority. The storefront shows what the API returns and never decides prices or stock.
4. Neutral and reusable. Nothing store-specific is built into the storefront.

## Accessibility & Inclusion

Open: no formal standard is confirmed. The baseline is labelled inputs, real buttons, keyboard use, and readable text at phone sizes.

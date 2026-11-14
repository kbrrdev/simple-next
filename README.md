# simple-next

The customer storefront for the [simple-express](https://github.com/kbrrdev/simple-express) store API, built with Next.js, React, and TypeScript. The admin app is [simple-vite](https://github.com/kbrrdev/simple-vite).

See [docs/architecture.md](docs/architecture.md) for how it works, [DESIGN.md](DESIGN.md) for how it looks, and [PRODUCT.md](PRODUCT.md) for who it is for.

**Status:** the storefront is built: the catalog, login, password reset, cart, checkout, orders, and account pages. Security headers are not set yet. The documents describe the design.

## Setup

Requires Node.js 24 and a running simple-express API.

```bash
npm install
cp .env.example .env
npm run dev
```

The production build prerenders pages from the API, so the API must be running when you run `npm run build`.

The app runs at `http://localhost:3001`, as the API uses port 3000. Add `http://localhost:3001` to the backend's `CORS_ORIGINS`, which only allows the admin app by default.

For password reset emails, set the backend's `PASSWORD_RESET_URL` to `http://localhost:3001/reset-password`. Development emails arrive in Mailpit, at `http://localhost:8025`.

To shop with sample data, run `npm run db:seed` in simple-express. It adds `customer@example.com`, with the password `dev-password-123`.

## Theming

Each store sets its look in two places, then rebuilds:

1. **Brand colour.** In `src/styles/globals.css`, set `--brand`, `--brand-hover` (a little darker), and `--brand-foreground` (the text on it, white or near-black, whichever reads better). `--control` and `--control-hover` set the grey of the header's round buttons.
2. **Logo.** Put the file in `public/brand/`, such as `public/brand/logo.svg`, and set it in `src/config/brand.ts` with the image's width and height. Without a logo, the header shows `NEXT_PUBLIC_STORE_NAME` as a wordmark in the brand colour.

## Scripts

| Script                 | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Development server, on port 3001                           |
| `npm run build`        | Production build                                           |
| `npm start`            | Serves the production build                                |
| `npm run typecheck`    | TypeScript                                                 |
| `npm run lint`         | ESLint                                                     |
| `npm run format`       | Prettier                                                   |
| `npm run format:check` | Prettier, without writing changes                          |
| `npm test`             | Vitest                                                     |
| `npm run test:watch`   | Vitest in watch mode                                       |
| `npm run api:types`    | Regenerates `src/lib/api-schema.d.ts` from the running API |

Run `npm run api:types` whenever the backend's API changes, and commit the result.

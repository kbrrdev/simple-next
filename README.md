# simple-next

The customer storefront for the [simple-express](https://github.com/kbrrdev/simple-express) store API, built with Next.js, React, and TypeScript. The admin app is [simple-vite](https://github.com/kbrrdev/simple-vite).

See [docs/architecture.md](docs/architecture.md) for how it works, and [PRODUCT.md](PRODUCT.md) for who it is for.

**Status:** the project is set up, and the store pages are not built yet. The documents describe the intended design.

## Setup

Requires Node.js 24 and a running simple-express API.

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:3001`, as the API uses port 3000. Add `http://localhost:3001` to the backend's `CORS_ORIGINS`, which only allows the admin app by default.

To shop with sample data, run `npm run db:seed` in simple-express. It adds `customer@example.com`, with the password `dev-password-123`.

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

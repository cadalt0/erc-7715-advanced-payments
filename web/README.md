# Web App (Developer README)

## Quickstart
- Install deps: `npm install --force`
- Run dev server: `npm run dev`
- Open http://localhost:3000

## Data sources (circles)
- Toggle via env: `NEXT_PUBLIC_ENVIO_MODE=on` uses Envio; on/off falls back to on-chain RPC.
- Envio fetch: address list from Envio GraphQL, then membership/details via RPC.
- RPC fallback: existing `findCirclesByMember` path.

## Env
- App env files are ignored (`.env`, `.env.local`). Do not commit secrets.
- Useful vars:
	- `NEXT_PUBLIC_ENVIO_MODE` (`on`|`off`)
	- `NEXT_PUBLIC_ENVIO_GRAPHQL_URL` (eg `http://localhost:8080/v1/graphql`)
	- `NEXT_PUBLIC_ENVIO_ADMIN_SECRET` (local Hasura secret; do not commit)

## Envio indexer (local dev)
- Location: `/web/envio`
- Start: `cd envio && pnpm dev` (requires Docker running; Hasura on :8080)
- Query (admin header required): POST to `http://localhost:8080/v1/graphql`
- Config/ABI: `envio/config.yaml`, `factory.json`, `circle.json`
- Keep `envio/.env*` and `envio/node_modules/` out of git (see .gitignore).

## Scripts
- `npm run dev` — start Next.js (app router)
- `npm run build` — production build

## ERC-7715 context
- Front end for ERC-7715 advanced payments (circles, permissions, recurring flows).
- Contracts surfaced via factory + circle events indexed by Envio when enabled.

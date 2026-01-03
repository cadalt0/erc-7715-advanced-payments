# Advanced Payments

<p align="center">
	<img src="web/public/logo.png" alt="Advanced Payments logo" width="160" height="160" />
</p>

Advanced Payments is inspired by Indian UPI CIRCLE : invite trusted people, family, or friends into a circle and let members spend from each other’s wallets within explicit limits. Everything runs fully on-chain using ERC-7715 delegated permissions, built with MetaMask Advanced Permissions and Envio.

## What This Is
- **Circle-based spending**: Members join with a one-time code and grant a spend limit from their wallet.
- **Trusted network**: Only people you invite can use the shared allowance.
- **Limits + expiry**: Each member controls token, limit, and expiry; changes are self-serve.
- **On-chain + permissioned**: Uses ERC-7715 `DelegationManager` to execute transfers via granted contexts; no custodial balances.

## How It Works
1. Create a circle (you are admin + first member with an initial allowance).
2. Generate a join code and share it privately.
3. A trusted person joins, granting a token allowance (amount + expiry) via ERC-7715.
4. Any member can spend from a member’s allowance up to the limit; every transfer is on-chain and permission-gated.
5. Members can update or revoke their allowance; admins can prune members or join codes.
<img width="1993" height="692" alt="diagram-export-1-3-2026-8_33_02-AM" src="https://github.com/user-attachments/assets/31a6500c-776b-48b2-bf94-85e70d7325aa" />






## Repo Layout
- contracts/ — ERC-7715 circle contracts and types (see contracts/README.md for dev details).
- web/ — Next.js front end (developer notes in web/README.md).
- web/envio/ —  Envio indexer workspace used by the web app when enabled.


## Advanced Permissions Usage
- Requesting/capturing permissions context (MetaMask Advanced Permissions grant) happens when a member joins or updates their grant: see `joinCircle` and `updateMemberPermission` in [contracts/Circle.sol#L70-L152](contracts/Circle.sol#L70-L152).
- Redeeming Advanced Permissions on-chain (executing with the granted context) happens in `transferToken`, which calls `DelegationManager.redeemDelegations`: [contracts/Circle.sol#L303-L352](contracts/Circle.sol#L303-L352).
- Frontend request flow (grant + capture permissionsContext) lives in the MetaMask permissions helper at [web/.next/dev/static/chunks/Documents_0hack_mm%20Advanced_v5%20envio_erc-7715-advanced-payments_web_c38794b0._.js.map](web/.next/dev/static/chunks/Documents_0hack_mm%20Advanced_v5%20envio_erc-7715-advanced-payments_web_c38794b0._.js.map) — see `grantCircleDelegation` and its call to `requestPermission`.
- Frontend redeem path uses the same stored `permissionsContext` when building delegated executions; see execution packing in the compiled bundle [web/.next/dev/server/chunks/ssr/3d15c_@metamask_delegation-toolkit_dist_aa47cfb6._.js.map](web/.next/dev/server/chunks/ssr/3d15c_@metamask_delegation-toolkit_dist_aa47cfb6._.js.map) where `redeemDelegations` calldata is prepared.

## Envio Usage
- Circle discovery using Envio `NEXT_PUBLIC_ENVIO_MODE`: [web/lib/get-circles.ts#L1-L65](web/lib/get-circles.ts#L1-L65) and hook wiring in [web/hooks/use-circles.ts#L1-L70](web/hooks/use-circles.ts#L1-L70).
- Envio GraphQL fetcher is implemented in [web/lib/envio-circles.ts](web/lib/envio-circles.ts) (used when Envio mode is on).
- Envio indexer setup and schema live in [web/envio/config.yaml](web/envio/config.yaml) and the generated workspace under `web/envio/`.


## Feedback
- Issue reference: https://github.com/MetaMask/metamask-docs/issues/2593
- No dev playground to test ERC-7715; requires spinning up the web app to exercise permissions. A hosted sandbox would help.
- LLM context delivery is a single huge text blob; most models can’t ingest it. Break into submodules or add pointers/ranges (e.g., sections 1-100).
- Dev support from the MetaMask team during the hackathon was top-tier.
- Overall building experience: 9/10.

## Running the Web App (quick)
- `cd web`
- `npm install --force`
- `npm run dev`
- Toggle data source: set `NEXT_PUBLIC_ENVIO_MODE=on` to use the Envio indexer; leave it off for RPC fallback.

## Security Notes
- Keep `.env` and Envio env files local; they are git-ignored.
- Permissions are delegated per member; set sensible limits and expiries.




## Learn More
- Contracts walkthrough: [contracts/README.md](contracts/readme.md)
- Web developer notes: [web/README.md](web/README.md)
- Base Sepolia factory: [0x1e30ca31827b66E9b7d4d32e67F59F7E83983213](https://sepolia.basescan.org/address/0x1e30ca31827b66E9b7d4d32e67F59F7E83983213)

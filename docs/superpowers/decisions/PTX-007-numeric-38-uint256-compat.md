# ADR-PTX-007: Balances stored as `NUMERIC(38,0)`; ERC-20 18-decimals reserved

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

ERC-20 conventionally uses `uint256` with 18 decimals. For PTX to port from Supabase to onchain without data conversion, the offchain schema must accept the full `uint256` range natively and the decimals convention must be reserved from the start.

## Decision

All PTX amount columns are `NUMERIC(38,0)`. The constant `PTX_DECIMALS = 18` is reserved in `lib/ptx/constants.ts`. In v1, user-facing PTX is a whole-unit integer — no fractional UI, no decimal arithmetic. At a future onchain snapshot, balances scale mechanically to 18-decimal ERC-20 units (multiply by 10^18 in the contract mint). TypeScript callers use `bigint` end-to-end.

## Consequences

**Positive:**
- No schema migration is required at tokenization; the offchain balance maps 1:1 to the onchain integer balance.
- Arithmetic is always exact: no floating-point drift across rewards, caps, and sinks.
- `bigint` everywhere in TypeScript matches the database column type without coercion.

**Negative / accepted tradeoffs:**
- `NUMERIC(38,0)` is heavier than `BIGINT`; query plans and storage are slightly larger.
- Callers must use `bigint` literals (`250n`) rather than `number` literals.

## Alternatives considered

- **`BIGINT` (PostgreSQL 8-byte integer).** Rejected: 64-bit range cannot cover `uint256` (256-bit). A future onchain port would require widening the column, which is expensive on a populated ledger.
- **`DECIMAL` with scale > 0.** Rejected: implies user-facing fractional PTX, which is out of scope for v1 and conflicts with the integer wei convention used by ERC-20.

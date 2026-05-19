# ADR-PTX-004: PTX is offchain-first; schema is currency-agnostic

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

PTX must preserve future-compatibility with tokenization without requiring it. v1 runs entirely on Supabase, but the schema must port directly to onchain (Base mainnet, ERC-20) without data migration if and when the business and legal decision to migrate is made.

## Decision

All amount columns use `NUMERIC(38,0)`, which covers the full uint256 range. `PTX_DECIMALS = 18` is reserved in `lib/ptx/constants.ts`. The identity table includes nullable `chain_address`, `chain_id`, and `bound_at` columns from day 1. A migration snapshot table is predefined. The v1 `package.json` contains zero web3 dependencies.

## Consequences

**Positive:**
- A future onchain distribution requires no schema migration; balances scale mechanically at snapshot time (multiply by 10^18).
- User identity is continuous across the offchain → onchain boundary via `ptx_user_id`.
- The legal and business decision to migrate stays fully option-preserving for years.

**Negative / accepted tradeoffs:**
- `NUMERIC(38,0)` is heavier than `BIGINT`; query plans and storage are slightly larger.
- JavaScript callers must use `bigint` rather than `number`; this requires TypeScript target `ES2020` or higher (already true in pt-app).
- Some columns and fields exist that have no v1 use (e.g., `chain_address`). Their presence is intentional and documented.

## Alternatives considered

- **TypeScript-only `bigint` without changing DB column types.** Rejected: JavaScript `number` wraps at 2^53 and cannot store uint256 values; the database must natively represent the full range.
- **`DECIMAL` with fractional scale.** Rejected: implies user-facing fractional PTX and is incompatible with the integer wei convention used by ERC-20.

# lib/ptx — PTX Native Social Currency Module

> Spec: `docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md`

## Module Boundary Contract (ADR-PTX-001)

This module exposes a **single public API surface** through `@/lib/ptx`.

**The rest of pt-app may ONLY import from `@/lib/ptx`.**

The following imports are **FORBIDDEN** outside this directory. The list covers
planned submodules too, so the contract stays correct as the module grows:
- `@/lib/ptx/events/*` (scaffolded)
- `@/lib/ptx/ledger/*` (scaffolded)
- `@/lib/ptx/rewards/*` (scaffolded)
- `@/lib/ptx/identity/*` (scaffolded)
- `@/lib/ptx/sinks/*` (planned — not yet scaffolded)
- `@/lib/ptx/fraud/*` (planned — not yet scaffolded)
- `@/lib/ptx/migration/*` (planned — not yet scaffolded)
- `@/lib/ptx/constants` (use re-exports from index)

**Enforcement:** currently an unenforced convention. ADR-PTX-021 specifies an
ESLint `no-restricted-imports` rule, but no `eslint.config.mjs` exists yet (ESLint
is not a dependency) — implementing it + a CI lint step is a Phase 1 prerequisite.
The module is dormant (zero external importers), so there are no violations today.

## Status

**Phase 0 — inert scaffolding.** No file in this module is wired to production. All flags in `flags.ts` default to `false`. No PTX database migrations exist yet — the `supabase/migrations/01[0-7]_ptx_*.sql` files are authored during Phase 1 wire-up, not before. Scaffolded submodules: `identity/`, `events/`, `ledger/`, `rewards/`. Pure compute (rules, caps, multipliers, validators, event-hash) is real and unit-tested; every DB-touching boundary (`resolver`, `emitPtxEvent`, balance/aggregate reads, `verifyChainForUser`) is a stub that throws until Phase 1.

## Activation roadmap

See spec §25 (Phased Visibility Plan). Phase 0 → 1 transition requires migrations applied + operator decision.

## Reversibility

`rm -rf lib/ptx` restores pt-app to its pre-PTX state — the module has zero external importers and adds no runtime dependencies (the ledger hash uses the `node:crypto` builtin). No PTX migrations exist yet, so there is nothing to drop. `vitest` was added as a general dev dependency for module tests.

## Known limitations & Phase 1 prerequisites

Must be addressed before/at Phase 1 wire-up (none block Phase 0 — the module is inert):

- **Boundary not yet enforced (ADR-PTX-021).** No `eslint.config.mjs` exists and ESLint is not installed — `pnpm lint` is vestigial. The import boundary above is currently a convention. Stand up the `no-restricted-imports` rule + a CI lint step.
- **bigint→Number precision (R4).** `rewards/multipliers.ts` (and `referral.ts` / `creator.ts`) compute via `Number(bigint)`. Safe for v1 whole-unit amounts, but loses precision above 2^53. Must move to integer/basis-points math before the 18-decimal scaling reserved by ADR-PTX-007.
- **No migrations authored.** The `supabase/migrations/01[0-7]_ptx_*.sql` files referenced by the spec/plan do not exist yet; they are written during Phase 1.
- **DB-touching functions are stubs** that `throw`: identity `resolver`/`exportIdentity`/`bindWallet`, `emitPtxEvent`, ledger `getPtxBalance`/`getPtxHistory`/aggregate readers, `verifyChainForUser`. Wiring them (with the Merkle chain + idempotency in `emitPtxEvent`) is the core of Phase 1.

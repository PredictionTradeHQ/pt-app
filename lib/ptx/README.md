# lib/ptx — PTX Native Social Currency Module

> Spec: `docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md`

## Module Boundary Contract (ADR-PTX-001)

This module exposes a **single public API surface** through `@/lib/ptx`.

**The rest of pt-app may ONLY import from `@/lib/ptx`.**

The following imports are **FORBIDDEN** outside this directory:
- `@/lib/ptx/events/*`
- `@/lib/ptx/ledger/*`
- `@/lib/ptx/rewards/*`
- `@/lib/ptx/sinks/*`
- `@/lib/ptx/fraud/*`
- `@/lib/ptx/migration/*`
- `@/lib/ptx/identity/*`
- `@/lib/ptx/constants` (use re-exports from index)

Enforced by ESLint rule `no-restricted-imports` (see `eslint.config.mjs`).

## Status

**Phase 0 — inert scaffolding.** No file in this module is wired to production. All flags in `flags.ts` default to `false`. Migrations in `supabase/migrations/01[0-7]_ptx_*.sql` are NOT applied.

## Activation roadmap

See spec §25 (Phased Visibility Plan). Phase 0 → 1 transition requires migrations applied + operator decision.

## Reversibility

`rm -rf lib/ptx` plus drop the 8 PTX migrations restores pt-app to pre-PTX state. No external dependencies introduced.

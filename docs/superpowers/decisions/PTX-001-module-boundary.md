# ADR-PTX-001: Module boundary — single public API surface `@/lib/ptx`

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

The PTX module spans events, ledger, rewards, sinks, fraud, identity, and migration. Without an explicit boundary, internal coupling will leak into the rest of pt-app and a future repo split to `ptx-economy` becomes archaeological rather than mechanical.

## Decision

All consumers outside `lib/ptx/` may import only from `@/lib/ptx` (the public index). Submodule imports such as `@/lib/ptx/events/*`, `@/lib/ptx/ledger/*`, `@/lib/ptx/rewards/*`, `@/lib/ptx/sinks/*`, `@/lib/ptx/fraud/*`, `@/lib/ptx/migration/*`, and `@/lib/ptx/identity/*` are forbidden by ESLint rule `no-restricted-imports`.

## Consequences

**Positive:**
- A future repo split (pt-app → ptx-economy) becomes mechanical: move the directory plus migrations plus the ESLint rule.
- Submodule testability is isolated; internal refactors do not ripple into application code.
- The public API can be governed deliberately — additions require an explicit re-export.

**Negative / accepted tradeoffs:**
- Small initial ceremony as submodules land: the `index.ts` re-export wire-up is written once in Task 15 of the scaffolding plan.
- A discovery cost for contributors who must learn that submodule internals are private.

## Alternatives considered

- **Flat scaffolding (no boundary).** Rejected: internal types and helpers would leak into application code; refactors become cross-cutting changes; the future split is no longer mechanical.
- **Dual repo from day 1.** Rejected: premature given v1 scope and team size. The split trigger criteria are documented in ADR-PTX-008.

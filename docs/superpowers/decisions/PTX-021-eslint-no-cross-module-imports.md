# ADR-PTX-021: ESLint `no-restricted-imports` enforces the PTX module boundary

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

> **Implementation status (2026-05-20): NOT YET IMPLEMENTED.** No `eslint.config.mjs`
> exists and ESLint is not yet a dependency of pt-app, so the boundary below is
> currently an unenforced convention. The module is dormant (zero external
> importers), so there are no violations to catch today. Standing up this rule —
> and a CI lint step to run it — is a Phase 1 prerequisite. The decision stands;
> only its enforcement is pending.

## Context

ADR-PTX-001 establishes the module boundary contract: only `@/lib/ptx` may be imported by code outside `lib/ptx/`. ADR-PTX-003 establishes triple orthogonality: PTX must not couple with reputation-bearing modules in either direction. Convention alone is insufficient — a future contributor refactoring under pressure may bypass it. The boundary must be enforced by tooling.

## Decision

`eslint.config.mjs` includes a `no-restricted-imports` rule that:

- Blocks any file outside `lib/ptx/**` from importing from `@/lib/ptx/events/**`, `@/lib/ptx/ledger/**`, `@/lib/ptx/rewards/**`, `@/lib/ptx/sinks/**`, `@/lib/ptx/fraud/**`, `@/lib/ptx/identity/**`, `@/lib/ptx/migration/**`, or `@/lib/ptx/constants`. The only legal import path is `@/lib/ptx`.
- Additionally blocks specific reputation-bearing files (`app/leaderboard/**`, `app/api/leaderboard/**`, `components/leaderboard/**`, `lib/demo-leaderboard.ts`, `lib/profile-helpers.ts`) from importing `@/lib/ptx` at all. This enforces the orthogonality boundary in the opposite direction.

Violations fail lint, and lint runs in CI.

## Consequences

**Positive:**
- The boundary contract is enforced mechanically, not by convention or PR diligence alone.
- A future reviewer can spot a boundary violation without architecture context — the lint output names the rule directly.
- The reputation-orthogonality rule (ADR-PTX-003) becomes a tooling-enforced invariant rather than a memo.

**Negative / accepted tradeoffs:**
- Adding a new legitimate import path requires updating the ESLint config. This is intentional friction.
- The rule list grows as `lib/ptx` adds submodules. The rule must be maintained alongside the module.

## Alternatives considered

- **Convention plus PR review.** Rejected: convention erodes under pressure; PR review is human and inconsistent across reviewers.
- **A separate package boundary at the npm or workspace level.** Rejected: workspace splitting is the eventual repo-split path (ADR-PTX-008). Until that trigger fires, ESLint is sufficient.

# ADR-PTX-006: Master `PTX_ENABLED` flag plus sub-flags per submodule

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

Progressive activation across the 10-phase visibility plan requires fine-grained gating: operator alpha, internal allowlist, then onboarding for all users, then balances, then referrals, and so on. A single boolean is too coarse; an external feature-flag service is too heavy for v1.

## Decision

A master flag `PTX_ENABLED` accepts three string values: `"false"`, `"true"`, and `"allowlist:uid1,uid2,..."`. Sub-flags per submodule (`PTX_REFERRALS_ENABLED`, `PTX_CREATOR_ENABLED`, `PTX_ONBOARDING_ENABLED`, `PTX_LEARNING_ENABLED`, `PTX_SEASONAL_ENABLED`, `PTX_SPONSOR_ENABLED`, `PTX_ANTI_FRAUD_ENABLED`, and others) inherit gating from the master. If the master is off for a user, every sub-flag returns false for that user, regardless of its own env value. Implemented in `lib/ptx/flags.ts`.

## Consequences

**Positive:**
- Per-user phase control via the allowlist syntax.
- Safe rollback via flag-off — no code revert required for an emergency dark-launch undo.
- The 10-phase visibility plan maps trivially onto the flag set.

**Negative / accepted tradeoffs:**
- Operators must understand the cascade: setting a sub-flag to true while the master is off has no effect.
- The allowlist syntax is strict (CSV, case-sensitive, no fuzzy matching) — misspellings silently fail closed.

## Alternatives considered

- **Single boolean flag.** Rejected: too coarse — flipping it exposes every PTX surface at once.
- **External feature-flag service (LaunchDarkly or similar).** Rejected: adds an external dependency and cost; not needed in v1 given the small surface area.

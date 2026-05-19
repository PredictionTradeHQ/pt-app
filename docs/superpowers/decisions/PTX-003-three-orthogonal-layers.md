# ADR-PTX-003: Reputation ⊥ Bankroll ⊥ PTX — triple orthogonality

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

The Prediction Trade economy has three layers: reputation (forecasting skill), virtual bankroll ($100k gameplay currency), and PTX (social currency). Per the locked strategy memory, these layers must never convert into one another in any direction except `bankroll-staked-correctly → reputation`. If any pair collapses, the architecture is dead.

## Decision

Architecture enforces zero conversion paths between PTX and bankroll, and between PTX and reputation. Multipliers stay scoped within PTX. No earning rule reads accuracy or reputation. No spending sink affects ranking, accuracy display, verification, or content surfacing. `lib/ptx` does not import `lib/leaderboard`, `lib/profile-helpers`, or any reputation-bearing module, and the ESLint rule forbids those modules from importing `lib/ptx`.

## Consequences

**Positive:**
- Reputation stays sacred: forecasting skill cannot be bought, gifted, or substituted.
- Bankroll stays gameplay-only: prediction conviction cannot leak into social currency.
- PTX stays social: participation rewards never affect ranking or verification.

**Negative / accepted tradeoffs:**
- Some product ideas that "feel natural" (e.g., spending PTX to feature a prediction in the leaderboard) are permanently out of scope.
- Cross-layer composition requires explicit ADR review before being considered.

## Alternatives considered

- **Any unified balance.** Rejected: collapses the architecture and erodes the integrity of reputation, which is the platform's core asset.
- **One-way bridge PTX → bankroll for cosmetic perks.** Rejected: any conversion path, even cosmetic, creates pressure to widen it over time.

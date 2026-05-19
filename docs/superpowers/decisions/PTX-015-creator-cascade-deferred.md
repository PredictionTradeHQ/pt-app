# ADR-PTX-015: Creator cascade share (5%) deferred to post-Phase 4

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

A creator cascade share (a small percentage of follower-derived PTX earnings flowing back to the upstream creator) is a plausible later mechanic. Introducing it in v1 would add ledger accounting, attribution complexity, and a new earning pathway with its own caps and audit considerations — all without any signal from real creator activity that the mechanic is wanted or load-bearing.

## Decision

The `source_id` payload structure reserves the fields needed to compute a cascade share later (specifically, the upstream attribution chain). No `creator.cascade.v1` rule is implemented in v1. The mechanic activates no earlier than 90 days after Phase 4 (creator economy and tipping) is stable in production, and only if observed creator activity demonstrates concrete demand for it.

## Consequences

**Positive:**
- v1 scope stays focused on the foundational primitives.
- The payload reservation costs nothing today and keeps the cascade option open without committing to it.
- The activation criterion is signal-driven, not roadmap-driven.

**Negative / accepted tradeoffs:**
- Some early creators may notice the absence and ask. The answer is: not yet, and only with evidence.

## Alternatives considered

- **Implement cascade in v1.** Rejected: introduces accounting and audit complexity before the basic creator earning loop has been observed in production.
- **Drop the cascade option entirely.** Rejected: foreclosing it now removes a useful future tool without benefit. The reservation is cheap.

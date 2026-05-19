# ADR-PTX-016: Paid content gating in PTX deferred

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

A future sink in which readers pay PTX to unlock a creator's premium content (with revenue flowing to that creator) is a plausible later mechanic. Implementing it requires content storage and per-content access control that does not exist in Prediction Trade today.

## Decision

This sink is not in the v1 catalog. Activation requires three prerequisites in product: (a) creator content storage exists, (b) per-content access control exists, and (c) creator-economy signal in Phase 4 or later supports the demand. Until all three are true, the mechanic is out of scope.

## Consequences

**Positive:**
- The v1 sink catalog stays grounded in mechanics that already have product support.
- The mechanic is documented as a known option without becoming a planning commitment.

**Negative / accepted tradeoffs:**
- A creator may expect a "premium content" feature and find PTX has no mechanic for it yet.

## Alternatives considered

- **Build a minimal paywall in v1 to enable the sink.** Rejected: a paywall is a significant product surface. Adding it to enable a single sink inverts the cost/value relationship.
- **Promise the feature for a near-term phase.** Rejected: roadmap commitments without product support drain credibility.

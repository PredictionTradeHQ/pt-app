# ADR-PTX-017: Banned-user PTX policy — freeze, 30-day appeal, burn

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

When a user account is closed for confirmed abuse, the existing PTX balance must be removed from the spendable economy. The procedure must be reversible during an appeal window, fully auditable on the ledger, and operationally boring — three ordinary events on the chain, no special-case delete path.

## Decision

The procedure has three sequential steps:

1. **Freeze.** An event of type `system.fraud.frozen` is emitted on the user's chain. The balance remains visible (for transparency and appeal preparation) but spendability is disabled at the application layer.
2. **30-day appeal window.** The user retains the right to contest the decision. The operator reviews the appeal. If the appeal succeeds, a `system.fraud.unfrozen` event is emitted and the balance becomes spendable again.
3. **Burn.** If the appeal is denied or the window expires without one, a `system.fraud.burned` event is emitted with a signed negative amount that zeros the balance. The prior history remains intact and visible on the audit chain.

Every step writes to the per-user audit chain (ADR-PTX-009). Nothing is hard-deleted. The procedure is encoded as three ordinary event types.

## Consequences

**Positive:**
- The procedure is reversible until the burn step is taken.
- The full sequence is visible on the chain for the user, the operator, and any future auditor.
- No special "delete" code path exists — all state transitions are ordinary append-only events.

**Negative / accepted tradeoffs:**
- The 30-day window means the freeze-to-burn cycle is slow by design. The cap layers (ADR-PTX-012) bound the damage an adversary can do during the window; the appeal window is the deliberate tradeoff for not punishing false positives.

## Alternatives considered

- **Immediate burn at close-of-account time.** Rejected: removes the appeal path, makes false positives permanent, and increases the operational cost of a wrong call.
- **Hard-delete the user's events at close-of-account time.** Rejected: breaks the per-user audit chain and removes the historical record needed for compliance and post-mortem review.

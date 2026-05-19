# ADR-PTX-020: Migration approach — snapshot-based claim, no live bridge

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

Should an onchain phase be approved (no earlier than Phase 9), the offchain ledger must transition to onchain balances. Two broad designs exist: a one-shot snapshot followed by a claim window, or a live bidirectional bridge that mirrors offchain balance changes to chain in real time. The live bridge is operationally significant and introduces an ongoing reconciliation surface.

## Decision

The migration is a single deterministic snapshot of all balances at moment T. An ERC-20 PTX contract is deployed on Base. A `ClaimContract` maps each `ptx_user_id` to its claimable amount; the user redeems by signing from a wallet bound to that `ptx_user_id` (ADR-PTX-005, ADR-PTX-019). The claim window is 12 months. Unclaimed PTX at the end of the window flows to a treasury address. There is no live bidirectional bridge at launch. A bridge is built post-launch only if observed usage justifies the operational cost.

## Consequences

**Positive:**
- The migration is bounded: a single snapshot, a single contract deployment, and a defined claim window.
- The ledger remains the source of truth until the snapshot; no dual-write reconciliation is required.
- Operational complexity stays low.

**Negative / accepted tradeoffs:**
- Users who do not claim within 12 months forfeit their PTX. The window is communicated explicitly and is the cost of bounded operational scope.
- Without a live bridge, ongoing offchain activity after T is not reflected onchain until a future snapshot or bridge mechanism is built.

## Alternatives considered

- **Live bidirectional bridge from day 1.** Rejected: requires continuous reconciliation, a permanently-running bridge service, and significant operational overhead. Out of scope for a first onchain phase.
- **No migration at all; offchain PTX remains permanent.** Rejected: forecloses the optionality that ADR-PTX-004 deliberately preserves.

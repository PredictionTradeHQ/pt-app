# ADR-PTX-009: Per-user Merkle chain of events

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

The PTX ledger is an append-only audit log. The integrity of the log is load-bearing: a corrupted or silently-edited row destroys the credibility of every downstream balance, cap, and migration snapshot. A simple `created_at` timestamp is insufficient — it does not detect tampering by a privileged actor with database access.

## Decision

Every row in `ptx_events` carries three integrity fields per user: `prev_event_hash` (the `event_hash` of the user's previous event), `event_hash` (canonical hash over the row's content), and `seq_per_user` (monotonic per-user sequence). The canonical hash formula is defined in spec §5.1. A read-only verification function `verifyChainForUser(ptx_user_id)` walks the chain and returns the first detected break. Periodic anchoring of chain roots to Base (Phase 7+) is option-preserving but not required for v1 integrity.

This is an audit primitive. It is not a consensus mechanism. There is no peer-to-peer replication, no proof-of-work, no validators. The chain exists so that any future audit — internal or external — can verify that the ledger has not been silently rewritten.

## Consequences

**Positive:**
- Tamper detection at insert time and at audit time, without external dependencies.
- Identity export (ADR-PTX-005) can carry a chain root, providing the user a portable proof of their PTX history.
- If a future onchain anchoring phase is approved, the chain root publishes mechanically — no schema or runtime change.

**Negative / accepted tradeoffs:**
- Each event insert must read the user's last event to compute `prev_event_hash`. This is one extra indexed read per write.
- The chain breaks if a row is hard-deleted. PTX events are immutable — hard deletes are forbidden — but this constraint must be enforced via database permissions, not relied on by convention.

## Alternatives considered

- **`created_at` timestamps only.** Rejected: timestamps detect ordering issues but not silent edits to historic rows.
- **Cryptographic signatures per row.** Rejected: requires key management for every writer and an offline-signing workflow; overkill for v1 where the audit threat model is "privileged operator with DB access", not "third-party adversary".

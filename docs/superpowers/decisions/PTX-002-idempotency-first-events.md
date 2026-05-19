# ADR-PTX-002: Every event has a deterministic, UNIQUE idempotency_key

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

Cron retries, double-clicks, network replays, and race conditions will produce repeat event submissions for the same logical action. Without protection at the storage layer, the ledger double-credits and silent corruption becomes possible.

## Decision

Every `emitPtxEvent` call requires a deterministic `idempotency_key` derived from the logical action (e.g., `ref-act:{referrer}:{referred}:v1` for a referral activation). The `ptx_events` table enforces UNIQUE on this column. Inserts use `ON CONFLICT DO NOTHING`, so a repeat submission is a safe no-op rather than a write.

## Consequences

**Positive:**
- Zero double-credits at the storage layer, regardless of caller bugs.
- Cron jobs can retry freely; at-least-once delivery is acceptable end-to-end.
- Debugging is straightforward — the key encodes the logical event identity.

**Negative / accepted tradeoffs:**
- Callers must construct keys consistently. Each new event type requires defining its key shape explicitly.
- Versioning is part of the key (`:v1`); a deliberate re-emit after a rule change requires a `v2` key and an ADR.

## Alternatives considered

- **Per-row content hash.** Rejected: hashes that include timestamps or actor metadata are non-deterministic and would allow duplicates to land as distinct rows.
- **Transaction-level locks.** Rejected: do not survive cross-process or cross-host retries, and add coordination cost without solving replay.

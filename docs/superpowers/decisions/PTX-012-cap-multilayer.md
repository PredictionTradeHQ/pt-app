# ADR-PTX-012: Caps applied at four levels (L1–L4)

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

Single-level caps are insufficient for the threat model. A per-user-per-day cap does not protect against coordinated activity by many accounts. A global per-day cap does not protect against a single user farming a single source aggressively. Caps also serve a non-defensive purpose: they preserve the social meaning of PTX cosmetics and sinks. If PTX inflates, the cosmetics become trivial and the social signal collapses.

## Decision

PTX rewards pass through four declarative cap layers:

- **L1 — per-user, per-day.** A user's total PTX from all sources cannot exceed `CAP_L1_PER_USER_PER_DAY` in any 24-hour window.
- **L2 — per-user, per-source, per-day.** A user's PTX from a single source type (e.g., `publication`, `lesson_complete`) cannot exceed the L2 cap for that source in any 24-hour window.
- **L3 — global, per-source, per-day.** Total PTX awarded across all users for a single source type cannot exceed the L3 cap in any 24-hour window.
- **L4 — per-user lifetime soft threshold.** Crossing the L4 threshold flags the user for review without blocking; rewards continue.

All cap values live in `lib/ptx/constants.ts` and are referenced declaratively by the rules. Caps clamp; they do not throw.

## Consequences

**Positive:**
- Anti-farm (L1, L2), anti-coordination (L3), and anti-runaway (L4) are addressed at distinct layers without ad-hoc rules.
- Cap values are auditable in one file (`constants.ts`) without code archeology.
- Cosmetic scarcity is preserved: the L1 cap implies that even theoretical maximum activity unlocks only a bounded number of cosmetics per day, which preserves the social meaning of those cosmetics.

**Negative / accepted tradeoffs:**
- A reward computation must aggregate prior-period totals across up to four scopes. In practice this is approximately four indexed queries — acceptable.
- The L4 soft threshold is a flag, not a block. Operators must act on flagged users manually; this is operational overhead that did not exist before.

## Alternatives considered

- **Single per-user-per-day cap only.** Rejected: leaves the global-source surface unprotected; a single high-volume source could inflate the entire economy via many accounts.
- **Hard L4 lifetime cap.** Rejected: hard caps on lifetime accumulation punish long-term engaged users without proportional defensive benefit; the soft flag preserves engagement while surfacing outliers.

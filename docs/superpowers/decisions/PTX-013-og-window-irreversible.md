# ADR-PTX-013: OG window closes once and forever

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

OG status marks users who joined Prediction Trade before a specific operator-chosen cutoff. It is a historical identity marker, not a financial privilege. Its meaning derives entirely from the fact that it cannot be re-opened: the window represents a specific moment in the platform's history. If the window can be re-opened by code path, business decision, or operator override, the identity claim collapses.

## Decision

The `ptx_og_window` table contains a single row. When the operator chooses to close the window, `manual_close_at` is set to the closing timestamp. A Postgres trigger rejects every subsequent `UPDATE` on that row. There is no application code path that can clear `manual_close_at`, and no migration that restores the row's previous state is to be authored under any circumstance.

## Consequences

**Positive:**
- OG scarcity is architecturally guaranteed at the storage layer, not by convention.
- Founder-cohort identity is authentic — it cannot be diluted by future operator decisions, marketing pushes, or platform pivots.
- The trigger makes the irreversibility legible: anyone reading the migration knows the row is one-shot.

**Negative / accepted tradeoffs:**
- A miscalibrated close (e.g., closing too early) is permanent. The decision to close is therefore weight-bearing and requires a deliberate operator action with prior review.
- If a future product direction wants a "second OG cohort", it must be a separate identity construct with a separate name and a separate table. It cannot inherit the OG namespace by re-opening the window.

## Alternatives considered

- **Application-level "do not re-open" convention.** Rejected: convention is not enforcement. A future operator under pressure could reopen the window with a one-line code change.
- **OG as a tier system with multiple cohorts.** Rejected: dilutes the historical-identity property. In v1 OG is a boolean; a future tiered identity construct, if ever introduced, lives in its own ADR and its own table.

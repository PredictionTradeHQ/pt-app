# ADR-PTX-010: Event types and source types are closed enums at code level

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

Runtime registration of new event types (via a config table, environment variable, or DB row) opens an injection vector: an operator with edit access could introduce arbitrary event types that bypass reward caps and audit. It also obscures audit: grep no longer surfaces the full universe of events that the system can emit.

## Decision

`PtxEventType` and `PtxSourceType` are TypeScript string-literal union types compiled into the application. Adding a new type requires a code change, an ADR justifying it, and a deployment. The database stores these as `TEXT` columns (not `CHECK`-constrained) because each new type does not warrant a database migration; validation lives at the application layer where the type union is the source of truth.

## Consequences

**Positive:**
- Cheap to extend (code change), impossible to extend at runtime (no operator-driven injection).
- The full universe of event and source types is greppable from a single file.
- Reviewers can audit type changes through the normal PR process.

**Negative / accepted tradeoffs:**
- Each new event type requires a deploy. This is intentional friction — event taxonomy is load-bearing and should not be hot-edited.

## Alternatives considered

- **Runtime-registered event types via DB.** Rejected: opens an injection path; obscures audit; conflates configuration with code.
- **DB-side `CHECK` constraint on the `event_type` column.** Rejected: each new event type would require a DB migration, raising the friction of adding events without raising the security ceiling above what the application-layer union already provides.

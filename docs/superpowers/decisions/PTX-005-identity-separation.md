# ADR-PTX-005: `ptx_user_id` is separate from `auth.user_id` from day 1

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

PTX identity must be decoupled from the authentication provider. The locked strategy memory states: "Separación de identity/auth. PTX atado a user_id propio, no al auth provider." This decoupling protects the ledger across future auth changes, supports eventual wallet binding, and preserves event history through GDPR deletion.

## Decision

A dedicated `ptx_identities` table is created with `ptx_user_id` (UUID) as primary key and `auth_user_id` (UUID) as foreign key to `auth.users`. The mapping is 1:1 today but the schema is extensible for future binding (`chain_address`, `chain_id`, `bound_at`). The `ptx_identities` row is NOT created at signup — it is lazily created at the first `emitPtxEvent` for a given auth user.

## Consequences

**Positive:**
- The auth provider can change (Supabase Auth → Privy → custom) without rewriting the ledger or rebinding identities.
- Future wallet binding ties to `ptx_user_id`, not to the auth user — onchain identity survives auth-layer changes.
- GDPR deletion of an `auth.users` row does not destroy PTX event history; anonymized retention is straightforward.
- Identity portability operates on a single key.

**Negative / accepted tradeoffs:**
- One extra JOIN at every read path (acceptable: denormalized in views as needed).
- Lazy creation requires care in the first-event code path to be atomic.

## Alternatives considered

- **Reuse `auth.user_id` directly in PTX tables.** Rejected: couples the ledger to Supabase Auth indefinitely; any auth provider change forces a full ledger migration.
- **Separate auth provider for PTX.** Rejected: premature complexity. The separation lives at the identity layer, not at the auth layer.

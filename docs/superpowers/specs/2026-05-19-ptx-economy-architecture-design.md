# PTX Economy v1 — Architecture & Implementation Design

> **Spec ID:** PTX-SPEC-2026-05-19
> **Status:** Approved — ready for implementation plan (scaffolding-only phase)
> **Author:** Design session 2026-05-19
> **Locks honored:** `project_pt_ptx_social_currency_layer.md` (2026-05-18), `project_pt_prediction_identity_economy_layer.md` (2026-05-18), `feedback_pt_observation_phase.md`, `feedback_pt_strategic_direction.md`
> **Codepath:** pt-app (Module Boundary B approach — single repo with strict module boundary)
> **Scope of this spec:** complete architecture + inert scaffolding. ZERO wire-up to production UI. ZERO web3 dependencies. ZERO new migrations applied. Fully reversible.

---

## Executive Summary

### What PTX is

**PTX is the native social currency of Prediction Trade.** It is the third layer of a strict 3-layer economic architecture:

| Layer | Nature | State today | Function |
|-------|--------|-------------|----------|
| 1 — Reputation | Score (not currency) | Exists in product | Forecasting skill / track record |
| 2 — Virtual bankroll ($100k) | Virtual currency | Exists in product | Gameplay / conviction signal |
| 3 — **PTX** | Social currency | This spec | Participation / progression / creator economy |

**Triple orthogonality is mandatory.** No layer converts to another in any direction. The only directional flow permitted is `bankroll-staked-correctly → reputation`; reputation never feeds bankroll, PTX never feeds reputation or bankroll, neither feeds PTX. If any pair collapses, the architecture is dead.

### What PTX is NOT (v1, and probably v2-v6)

- Public crypto / financial token
- Tradeable speculative asset
- Wallet-required, KYC-required, or fiat-rampable
- Governance token / DAO instrument
- Settlement currency for prediction outcomes
- Reputation substitute or accuracy bypass
- Pay-to-win in any surface that affects ranking, accuracy, surfacing, or verification

### Public framing

> "Native social currency of Prediction Trade."

Never: "token", "crypto", "tradeable asset". This framing is permanent until an explicit business + legal decision to migrate to onchain (Phase 9 — far future).

### Scope of v1

- **Foundation layer** for: referrals, creator rewards, onboarding progression, learning rewards, seasonal events, contribution rewards, OG identity, cosmetic identity, peer tipping, community gestures, visibility boosts (social only, not accuracy).
- **Offchain, Supabase-native**, event-sourced, append-only, Merkle-chained per user.
- **Future-compatible** with ERC-20 migration on Base (Phase 7+, separate business decision).
- **Inert in this session**: all code lives in `lib/ptx/`, all migrations stay unapplied, ZERO production UI surfaces touched.

### Phased rollout

| Phase | Visibility | When |
|-------|-----------|------|
| 0 | None — scaffolding only | This session |
| 1 | Operator + alpha whitelist | After migrations applied |
| 2 | Onboarding progress indicator (all users) | After 30d stable in Phase 1 |
| 3 | PTX balance + referrals + cosmetics | After Phase 2 reception positive |
| 4 | Creator highlights + tipping | After Phase 3 loop active |
| 5 | Learning + seasonal | After Phase 4 stable |
| 6 | OG window opens (irreversible) | Operator decision |
| 7+ | Onchain anchoring → wallet binding → ERC-20 distribution | FAR FUTURE — separate business + legal decision |

Each phase has explicit trigger criteria and full rollback (flag off + git revert). See PART IV.

---

# PART I — Foundations

## §1 — Module Boundary Contract

PTX lives as a single module inside pt-app at `lib/ptx/`. The rest of pt-app may **only** import from `@/lib/ptx` (the public API). All internals (`@/lib/ptx/events/...`, `@/lib/ptx/rewards/...`, etc.) are **private to the module**.

### Public API surface

```typescript
// lib/ptx/index.ts (re-exports only — single source of truth for what's public)

// IDENTITY
export { getPtxUserId, exportIdentity } from "./identity";
export type { PtxUserId, PtxIdentityExport } from "./identity";

// EVENTS (write path — emit only, never delete/update)
export { emitPtxEvent } from "./events";
export type { PtxEventType, PtxEventInput, PtxEventResult } from "./events";

// LEDGER (read path)
export { getPtxBalance, getPtxHistory } from "./ledger";
export type { PtxBalance, PtxHistoryEntry, PtxAmount } from "./ledger";

// REWARDS (pure function — no side effects)
export { computePtxReward } from "./rewards";
export type { PtxRewardContext, PtxRewardOutcome } from "./rewards";

// SINKS
export { listPtxSinks, getPtxSinkCost, consumePtx } from "./sinks";
export type { PtxSink, PtxSinkCategory } from "./sinks";

// MIGRATION (stubs in v1)
export { snapshotForChain, anchorEvent } from "./migration";

// FLAGS
export { isPtxEnabled, isPtxSubFlagEnabled } from "./flags";

// CONSTANTS (only safe-to-expose)
export { PTX_VERSION, PTX_DECIMALS } from "./constants";
```

### Enforcement

- **ESLint rule** `no-restricted-imports` blocks any import from `@/lib/ptx/events/*`, `@/lib/ptx/rewards/*`, `@/lib/ptx/ledger/*`, `@/lib/ptx/sinks/*`, `@/lib/ptx/fraud/*`, `@/lib/ptx/migration/*`, `@/lib/ptx/identity/*` outside the `lib/ptx/` directory. Configured in `eslint.config.mjs`.
- **Code review rule**: any PR that introduces such an import must be rejected unless it explicitly justifies a public API extension.
- **ADR-PTX-001** documents this contract.

### Why this matters

- A future split to a separate `ptx-economy` repo becomes mechanical (move the directory + migrations + ESLint rule). See ADR-PTX-008.
- Forces architectural discipline now while the cost is near-zero.

## §2 — Identity Model

`ptx_user_id` is **separate** from `auth.user_id` from day 1, even when they map 1:1 today.

### Schema

```sql
-- supabase/migrations/010_ptx_identities.sql (INERT — not applied)
CREATE TABLE public.ptx_identities (
  ptx_user_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  chain_address  TEXT,
  chain_id       INTEGER,
  bound_at       TIMESTAMPTZ,
  CONSTRAINT chain_consistency CHECK (
    (chain_address IS NULL AND chain_id IS NULL AND bound_at IS NULL)
    OR (chain_address IS NOT NULL AND chain_id IS NOT NULL AND bound_at IS NOT NULL)
  )
);

CREATE INDEX idx_ptx_identities_auth ON public.ptx_identities(auth_user_id);
CREATE INDEX idx_ptx_identities_chain
  ON public.ptx_identities(chain_address) WHERE chain_address IS NOT NULL;

ALTER TABLE public.ptx_identities ENABLE ROW LEVEL SECURITY;
-- RLS policies (defined in migration):
--   - SELECT own row: ptx_user_id WHERE auth_user_id = auth.uid()
--   - SELECT public chain_address fields: granted to anon (for future ENS-style lookups)
```

### Lifecycle

- **Lazy creation**: `ptx_identities` row is **not** auto-created on signup. It is created at the first `emitPtxEvent` call for a given auth user. This prevents pollution of the table by users who never enter the PTX economy.
- **Resolver**: `getPtxUserId(authUserId)` returns existing `ptx_user_id` or creates one lazily (transactionally with the first event insert).
- **Future binding**: `chain_address`, `chain_id`, `bound_at` populate during Phase 8 (wallet binding). Until then they are NULL.

### Why separation matters

- Future auth provider change does not break the ledger.
- Future onchain bind associates a wallet to the `ptx_user_id`, not to the auth.
- GDPR delete of auth row does not destroy PTX history (anonymized retention possible).
- Identity portability (§29) operates on `ptx_user_id`.

ADR-PTX-005 documents this decision.

## §3 — Feature Flags

```typescript
// lib/ptx/flags.ts
const FLAG_DEFAULTS = {
  PTX_ENABLED: false,                  // master kill switch
  PTX_EVENTS_WRITE_ENABLED: false,
  PTX_REWARDS_ENABLED: false,
  PTX_SINKS_ENABLED: false,
  PTX_REFERRALS_ENABLED: false,
  PTX_SPONSOR_ENABLED: false,          // sub-flag for sponsor mechanic
  PTX_CREATOR_ENABLED: false,
  PTX_ONBOARDING_ENABLED: false,
  PTX_LEARNING_ENABLED: false,
  PTX_SEASONAL_ENABLED: false,
  PTX_OG_WINDOW_OPEN: false,           // critical: once set in prod, irreversible
  PTX_ANTI_FRAUD_ENABLED: false,
} as const;

export type PtxFlagSet = typeof FLAG_DEFAULTS;

export function isPtxEnabled(authUserId?: string): boolean;
// PTX_ENABLED supports: "false" | "true" | "allowlist:user_id_a,user_id_b,..."

export function isPtxSubFlagEnabled(flag: keyof PtxFlagSet, authUserId?: string): boolean;
// Sub-flags inherit from PTX_ENABLED; if master is OFF for user, all sub-flags return false.
```

**v1 deployed state**: every flag is `false`. The scaffolding has zero runtime effect in production.

**OG window special handling**: when `PTX_OG_WINDOW_OPEN` is set to `true` in production for the first time, a database row is written to `ptx_og_window` capturing `opened_at` (immutable). When closed via operator action, `manual_close_at` is set and a database trigger rejects any subsequent UPDATE attempts on the row.

ADR-PTX-006 documents flag hierarchy. ADR-PTX-013 documents OG irreversibility.

## §4 — Event Model (Ledger Write Path)

The universe of event types is **closed** at code level. Adding a new event type requires a code change + ADR; runtime registration is impossible.

### Event types (closed enum)

```typescript
// lib/ptx/events/types.ts
export type PtxEventType =
  // EARN
  | "earn.referral.activated"
  | "earn.referral.cascade"
  | "earn.creator.publication"
  | "earn.creator.audience_milestone"
  | "earn.onboarding.milestone"
  | "earn.learning.completion"
  | "earn.seasonal.participation"
  | "earn.seasonal.completion"
  | "earn.contribution.help"
  | "earn.community.quality_engagement"
  | "earn.og.early_adopter"
  | "earn.tipping.received"
  // SPEND
  | "spend.cosmetic.unlock"
  | "spend.tipping.peer"
  | "spend.visibility.feed_boost"
  | "spend.premium.access"
  | "spend.sponsor.referred"
  // SYSTEM (no balance impact, audit only)
  | "system.fraud.flagged"
  | "system.fraud.cleared"
  | "system.fraud.frozen"
  | "system.fraud.burned"
  | "system.reconcile.checkpoint"
  | "system.migration.snapshot"
  | "system.migration.anchor";
```

### Source types

```typescript
// lib/ptx/events/source-types.ts
export type PtxSourceType =
  | "referral_activation"
  | "publication"
  | "milestone"
  | "lesson_complete"
  | "season_event"
  | "moderation_action"
  | "engagement_quality"
  | "og_window"
  | "sink_consumption"
  | "tip_received"
  | "sponsor_action"
  | "fraud_audit"
  | "reconcile_job"
  | "migration_op";
```

### Event payload contract

```typescript
export interface PtxEventInput {
  ptx_user_id: PtxUserId;
  event_type: PtxEventType;
  source_type: PtxSourceType;
  source_id: string;                       // logical FK to originating action
  amount: bigint;                          // SIGNED — earn: +, spend: -, system: 0
  multiplier_applied: number;              // tracked for audit
  context: Record<string, unknown>;        // JSONB, schema validated per event_type
  occurred_at: string;                     // ISO sub-second
  idempotency_key: string;                 // UNIQUE constraint at DB level
}

export interface PtxEventResult {
  event_id: string;
  accepted: boolean;
  reason?: PtxRejectionReason;
  new_balance: bigint | null;
}
```

### Idempotency

Idempotency keys are **mandatory** and **deterministic per logical action**. Examples:
- `ref-act:{referrer_id}:{referred_id}:v1`
- `onboarding:{milestone_id}:{ptx_user_id}`
- `creator-pub:{publication_id}:v1`
- `season:{season_id}:participation:{ptx_user_id}`

Database enforces `UNIQUE` constraint on `idempotency_key`. Double-clicks, cron retries, replays → all yield same event with no double-credit.

ADR-PTX-002 documents idempotency-first approach.
ADR-PTX-010 documents closed-enum decision.

## §5 — Ledger Schema

```sql
-- supabase/migrations/011_ptx_events.sql (INERT)
CREATE TABLE public.ptx_events (
  event_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptx_user_id        UUID NOT NULL REFERENCES public.ptx_identities(ptx_user_id),
  event_type         TEXT NOT NULL,
  source_type        TEXT NOT NULL,
  source_id          TEXT NOT NULL,
  amount             NUMERIC(38,0) NOT NULL,            -- uint256-compatible
  multiplier_applied NUMERIC(10,4) NOT NULL DEFAULT 1.0,
  context            JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at        TIMESTAMPTZ NOT NULL,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key    TEXT NOT NULL UNIQUE,
  schema_version     SMALLINT NOT NULL DEFAULT 1,
  -- Merkle chain (per user)
  prev_event_hash    TEXT,                              -- NULL for first event of user
  event_hash         TEXT NOT NULL,                     -- computed app-side at insert
  seq_per_user       BIGINT NOT NULL,                   -- monotonic per ptx_user_id

  CONSTRAINT amount_for_system_events CHECK (
    (event_type LIKE 'system.%' AND amount = 0)
    OR (event_type LIKE 'earn.%' AND amount > 0)
    OR (event_type LIKE 'spend.%' AND amount < 0)
  )
);

-- APPEND-ONLY enforcement
REVOKE UPDATE, DELETE ON public.ptx_events FROM authenticated, anon, service_role;

CREATE INDEX idx_ptx_events_user_time ON public.ptx_events(ptx_user_id, occurred_at DESC);
CREATE INDEX idx_ptx_events_type ON public.ptx_events(event_type);
CREATE INDEX idx_ptx_events_source ON public.ptx_events(source_type, source_id);
CREATE UNIQUE INDEX idx_ptx_events_user_seq ON public.ptx_events(ptx_user_id, seq_per_user);

ALTER TABLE public.ptx_events ENABLE ROW LEVEL SECURITY;
-- RLS: owner SELECT of own events; service_role full INSERT
```

### Why `NUMERIC(38,0)`

`NUMERIC(38,0)` covers the full `uint256` range used by ERC-20. PTX is stored as raw integer units. `PTX_DECIMALS = 18` (matching ERC-20 standard) is reserved in constants — when onchain migration happens (Phase 9), the column ports directly with no type conversion needed.

ADR-PTX-007 documents this choice.

### Merkle chain per user

Each event row carries:
- `prev_event_hash` — hash of the previous event for this user (NULL for first event)
- `event_hash` — sha256 of this event's content + prev_event_hash
- `seq_per_user` — monotonic counter for ordering verification

**Canonical hash formula** (per ADR-PTX-009):

```
event_hash = sha256(
  prev_event_hash_or_zero ||
  event_type ||
  source_type || ":" || source_id ||
  amount_signed_decimal ||
  occurred_at_iso ||
  sha256(context_canonical_json) ||
  schema_version
)
```

`lib/ptx/ledger/reconcile.ts` provides `verifyChainForUser(ptxUserId)` which replays the events in `seq_per_user` order and recomputes each hash. Any divergence emits `system.reconcile.checkpoint` with `severity: tamper_suspected`.

### Balances view

```sql
-- supabase/migrations/012_ptx_balances_view.sql (INERT)
CREATE VIEW public.ptx_balances AS
SELECT
  ptx_user_id,
  COALESCE(SUM(amount), 0)::NUMERIC(38,0) AS balance,
  COUNT(*) FILTER (WHERE event_type LIKE 'earn.%') AS earn_events,
  COUNT(*) FILTER (WHERE event_type LIKE 'spend.%') AS spend_events,
  MAX(occurred_at) AS last_event_at
FROM public.ptx_events
GROUP BY ptx_user_id;

GRANT SELECT ON public.ptx_balances TO authenticated, anon, service_role;
```

**Read path goes through the view**, not a denormalized column. The view is always faithful to the event log. If performance degrades at scale, the escalation path is documented:

1. Postgres materialized view with periodic refresh.
2. If still insufficient, denormalized `running_balance` column on `ptx_events` computed by trigger — but the view remains source of truth for `reconcile`.

These are not built in v1.

---

# PART II — Reward Engine

## §7 — Engine Architecture

The reward engine is a **pure function**. It never reads/writes the DB. The caller fetches all required context (aggregates, multipliers, flags), passes it in, and receives a pure outcome. The caller (Server Action or cron worker) emits the event using `emitPtxEvent`.

This separation enables:
- Full unit testing without DB
- Dry-run preview of any action's reward
- Future repo split (engine becomes a shared library)

### Contract

```typescript
// lib/ptx/rewards/index.ts
export interface PtxRewardContext {
  ptx_user_id: PtxUserId;
  source_type: PtxSourceType;
  source_id: string;
  payload: Record<string, unknown>;     // typed by source_type
  occurred_at: string;
  user_age_days: number;
  user_lifetime_earned: bigint;
  user_today_earned: bigint;
  user_today_earned_by_source: bigint;
  global_today_earned_by_source: bigint;
  active_multipliers: PtxMultiplierBundle;
}

export interface PtxRewardOutcome {
  granted_amount: bigint;
  rule_matched: string | null;
  multipliers_applied: PtxMultiplierBundle;
  caps_hit: PtxCapKind[];
  rejected: boolean;
  rejection_reason?: PtxRejectionReason;
  event_type_if_granted: PtxEventType | null;
  idempotency_key_proposal: string;
}

export type PtxRejectionReason =
  | "flag_disabled"
  | "rule_not_matched"
  | "cap_exhausted"
  | "fraud_blocked"
  | "duplicate_attempt"
  | "user_ineligible";

export function computePtxReward(ctx: PtxRewardContext): PtxRewardOutcome;
```

ADR-PTX-011 documents the pure-function design.

## §8 — Rule Registry

Each earning rule is a self-contained module exporting a uniform interface:

```typescript
// lib/ptx/rewards/rules/types.ts
export interface PtxEarningRule {
  id: string;                           // e.g., "referral.activated.v1"
  source_types: PtxSourceType[];
  flag_required: keyof PtxFlagSet;
  eligibility(ctx: PtxRewardContext): EligibilityResult;
  compute(ctx: PtxRewardContext): bigint;    // amount BEFORE multipliers/caps
  emits: PtxEventType;
  idempotency(ctx: PtxRewardContext): string;
}
```

Registry: an array in `lib/ptx/rewards/rules/index.ts`. The engine iterates, finds matching rule by `source_types`, validates flag + eligibility, computes amount, applies multipliers, applies caps, returns outcome.

**Closed registry**: rules cannot be registered at runtime. All rules live in versioned code. No dynamic earning path can be injected by a bug or attacker.

## §9 — Earning Rules (v1)

### §9.1 — Referral activation (`referral.activated.v1`)

Activation criteria — all must be true:
- Referred account created ≥ 24h ago (cool-down anti-script)
- Referred user has ≥ 5 predictions made
- ≥ 1 prediction resolved (any outcome)
- Active on ≥ 3 distinct days
- Passes `fraud.sybil` check

```typescript
export const referralActivatedV1: PtxEarningRule = {
  id: "referral.activated.v1",
  source_types: ["referral_activation"],
  flag_required: "PTX_REFERRALS_ENABLED",
  emits: "earn.referral.activated",
  eligibility: (ctx) => {
    const p = ReferralPayloadSchema.parse(ctx.payload);
    if (p.referrer_id === p.referred_id) return { eligible: false, reason: "user_ineligible" };
    if (!p.referred_passed_sybil_check) return { eligible: false, reason: "fraud_blocked" };
    if (p.referred_predictions_count < 5) return { eligible: false, reason: "user_ineligible" };
    if (p.referred_resolved_count < 1) return { eligible: false, reason: "user_ineligible" };
    if (p.referred_active_distinct_days < 3) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => REFERRAL_ACTIVATION_PTX,
  idempotency: (ctx) => {
    const p = ReferralPayloadSchema.parse(ctx.payload);
    return `ref-act:${p.referrer_id}:${p.referred_id}:v1`;
  },
};
```

### §9.2 — Referral cascade (`referral.cascade.v1`)

When a referred user earns from their referrer (level-1), the original referrer (level-2) earns a small share. Maximum 2 levels deep. Coefficients:
- Level 0 (self): 1.0
- Level 1 (direct referrer): 0.30
- Level 2 (referrer's referrer): 0.10
- Beyond: 0.0

This blocks the "infinite cascade pyramid" pattern that signals scam.

Per-user cap: max 20 referrals activated per 30-day window.

### §9.3 — Creator publication (`creator.publication.v1`)

Fires 72h after a publication. Eligibility:
- Publication has ≥ N unique viewers (constant `CREATOR_PUBLICATION_MIN_VIEWERS`)
- Publication has ≥ M meaningful engagement signals (comments, shares, follows gained, predictions inspired — NOT just likes)
- Author has ≤ X publications flagged in the last month (anti-spam)

```typescript
compute: (ctx) => {
  const p = PublicationPayloadSchema.parse(ctx.payload);
  return weightedPublicationReward(p.meaningful_engagement, p.unique_viewers);
},
```

Reward is quality-weighted with diminishing returns and a hard cap.

### §9.4 — Creator audience milestone (`creator.audience_milestone.v1`)

Stable thresholds → reward. Stability requires sustaining ≥ threshold for 7 consecutive days before eligibility (anti-pump-and-dump of bought follows). Each threshold pays once per user (idempotency includes threshold).

Thresholds: 10 / 50 / 100 / 500 / 1000 / 5000 followers.

### §9.5 — Onboarding milestones (`onboarding.milestone.v1`)

Progressive, NOT a single welcome bonus. Each milestone pays once per user.

Milestones v1:
- `first_prediction`
- `first_resolution_seen`
- `first_correct_call`
- `first_streak_3`
- `first_follow_received`
- `first_share_action`

Idempotency: `onboarding:{milestone_id}:{ptx_user_id}`.

Total lifetime onboarding reward: 350 PTX max (single-cosmetic-purchase, not "welcome bonus paradise").

### §9.6 — Learning completion (`learning.completion.v1`)

Per Academy lesson completed (with "real completion" criteria: minimum time + interaction signals + no skip). Bonus for completing a series. Cap: max 4 lessons/day rewarded (incentivizes spread, not binge).

### §9.7 — Seasonal participation & completion

Schema:

```sql
-- supabase/migrations/013_ptx_seasonal_events.sql (INERT)
CREATE TABLE public.ptx_seasonal_events (
  season_id            TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  starts_at            TIMESTAMPTZ NOT NULL,
  ends_at              TIMESTAMPTZ NOT NULL,
  eligibility_jsonb    JSONB NOT NULL,
  completion_jsonb     JSONB NOT NULL,
  participation_reward NUMERIC(38,0) NOT NULL,
  completion_reward    NUMERIC(38,0) NOT NULL,
  snapshot_at          TIMESTAMPTZ,
  CONSTRAINT season_dates CHECK (ends_at > starts_at),
  CONSTRAINT snapshot_after_end CHECK (snapshot_at IS NULL OR snapshot_at >= ends_at)
);
```

Season-end `snapshot_at` is immutable once set (DB trigger rejects UPDATE thereafter). If parameters are wrong, a corrected new season is created — distributed rewards are never reversed.

### §9.8 — Contribution (manual) & community quality (manual)

These are difficult to automate cleanly in v1. Strategy: **operator-approved with audit trail**.

```sql
-- part of 011_ptx_events.sql ecosystem; manual approval table
CREATE TABLE public.ptx_manual_rewards (
  approval_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptx_user_id    UUID NOT NULL REFERENCES public.ptx_identities(ptx_user_id),
  category       TEXT NOT NULL,
  amount         NUMERIC(38,0) NOT NULL,
  context        JSONB NOT NULL,
  approved_by    UUID NOT NULL,
  approved_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

When a row is inserted here, a cron worker emits the corresponding `earn.contribution.help` or `earn.community.quality_engagement` event with `source_id = approval_id`.

### §9.9 — OG early adopter (`og.early_adopter.v1`)

OG status is **status + permanent 1.5× multiplier on all future earns**, not a PTX one-shot. Status is granted within the time-bounded OG window.

```sql
-- supabase/migrations/014_ptx_og_window.sql (INERT)
CREATE TABLE public.ptx_og_window (
  id                    BOOLEAN PRIMARY KEY DEFAULT TRUE,    -- singleton enforcement
  criteria_jsonb        JSONB NOT NULL,
  opened_at             TIMESTAMPTZ NOT NULL,
  manual_close_at       TIMESTAMPTZ,
  closed_reason         TEXT,
  closed_by             UUID,
  total_og_granted      INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT singleton CHECK (id = TRUE)
);

CREATE TABLE public.ptx_og_grants (
  ptx_user_id    UUID PRIMARY KEY REFERENCES public.ptx_identities(ptx_user_id),
  granted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  criteria_met   JSONB NOT NULL                              -- snapshot of what they did
);

-- Trigger: once manual_close_at is set, reject all subsequent UPDATEs
CREATE OR REPLACE FUNCTION enforce_og_window_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.manual_close_at IS NOT NULL THEN
    RAISE EXCEPTION 'OG window is closed; no further mutations allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER og_window_immutable
  BEFORE UPDATE ON public.ptx_og_window
  FOR EACH ROW EXECUTE FUNCTION enforce_og_window_immutability();
```

v1 criteria (combinable, stored in `criteria_jsonb`):
- Time bound (N days from window open)
- User count cap (first K users meeting criteria)
- Participation signals (≥ M onboarding milestones completed, ≥ 5 predictions resolved)

Closure is **manual** by operator once any criterion is reached. Once `manual_close_at` is set, the trigger blocks all further mutations.

ADR-PTX-013 documents OG irreversibility.

## §10 — Multipliers

```typescript
// lib/ptx/rewards/multipliers.ts
export interface PtxMultiplierBundle {
  base: number;       // 1.0 default
  og: number;         // 1.5 if OG, 1.0 otherwise
  cascade: number;    // 1.0 / 0.3 / 0.1 by referral chain depth
  seasonal: number;   // 1.0 default; > 1.0 during active seasons
}

export const PTX_MAX_COMBINED_MULTIPLIER = 2.5;

export function combineMultipliers(b: PtxMultiplierBundle): number {
  return Math.min(b.base * b.og * b.cascade * b.seasonal, PTX_MAX_COMBINED_MULTIPLIER);
}
```

Hard cap on combined multiplier prevents abusive stacking (OG × cascade × seasonal × X).

**Multipliers apply only to PTX earn events.** They never apply to spend events, system events, reputation score, or bankroll. The orthogonality is preserved by architecture.

## §11 — Caps (Anti-Inflation Layer)

4 levels, all declarative in `constants.ts`:

| Level | Limits | Purpose |
|-------|--------|---------|
| L1 | Per-user per-day total PTX earned | Prevent continuous farm |
| L2 | Per-user per-source per-day | Prevent single-loop farm |
| L3 | Global per-source per-day | Prevent mass exploitation |
| L4 | Per-user lifetime (soft, flags only) | Audit signal, not blocking |

Evaluation order: L1 → L2 → L3 → L4. If any cap is hit, `granted_amount = min(reward_before_caps, remaining_under_cap)` and `caps_hit` includes the level. The remaining permitted portion is still emitted; `rejected` is only true if the entire reward is blocked.

Computation queries against `ptx_events` with `event_type LIKE 'earn.%' AND occurred_at >= today_start_user_tz`. The `idx_ptx_events_user_time` index covers these queries.

ADR-PTX-012 documents the multilayer cap design.

## §12 — Reward Computation Flow (end-to-end)

```
Caller (Server Action / cron worker)
  │
  │ 1. Build PtxRewardContext (fetches aggregates, multipliers, flags)
  ▼
computePtxReward(ctx)            [pure function — lib/ptx/rewards]
  │
  │ 2. Find rules matching ctx.source_type
  │ 3. For each rule:
  │      a. Flag check
  │      b. Eligibility check
  │      c. Base compute
  │      d. Apply multipliers
  │      e. Apply caps
  │      f. Build idempotency key
  │
  │ 4. Return PtxRewardOutcome (no side effects)
  ▼
Caller
  │
  │ 5. If rejected → log, return.
  │ 6. If granted_amount > 0:
  │      a. Call fraud.evaluateEvent(ctx, outcome)
  │      b. If fraud blocks → emit system.fraud.flagged, return.
  │      c. Else → emitPtxEvent({ ...ctx, amount: outcome.granted_amount, idempotency_key })
  ▼
emitPtxEvent (lib/ptx/events/emit.ts)
  │
  │ 7. Compute prev_event_hash + event_hash + seq_per_user (Merkle chain)
  │ 8. INSERT INTO ptx_events ... ON CONFLICT (idempotency_key) DO NOTHING
  │ 9. Return event_id + new balance (from view)
```

Critical invariants of the flow:
- Engine reads no DB; caller is responsible for fetching context.
- Idempotency prevents double-credit at the DB level.
- Fraud gate is **before** emit, never after.
- Merkle chain is computed in `emit`, not in `compute` — `compute` stays pure.

---

# PART III — Sinks & Economy Health

## §15 — Sink Catalog

6 categories, all permitted because they do **not** affect anything sacred (reputation, accuracy, ranking, surfacing, verification, anti-Sybil):

```typescript
export type PtxSinkCategory =
  | "cosmetic_identity"
  | "status_marker"
  | "self_visibility"         // social surfaces only, NEVER accuracy leaderboard
  | "community_gesture"
  | "functional_accessory"
  | "learning_access";
```

### Sink contract

```typescript
export interface PtxSink {
  sink_id: string;                      // e.g., "cosmetic.avatar_frame.galaxy.v1"
  category: PtxSinkCategory;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  base_cost: bigint;
  unlock_type: "one_time" | "recurring_subscription" | "consumable";
  recurring_period_days?: number;
  scarcity_signal?: "common" | "rare" | "seasonal" | "OG_only";
  preview_asset_url?: string;
  flag_required?: keyof PtxFlagSet;
  expires_at?: string;
}
```

### v1 sink registry (~24 sinks)

| Sink id | Category | Cost (PTX) | Type |
|---------|----------|-----------:|------|
| `cosmetic.avatar_frame.basic.*` (6 designs) | cosmetic_identity | 200 | one_time |
| `cosmetic.avatar_frame.seasonal.*` | cosmetic_identity | 1500 | one_time (seasonal) |
| `cosmetic.profile_theme.*` (3 designs) | cosmetic_identity | 500 | one_time |
| `cosmetic.username_color.*` (5 colors) | cosmetic_identity | 300 | one_time |
| `cosmetic.profile_badge.*` | cosmetic_identity | 250–1000 | one_time |
| `status.custom_title.slot` | status_marker | 750 | recurring 30d |
| `status.og_badge_display_styles.*` | status_marker | 500 (OG_only) | one_time |
| `visibility.creator_highlights_feature.1d` | self_visibility | 2000 | consumable |
| `visibility.profile_pinned_explanation.7d` | self_visibility | 100 | consumable |
| `community.tip_peer` | community_gesture | variable (min 50) | consumable |
| `community.sponsor_referred_milestone` | community_gesture | 200 | consumable |
| `accessory.export_track_record_premium` | functional_accessory | 500/30d | recurring |
| `accessory.advanced_filtering` | functional_accessory | 750/30d | recurring |
| `accessory.custom_og_card_variant.*` | functional_accessory | 750 | one_time |
| `accessory.early_access_pass` | functional_accessory | 1500/90d | recurring |
| `learning.premium_pack.*` | learning_access | 250–1000 | one_time |

### Hard architectural rules for sinks

1. NO sink may affect reputation, accuracy leaderboard, track record, verified status, anti-Sybil, or algorithmic surfacing of serious predictions.
2. `visibility.creator_highlights_feature` operates on a **separate surface** from `/leaderboard`. `/leaderboard` and `lib/leaderboard*` are forbidden by ESLint rule from importing `@/lib/ptx`.
3. `community.tip_peer` is peer-to-peer atomic: emits `spend.tipping.peer` for sender + `earn.tipping.received` for receiver in a single DB transaction.
4. Cosmetic items are cosmetic only — they do not affect functionality, only appearance.
5. `scarcity_signal: "OG_only"` is checked against `ptx_og_grants` at spend time; impossible to spoof.

## §16 — Quantum Table v1 (single source of truth)

All numbers live in `lib/ptx/constants.ts`. Any rule references them from there.

```typescript
// lib/ptx/constants.ts

export const PTX_VERSION = 1;
export const PTX_DECIMALS = 18;
export const PTX_MAX_COMBINED_MULTIPLIER = 2.5;

// EARNING QUANTUM
export const REFERRAL_ACTIVATION_PTX = 250n;
export const REFERRAL_CASCADE_L2_FACTOR = 0.10;
export const REFERRAL_MAX_ACTIVATIONS_PER_30D_PER_USER = 20;

export const CREATOR_PUBLICATION_BASE_PTX = 50n;
export const CREATOR_PUBLICATION_MAX_PTX = 200n;
export const CREATOR_PUBLICATION_WAIT_MS = 72 * 60 * 60 * 1000;
export const CREATOR_PUBLICATION_MIN_VIEWERS = 25;
export const CREATOR_PUBLICATION_MIN_ENGAGEMENT = 5;
export const CREATOR_AUDIENCE_MILESTONES: Record<number, bigint> = {
  10: 100n, 50: 200n, 100: 400n, 500: 1000n, 1000: 2500n, 5000: 7500n,
};
export const CREATOR_MILESTONE_STABILITY_DAYS = 7;

export const ONBOARDING_REWARDS: Record<string, bigint> = {
  first_prediction:        50n,
  first_resolution_seen:   25n,
  first_correct_call:      100n,
  first_streak_3:          75n,
  first_follow_received:   50n,
  first_share_action:      50n,
};

export const LEARNING_PER_LESSON_PTX = 25n;
export const LEARNING_MAX_LESSONS_PER_DAY_REWARDED = 4;
export const LEARNING_SERIES_BONUS_PTX = 100n;

export const SEASONAL_PARTICIPATION_PTX = 100n;
export const SEASONAL_COMPLETION_PTX = 500n;

export const CONTRIBUTION_MIN_PTX = 50n;
export const CONTRIBUTION_MAX_PTX_PER_APPROVAL = 200n;

export const OG_MULTIPLIER = 1.5;

// CAPS
export const CAP_L1_PER_USER_PER_DAY = 1500n;
export const CAP_L2_PER_USER_PER_SOURCE_PER_DAY: Partial<Record<PtxSourceType, bigint>> = {
  referral_activation: 1000n,
  publication: 500n,
  lesson_complete: 100n,
  season_event: 1000n,
  moderation_action: 500n,
  engagement_quality: 200n,
};
export const CAP_L3_GLOBAL_PER_SOURCE_PER_DAY: Partial<Record<PtxSourceType, bigint>> = {
  referral_activation: 50000n,
  publication: 20000n,
  lesson_complete: 10000n,
  moderation_action: 5000n,
};
export const CAP_L4_USER_LIFETIME_SOFT_THRESHOLD = 100000n;

// SINK PRICING
export const SINK_PRICING: Record<string, bigint> = {
  "cosmetic.avatar_frame.basic": 200n,
  "cosmetic.avatar_frame.seasonal": 1500n,
  "cosmetic.profile_theme": 500n,
  "cosmetic.username_color": 300n,
  "status.custom_title": 750n,
  "visibility.creator_highlights_feature.1d": 2000n,
  "visibility.profile_pinned_explanation.7d": 100n,
  "community.tip_peer.min": 50n,
  "community.sponsor_referred_milestone": 200n,
  "accessory.export_premium.30d": 500n,
  "accessory.advanced_filtering.30d": 750n,
  "accessory.early_access_pass.90d": 1500n,
};
```

### Calibration memo

- 1 onboarding milestone (~50 PTX) ≈ 1/4 of a basic avatar frame (200 PTX)
- 1 referral activated (250 PTX) ≈ 1 basic avatar frame + change
- Full onboarding (~350 PTX) = avatar frame + username color
- 1 average creator publication (~100 PTX) = 1 profile-pinned explanation
- 1 audience milestone of 100 followers (400 PTX) = a profile theme
- OG with 1.5× multiplier reaches cosmetics ~33% faster than non-OG with identical activity
- A typical active user (1 prediction/day, 1 academy lesson/week, occasional follow) → ~30–50 PTX/week → first cosmetic in 4–7 weeks
- A power user (active creator + referrals + onboarding) reaches top sinks in weeks, not days

### Why these numbers
1. Onboarding total of 350 PTX cannot buy even the most expensive cosmetic — no "welcome bonus paradise".
2. L1 cap (1500/day) means farming intensively unlocks at most one seasonal cosmetic per day at theoretical max.
3. L3 global caps prevent coordinated attack (100 accounts) from inflating dramatically.
4. Sink prices are calibrated so progress feels natural in weeks, not days or months.
5. Tipping has no max-per-sender, but L1 cap applies → a user cannot tip > 1500 PTX/day total.

## §17 — Faucet/Sink Equilibrium Tracking

```sql
-- supabase/migrations/015_ptx_economy_metrics.sql (INERT)
CREATE TABLE public.ptx_economy_metrics (
  metric_date            DATE PRIMARY KEY,
  total_earned           NUMERIC(38,0) NOT NULL DEFAULT 0,
  total_spent            NUMERIC(38,0) NOT NULL DEFAULT 0,
  net_inflation          NUMERIC(38,0) NOT NULL DEFAULT 0,
  circulation_total      NUMERIC(38,0) NOT NULL,
  active_earners         INTEGER NOT NULL DEFAULT 0,
  active_spenders        INTEGER NOT NULL DEFAULT 0,
  per_source_earned      JSONB NOT NULL DEFAULT '{}'::jsonb,
  per_sink_spent         JSONB NOT NULL DEFAULT '{}'::jsonb,
  per_user_top_earners   JSONB NOT NULL DEFAULT '[]'::jsonb,
  health_status          TEXT NOT NULL DEFAULT 'green',
  flags                  JSONB NOT NULL DEFAULT '[]'::jsonb,
  computed_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE UPDATE, DELETE ON public.ptx_economy_metrics FROM authenticated, anon, service_role;
```

Daily cron worker (`lib/ptx/sinks/jobs/economy-snapshot.ts`) aggregates the previous day, writes the snapshot, computes health, and emits a `system.reconcile.checkpoint`.

### Health bands

| Status | Criteria | Action |
|--------|----------|--------|
| green | net inflation ∈ [0, +5% circulation], no single source > 60% of faucet | Normal |
| yellow | net inflation > 5% for 3+ consecutive days OR single source > 60% OR single sink > 70% | Operator notified; flagged for review |
| red | net inflation > 15% for 5+ consecutive days OR detected exploit pattern | Operator must investigate; manually disable specific rules if needed |

**Auto-rate-adjustment is forbidden.** It is itself an attack vector (trigger the breaker to throttle other users). Manual review only.

## §18 — Inflation Circuit Breakers

Three explicit protections in `lib/ptx/sinks/inflation-control.ts`:

1. **Per-rule daily ceiling**: each rule's compute clamps against `CAP_L3_GLOBAL_PER_SOURCE_PER_DAY[source_type]`. Once hit, rule emits 0.
2. **Per-day total emission ceiling**: hard global `CAP_GLOBAL_DAILY_EMISSION = 200000n`. At 90% → operator notified. At 100% → all earning rules return 0 for the day. Spend events unaffected.
3. **Velocity throttling**: if a single user generates > X earn events in 60s, fraud module short-circuits the engine.

No breaker changes earning rates or sink prices automatically. Any constant change requires code change + ADR.

## §19 — Anti-Fraud Module

Position: **gatekeeper between reward computation and event emission**.

```typescript
// lib/ptx/fraud/index.ts
export interface FraudEvaluation {
  decision: "allow" | "block" | "review_pending";
  signals: FraudSignal[];
  severity: 1 | 2 | 3 | 4 | 5;
  reason?: string;
}

export async function evaluateEvent(
  ctx: PtxRewardContext,
  outcome: PtxRewardOutcome,
): Promise<FraudEvaluation>;
```

### Four detection layers

**§19.1 Sybil signals** (`lib/ptx/fraud/sybil.ts`)

v1 implements only cheap signals:
- IP class (anonymized to /24 for IPv4, /48 for IPv6)
- Email domain (static disposable-domain blocklist in `data/disposable-domains.ts`)
- Account age vs activity ratio

Deferred to v2 (ADR-PTX-014): canvas fingerprinting, behavioral clustering.

Output: `sybil_score: 0–100`. > 70 → block; 50–70 → review_pending; < 50 → allow.

**§19.2 Velocity controls** (`lib/ptx/fraud/velocity.ts`)

```typescript
export const VELOCITY_LIMITS: Partial<Record<PtxSourceType, { max: number; window_seconds: number }>> = {
  referral_activation: { max: 3, window_seconds: 60 },
  publication:         { max: 1, window_seconds: 3600 },
  lesson_complete:     { max: 2, window_seconds: 600 },
  milestone:           { max: 5, window_seconds: 60 },
};
```

Computed via `COUNT(*) WHERE ptx_user_id = ? AND source_type = ? AND occurred_at > now() - window`.

**§19.3 Pattern detection** (`lib/ptx/fraud/patterns.ts`)

- **Cycle**: A → B → C → A referral loop → block all three + flag
- **Burst clustering**: > 10 referrals to same domain/IP class in 24h → flag for review
- **Mirror users**: > 80% similar event sequences across two users in first week → review
- **Inactive earner**: user earns X PTX, never spends, never engages socially → low-priority flag (not blocked)

Patterns run **after** allow decision (don't block real-time), but emit `system.fraud.flagged` for retroactive intervention.

**§19.4 Audit trail**

```sql
-- supabase/migrations/016_ptx_fraud_signals.sql (INERT)
CREATE TABLE public.ptx_fraud_signals (
  signal_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptx_user_id       UUID NOT NULL REFERENCES public.ptx_identities(ptx_user_id),
  signal_type       TEXT NOT NULL,
  severity          SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
  source_type       TEXT,
  source_id         TEXT,
  context           JSONB NOT NULL,
  triggered_by      TEXT NOT NULL,
  decision          TEXT NOT NULL,
  decided_by        UUID,
  decided_at        TIMESTAMPTZ,
  related_event_id  UUID REFERENCES public.ptx_events(event_id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ptx_fraud_user ON public.ptx_fraud_signals(ptx_user_id);
CREATE INDEX idx_ptx_fraud_pending
  ON public.ptx_fraud_signals(created_at) WHERE decision = 'review_pending';
```

### Banned PTX policy (ADR-PTX-017)

When a user is banned for fraud:
1. **Freeze** balance — emits `system.fraud.frozen`, balance still visible but spendability disabled.
2. **Appeal window** — 30 days for the user to contest.
3. **Burn** — if fraud confirmed (or appeal window expires without successful appeal), emits `system.fraud.burned` for the full frozen balance (negating it via signed event amount).

This is auditable and reversible during appeal.

## §20 — Visibility Boosts (delicate area)

3 visibility primitives, all **architecturally separated** from `/leaderboard`:

1. **Creator Highlights** (`visibility.creator_highlights_feature`)
   - Lives on a **new surface** (e.g., `/discover`), separate from `/leaderboard`.
   - Featured creators pay PTX for 1-day appearance.
   - Max 5 featured at once, chronological + minor randomization.
   - `/leaderboard` is forbidden by ESLint from reading any PTX state.

2. **Profile-pinned content** (`visibility.profile_pinned_explanation`)
   - User pins their own reasoning/explanation in their own profile.
   - 7-day duration, auto-expires.
   - Visible only on that user's profile; no global feed impact.

3. **OG profile flair display**
   - OG badge granted at OG eligibility (not for sale).
   - PTX can customize the badge's visual style (`status.og_badge_display_styles`).
   - 100% cosmetic; no ranking, surfacing, or verification effect.

ADR-PTX-021 enforces the `no-restricted-imports` ESLint rule preventing `/leaderboard` and `lib/leaderboard*` from importing `@/lib/ptx`.

## §21 — Creator Monetization Paths

Three v1 paths:

- **Path A — Audience milestones** (§9.4): stable thresholds → reward.
- **Path B — Quality-weighted publications** (§9.3): sustained engagement → reward weighted.
- **Path C — Community tipping income**: passive peer-to-peer via `community.tip_peer`. No commission, no platform-take in v1.

Deferred paths (documented as ADRs):
- **Path D** — cascade share: 5% of follower-earned PTX flows back to creator (ADR-PTX-015).
- **Path E** — paid content gating: PTX-cost content unlocks for readers, paid to creator (ADR-PTX-016).

---

# PART IV — Visibility, Migration, and the Future

## §25 — Phased Visibility Plan

10 phases total. Phases 0–6 are near-term realistic. Phases 7–10 require separate business + legal decisions and are documented only to guarantee the v1 architecture does not close those doors.

### Phase 0 — Inert scaffolding (this session)
| Visible | Flags ON | Trigger to Phase 1 |
|---------|----------|--------------------|
| Nothing | None | Migrations applied + operator confirms flag infrastructure |

### Phase 1 — Operator + alpha whitelist
| Visible | Flags ON | Trigger to Phase 2 |
|---------|----------|--------------------|
| Hidden `/ptx/me` for whitelisted users | `PTX_ENABLED=allowlist:...` | 30d stable, fraud module tested, no critical bugs |

Initial whitelist: operator only. Expand to 2–3 trusted alpha users after 14 days.

### Phase 2 — Onboarding milestones live
| Visible | Flags ON | Trigger to Phase 3 |
|---------|----------|--------------------|
| Discrete `<OnboardingProgress />` in `/profile` showing milestones earned. PTX balance not shown yet. | `PTX_ENABLED`, `PTX_ONBOARDING_ENABLED` | ≥ 60% active users earn ≥ 1 milestone; no UI confusion; fraud < 1% |

### Phase 3 — Balance visible + referrals + first cosmetics + sponsor mechanic
| Visible | Flags ON | Trigger to Phase 4 |
|---------|----------|--------------------|
| PTX balance in profile header. 6 basic avatar frames. Referral codes in `/settings/referrals`. Sponsor flow inline in onboarding. | `+ PTX_REFERRALS_ENABLED`, `PTX_SPONSOR_ENABLED`, `PTX_SINKS_ENABLED` (cosmetic subset) | ≥ N referrals/week organic; faucet/sink green; zero high-severity fraud |

### Phase 4 — Creator economy + community gestures
| Visible | Flags ON | Trigger to Phase 5 |
|---------|----------|--------------------|
| New `/discover` page with creator highlights. Audience milestone notifications. Profile pinned explanation. Tip button on post views. | `+ PTX_CREATOR_ENABLED` | ≥ M tips/week; creator publication rewards triggering naturally; no "tip farming" patterns |

### Phase 5 — Learning + Seasonal
| Visible | Flags ON | Trigger to Phase 6 |
|---------|----------|--------------------|
| Academy lessons show "+25 PTX" badges. Seasonal banner. `<SeasonalProgress />` in profile. | `+ PTX_LEARNING_ENABLED`, `PTX_SEASONAL_ENABLED` | Stable for 90 days + operator decision |

### Phase 6 — OG window opens (one-time, irreversible)
| Visible | Flags ON | Closure trigger |
|---------|----------|-----------------|
| Global limited-time banner. Eligible users granted OG badge + 1.5× permanent multiplier. | `+ PTX_OG_WINDOW_OPEN=true` | Time bound expires OR user count cap reached |

Closure is operator-initiated. Once `manual_close_at` is set in `ptx_og_window`, the DB trigger blocks all further mutations.

### Phases 7–10 — Onchain path (FAR FUTURE)

| Phase | Action | Trigger |
|-------|--------|---------|
| 7 — Cryptographic anchoring | Monthly snapshot of global Merkle root → Base mainnet tx. Zero user-facing change. | Operator + legal decide ledger trust justifies anchor cost |
| 8 — Wallet binding opt-in | Privy embedded wallets available. Users bind wallet to `ptx_user_id`. No tokens distributed. | Decision explicit; Privy integration staged |
| 9 — ERC-20 distribution | Snapshot frozen. ERC-20 PTX deployed on Base. Claim flow opens. | Major business + legal decision: counsel signoff, social PMF clear, contract audited, communication prepared |
| 10 — Hybrid steady state | Cosmetic txs offchain, high-value events bridge. Token tradeable on Base DEXes. | Long-term post-launch state |

## §26 — Migration Strategy to ERC-20 (Phase 9 deep-dive)

Approach: **snapshot-based claim, no live bridge.**

```
PRE-MIGRATION (Phase 7)
  └── periodic anchoring of Merkle roots → Base
      (proves history hasn't been tampered)

PRE-DISTRIBUTION (Phase 8)
  └── ptx_identities.chain_address populated for opt-in users

MIGRATION T-MOMENT (Phase 9 launch)
  ├── Snapshot frozen: balance_at_snapshot per ptx_user_id
  │   stored in public.ptx_migration_snapshot (immutable)
  ├── ERC-20 PTX deployed on Base
  │   - Standard OpenZeppelin ERC-20 (no custom mint logic post-deploy)
  │   - Total supply = sum(balances) + initial treasury reserves
  │   - Initial mint to escrow contract for auditability
  ├── ClaimContract deployed
  │   - Maps ptx_user_id → claimable amount
  │   - Claim via signature from bound wallet
  │   - Claim window: 12 months (unclaimed → treasury)

POST-MIGRATION
  ├── Offchain ledger continues for low-value (cosmetic, daily activity)
  ├── Bridge events:
  │   - Withdraw to onchain → spend offchain PTX, mint onchain
  │   - Spend onchain on cosmetics → burn onchain, credit offchain
  └── Audit reconciliation: sum(offchain) + sum(onchain) = total supply
```

```sql
-- supabase/migrations/017_ptx_migration_snapshot.sql (INERT — Phase 9 prep)
CREATE TABLE public.ptx_migration_snapshot (
  snapshot_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptx_user_id          UUID NOT NULL REFERENCES public.ptx_identities(ptx_user_id),
  chain_id             INTEGER NOT NULL,
  balance_at_snapshot  NUMERIC(38,0) NOT NULL,
  snapshot_taken_at    TIMESTAMPTZ NOT NULL,
  merkle_proof         JSONB,
  claimed              BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_at           TIMESTAMPTZ,
  claimed_tx_hash      TEXT,
  claimed_address      TEXT,
  UNIQUE(ptx_user_id, chain_id)
);
```

Snapshot is immutable post-creation. A DB trigger rejects UPDATE except to `claimed` and `claimed_*` columns.

ADR-PTX-020 documents the migration strategy.

## §27 — Chain Selection: Base

**Primary**: Base mainnet (chain_id 8453). Testing on Base Sepolia (84532).

| Criterion | Base | Polygon PoS | Solana | Arbitrum | Optimism | Ethereum L1 |
|-----------|:----:|:-----------:|:------:|:--------:|:--------:|:-----------:|
| EVM compat → ERC-20 path | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Gas for cosmetic-priced txs | ~$0.01 | ~$0.01 | ~$0.001 | ~$0.05 | ~$0.05 | $5+ ❌ |
| Consumer brand | ✅ Coinbase | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| Embedded wallet first-class | ✅ (CSW + Privy) | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| Account abstraction maturity | ✅ | 🟡 | n/a | ✅ | ✅ | 🟡 |
| Basenames / identity primitives | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (ENS) |
| Onramp UX (fiat → chain) | ✅ Coinbase | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |

Base wins on consumer-social positioning. Polygon was considered for Polymarket alignment but rejected — PT positions explicitly as separate from financial prediction markets (per `feedback_pt_strategic_direction.md`).

EVM-compatible fallbacks (Arbitrum, Optimism) are documented as swappable if Base sequencer issues become problematic. The schema is chain-agnostic.

ADR-PTX-018 documents this choice.

## §28 — Embedded Wallet Strategy

**Primary**: Privy. Best consumer UX (email + Google/Apple/X → wallet in seconds), self-custody via passkeys, multi-chain, reasonable consumer pricing.

**Alternate**: Coinbase Smart Wallet (native to Base, native account abstraction). Documented as fallback.

In v1 scaffolding:
- Interface `lib/ptx/identity/wallet-binding.ts` exists (no implementation)
- `chain_address`, `chain_id`, `bound_at` columns ready in `ptx_identities`
- ZERO web3 dependencies in `package.json`

Phase 8 activation will require: `pnpm add @privy-io/react-auth`, `<PrivyProvider />` mounting behind `PTX_ONCHAIN_ENABLED`, wallet-bind flow UI, backend signature verification.

ADR-PTX-019 documents this.

## §29 — Identity Portability

```typescript
// lib/ptx/identity/portability.ts
export interface PtxIdentityExport {
  schema_version: 1;
  ptx_user_id: PtxUserId;
  generated_at: string;
  events: PtxEventExport[];
  events_chain_root: string;       // sha256 of last event_hash
  balance_snapshot: {
    earned: bigint;
    spent: bigint;
    balance: bigint;
  };
  multipliers_applied_history: { multiplier: string; activated_at: string }[];
  signature?: {                     // future: wallet-signed
    chain_address: string;
    signature: string;
    signed_at: string;
  };
}

export function exportIdentity(ptxUserId: PtxUserId): Promise<PtxIdentityExport>;
```

v1: function exists, returns the export structure. No UI. API/CLI only.

Use cases:
- GDPR right-to-portability
- Pre-claim proof (Phase 9 user proves balance offline before wallet binding)
- 3rd party verification

---

# PART V — Implementation Skeleton

## §30 — Directory & File Layout

```
pt-app/
├── docs/superpowers/
│   ├── specs/2026-05-19-ptx-economy-architecture-design.md
│   └── decisions/
│       ├── PTX-001-module-boundary.md
│       ├── PTX-002-idempotency-first-events.md
│       ├── PTX-003-three-orthogonal-layers.md
│       ├── PTX-004-offchain-first-currency-agnostic.md
│       ├── PTX-005-identity-separation.md
│       ├── PTX-006-feature-flag-hierarchy.md
│       ├── PTX-007-numeric-38-uint256-compat.md
│       ├── PTX-008-repo-split-trigger.md
│       ├── PTX-009-merkle-event-chain.md
│       ├── PTX-010-closed-enum-events.md
│       ├── PTX-011-pure-function-rewards.md
│       ├── PTX-012-cap-multilayer.md
│       ├── PTX-013-og-window-irreversible.md
│       ├── PTX-014-sybil-signals-v1-scope.md
│       ├── PTX-015-creator-cascade-deferred.md
│       ├── PTX-016-paid-content-gating-deferred.md
│       ├── PTX-017-fraud-banned-ptx-policy.md
│       ├── PTX-018-chain-selection-base.md
│       ├── PTX-019-embedded-wallet-privy.md
│       ├── PTX-020-migration-snapshot-strategy.md
│       └── PTX-021-eslint-no-cross-module-imports.md
│
├── lib/ptx/
│   ├── README.md                     ← boundary contract; do not import internals
│   ├── index.ts                      ← public API (re-exports only)
│   ├── constants.ts                  ← single source of truth
│   ├── flags.ts                      ← feature flag reader
│   │
│   ├── identity/
│   │   ├── index.ts
│   │   ├── resolver.ts               ← auth.user_id ↔ ptx_user_id (lazy)
│   │   ├── portability.ts            ← exportIdentity stub
│   │   ├── wallet-binding.ts         ← interface only
│   │   └── types.ts
│   │
│   ├── events/
│   │   ├── index.ts
│   │   ├── types.ts                  ← closed enum + payload union
│   │   ├── source-types.ts
│   │   ├── emit.ts                   ← INSERT logic (stub)
│   │   └── validators.ts             ← TS guard functions (no zod in v1)
│   │
│   ├── ledger/
│   │   ├── index.ts
│   │   ├── balance.ts                ← reads from ptx_balances view
│   │   ├── aggregates.ts
│   │   └── reconcile.ts              ← chain integrity verifier
│   │
│   ├── rewards/
│   │   ├── index.ts                  ← computePtxReward (pure)
│   │   ├── engine.ts
│   │   ├── multipliers.ts
│   │   ├── caps.ts
│   │   └── rules/
│   │       ├── index.ts              ← registry
│   │       ├── types.ts
│   │       ├── referral.ts
│   │       ├── creator.ts
│   │       ├── onboarding.ts
│   │       ├── learning.ts
│   │       ├── seasonal.ts
│   │       ├── contribution.ts
│   │       ├── community.ts
│   │       └── og.ts
│   │
│   ├── sinks/
│   │   ├── index.ts
│   │   ├── catalog.ts
│   │   ├── consume.ts
│   │   ├── pricing.ts
│   │   ├── inflation-control.ts
│   │   ├── data/v1-catalog.ts        ← 24-sink initial registry
│   │   └── jobs/economy-snapshot.ts  ← cron worker (inert)
│   │
│   ├── fraud/
│   │   ├── index.ts                  ← evaluateEvent
│   │   ├── sybil.ts
│   │   ├── velocity.ts
│   │   ├── patterns.ts
│   │   ├── audit.ts
│   │   └── data/disposable-domains.ts ← static blocklist v1
│   │
│   ├── migration/
│   │   ├── index.ts
│   │   ├── anchor.ts                 ← no-op v1
│   │   ├── snapshot.ts               ← stub returns mock snapshot
│   │   ├── chain-bindings.ts
│   │   └── README.md
│   │
│   └── __tests__/
│       └── README.md                 ← tests live here once wire-up begins
│
├── supabase/migrations/
│   ├── 010_ptx_identities.sql
│   ├── 011_ptx_events.sql
│   ├── 012_ptx_balances_view.sql
│   ├── 013_ptx_seasonal_events.sql
│   ├── 014_ptx_og_window.sql
│   ├── 015_ptx_economy_metrics.sql
│   ├── 016_ptx_fraud_signals.sql
│   └── 017_ptx_migration_snapshot.sql
│
├── types/
│   └── ptx.ts                        ← re-exports from lib/ptx (typing)
│
├── eslint.config.mjs                 ← UPDATE: add no-restricted-imports rule
└── .env.example                      ← UPDATE: add PTX_* flag stubs (commented)
```

### Totals for the scaffolding commit

- 1 spec doc (this file)
- 21 ADRs
- ~50 TypeScript files in `lib/ptx/`
- 8 SQL migration files (NOT applied)
- 2 existing files updated (eslint config + .env.example)
- 0 npm dependencies added
- 0 changes to existing components, pages, hooks, stores
- 0 wire-up to production UI

### Reversibility

```bash
rm -rf lib/ptx \
       supabase/migrations/01[0-7]_ptx_*.sql \
       types/ptx.ts \
       docs/superpowers/specs/2026-05-19-ptx-* \
       docs/superpowers/decisions/PTX-* \
&& git checkout eslint.config.mjs .env.example
```

Full reversion.

## §31 — ADR List (21 ADRs, one-line rationale each)

| ADR | Decision | Rationale |
|-----|----------|-----------|
| PTX-001 | Module boundary: single public API surface `@/lib/ptx` | Explicit boundary; future repo split is mechanical |
| PTX-002 | Idempotency-first: every event has `idempotency_key UNIQUE` | No double-credit from retries/double-clicks |
| PTX-003 | 3 orthogonal layers: reputation ⊥ bankroll ⊥ PTX | Memory locked 2026-05-18; no conversions allowed |
| PTX-004 | Offchain-first + currency-agnostic schema | Future tokenization possible without requiring it |
| PTX-005 | `ptx_user_id` ≠ `auth.user_id` from day 1 | Portable identity; auth provider can change |
| PTX-006 | Feature flag hierarchy: master `PTX_ENABLED` + sub-flags | Progressive controlled activation |
| PTX-007 | `NUMERIC(38,0)` = uint256 compat; `PTX_DECIMALS=18` | Snapshot future ERC-20 with no type conversion |
| PTX-008 | Repo split trigger documented (LoC + complexity criteria) | pt-app → ptx-economy upgrade is mechanical |
| PTX-009 | Merkle event chaining per user | Tamper detection without onchain; pre-anchor primitive |
| PTX-010 | Closed enum of event + source types; no dynamic registration | Audit + safety; no runtime injection |
| PTX-011 | Reward engine pure function; emit is separate | Testability + future repo split |
| PTX-012 | Multilayer caps L1–L4 | Anti-inflation hard guarantees |
| PTX-013 | OG window manual closure + DB trigger irreversibility | Memory: "OG window technically finite" |
| PTX-014 | Sybil signals v1 = IP + email + age; fingerprint deferred | Privacy-respectful starting point |
| PTX-015 | Creator cascade share (5%) — DEFERRED | Hooks reserved, not in v1 |
| PTX-016 | Paid content gating in PTX — DEFERRED | Interesting idea post-PMF |
| PTX-017 | Fraud-banned PTX: freeze → 30d appeal → burn if confirmed | Auditable + appealable |
| PTX-018 | Chain selection: Base mainnet primary, EVM fallbacks documented | Best consumer + AA support |
| PTX-019 | Embedded wallet: Privy primary, Coinbase Smart Wallet fallback | Best consumer UX |
| PTX-020 | Migration approach: snapshot-based claim, no live bridge at launch | Determinism + auditability |
| PTX-021 | ESLint `no-restricted-imports` enforces module boundary | Boundary enforced automatically |

---

# PART VI — Compliance Check & Closing

## §32 — Compliance Matrix (vs. memory `project_pt_ptx_social_currency_layer.md`)

| Requirement (locked 2026-05-18) | Status |
|---|:---:|
| 3 orthogonal layers (reputation / bankroll / PTX) | ✅ |
| Triple orthogonality (zero conversions) | ✅ |
| Reputation sacred (not buyable with PTX) | ✅ |
| PTX as social currency (not public token) | ✅ |
| Public framing "moneda nativa social" (not "token") | ✅ |
| 10 approved use cases implemented | ✅ |
| Hardline avoidances honored (no casino, gambling, speculation) | ✅ |
| Earning: referrals with real activation | ✅ |
| Earning: NO daily-login rewards | ✅ |
| Earning: NO accuracy rewards | ✅ |
| Earning: NO buying PTX with fiat | ✅ |
| Earning: NO bankroll → PTX | ✅ |
| Spending: cosmetic + functional + tipping + visibility-social | ✅ |
| Spending: NO affect on reputation / accuracy ranking / verification | ✅ |
| Spending: NO bypass anti-Sybil | ✅ |
| Spending: NO edits to past predictions | ✅ |
| Spending: NO bankroll touch | ✅ |
| Ledger separate from bankroll + reputation | ✅ |
| Event-sourced append-only + audit trail | ✅ |
| Anti-inflation/deflation circuit breakers | ✅ |
| Future-compatible tokenization | ✅ |
| OG window technically finite | ✅ |
| Identity separate from auth | ✅ |
| Single source of truth for constants | ✅ |
| Zero web3 deps in v1 | ✅ |
| Zero public UI in v1 (Phase 0) | ✅ |
| Total reversibility | ✅ |
| Observation phase no-touch rules respected | ✅ |

## §33 — Open Decisions (resolved during design session)

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Merkle chain in v1? | YES — included from day 1 (ADR-PTX-009) |
| 2 | Lazy vs eager `ptx_user_id` creation? | Lazy (created at first event) |
| 3 | OG window: criteria + closure? | Manual + irreversible + combined criteria (time + count + signals) |
| 4 | Quantum amounts? | Conservative table v1 in `constants.ts` (§16) |
| 5 | OG = boolean or tier? | Boolean in v1 |
| 6 | Creator quality scoring v1 implementation? | Cron scaffold; no ML |
| 7 | Academy integration timing? | Deferred to Phase 5; architecture ready |
| 8 | Tipping minimum? | 50 PTX v1 |
| 9 | Sponsor mechanic? | Yes, Phase 3 behind `PTX_SPONSOR_ENABLED` |
| 10 | Fraud-banned PTX policy? | Freeze → 30d appeal → burn |
| 11 | Disposable email strategy? | Static blocklist v1 |
| 12 | Phase 1 whitelist size? | Operator only initially; 2–3 trusted after 14 days |
| 13 | `/discover` separate from `/leaderboard`? | YES — architectural separation enforced |
| 14 | Anchoring frequency (Phase 7)? | Monthly |

## §34 — Build-Now Scope (the next session)

The next session (after this spec is approved) will use the `writing-plans` skill to produce an atomic implementation plan that creates the ~50 files of inert scaffolding listed in §30. The plan will be structured so each step:

- Adds a coherent group of files (e.g., "step 5: write all rules in lib/ptx/rewards/rules/")
- Compiles cleanly under TypeScript strict (`pnpm build` passes)
- Does not affect any existing component, page, or wired-up behavior
- Can be reverted with a single `git revert` of that commit

The implementation plan itself does **not**:
- Apply any SQL migration (operator decides timing)
- Add any npm dependency
- Touch any UI surface
- Wire any flag to a runtime trigger in production
- Modify any existing module

---

> **End of spec.** Next: implementation plan via `writing-plans` skill.

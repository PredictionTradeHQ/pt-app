# PTX Economy v1 Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete inert scaffolding for PTX v1 economy (~60 files: TS modules, SQL migrations, ADRs, ESLint config) so the PTX foundation layer is ready for progressive activation per the phased visibility plan, without any wire-up to production UI or wired-up code.

**Architecture:** Module Boundary B approach (per `docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md`) — PTX lives as a strictly-bounded module under `lib/ptx/` with a single public API surface (`@/lib/ptx`). All internals are private. SQL migrations are written but NOT applied. Zero web3 dependencies added. Zero touches to existing components, pages, hooks, or stores. Fully reversible.

**Tech Stack:** TypeScript 5.7 strict (existing), Next.js 16.2 App Router (existing), Supabase Postgres (schema target only — no migration applied in this plan), ESLint flat config (existing). **No new npm dependencies.**

**Verification model:** PT has no test framework (per `CLAUDE.md`: "There are no tests. `pnpm build` is the canonical correctness check"). This plan uses `pnpm build` clean (TypeScript strict) as the verification gate after each task. Formal tests will be introduced when Phase 1 wire-up begins (separate plan).

**Out of scope for this plan:**
- Applying any SQL migration (operator decides timing in a separate Phase-1 plan)
- Adding any npm dependency
- Touching any UI surface, component, page, store, or hook
- Wiring any flag to a runtime trigger in production
- Modifying any existing module

**Reversibility:** After completing this plan, the entire scaffolding can be removed with:
```bash
rm -rf lib/ptx supabase/migrations/01[0-7]_ptx_*.sql types/ptx.ts \
       docs/superpowers/specs/2026-05-19-ptx-* docs/superpowers/decisions/PTX-* \
       docs/superpowers/plans/2026-05-19-ptx-* \
&& git checkout eslint.config.mjs .env.example
```

---

## File Structure

Spec reference: `docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md` §30.

```
pt-app/
├── docs/superpowers/
│   ├── specs/2026-05-19-ptx-economy-architecture-design.md   (EXISTS, commit 673690d)
│   ├── plans/2026-05-19-ptx-economy-v1-scaffolding.md         (THIS FILE)
│   └── decisions/PTX-001 … PTX-021.md                         (CREATE — 21 ADRs)
├── lib/ptx/                                                    (CREATE — module root)
│   ├── README.md, index.ts, constants.ts, flags.ts
│   ├── identity/ (5 files)
│   ├── events/ (5 files)
│   ├── ledger/ (4 files)
│   ├── rewards/ (4 files + rules/ subdir with 10 files)
│   ├── sinks/ (5 files + data/ + jobs/)
│   ├── fraud/ (6 files + data/)
│   ├── migration/ (6 files)
│   └── __tests__/README.md
├── supabase/migrations/                                        (8 NEW .sql, NOT applied)
│   └── 010_*.sql … 017_*.sql
├── types/ptx.ts                                                (CREATE)
├── eslint.config.mjs                                           (MODIFY — add no-restricted-imports rule)
└── .env.example                                                (MODIFY — add PTX_* flag stubs)
```

Total: ~60 new files + 2 modified files. 0 npm deps added.

---

## Task 0: Pre-flight verification

**Files:** none modified

- [ ] **Step 1: Verify working tree clean and on main**

```bash
cd "C:/Users/Usuario/Documents/PREDICTION TRADE/pt-infrastructure/pt-app"
git status --short
git rev-parse --abbrev-ref HEAD
git log --oneline -3
```

Expected: empty status; branch `main`; HEAD is `673690d docs(ptx): canonical architecture spec — PTX v1 economy design`.

- [ ] **Step 2: Verify spec exists**

```bash
ls -la docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
```

Expected: file exists, ~1475 lines.

- [ ] **Step 3: Verify baseline build is clean**

```bash
corepack pnpm build 2>&1 | tail -10
```

Expected: TypeScript 0 errors, "Compiled successfully".

- [ ] **Step 4: Verify migrations 010-017 do NOT already exist**

```bash
ls supabase/migrations/ | grep -E "^01[0-7]_"
```

Expected: no matches (range is free).

- [ ] **Step 5: Verify `lib/ptx/` does NOT already exist**

```bash
ls lib/ptx 2>&1
```

Expected: "No such file or directory".

If any check fails, STOP and report. Do NOT proceed.

---

## Task 1: Bootstrap `lib/ptx/` with README, public API stub, and `__tests__/README.md`

**Files:**
- Create: `lib/ptx/README.md`
- Create: `lib/ptx/index.ts`
- Create: `lib/ptx/__tests__/README.md`

- [ ] **Step 1: Create `lib/ptx/README.md`**

```markdown
# lib/ptx — PTX Native Social Currency Module

> Spec: `docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md`

## Module Boundary Contract (ADR-PTX-001)

This module exposes a **single public API surface** through `@/lib/ptx`.

**The rest of pt-app may ONLY import from `@/lib/ptx`.**

The following imports are **FORBIDDEN** outside this directory:
- `@/lib/ptx/events/*`
- `@/lib/ptx/ledger/*`
- `@/lib/ptx/rewards/*`
- `@/lib/ptx/sinks/*`
- `@/lib/ptx/fraud/*`
- `@/lib/ptx/migration/*`
- `@/lib/ptx/identity/*`
- `@/lib/ptx/constants` (use re-exports from index)

Enforced by ESLint rule `no-restricted-imports` (see `eslint.config.mjs`).

## Status

**Phase 0 — inert scaffolding.** No file in this module is wired to production. All flags in `flags.ts` default to `false`. Migrations in `supabase/migrations/01[0-7]_ptx_*.sql` are NOT applied.

## Activation roadmap

See spec §25 (Phased Visibility Plan). Phase 0 → 1 transition requires migrations applied + operator decision.

## Reversibility

`rm -rf lib/ptx` plus drop the 8 PTX migrations restores pt-app to pre-PTX state. No external dependencies introduced.
```

- [ ] **Step 2: Create `lib/ptx/index.ts` (skeleton — will be filled in Task 17)**

```typescript
/**
 * PTX — Native social currency module for Prediction Trade.
 *
 * Public API surface. Do not import from submodules directly.
 *
 * Spec: docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
 * ADR-PTX-001: module boundary contract.
 *
 * NOTE: Phase 0 scaffolding. All exports are inert stubs until wire-up phases.
 */

// Re-exports will be populated as submodules land (Tasks 5-15).
// For Phase 0, this file intentionally exports nothing to keep the public
// surface explicit. The final re-export wire-up happens in Task 17.

export {};
```

- [ ] **Step 3: Create `lib/ptx/__tests__/README.md`**

```markdown
# lib/ptx/__tests__

Tests live here once wire-up begins (Phase 1+).

PT has no test framework today. Activation Phase 1 plan will introduce vitest or similar and populate this directory. Until then, verification is `pnpm build` clean (TypeScript strict).
```

- [ ] **Step 4: Run build**

```bash
corepack pnpm build 2>&1 | tail -5
```

Expected: 0 errors, clean compile.

- [ ] **Step 5: Commit**

```bash
git add lib/ptx/README.md lib/ptx/index.ts lib/ptx/__tests__/README.md
git commit -m "feat(ptx): bootstrap lib/ptx module with boundary contract"
```

---

## Task 2: Write `lib/ptx/constants.ts` (single source of truth)

**Files:**
- Create: `lib/ptx/constants.ts`

This file is THE source of truth for every PTX number. Embed full content per spec §16. Treat each numeric constant as a load-bearing decision.

- [ ] **Step 1: Create `lib/ptx/constants.ts` with full content from spec §16**

Embed the full contents (~120 lines) shown in spec §16, including:
- `PTX_VERSION`, `PTX_DECIMALS`, `PTX_MAX_COMBINED_MULTIPLIER`
- All earning quantum constants (`REFERRAL_ACTIVATION_PTX`, `ONBOARDING_REWARDS`, etc.)
- All cap constants (`CAP_L1_*` through `CAP_L4_*`)
- All sink pricing constants (`SINK_PRICING`)
- Type imports from `./events/source-types` (will be resolved when Task 6 lands)

**Important note about ordering:** This file imports `PtxSourceType` from `./events/source-types` which does not yet exist. To avoid breaking the build mid-task, write the file but use a **temporary inline type** for `PtxSourceType` (string literal union matching the spec). Replace the temporary with the real import in Task 6 Step 5.

Temporary local type at top of constants.ts:

```typescript
// TEMPORARY local type — replaced by import from ./events/source-types in Task 6 Step 5.
type PtxSourceType =
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

- [ ] **Step 2: Run build**

```bash
corepack pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/ptx/constants.ts
git commit -m "feat(ptx): add constants.ts as single source of truth"
```

---

## Task 3: Write `lib/ptx/flags.ts`

**Files:**
- Create: `lib/ptx/flags.ts`

- [ ] **Step 1: Create `lib/ptx/flags.ts`**

```typescript
/**
 * Feature flag reader for PTX.
 *
 * Phase 0: all flags default to false. Production reads from process.env.
 *
 * Master flag PTX_ENABLED supports:
 *   - "false" (default) — entire module inert
 *   - "true" — all users
 *   - "allowlist:user_id_a,user_id_b,..." — only listed auth user_ids
 *
 * Sub-flags inherit gating from master. If master is OFF for a given user,
 * all sub-flags return false for that user.
 *
 * Spec: §3, ADR-PTX-006.
 */

export const FLAG_DEFAULTS = {
  PTX_ENABLED: false,
  PTX_EVENTS_WRITE_ENABLED: false,
  PTX_REWARDS_ENABLED: false,
  PTX_SINKS_ENABLED: false,
  PTX_REFERRALS_ENABLED: false,
  PTX_SPONSOR_ENABLED: false,
  PTX_CREATOR_ENABLED: false,
  PTX_ONBOARDING_ENABLED: false,
  PTX_LEARNING_ENABLED: false,
  PTX_SEASONAL_ENABLED: false,
  PTX_OG_WINDOW_OPEN: false,
  PTX_ANTI_FRAUD_ENABLED: false,
} as const;

export type PtxFlagSet = typeof FLAG_DEFAULTS;
export type PtxFlagName = keyof PtxFlagSet;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

/**
 * Returns true if PTX_ENABLED master is on for the given user (or all users).
 * Phase 0: always returns false in prod because PTX_ENABLED unset → defaults to false.
 */
export function isPtxEnabled(authUserId?: string): boolean {
  const raw = readEnv("PTX_ENABLED");
  if (!raw || raw === "false") return false;
  if (raw === "true") return true;
  if (raw.startsWith("allowlist:")) {
    if (!authUserId) return false;
    const list = raw.slice("allowlist:".length).split(",").map((s) => s.trim());
    return list.includes(authUserId);
  }
  return false;
}

/**
 * Returns true if the given sub-flag is on AND master is on for this user.
 */
export function isPtxSubFlagEnabled(flag: PtxFlagName, authUserId?: string): boolean {
  if (flag === "PTX_ENABLED") return isPtxEnabled(authUserId);
  if (!isPtxEnabled(authUserId)) return false;
  const raw = readEnv(flag);
  return raw === "true";
}
```

- [ ] **Step 2: Run build**

```bash
corepack pnpm build 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/ptx/flags.ts
git commit -m "feat(ptx): add feature flag reader with allowlist support"
```

---

## Task 4: Write ADRs 001–007 (Foundations theme)

**Files:**
- Create: `docs/superpowers/decisions/PTX-001-module-boundary.md`
- Create: `docs/superpowers/decisions/PTX-002-idempotency-first-events.md`
- Create: `docs/superpowers/decisions/PTX-003-three-orthogonal-layers.md`
- Create: `docs/superpowers/decisions/PTX-004-offchain-first-currency-agnostic.md`
- Create: `docs/superpowers/decisions/PTX-005-identity-separation.md`
- Create: `docs/superpowers/decisions/PTX-006-feature-flag-hierarchy.md`
- Create: `docs/superpowers/decisions/PTX-007-numeric-38-uint256-compat.md`

Each ADR uses this template:

```markdown
# ADR-PTX-XXX: <title>

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

<2-4 sentence problem statement>

## Decision

<the chosen decision>

## Consequences

**Positive:**
- <item>
- <item>

**Negative / accepted tradeoffs:**
- <item>

## Alternatives considered

- <alt 1> — why rejected
- <alt 2> — why rejected
```

- [ ] **Step 1: Create PTX-001-module-boundary.md**

Title: "Module boundary: single public API surface `@/lib/ptx`"

Context: The PTX module spans events, ledger, rewards, sinks, fraud, identity, and migration. Without an explicit boundary, internal coupling will leak into the rest of pt-app and the future repo split to `ptx-economy` becomes archaeological.

Decision: All consumers outside `lib/ptx/` may import only from `@/lib/ptx` (the index). All submodule imports are forbidden by ESLint rule `no-restricted-imports` (ADR-PTX-021).

Consequences positive: future repo split mechanical; testability isolated; refactor freedom inside the module.

Consequences negative: small initial ceremony writing the index re-exports.

Alternatives: flat scaffolding (rejected — leaks); dual repo from day 1 (rejected — premature, see ADR-PTX-008).

- [ ] **Step 2: Create PTX-002-idempotency-first-events.md**

Title: "Every event has a deterministic, UNIQUE idempotency_key"

Context: Cron retries, double-clicks, replays will produce repeat event submissions. Without protection the ledger double-credits.

Decision: Every `emitPtxEvent` call requires a deterministic `idempotency_key` derived from the logical action (e.g., `ref-act:{referrer}:{referred}:v1`). DB enforces UNIQUE. `ON CONFLICT DO NOTHING` makes repeat submission a safe no-op.

Consequences: zero double-credits; replay-safe cron design; debugging is straightforward.

Alternatives: per-row content hash (rejected — non-deterministic with timestamps); transaction locks (rejected — doesn't survive cross-process retries).

- [ ] **Step 3: Create PTX-003-three-orthogonal-layers.md**

Title: "Reputation ⊥ Bankroll ⊥ PTX — triple orthogonality"

Context: Per memory `project_pt_ptx_social_currency_layer.md` (2026-05-18), the PT economy has three layers that must never convert into each other in any direction except `bankroll-staked-correctly → reputation`.

Decision: Architecture enforces zero conversion paths between PTX and bankroll, PTX and reputation. Multipliers stay scoped within PTX. No earning rule reads accuracy/reputation. No spending sink affects ranking/verification. Hard-coded in lib/ptx (which never imports lib/leaderboard, lib/profile-helpers, etc., and is forbidden by ESLint from being imported by them).

Consequences: reputation stays sacred; bankroll stays gameplay; PTX stays social currency.

Alternatives: any unified balance (rejected — collapses the architecture).

- [ ] **Step 4: Create PTX-004-offchain-first-currency-agnostic.md**

Title: "PTX is offchain-first; schema is currency-agnostic"

Context: Per memory, PTX must "preserve future-compatibility with tokenization without requiring it". v1 must work entirely in Supabase, but the schema must port directly to onchain.

Decision: All balances in `NUMERIC(38,0)` (uint256-compatible). `PTX_DECIMALS = 18` reserved in constants. Identity has `chain_address`/`chain_id`/`bound_at` columns nullable. Migration snapshot table predefined. ZERO web3 dependencies in v1 package.json.

Consequences: future ERC-20 distribution requires no schema migration; users have continuous identity across the offchain → onchain boundary; legal and business decision to migrate is fully option-preserving.

Alternatives: bigint TypeScript-only (rejected — wraps at 2^53); decimal with fractional (rejected — incompatible with ERC-20 wei units).

- [ ] **Step 5: Create PTX-005-identity-separation.md**

Title: "`ptx_user_id` is separate from `auth.user_id` from day 1"

Context: Memory: "Separación de identity/auth. PTX atado a user_id propio, no al auth provider."

Decision: Dedicated `ptx_identities` table with `ptx_user_id` PK and `auth_user_id` FK. 1:1 mapping today, but extensible for future binding (chain_address, chain_id). Lazy creation at first event (not at signup).

Consequences: auth provider can change without rewriting ledger; future wallet binding ties to ptx_user_id, not auth; GDPR delete of auth row does not destroy event history; identity portability is straightforward.

Alternatives: reuse auth.user_id (rejected — couples to Supabase Auth indefinitely); separate auth provider for PTX (rejected — premature complexity).

- [ ] **Step 6: Create PTX-006-feature-flag-hierarchy.md**

Title: "Master `PTX_ENABLED` flag plus sub-flags per submodule"

Context: Progressive activation requires fine-grained gating without exposing PTX to all users at once.

Decision: Master flag `PTX_ENABLED` supports `false | true | allowlist:uid1,uid2,...`. Sub-flags (`PTX_REFERRALS_ENABLED`, `PTX_CREATOR_ENABLED`, etc.) inherit from master — if master is off for a user, all sub-flags return false. Implemented in `lib/ptx/flags.ts`.

Consequences: per-user phase control; safe rollback via flag-off; integration with the 10-phase visibility plan is trivial.

Alternatives: Single boolean flag (rejected — too coarse); LaunchDarkly (rejected — adds dependency, cost).

- [ ] **Step 7: Create PTX-007-numeric-38-uint256-compat.md**

Title: "Balances stored as `NUMERIC(38,0)`, ERC-20 18-decimals reserved"

Context: ERC-20 uses uint256 with 18 decimals by convention. To port without conversion, offchain schema must accept the full range.

Decision: All amount columns in PTX migrations are `NUMERIC(38,0)`. `PTX_DECIMALS = 18` constant reserved. v1 user-facing PTX is whole-unit integer (no fractional UI). At Phase 9 snapshot, balances scale to 18-decimal ERC-20 units mechanically (multiply by 10^18 in the contract mint).

Consequences: no migration required at tokenization; arithmetic always exact; bigint type used throughout TypeScript.

Alternatives: BIGINT (rejected — 64-bit, doesn't cover uint256); DECIMAL with scale > 0 (rejected — implies fractional PTX user-facing).

- [ ] **Step 8: Run build**

```bash
corepack pnpm build 2>&1 | tail -5
```

Expected: 0 errors (docs don't affect build, but verify).

- [ ] **Step 9: Commit**

```bash
git add docs/superpowers/decisions/PTX-00{1,2,3,4,5,6,7}-*.md
git commit -m "docs(ptx): ADRs 001-007 (foundations theme)"
```

---

## Task 5: Write ADRs 008–014 (Ledger + Rewards + Caps theme)

**Files:**
- Create: `docs/superpowers/decisions/PTX-008-repo-split-trigger.md`
- Create: `docs/superpowers/decisions/PTX-009-merkle-event-chain.md`
- Create: `docs/superpowers/decisions/PTX-010-closed-enum-events.md`
- Create: `docs/superpowers/decisions/PTX-011-pure-function-rewards.md`
- Create: `docs/superpowers/decisions/PTX-012-cap-multilayer.md`
- Create: `docs/superpowers/decisions/PTX-013-og-window-irreversible.md`
- Create: `docs/superpowers/decisions/PTX-014-sybil-signals-v1-scope.md`

Use same template as Task 4. Bodies (1-2 paragraphs each):

- [ ] **Step 1: PTX-008-repo-split-trigger.md** — "Trigger criteria for splitting pt-app → ptx-economy"

Context: Memory: "preparar un futuro repo ptx-economy separado SI la complejidad crece." Spec §1 + §31 commit to staying single-repo until trigger.

Decision: Split occurs when any of: (a) `lib/ptx/` exceeds ~5,000 LoC, (b) contracts (Solidity) development begins, (c) standalone cron workers exceed 3 in number, (d) operator review UI becomes substantial. Until then, single repo + module boundary contract suffices.

Consequences: single-repo dev velocity preserved; future split is mechanical (move directory + migrations).

- [ ] **Step 2: PTX-009-merkle-event-chain.md** — "Per-user Merkle chain of events"

Context: Memory PT primitive #1: "Prediction events inmutables + sub-second timestamped + append-only" extended for PTX. Tamper detection without onchain is a primitive.

Decision: Every `ptx_events` row includes `prev_event_hash`, `event_hash`, `seq_per_user`. Canonical hash formula in spec §5.1. `verifyChainForUser()` reconciles. Periodic anchoring to Base (Phase 7) seals the chain.

Consequences: tamper detection at insert time; future onchain anchoring trivial; identity export carries chain root for offline proof.

- [ ] **Step 3: PTX-010-closed-enum-events.md** — "Event types and source types are closed enums at code level"

Context: Runtime registration of event types creates an injection vector and obscures audit.

Decision: `PtxEventType` and `PtxSourceType` are TypeScript string-literal union types. Adding a type requires a code change + ADR. DB stores TEXT (not CHECK-constrained) because each new type doesn't warrant a DB migration; validation happens at the application layer.

Consequences: cheap to extend in code, impossible to extend at runtime, easy to grep.

- [ ] **Step 4: PTX-011-pure-function-rewards.md** — "Reward engine is a pure function"

Context: Testability, future repo split, dry-run capability all demand a side-effect-free computation core.

Decision: `computePtxReward(ctx)` performs zero DB I/O. The caller assembles the `PtxRewardContext` (aggregates, flags, multipliers) and passes it in. The engine returns a `PtxRewardOutcome` without emitting. The caller then calls `emitPtxEvent` with the outcome's idempotency_key.

Consequences: trivially testable, dry-run-capable, future-library-extractable.

- [ ] **Step 5: PTX-012-cap-multilayer.md** — "Caps applied at four levels (L1–L4)"

Context: Single-level caps are insufficient. A per-user cap doesn't protect against coordinated attacks; a global cap doesn't protect against single-user farm.

Decision: L1 per-user per-day; L2 per-user per-source per-day; L3 global per-source per-day; L4 lifetime soft (flags only). All declarative in constants.ts.

Consequences: anti-farm + anti-inflation + anti-attack at the cost of slightly more complex compute (~4 aggregate queries).

- [ ] **Step 6: PTX-013-og-window-irreversible.md** — "OG window closes once and forever"

Context: Memory: "OG window técnicamente finita. Una vez cerrada, imposible reabrir."

Decision: `ptx_og_window` is a singleton row. When `manual_close_at` is set, a Postgres trigger rejects all subsequent UPDATEs. No application code path can reopen.

Consequences: OG scarcity is architecturally guaranteed; founder-cohort identity is real.

- [ ] **Step 7: PTX-014-sybil-signals-v1-scope.md** — "v1 Sybil detection uses cheap signals only"

Context: Canvas fingerprinting and behavioral clustering are powerful but introduce privacy concerns and ML overhead.

Decision: v1 implements IP class anonymized + email domain (static disposable blocklist) + account-age-vs-activity ratio only. Canvas fingerprint and behavioral clustering deferred to v2 once activation metrics justify the privacy surface.

Consequences: privacy-respectful start; cheap to compute; sufficient for early scale.

- [ ] **Step 8: Run build**

```bash
corepack pnpm build 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add docs/superpowers/decisions/PTX-0{08,09,10,11,12,13,14}-*.md
git commit -m "docs(ptx): ADRs 008-014 (ledger + rewards + caps + OG)"
```

---

## Task 6: Write ADRs 015–021 (Future + Operations theme)

**Files:**
- Create: `docs/superpowers/decisions/PTX-015-creator-cascade-deferred.md`
- Create: `docs/superpowers/decisions/PTX-016-paid-content-gating-deferred.md`
- Create: `docs/superpowers/decisions/PTX-017-fraud-banned-ptx-policy.md`
- Create: `docs/superpowers/decisions/PTX-018-chain-selection-base.md`
- Create: `docs/superpowers/decisions/PTX-019-embedded-wallet-privy.md`
- Create: `docs/superpowers/decisions/PTX-020-migration-snapshot-strategy.md`
- Create: `docs/superpowers/decisions/PTX-021-eslint-no-cross-module-imports.md`

- [ ] **Step 1: PTX-015** — "Creator cascade share (5%) deferred"

Decision: Hooks reserved in `source_id` payload for future cascade computation, but `creator.cascade.v1` rule not implemented in v1. Activation criterion: ≥ 90 days post-Phase 4 with stable creator economy and clear demand.

- [ ] **Step 2: PTX-016** — "Paid content gating in PTX deferred"

Decision: Interesting future sink (reader pays PTX to unlock creator's premium content; revenue flows to creator). Not in v1 catalog. Activation requires content infrastructure (creator content storage, access control) that does not exist.

- [ ] **Step 3: PTX-017** — "Banned-user PTX policy: freeze → 30d appeal → burn"

Decision: When user is banned for fraud: (a) emit `system.fraud.frozen` (balance visible, spendability disabled); (b) 30-day appeal window; (c) if appeal denied or window expires, emit `system.fraud.burned` with signed negative amount to zero the balance. Fully auditable and appealable.

- [ ] **Step 4: PTX-018** — "Chain selection: Base mainnet (chain_id 8453)"

Decision: Base is primary for Phase 9 ERC-20. Rationale per spec §27 table. Polygon explicitly rejected to avoid the "financial prediction market" identity (PT positions as consumer social per `feedback_pt_strategic_direction.md`). EVM-compatible fallbacks (Arbitrum, Optimism) documented as swappable.

- [ ] **Step 5: PTX-019** — "Embedded wallet: Privy primary, Coinbase Smart Wallet fallback"

Decision: Privy is the primary choice for Phase 8 wallet binding (consumer UX, multi-chain, passkeys, pricing). CSW (native Base, AA-first) is the documented fallback if Privy pricing or feature set becomes unfavorable. v1 adds zero web3 dependencies.

- [ ] **Step 6: PTX-020** — "Migration approach: snapshot-based claim, no live bridge"

Decision: Phase 9 takes a single deterministic snapshot of all balances at moment T. ERC-20 PTX deployed on Base. ClaimContract maps `ptx_user_id` → claimable amount, redeemed by signature from bound wallet. 12-month claim window; unclaimed flows to treasury. No live bidirectional bridge at launch; bridge built post-launch if demand justifies.

- [ ] **Step 7: PTX-021** — "ESLint `no-restricted-imports` enforces module boundary"

Decision: `eslint.config.mjs` includes a rule that blocks any file outside `lib/ptx/**` from importing from `@/lib/ptx/{events,ledger,rewards,sinks,fraud,identity,migration,constants}/**`. Files in `app/leaderboard/**`, `app/api/leaderboard/**`, `components/leaderboard/**`, `lib/demo-leaderboard.ts`, `lib/profile-helpers.ts` are additionally blocked from importing `@/lib/ptx` at all, enforcing reputation/accuracy separation (per ADR-PTX-003).

- [ ] **Step 8: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add docs/superpowers/decisions/PTX-0{15,16,17,18,19,20,21}-*.md
git commit -m "docs(ptx): ADRs 015-021 (future + operations)"
```

Expected: 0 errors.

---

## Task 7: Build `lib/ptx/identity/` module

**Files:**
- Create: `lib/ptx/identity/types.ts`
- Create: `lib/ptx/identity/resolver.ts`
- Create: `lib/ptx/identity/portability.ts`
- Create: `lib/ptx/identity/wallet-binding.ts`
- Create: `lib/ptx/identity/index.ts`

- [ ] **Step 1: Create `lib/ptx/identity/types.ts`**

```typescript
/**
 * PTX Identity types.
 * Spec §2, ADR-PTX-005.
 */

export type PtxUserId = string; // UUID

export interface PtxIdentityRecord {
  ptx_user_id: PtxUserId;
  auth_user_id: string;
  created_at: string;
  chain_address: string | null;
  chain_id: number | null;
  bound_at: string | null;
}

export interface PtxEventExport {
  event_id: string;
  event_type: string;
  source_type: string;
  source_id: string;
  amount: string; // bigint serialized
  occurred_at: string;
  prev_event_hash: string | null;
  event_hash: string;
  seq_per_user: number;
  context: Record<string, unknown>;
}

export interface PtxIdentityExport {
  schema_version: 1;
  ptx_user_id: PtxUserId;
  generated_at: string;
  events: PtxEventExport[];
  events_chain_root: string;
  balance_snapshot: {
    earned: string; // bigint serialized
    spent: string;
    balance: string;
  };
  multipliers_applied_history: { multiplier: string; activated_at: string }[];
  signature?: {
    chain_address: string;
    signature: string;
    signed_at: string;
  };
}
```

- [ ] **Step 2: Create `lib/ptx/identity/resolver.ts`**

```typescript
/**
 * Lazy resolver: auth.user_id → ptx_user_id.
 * Stub for Phase 0. Real implementation in Phase 1 (writes to ptx_identities).
 * Spec §2, ADR-PTX-005.
 */

import type { PtxUserId } from "./types";

/**
 * Get or lazily create the ptx_user_id for an auth user.
 *
 * Phase 0: throws — function exists for typing only.
 */
export async function getPtxUserId(authUserId: string): Promise<PtxUserId> {
  void authUserId;
  throw new Error("PTX Phase 0: resolver not wired. See spec §2.");
}
```

- [ ] **Step 3: Create `lib/ptx/identity/portability.ts`**

```typescript
/**
 * Identity export for GDPR portability and future onchain claim.
 * Spec §29.
 */

import type { PtxUserId, PtxIdentityExport } from "./types";

/**
 * Export a user's full PTX identity: events chain + balance snapshot + multiplier history.
 *
 * Phase 0: throws — function exists for typing and future wire-up.
 */
export async function exportIdentity(ptxUserId: PtxUserId): Promise<PtxIdentityExport> {
  void ptxUserId;
  throw new Error("PTX Phase 0: exportIdentity not wired. See spec §29.");
}
```

- [ ] **Step 4: Create `lib/ptx/identity/wallet-binding.ts`**

```typescript
/**
 * Phase 8 (FAR FUTURE) wallet binding interface.
 * Spec §28, ADR-PTX-019. v1 has zero web3 deps.
 */

import type { PtxUserId } from "./types";

export interface WalletBindingInput {
  ptx_user_id: PtxUserId;
  chain_id: number;       // 8453 = Base mainnet
  chain_address: string;
  signature: string;      // EIP-712 signature proving wallet ownership
  signed_at: string;
}

export interface WalletBindingResult {
  bound: boolean;
  reason?: string;
}

/**
 * Bind a wallet address to a ptx_user_id.
 *
 * Phase 0/1: throws — function exists for typing and Phase 8 wire-up only.
 */
export async function bindWallet(input: WalletBindingInput): Promise<WalletBindingResult> {
  void input;
  throw new Error("PTX Phase 0: bindWallet not wired (Phase 8 only). See spec §28.");
}
```

- [ ] **Step 5: Create `lib/ptx/identity/index.ts`**

```typescript
export { getPtxUserId } from "./resolver";
export { exportIdentity } from "./portability";
export { bindWallet } from "./wallet-binding";
export type {
  PtxUserId,
  PtxIdentityRecord,
  PtxIdentityExport,
  PtxEventExport,
} from "./types";
export type { WalletBindingInput, WalletBindingResult } from "./wallet-binding";
```

- [ ] **Step 6: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/identity/
git commit -m "feat(ptx): identity module (lazy resolver, export, wallet binding stubs)"
```

Expected: 0 errors.

---

## Task 8: Build `lib/ptx/events/` module

**Files:**
- Create: `lib/ptx/events/source-types.ts`
- Create: `lib/ptx/events/types.ts`
- Create: `lib/ptx/events/validators.ts`
- Create: `lib/ptx/events/emit.ts`
- Create: `lib/ptx/events/index.ts`
- Modify: `lib/ptx/constants.ts` (replace temporary `PtxSourceType` with import)

- [ ] **Step 1: Create `lib/ptx/events/source-types.ts`**

```typescript
/**
 * Closed enum of PtxSourceType — what kind of action produced an event.
 * Spec §4, ADR-PTX-010.
 */

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

export const PTX_SOURCE_TYPES: readonly PtxSourceType[] = [
  "referral_activation", "publication", "milestone", "lesson_complete",
  "season_event", "moderation_action", "engagement_quality", "og_window",
  "sink_consumption", "tip_received", "sponsor_action",
  "fraud_audit", "reconcile_job", "migration_op",
] as const;
```

- [ ] **Step 2: Create `lib/ptx/events/types.ts`**

```typescript
/**
 * Closed enum of PtxEventType + payload contract.
 * Spec §4, ADR-PTX-010.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "./source-types";

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
  // SYSTEM
  | "system.fraud.flagged"
  | "system.fraud.cleared"
  | "system.fraud.frozen"
  | "system.fraud.burned"
  | "system.reconcile.checkpoint"
  | "system.migration.snapshot"
  | "system.migration.anchor";

export const PTX_EVENT_TYPES: readonly PtxEventType[] = [
  "earn.referral.activated", "earn.referral.cascade",
  "earn.creator.publication", "earn.creator.audience_milestone",
  "earn.onboarding.milestone", "earn.learning.completion",
  "earn.seasonal.participation", "earn.seasonal.completion",
  "earn.contribution.help", "earn.community.quality_engagement",
  "earn.og.early_adopter", "earn.tipping.received",
  "spend.cosmetic.unlock", "spend.tipping.peer",
  "spend.visibility.feed_boost", "spend.premium.access",
  "spend.sponsor.referred",
  "system.fraud.flagged", "system.fraud.cleared",
  "system.fraud.frozen", "system.fraud.burned",
  "system.reconcile.checkpoint",
  "system.migration.snapshot", "system.migration.anchor",
] as const;

export interface PtxEventInput {
  ptx_user_id: PtxUserId;
  event_type: PtxEventType;
  source_type: PtxSourceType;
  source_id: string;
  amount: bigint;
  multiplier_applied: number;
  context: Record<string, unknown>;
  occurred_at: string;
  idempotency_key: string;
}

export interface PtxEventResult {
  event_id: string;
  accepted: boolean;
  reason?: PtxRejectionReason;
  new_balance: bigint | null;
}

export type PtxRejectionReason =
  | "flag_disabled"
  | "rule_not_matched"
  | "cap_exhausted"
  | "fraud_blocked"
  | "duplicate_attempt"
  | "user_ineligible";
```

- [ ] **Step 3: Create `lib/ptx/events/validators.ts`**

```typescript
/**
 * Lightweight TS guards for event payloads. Replaces a zod dependency in v1.
 * Spec §4.
 */

import type { PtxEventInput, PtxEventType } from "./types";
import { PTX_EVENT_TYPES } from "./types";
import { PTX_SOURCE_TYPES, type PtxSourceType } from "./source-types";

export function isPtxEventType(value: unknown): value is PtxEventType {
  return typeof value === "string" && (PTX_EVENT_TYPES as readonly string[]).includes(value);
}

export function isPtxSourceType(value: unknown): value is PtxSourceType {
  return typeof value === "string" && (PTX_SOURCE_TYPES as readonly string[]).includes(value);
}

/**
 * Validates event shape and amount-sign convention (earn > 0, spend < 0, system = 0).
 * Throws on invalid input.
 */
export function validatePtxEventInput(input: PtxEventInput): void {
  if (!isPtxEventType(input.event_type)) {
    throw new Error(`Invalid PtxEventType: ${input.event_type}`);
  }
  if (!isPtxSourceType(input.source_type)) {
    throw new Error(`Invalid PtxSourceType: ${input.source_type}`);
  }
  if (!input.idempotency_key || input.idempotency_key.length < 4) {
    throw new Error("idempotency_key is required and must be non-trivial");
  }
  if (input.event_type.startsWith("earn.") && input.amount <= 0n) {
    throw new Error(`earn events require amount > 0; got ${input.amount.toString()}`);
  }
  if (input.event_type.startsWith("spend.") && input.amount >= 0n) {
    throw new Error(`spend events require amount < 0; got ${input.amount.toString()}`);
  }
  if (input.event_type.startsWith("system.") && input.amount !== 0n) {
    throw new Error(`system events require amount === 0; got ${input.amount.toString()}`);
  }
}
```

- [ ] **Step 4: Create `lib/ptx/events/emit.ts`**

```typescript
/**
 * Event emission (write path).
 *
 * Phase 0: throws — function exists for typing.
 * Phase 1+: writes to ptx_events table with Merkle chain + idempotency.
 *
 * Spec §5, §12.
 */

import type { PtxEventInput, PtxEventResult } from "./types";
import { validatePtxEventInput } from "./validators";

export async function emitPtxEvent(input: PtxEventInput): Promise<PtxEventResult> {
  validatePtxEventInput(input);
  // Phase 0: no DB write. Real implementation lands when migrations 010-011 are applied.
  throw new Error("PTX Phase 0: emitPtxEvent not wired. See spec §5, §12.");
}
```

- [ ] **Step 5: Update `lib/ptx/constants.ts` to import `PtxSourceType`**

Open `lib/ptx/constants.ts`. Replace the temporary local `PtxSourceType` block with:

```typescript
import type { PtxSourceType } from "./events/source-types";
```

Verify the rest of the file references `PtxSourceType` only through this import. The `CAP_L2_PER_USER_PER_SOURCE_PER_DAY` and `CAP_L3_GLOBAL_PER_SOURCE_PER_DAY` typed records continue to work.

- [ ] **Step 6: Create `lib/ptx/events/index.ts`**

```typescript
export { emitPtxEvent } from "./emit";
export { validatePtxEventInput, isPtxEventType, isPtxSourceType } from "./validators";
export type {
  PtxEventType,
  PtxEventInput,
  PtxEventResult,
  PtxRejectionReason,
} from "./types";
export type { PtxSourceType } from "./source-types";
export { PTX_EVENT_TYPES } from "./types";
export { PTX_SOURCE_TYPES } from "./source-types";
```

- [ ] **Step 7: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/events/ lib/ptx/constants.ts
git commit -m "feat(ptx): events module (closed enums, validators, emit stub)"
```

Expected: 0 errors.

---

## Task 9: Build `lib/ptx/ledger/` module

**Files:**
- Create: `lib/ptx/ledger/balance.ts`
- Create: `lib/ptx/ledger/aggregates.ts`
- Create: `lib/ptx/ledger/reconcile.ts`
- Create: `lib/ptx/ledger/index.ts`

- [ ] **Step 1: Create `lib/ptx/ledger/balance.ts`**

```typescript
/**
 * Balance read path. Reads from ptx_balances view.
 * Phase 0: stubs. Spec §6.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "../events/source-types";

export type PtxAmount = bigint;

export interface PtxBalance {
  ptx_user_id: PtxUserId;
  balance: PtxAmount;
  earn_events: number;
  spend_events: number;
  last_event_at: string | null;
}

export interface PtxHistoryEntry {
  event_id: string;
  event_type: string;
  source_type: PtxSourceType;
  source_id: string;
  amount: PtxAmount;
  occurred_at: string;
  context: Record<string, unknown>;
}

export interface PtxHistoryOptions {
  limit?: number;
  before?: string;
  sourceTypes?: PtxSourceType[];
}

export async function getPtxBalance(ptxUserId: PtxUserId): Promise<PtxBalance> {
  void ptxUserId;
  throw new Error("PTX Phase 0: getPtxBalance not wired. See spec §6.");
}

export async function getPtxHistory(
  ptxUserId: PtxUserId,
  opts?: PtxHistoryOptions,
): Promise<PtxHistoryEntry[]> {
  void ptxUserId; void opts;
  throw new Error("PTX Phase 0: getPtxHistory not wired. See spec §6.");
}
```

- [ ] **Step 2: Create `lib/ptx/ledger/aggregates.ts`**

```typescript
/**
 * Time-windowed aggregates per user / per source.
 * Used by reward engine context (caps L1-L4).
 * Phase 0: stubs. Spec §11.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "../events/source-types";

export interface UserDailyAggregate {
  ptx_user_id: PtxUserId;
  date_utc: string;
  total_earned: bigint;
  by_source: Partial<Record<PtxSourceType, bigint>>;
}

export async function getUserTodayEarned(ptxUserId: PtxUserId): Promise<bigint> {
  void ptxUserId;
  throw new Error("PTX Phase 0: getUserTodayEarned not wired.");
}

export async function getUserTodayEarnedBySource(
  ptxUserId: PtxUserId,
  sourceType: PtxSourceType,
): Promise<bigint> {
  void ptxUserId; void sourceType;
  throw new Error("PTX Phase 0: getUserTodayEarnedBySource not wired.");
}

export async function getGlobalTodayEarnedBySource(sourceType: PtxSourceType): Promise<bigint> {
  void sourceType;
  throw new Error("PTX Phase 0: getGlobalTodayEarnedBySource not wired.");
}

export async function getUserLifetimeEarned(ptxUserId: PtxUserId): Promise<bigint> {
  void ptxUserId;
  throw new Error("PTX Phase 0: getUserLifetimeEarned not wired.");
}
```

- [ ] **Step 3: Create `lib/ptx/ledger/reconcile.ts`**

```typescript
/**
 * Merkle chain verifier per user. ADR-PTX-009.
 * Phase 0: stub.
 */

import type { PtxUserId } from "../identity/types";

export interface ReconcileResult {
  ok: boolean;
  expected_chain_root: string;
  observed_chain_root: string;
  diverged_at_seq?: number;
}

export async function verifyChainForUser(ptxUserId: PtxUserId): Promise<ReconcileResult> {
  void ptxUserId;
  throw new Error("PTX Phase 0: verifyChainForUser not wired. See spec §5.1.");
}

/**
 * Canonical hash computation for an event (deterministic, ADR-PTX-009).
 * Pure function — safe to call without DB. Implemented eagerly because Tasks 14+
 * unit-verify the format via direct invocation later.
 */
export function computeEventHash(input: {
  prev_event_hash: string | null;
  event_type: string;
  source_type: string;
  source_id: string;
  amount: bigint;
  occurred_at: string;
  context_canonical_json: string;
  schema_version: number;
}): string {
  const parts = [
    input.prev_event_hash ?? "0".repeat(64),
    input.event_type,
    `${input.source_type}:${input.source_id}`,
    input.amount.toString(),
    input.occurred_at,
    sha256Hex(input.context_canonical_json),
    String(input.schema_version),
  ];
  return sha256Hex(parts.join("|"));
}

function sha256Hex(input: string): string {
  // Phase 0: deterministic stub using a simple hash. Node crypto wired in Phase 1.
  // The format (64 lowercase hex chars) matches sha256 for downstream compatibility.
  let hash = 0n;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31n + BigInt(input.charCodeAt(i))) & ((1n << 256n) - 1n);
  }
  return hash.toString(16).padStart(64, "0");
}
```

- [ ] **Step 4: Create `lib/ptx/ledger/index.ts`**

```typescript
export { getPtxBalance, getPtxHistory } from "./balance";
export type {
  PtxBalance,
  PtxHistoryEntry,
  PtxHistoryOptions,
  PtxAmount,
} from "./balance";
export {
  getUserTodayEarned,
  getUserTodayEarnedBySource,
  getGlobalTodayEarnedBySource,
  getUserLifetimeEarned,
} from "./aggregates";
export { verifyChainForUser, computeEventHash } from "./reconcile";
export type { ReconcileResult } from "./reconcile";
```

- [ ] **Step 5: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/ledger/
git commit -m "feat(ptx): ledger module (balance, aggregates, Merkle chain verifier)"
```

Expected: 0 errors.

---

## Task 10: Build `lib/ptx/rewards/` core (multipliers, caps, engine)

**Files:**
- Create: `lib/ptx/rewards/multipliers.ts`
- Create: `lib/ptx/rewards/caps.ts`
- Create: `lib/ptx/rewards/engine.ts`

(Rules subdir lands in Task 11.)

- [ ] **Step 1: Create `lib/ptx/rewards/multipliers.ts`**

```typescript
/**
 * Multiplier bundle + combiner. Pure functions, no I/O.
 * Spec §10, ADR-PTX-011.
 */

import { PTX_MAX_COMBINED_MULTIPLIER } from "../constants";

export interface PtxMultiplierBundle {
  base: number;       // 1.0 default
  og: number;         // 1.5 if OG, 1.0 otherwise
  cascade: number;    // 1.0 / 0.3 / 0.1 by referral chain depth
  seasonal: number;   // 1.0 default; > 1.0 during active seasons
}

export const DEFAULT_MULTIPLIERS: PtxMultiplierBundle = {
  base: 1.0,
  og: 1.0,
  cascade: 1.0,
  seasonal: 1.0,
};

export function combineMultipliers(bundle: PtxMultiplierBundle): number {
  const raw = bundle.base * bundle.og * bundle.cascade * bundle.seasonal;
  return Math.min(raw, PTX_MAX_COMBINED_MULTIPLIER);
}

export function applyMultiplier(baseAmount: bigint, bundle: PtxMultiplierBundle): bigint {
  const factor = combineMultipliers(bundle);
  // bigint × float: round to nearest integer
  return BigInt(Math.round(Number(baseAmount) * factor));
}
```

- [ ] **Step 2: Create `lib/ptx/rewards/caps.ts`**

```typescript
/**
 * Cap evaluation (L1-L4).
 * Pure function — caller provides the aggregates.
 * Spec §11, ADR-PTX-012.
 */

import type { PtxSourceType } from "../events/source-types";
import {
  CAP_L1_PER_USER_PER_DAY,
  CAP_L2_PER_USER_PER_SOURCE_PER_DAY,
  CAP_L3_GLOBAL_PER_SOURCE_PER_DAY,
  CAP_L4_USER_LIFETIME_SOFT_THRESHOLD,
} from "../constants";

export type PtxCapKind = "L1_user_day" | "L2_user_source_day" | "L3_global_source_day" | "L4_user_lifetime_soft";

export interface CapContext {
  source_type: PtxSourceType;
  user_today_earned: bigint;
  user_today_earned_by_source: bigint;
  global_today_earned_by_source: bigint;
  user_lifetime_earned: bigint;
}

export interface CappedResult {
  permitted: bigint;
  caps_hit: PtxCapKind[];
}

/**
 * Given a base amount and a CapContext, returns the amount that can be granted
 * after applying L1-L4 caps in order.
 *
 * L4 is soft — does NOT clip the amount, only flags it.
 */
export function applyCaps(baseAmount: bigint, ctx: CapContext): CappedResult {
  const caps_hit: PtxCapKind[] = [];
  let permitted = baseAmount;

  // L1
  const l1_remaining = CAP_L1_PER_USER_PER_DAY - ctx.user_today_earned;
  if (l1_remaining <= 0n) {
    return { permitted: 0n, caps_hit: ["L1_user_day"] };
  }
  if (permitted > l1_remaining) {
    permitted = l1_remaining;
    caps_hit.push("L1_user_day");
  }

  // L2
  const l2Limit = CAP_L2_PER_USER_PER_SOURCE_PER_DAY[ctx.source_type];
  if (l2Limit !== undefined) {
    const l2_remaining = l2Limit - ctx.user_today_earned_by_source;
    if (l2_remaining <= 0n) {
      return { permitted: 0n, caps_hit: [...caps_hit, "L2_user_source_day"] };
    }
    if (permitted > l2_remaining) {
      permitted = l2_remaining;
      caps_hit.push("L2_user_source_day");
    }
  }

  // L3
  const l3Limit = CAP_L3_GLOBAL_PER_SOURCE_PER_DAY[ctx.source_type];
  if (l3Limit !== undefined) {
    const l3_remaining = l3Limit - ctx.global_today_earned_by_source;
    if (l3_remaining <= 0n) {
      return { permitted: 0n, caps_hit: [...caps_hit, "L3_global_source_day"] };
    }
    if (permitted > l3_remaining) {
      permitted = l3_remaining;
      caps_hit.push("L3_global_source_day");
    }
  }

  // L4 (soft — does NOT clip)
  if (ctx.user_lifetime_earned + permitted >= CAP_L4_USER_LIFETIME_SOFT_THRESHOLD) {
    caps_hit.push("L4_user_lifetime_soft");
  }

  return { permitted, caps_hit };
}
```

- [ ] **Step 3: Create `lib/ptx/rewards/engine.ts`**

```typescript
/**
 * Reward engine — pure function, no I/O.
 * Spec §7, §12. ADR-PTX-011.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "../events/source-types";
import type { PtxEventType, PtxRejectionReason } from "../events/types";
import { applyMultiplier, type PtxMultiplierBundle } from "./multipliers";
import { applyCaps, type PtxCapKind, type CapContext } from "./caps";
import { PTX_RULES } from "./rules";

export interface PtxRewardContext {
  ptx_user_id: PtxUserId;
  source_type: PtxSourceType;
  source_id: string;
  payload: Record<string, unknown>;
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

export function computePtxReward(ctx: PtxRewardContext): PtxRewardOutcome {
  // Find the first rule whose source_types includes this ctx.source_type.
  const rule = PTX_RULES.find((r) => r.source_types.includes(ctx.source_type));

  if (!rule) {
    return rejected("rule_not_matched", ctx);
  }

  // Eligibility check
  const elig = rule.eligibility(ctx);
  if (!elig.eligible) {
    return rejected(elig.reason ?? "user_ineligible", ctx, rule.id);
  }

  // Base compute (pre-multiplier, pre-cap)
  const base = rule.compute(ctx);
  if (base <= 0n) {
    return rejected("user_ineligible", ctx, rule.id);
  }

  // Apply multipliers
  const multiplied = applyMultiplier(base, ctx.active_multipliers);

  // Apply caps
  const capCtx: CapContext = {
    source_type: ctx.source_type,
    user_today_earned: ctx.user_today_earned,
    user_today_earned_by_source: ctx.user_today_earned_by_source,
    global_today_earned_by_source: ctx.global_today_earned_by_source,
    user_lifetime_earned: ctx.user_lifetime_earned,
  };
  const { permitted, caps_hit } = applyCaps(multiplied, capCtx);

  if (permitted <= 0n) {
    return {
      granted_amount: 0n,
      rule_matched: rule.id,
      multipliers_applied: ctx.active_multipliers,
      caps_hit,
      rejected: true,
      rejection_reason: "cap_exhausted",
      event_type_if_granted: null,
      idempotency_key_proposal: rule.idempotency(ctx),
    };
  }

  return {
    granted_amount: permitted,
    rule_matched: rule.id,
    multipliers_applied: ctx.active_multipliers,
    caps_hit,
    rejected: false,
    event_type_if_granted: rule.emits,
    idempotency_key_proposal: rule.idempotency(ctx),
  };
}

function rejected(
  reason: PtxRejectionReason,
  ctx: PtxRewardContext,
  ruleId?: string,
): PtxRewardOutcome {
  return {
    granted_amount: 0n,
    rule_matched: ruleId ?? null,
    multipliers_applied: ctx.active_multipliers,
    caps_hit: [],
    rejected: true,
    rejection_reason: reason,
    event_type_if_granted: null,
    idempotency_key_proposal: `rejected:${ctx.source_type}:${ctx.source_id}`,
  };
}
```

NOTE: `engine.ts` imports `PTX_RULES` from `./rules`. That subdir lands in Task 11. Build will fail temporarily after this task — proceed to Task 11 immediately.

- [ ] **Step 4: Run build (expect failure — proceed to Task 11)**

```bash
corepack pnpm build 2>&1 | tail -10
```

Expected: error about `./rules` module not found. This is expected and resolved by Task 11.

- [ ] **Step 5: Stage changes (do NOT commit yet — wait for Task 11 to compile clean)**

```bash
git add lib/ptx/rewards/multipliers.ts lib/ptx/rewards/caps.ts lib/ptx/rewards/engine.ts
```

---

## Task 11: Build `lib/ptx/rewards/rules/` (9 rules + types + registry)

**Files:**
- Create: `lib/ptx/rewards/rules/types.ts`
- Create: `lib/ptx/rewards/rules/referral.ts`
- Create: `lib/ptx/rewards/rules/creator.ts`
- Create: `lib/ptx/rewards/rules/onboarding.ts`
- Create: `lib/ptx/rewards/rules/learning.ts`
- Create: `lib/ptx/rewards/rules/seasonal.ts`
- Create: `lib/ptx/rewards/rules/contribution.ts`
- Create: `lib/ptx/rewards/rules/community.ts`
- Create: `lib/ptx/rewards/rules/og.ts`
- Create: `lib/ptx/rewards/rules/index.ts`
- Create: `lib/ptx/rewards/index.ts`

- [ ] **Step 1: Create `lib/ptx/rewards/rules/types.ts`**

```typescript
import type { PtxSourceType } from "../../events/source-types";
import type { PtxEventType, PtxRejectionReason } from "../../events/types";
import type { PtxRewardContext } from "../engine";
import type { PtxFlagName } from "../../flags";

export interface EligibilityResult {
  eligible: boolean;
  reason?: PtxRejectionReason;
}

export interface PtxEarningRule {
  id: string;
  source_types: PtxSourceType[];
  flag_required: PtxFlagName;
  emits: PtxEventType;
  eligibility(ctx: PtxRewardContext): EligibilityResult;
  compute(ctx: PtxRewardContext): bigint;
  idempotency(ctx: PtxRewardContext): string;
}
```

- [ ] **Step 2: Create `lib/ptx/rewards/rules/referral.ts`**

```typescript
/**
 * Referral activation + cascade rules. Spec §9.1, §9.2.
 */

import type { PtxEarningRule } from "./types";
import {
  REFERRAL_ACTIVATION_PTX,
  REFERRAL_CASCADE_L2_FACTOR,
} from "../../constants";

interface ReferralPayload {
  referrer_id: string;
  referred_id: string;
  referred_passed_sybil_check: boolean;
  referred_predictions_count: number;
  referred_resolved_count: number;
  referred_active_distinct_days: number;
}

function parseReferralPayload(p: Record<string, unknown>): ReferralPayload {
  return {
    referrer_id: String(p.referrer_id ?? ""),
    referred_id: String(p.referred_id ?? ""),
    referred_passed_sybil_check: Boolean(p.referred_passed_sybil_check),
    referred_predictions_count: Number(p.referred_predictions_count ?? 0),
    referred_resolved_count: Number(p.referred_resolved_count ?? 0),
    referred_active_distinct_days: Number(p.referred_active_distinct_days ?? 0),
  };
}

export const referralActivatedV1: PtxEarningRule = {
  id: "referral.activated.v1",
  source_types: ["referral_activation"],
  flag_required: "PTX_REFERRALS_ENABLED",
  emits: "earn.referral.activated",
  eligibility: (ctx) => {
    const p = parseReferralPayload(ctx.payload);
    if (!p.referrer_id || !p.referred_id) return { eligible: false, reason: "user_ineligible" };
    if (p.referrer_id === p.referred_id) return { eligible: false, reason: "user_ineligible" };
    if (!p.referred_passed_sybil_check) return { eligible: false, reason: "fraud_blocked" };
    if (p.referred_predictions_count < 5) return { eligible: false, reason: "user_ineligible" };
    if (p.referred_resolved_count < 1) return { eligible: false, reason: "user_ineligible" };
    if (p.referred_active_distinct_days < 3) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => REFERRAL_ACTIVATION_PTX,
  idempotency: (ctx) => {
    const p = parseReferralPayload(ctx.payload);
    return `ref-act:${p.referrer_id}:${p.referred_id}:v1`;
  },
};

interface ReferralCascadePayload {
  ancestor_id: string;
  descendant_event_id: string;
  descendant_amount: string; // serialized bigint
}

export const referralCascadeV1: PtxEarningRule = {
  id: "referral.cascade.v1",
  source_types: ["referral_activation"],
  flag_required: "PTX_REFERRALS_ENABLED",
  emits: "earn.referral.cascade",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<ReferralCascadePayload>;
    if (!p.ancestor_id || !p.descendant_event_id || !p.descendant_amount) {
      return { eligible: false, reason: "user_ineligible" };
    }
    return { eligible: true };
  },
  compute: (ctx) => {
    const descendantAmount = BigInt((ctx.payload as { descendant_amount: string }).descendant_amount);
    const cascaded = Number(descendantAmount) * REFERRAL_CASCADE_L2_FACTOR;
    return BigInt(Math.floor(cascaded));
  },
  idempotency: (ctx) => {
    const p = ctx.payload as ReferralCascadePayload;
    return `ref-cas:${p.ancestor_id}:${p.descendant_event_id}:v1`;
  },
};
```

- [ ] **Step 3: Create `lib/ptx/rewards/rules/creator.ts`**

```typescript
/**
 * Creator publication + audience milestone rules. Spec §9.2.
 */

import type { PtxEarningRule } from "./types";
import {
  CREATOR_PUBLICATION_BASE_PTX,
  CREATOR_PUBLICATION_MAX_PTX,
  CREATOR_PUBLICATION_WAIT_MS,
  CREATOR_PUBLICATION_MIN_VIEWERS,
  CREATOR_PUBLICATION_MIN_ENGAGEMENT,
  CREATOR_AUDIENCE_MILESTONES,
  CREATOR_MILESTONE_STABILITY_DAYS,
} from "../../constants";

interface PublicationPayload {
  publication_id: string;
  author_ptx_user_id: string;
  published_at: string;
  unique_viewers: number;
  meaningful_engagement: number;
  author_recent_flagged_count: number;
}

function parsePublicationPayload(p: Record<string, unknown>): PublicationPayload {
  return {
    publication_id: String(p.publication_id ?? ""),
    author_ptx_user_id: String(p.author_ptx_user_id ?? ""),
    published_at: String(p.published_at ?? ""),
    unique_viewers: Number(p.unique_viewers ?? 0),
    meaningful_engagement: Number(p.meaningful_engagement ?? 0),
    author_recent_flagged_count: Number(p.author_recent_flagged_count ?? 0),
  };
}

function weightedPublicationReward(meaningful: number, viewers: number): bigint {
  // Quality-weighted with diminishing returns. Linear floor + sqrt bonus, capped at MAX.
  const engagementScore = meaningful * 2 + Math.sqrt(viewers);
  const raw = Number(CREATOR_PUBLICATION_BASE_PTX) + engagementScore;
  const capped = Math.min(raw, Number(CREATOR_PUBLICATION_MAX_PTX));
  return BigInt(Math.floor(capped));
}

export const creatorPublicationV1: PtxEarningRule = {
  id: "creator.publication.v1",
  source_types: ["publication"],
  flag_required: "PTX_CREATOR_ENABLED",
  emits: "earn.creator.publication",
  eligibility: (ctx) => {
    const p = parsePublicationPayload(ctx.payload);
    if (!p.publication_id) return { eligible: false, reason: "user_ineligible" };
    const elapsedMs = Date.now() - new Date(p.published_at).getTime();
    if (elapsedMs < CREATOR_PUBLICATION_WAIT_MS) {
      return { eligible: false, reason: "user_ineligible" };
    }
    if (p.unique_viewers < CREATOR_PUBLICATION_MIN_VIEWERS) {
      return { eligible: false, reason: "user_ineligible" };
    }
    if (p.meaningful_engagement < CREATOR_PUBLICATION_MIN_ENGAGEMENT) {
      return { eligible: false, reason: "user_ineligible" };
    }
    if (p.author_recent_flagged_count > 0) {
      return { eligible: false, reason: "fraud_blocked" };
    }
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = parsePublicationPayload(ctx.payload);
    return weightedPublicationReward(p.meaningful_engagement, p.unique_viewers);
  },
  idempotency: (ctx) => {
    const p = parsePublicationPayload(ctx.payload);
    return `creator-pub:${p.publication_id}:v1`;
  },
};

interface AudienceMilestonePayload {
  author_ptx_user_id: string;
  threshold: number;            // 10, 50, 100, 500, 1000, 5000
  current_followers: number;
  stable_since: string;          // ISO when count crossed threshold
}

export const creatorAudienceMilestoneV1: PtxEarningRule = {
  id: "creator.audience_milestone.v1",
  source_types: ["publication"],
  flag_required: "PTX_CREATOR_ENABLED",
  emits: "earn.creator.audience_milestone",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<AudienceMilestonePayload>;
    if (!p.author_ptx_user_id || !p.threshold) return { eligible: false, reason: "user_ineligible" };
    if (CREATOR_AUDIENCE_MILESTONES[p.threshold] === undefined) {
      return { eligible: false, reason: "user_ineligible" };
    }
    if ((p.current_followers ?? 0) < p.threshold) {
      return { eligible: false, reason: "user_ineligible" };
    }
    const daysSinceCrossed =
      (Date.now() - new Date(p.stable_since ?? 0).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSinceCrossed < CREATOR_MILESTONE_STABILITY_DAYS) {
      return { eligible: false, reason: "user_ineligible" };
    }
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = ctx.payload as AudienceMilestonePayload;
    return CREATOR_AUDIENCE_MILESTONES[p.threshold] ?? 0n;
  },
  idempotency: (ctx) => {
    const p = ctx.payload as AudienceMilestonePayload;
    return `creator-aud:${p.author_ptx_user_id}:${p.threshold}:v1`;
  },
};
```

- [ ] **Step 4: Create `lib/ptx/rewards/rules/onboarding.ts`**

```typescript
/**
 * Onboarding milestones. Spec §9.5.
 */

import type { PtxEarningRule } from "./types";
import { ONBOARDING_REWARDS } from "../../constants";

interface OnboardingPayload {
  milestone_id: string;   // "first_prediction" | "first_resolution_seen" | ...
  ptx_user_id: string;
}

export const onboardingMilestoneV1: PtxEarningRule = {
  id: "onboarding.milestone.v1",
  source_types: ["milestone"],
  flag_required: "PTX_ONBOARDING_ENABLED",
  emits: "earn.onboarding.milestone",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<OnboardingPayload>;
    if (!p.milestone_id) return { eligible: false, reason: "user_ineligible" };
    if (ONBOARDING_REWARDS[p.milestone_id] === undefined) {
      return { eligible: false, reason: "user_ineligible" };
    }
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = ctx.payload as OnboardingPayload;
    return ONBOARDING_REWARDS[p.milestone_id] ?? 0n;
  },
  idempotency: (ctx) => {
    const p = ctx.payload as OnboardingPayload;
    return `onboarding:${p.milestone_id}:${ctx.ptx_user_id}`;
  },
};
```

- [ ] **Step 5: Create `lib/ptx/rewards/rules/learning.ts`**

```typescript
/**
 * Learning completion + series bonus. Spec §9.4.
 */

import type { PtxEarningRule } from "./types";
import {
  LEARNING_PER_LESSON_PTX,
  LEARNING_SERIES_BONUS_PTX,
} from "../../constants";

interface LearningPayload {
  lesson_id: string;
  series_id?: string;
  series_completed_with_this_lesson?: boolean;
  attention_signals_passed: boolean;
}

export const learningCompletionV1: PtxEarningRule = {
  id: "learning.completion.v1",
  source_types: ["lesson_complete"],
  flag_required: "PTX_LEARNING_ENABLED",
  emits: "earn.learning.completion",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<LearningPayload>;
    if (!p.lesson_id) return { eligible: false, reason: "user_ineligible" };
    if (!p.attention_signals_passed) return { eligible: false, reason: "fraud_blocked" };
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = ctx.payload as LearningPayload;
    const base = LEARNING_PER_LESSON_PTX;
    if (p.series_completed_with_this_lesson && p.series_id) {
      return base + LEARNING_SERIES_BONUS_PTX;
    }
    return base;
  },
  idempotency: (ctx) => {
    const p = ctx.payload as LearningPayload;
    return `learning:${p.lesson_id}:${ctx.ptx_user_id}`;
  },
};
```

- [ ] **Step 6: Create `lib/ptx/rewards/rules/seasonal.ts`**

```typescript
/**
 * Seasonal participation + completion. Spec §9.7.
 */

import type { PtxEarningRule } from "./types";
import {
  SEASONAL_PARTICIPATION_PTX,
  SEASONAL_COMPLETION_PTX,
} from "../../constants";

interface SeasonalPayload {
  season_id: string;
  phase: "participation" | "completion";
  user_eligible: boolean;
  user_completed: boolean;
}

export const seasonalParticipationV1: PtxEarningRule = {
  id: "seasonal.participation.v1",
  source_types: ["season_event"],
  flag_required: "PTX_SEASONAL_ENABLED",
  emits: "earn.seasonal.participation",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<SeasonalPayload>;
    if (!p.season_id) return { eligible: false, reason: "user_ineligible" };
    if (p.phase !== "participation") return { eligible: false, reason: "rule_not_matched" };
    if (!p.user_eligible) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => SEASONAL_PARTICIPATION_PTX,
  idempotency: (ctx) => {
    const p = ctx.payload as SeasonalPayload;
    return `season:${p.season_id}:participation:${ctx.ptx_user_id}`;
  },
};

export const seasonalCompletionV1: PtxEarningRule = {
  id: "seasonal.completion.v1",
  source_types: ["season_event"],
  flag_required: "PTX_SEASONAL_ENABLED",
  emits: "earn.seasonal.completion",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<SeasonalPayload>;
    if (!p.season_id) return { eligible: false, reason: "user_ineligible" };
    if (p.phase !== "completion") return { eligible: false, reason: "rule_not_matched" };
    if (!p.user_completed) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => SEASONAL_COMPLETION_PTX,
  idempotency: (ctx) => {
    const p = ctx.payload as SeasonalPayload;
    return `season:${p.season_id}:completion:${ctx.ptx_user_id}`;
  },
};
```

- [ ] **Step 7: Create `lib/ptx/rewards/rules/contribution.ts`**

```typescript
/**
 * Contribution (manual approval) rule. Spec §9.8.
 */

import type { PtxEarningRule } from "./types";
import {
  CONTRIBUTION_MIN_PTX,
  CONTRIBUTION_MAX_PTX_PER_APPROVAL,
} from "../../constants";

interface ContributionPayload {
  approval_id: string;       // PK of ptx_manual_rewards row
  approved_amount: string;   // serialized bigint
  category: "help" | "moderation" | "mentoring";
}

export const contributionManualV1: PtxEarningRule = {
  id: "contribution.manual.v1",
  source_types: ["moderation_action"],
  flag_required: "PTX_REWARDS_ENABLED",
  emits: "earn.contribution.help",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<ContributionPayload>;
    if (!p.approval_id || !p.approved_amount) {
      return { eligible: false, reason: "user_ineligible" };
    }
    const amt = BigInt(p.approved_amount);
    if (amt < CONTRIBUTION_MIN_PTX || amt > CONTRIBUTION_MAX_PTX_PER_APPROVAL) {
      return { eligible: false, reason: "user_ineligible" };
    }
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = ctx.payload as ContributionPayload;
    return BigInt(p.approved_amount);
  },
  idempotency: (ctx) => {
    const p = ctx.payload as ContributionPayload;
    return `contrib:${p.approval_id}`;
  },
};
```

- [ ] **Step 8: Create `lib/ptx/rewards/rules/community.ts`**

```typescript
/**
 * Community quality engagement (manual approval). Spec §9.8.
 */

import type { PtxEarningRule } from "./types";
import {
  CONTRIBUTION_MIN_PTX,
  CONTRIBUTION_MAX_PTX_PER_APPROVAL,
} from "../../constants";

interface CommunityQualityPayload {
  approval_id: string;
  approved_amount: string;
}

export const communityQualityV1: PtxEarningRule = {
  id: "community.quality.v1",
  source_types: ["engagement_quality"],
  flag_required: "PTX_REWARDS_ENABLED",
  emits: "earn.community.quality_engagement",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<CommunityQualityPayload>;
    if (!p.approval_id || !p.approved_amount) {
      return { eligible: false, reason: "user_ineligible" };
    }
    const amt = BigInt(p.approved_amount);
    if (amt < CONTRIBUTION_MIN_PTX || amt > CONTRIBUTION_MAX_PTX_PER_APPROVAL) {
      return { eligible: false, reason: "user_ineligible" };
    }
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = ctx.payload as CommunityQualityPayload;
    return BigInt(p.approved_amount);
  },
  idempotency: (ctx) => {
    const p = ctx.payload as CommunityQualityPayload;
    return `community:${p.approval_id}`;
  },
};
```

- [ ] **Step 9: Create `lib/ptx/rewards/rules/og.ts`**

```typescript
/**
 * OG early adopter grant rule. Spec §9.9.
 * NOTE: OG rule grants STATUS (and a permanent multiplier elsewhere applied),
 * not a PTX one-shot. compute() returns 0 — the side effect is recording the OG grant
 * in ptx_og_grants (handled by caller).
 */

import type { PtxEarningRule } from "./types";

interface OgEligibilityPayload {
  criteria_met: Record<string, boolean | number>;
  window_still_open: boolean;
}

export const ogEarlyAdopterV1: PtxEarningRule = {
  id: "og.early_adopter.v1",
  source_types: ["og_window"],
  flag_required: "PTX_OG_WINDOW_OPEN",
  emits: "earn.og.early_adopter",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<OgEligibilityPayload>;
    if (!p.window_still_open) return { eligible: false, reason: "flag_disabled" };
    if (!p.criteria_met) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => 0n,                          // Status grant, not PTX amount
  idempotency: (ctx) => `og-grant:${ctx.ptx_user_id}`,
};
```

- [ ] **Step 10: Create `lib/ptx/rewards/rules/index.ts`**

```typescript
import type { PtxEarningRule } from "./types";
import { referralActivatedV1, referralCascadeV1 } from "./referral";
import { creatorPublicationV1, creatorAudienceMilestoneV1 } from "./creator";
import { onboardingMilestoneV1 } from "./onboarding";
import { learningCompletionV1 } from "./learning";
import { seasonalParticipationV1, seasonalCompletionV1 } from "./seasonal";
import { contributionManualV1 } from "./contribution";
import { communityQualityV1 } from "./community";
import { ogEarlyAdopterV1 } from "./og";

/**
 * Closed registry. Order is significant for matching when multiple rules share a source_type.
 * The first match wins.
 */
export const PTX_RULES: readonly PtxEarningRule[] = [
  referralActivatedV1,
  referralCascadeV1,
  creatorPublicationV1,
  creatorAudienceMilestoneV1,
  onboardingMilestoneV1,
  learningCompletionV1,
  seasonalParticipationV1,
  seasonalCompletionV1,
  contributionManualV1,
  communityQualityV1,
  ogEarlyAdopterV1,
] as const;

export type { PtxEarningRule, EligibilityResult } from "./types";
```

- [ ] **Step 11: Create `lib/ptx/rewards/index.ts`**

```typescript
export { computePtxReward } from "./engine";
export type { PtxRewardContext, PtxRewardOutcome } from "./engine";
export { combineMultipliers, applyMultiplier, DEFAULT_MULTIPLIERS } from "./multipliers";
export type { PtxMultiplierBundle } from "./multipliers";
export { applyCaps } from "./caps";
export type { PtxCapKind, CapContext, CappedResult } from "./caps";
export { PTX_RULES } from "./rules";
export type { PtxEarningRule, EligibilityResult } from "./rules";
```

- [ ] **Step 12: Build + commit (consolidates Tasks 10 + 11)**

```bash
corepack pnpm build 2>&1 | tail -10
git add lib/ptx/rewards/
git commit -m "feat(ptx): reward engine (pure function) + 11 closed rules + caps + multipliers"
```

Expected: 0 errors.

---

## Task 12: Build `lib/ptx/sinks/` module

**Files:**
- Create: `lib/ptx/sinks/catalog.ts`
- Create: `lib/ptx/sinks/data/v1-catalog.ts`
- Create: `lib/ptx/sinks/consume.ts`
- Create: `lib/ptx/sinks/pricing.ts`
- Create: `lib/ptx/sinks/inflation-control.ts`
- Create: `lib/ptx/sinks/jobs/economy-snapshot.ts`
- Create: `lib/ptx/sinks/index.ts`

- [ ] **Step 1: Create `lib/ptx/sinks/catalog.ts`**

```typescript
/**
 * Sink catalog interface + category types. Spec §15.
 */

import type { PtxFlagName } from "../flags";

export type PtxSinkCategory =
  | "cosmetic_identity"
  | "status_marker"
  | "self_visibility"
  | "community_gesture"
  | "functional_accessory"
  | "learning_access";

export interface PtxSink {
  sink_id: string;
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
  flag_required?: PtxFlagName;
  expires_at?: string;
}
```

- [ ] **Step 2: Create `lib/ptx/sinks/data/v1-catalog.ts`**

```typescript
/**
 * Initial v1 sink registry. ~24 sinks. Spec §15.
 *
 * IMPORTANT: This is the only place sink metadata is declared. constants.ts SINK_PRICING
 * uses these sink_id values as keys.
 */

import type { PtxSink } from "../catalog";

export const V1_SINK_REGISTRY: readonly PtxSink[] = [
  // COSMETIC IDENTITY — avatar frames basic (6 designs)
  ...["aurora", "ember", "wave", "lattice", "forest", "tide"].map((variant): PtxSink => ({
    sink_id: `cosmetic.avatar_frame.basic.${variant}`,
    category: "cosmetic_identity",
    name_en: `Avatar frame — ${variant}`,
    name_es: `Marco de avatar — ${variant}`,
    description_en: "Cosmetic avatar frame.",
    description_es: "Marco cosmético para tu avatar.",
    base_cost: 200n,
    unlock_type: "one_time",
    scarcity_signal: "common",
    flag_required: "PTX_SINKS_ENABLED",
  })),
  // COSMETIC IDENTITY — profile themes
  ...["light", "dark", "emerald"].map((variant): PtxSink => ({
    sink_id: `cosmetic.profile_theme.${variant}`,
    category: "cosmetic_identity",
    name_en: `Profile theme — ${variant}`,
    name_es: `Tema de perfil — ${variant}`,
    description_en: "Cosmetic profile background theme.",
    description_es: "Tema de fondo cosmético para tu perfil.",
    base_cost: 500n,
    unlock_type: "one_time",
    scarcity_signal: "common",
    flag_required: "PTX_SINKS_ENABLED",
  })),
  // COSMETIC IDENTITY — username colors
  ...["sapphire", "amber", "rose", "violet", "moss"].map((variant): PtxSink => ({
    sink_id: `cosmetic.username_color.${variant}`,
    category: "cosmetic_identity",
    name_en: `Username color — ${variant}`,
    name_es: `Color de nombre — ${variant}`,
    description_en: "Cosmetic username accent color.",
    description_es: "Color cosmético para tu nombre de usuario.",
    base_cost: 300n,
    unlock_type: "one_time",
    scarcity_signal: "common",
    flag_required: "PTX_SINKS_ENABLED",
  })),
  // STATUS MARKERS
  {
    sink_id: "status.custom_title",
    category: "status_marker",
    name_en: "Custom title (30d)",
    name_es: "Título personalizado (30d)",
    description_en: "Display a custom title on your profile for 30 days.",
    description_es: "Muestra un título personalizado en tu perfil durante 30 días.",
    base_cost: 750n,
    unlock_type: "recurring_subscription",
    recurring_period_days: 30,
    scarcity_signal: "rare",
    flag_required: "PTX_SINKS_ENABLED",
  },
  {
    sink_id: "status.og_badge_display_styles.classic",
    category: "status_marker",
    name_en: "OG badge style — Classic",
    name_es: "Estilo de insignia OG — Clásico",
    description_en: "Visual variant for your OG badge.",
    description_es: "Variante visual para tu insignia OG.",
    base_cost: 500n,
    unlock_type: "one_time",
    scarcity_signal: "OG_only",
    flag_required: "PTX_SINKS_ENABLED",
  },
  // SELF VISIBILITY (NEVER affects accuracy leaderboard)
  {
    sink_id: "visibility.creator_highlights_feature.1d",
    category: "self_visibility",
    name_en: "Creator highlights feature (1 day)",
    name_es: "Destacado en creadores (1 día)",
    description_en: "Appear in the /discover creator highlights for 1 day.",
    description_es: "Aparece en los destacados de creadores en /discover durante 1 día.",
    base_cost: 2000n,
    unlock_type: "consumable",
    scarcity_signal: "rare",
    flag_required: "PTX_SINKS_ENABLED",
  },
  {
    sink_id: "visibility.profile_pinned_explanation.7d",
    category: "self_visibility",
    name_en: "Pin explanation to profile (7 days)",
    name_es: "Anclar explicación a tu perfil (7 días)",
    description_en: "Pin a reasoning or explanation to your own profile for 7 days.",
    description_es: "Ancla una explicación o razonamiento a tu perfil durante 7 días.",
    base_cost: 100n,
    unlock_type: "consumable",
    scarcity_signal: "common",
    flag_required: "PTX_SINKS_ENABLED",
  },
  // COMMUNITY GESTURES
  {
    sink_id: "community.tip_peer",
    category: "community_gesture",
    name_en: "Tip another forecaster",
    name_es: "Da una propina a otro pronosticador",
    description_en: "Send PTX to another forecaster. Minimum 50 PTX.",
    description_es: "Envía PTX a otro pronosticador. Mínimo 50 PTX.",
    base_cost: 50n,                        // minimum; actual amount variable per spend
    unlock_type: "consumable",
    scarcity_signal: "common",
    flag_required: "PTX_SINKS_ENABLED",
  },
  {
    sink_id: "community.sponsor_referred_milestone",
    category: "community_gesture",
    name_en: "Sponsor referred user's next milestone",
    name_es: "Patrocina el próximo milestone de tu referido",
    description_en: "Boost a referred user's next onboarding milestone with extra PTX.",
    description_es: "Refuerza el próximo milestone de onboarding de un referido con PTX extra.",
    base_cost: 200n,
    unlock_type: "consumable",
    scarcity_signal: "common",
    flag_required: "PTX_SPONSOR_ENABLED",
  },
  // FUNCTIONAL ACCESSORIES
  {
    sink_id: "accessory.export_track_record_premium",
    category: "functional_accessory",
    name_en: "Premium track-record export (30d)",
    name_es: "Exportación premium de track record (30d)",
    description_en: "Premium PDF/CSV export of your forecasting track record.",
    description_es: "Exportación premium PDF/CSV de tu historial de pronósticos.",
    base_cost: 500n,
    unlock_type: "recurring_subscription",
    recurring_period_days: 30,
    flag_required: "PTX_SINKS_ENABLED",
  },
  {
    sink_id: "accessory.advanced_filtering",
    category: "functional_accessory",
    name_en: "Advanced market filtering (30d)",
    name_es: "Filtrado avanzado de mercados (30d)",
    description_en: "Advanced filters and saved searches for markets.",
    description_es: "Filtros avanzados y búsquedas guardadas para mercados.",
    base_cost: 750n,
    unlock_type: "recurring_subscription",
    recurring_period_days: 30,
    flag_required: "PTX_SINKS_ENABLED",
  },
  {
    sink_id: "accessory.custom_og_card_variant.aurora",
    category: "functional_accessory",
    name_en: "Custom Called-It card variant — Aurora",
    name_es: "Variante de tarjeta Called-It — Aurora",
    description_en: "Unlock an Aurora-style Called-It share card.",
    description_es: "Desbloquea una variante Aurora de la tarjeta Called-It.",
    base_cost: 750n,
    unlock_type: "one_time",
    flag_required: "PTX_SINKS_ENABLED",
  },
  {
    sink_id: "accessory.early_access_pass",
    category: "functional_accessory",
    name_en: "Early access pass (90d)",
    name_es: "Pase de acceso anticipado (90d)",
    description_en: "Early access to new categories and features.",
    description_es: "Acceso anticipado a nuevas categorías y funciones.",
    base_cost: 1500n,
    unlock_type: "recurring_subscription",
    recurring_period_days: 90,
    flag_required: "PTX_SINKS_ENABLED",
  },
  // LEARNING ACCESS (deferred to Phase 5)
  {
    sink_id: "learning.premium_pack.crypto",
    category: "learning_access",
    name_en: "Premium learning pack — Crypto",
    name_es: "Pack premium de aprendizaje — Cripto",
    description_en: "Premium Academy content for crypto category.",
    description_es: "Contenido premium de Academy para la categoría cripto.",
    base_cost: 500n,
    unlock_type: "one_time",
    flag_required: "PTX_LEARNING_ENABLED",
  },
] as const;
```

- [ ] **Step 3: Create `lib/ptx/sinks/pricing.ts`**

```typescript
import { SINK_PRICING } from "../constants";
import { V1_SINK_REGISTRY } from "./data/v1-catalog";

export function getPtxSinkCost(sinkId: string): bigint | null {
  // First check explicit SINK_PRICING overrides
  const fromConstants = SINK_PRICING[sinkId];
  if (fromConstants !== undefined) return fromConstants;
  // Fall back to the catalog's base_cost
  const sink = V1_SINK_REGISTRY.find((s) => s.sink_id === sinkId);
  if (!sink) return null;
  return sink.base_cost;
}

export function listPtxSinks(): readonly typeof V1_SINK_REGISTRY[number][] {
  return V1_SINK_REGISTRY;
}
```

- [ ] **Step 4: Create `lib/ptx/sinks/consume.ts`**

```typescript
/**
 * Spend transaction. Atomic for tipping (emits two events). Phase 0: stub.
 * Spec §15.
 */

import type { PtxUserId } from "../identity/types";

export interface ConsumeInput {
  ptx_user_id: PtxUserId;
  sink_id: string;
  amount: bigint;             // for tip_peer this is the variable amount; >= sink.base_cost
  target_id?: string;         // for tipping target_ptx_user_id; for sponsor target referred_id
}

export interface ConsumeResult {
  consumed: boolean;
  spend_event_id: string | null;
  paired_event_id: string | null; // for tip_peer, the receiver's earn event
  reason?: string;
}

export async function consumePtx(input: ConsumeInput): Promise<ConsumeResult> {
  void input;
  throw new Error("PTX Phase 0: consumePtx not wired. See spec §15.");
}
```

- [ ] **Step 5: Create `lib/ptx/sinks/inflation-control.ts`**

```typescript
/**
 * Inflation circuit breakers. Spec §18.
 * Phase 0: stubs.
 */

export interface InflationHealth {
  status: "green" | "yellow" | "red";
  flags: string[];
  net_inflation_today: bigint;
  global_daily_emission_used_pct: number;
}

const CAP_GLOBAL_DAILY_EMISSION = 200_000n;

export function evaluateInflationHealth(input: {
  total_earned_today: bigint;
  total_spent_today: bigint;
  circulation_total: bigint;
  per_source_share_max_pct: number;
  per_sink_share_max_pct: number;
  consecutive_yellow_days: number;
  consecutive_red_days: number;
}): InflationHealth {
  const net = input.total_earned_today - input.total_spent_today;
  const usedPct = Math.min(100, Number((input.total_earned_today * 100n) / CAP_GLOBAL_DAILY_EMISSION));
  const flags: string[] = [];

  let status: "green" | "yellow" | "red" = "green";

  const inflationPct =
    input.circulation_total > 0n
      ? Number((net * 100n) / input.circulation_total)
      : 0;

  if (inflationPct > 5 || input.per_source_share_max_pct > 60 || input.per_sink_share_max_pct > 70) {
    status = "yellow";
    flags.push("yellow_threshold");
  }
  if (input.consecutive_yellow_days >= 3) {
    status = "yellow";
    flags.push("yellow_persistent_3d");
  }
  if (inflationPct > 15 && input.consecutive_red_days >= 5) {
    status = "red";
    flags.push("red_threshold_persistent");
  }
  if (usedPct >= 100) {
    status = "red";
    flags.push("global_emission_ceiling_hit");
  }

  return {
    status,
    flags,
    net_inflation_today: net,
    global_daily_emission_used_pct: usedPct,
  };
}

export { CAP_GLOBAL_DAILY_EMISSION };
```

- [ ] **Step 6: Create `lib/ptx/sinks/jobs/economy-snapshot.ts`**

```typescript
/**
 * Daily economy snapshot worker. Phase 0: stub.
 * Will be scheduled (Vercel cron or Supabase scheduled function) when Phase 1+ wires up.
 * Spec §17.
 */

export interface EconomySnapshotResult {
  metric_date: string;
  rows_aggregated: number;
  health_status: "green" | "yellow" | "red";
}

export async function runEconomySnapshot(forDate?: string): Promise<EconomySnapshotResult> {
  void forDate;
  throw new Error("PTX Phase 0: runEconomySnapshot not wired. See spec §17.");
}
```

- [ ] **Step 7: Create `lib/ptx/sinks/index.ts`**

```typescript
export { listPtxSinks, getPtxSinkCost } from "./pricing";
export { consumePtx } from "./consume";
export type { PtxSink, PtxSinkCategory } from "./catalog";
export type { ConsumeInput, ConsumeResult } from "./consume";
export { evaluateInflationHealth, CAP_GLOBAL_DAILY_EMISSION } from "./inflation-control";
export type { InflationHealth } from "./inflation-control";
export { V1_SINK_REGISTRY } from "./data/v1-catalog";
```

- [ ] **Step 8: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/sinks/
git commit -m "feat(ptx): sinks module (24-item catalog, pricing, inflation control)"
```

Expected: 0 errors.

---

## Task 13: Build `lib/ptx/fraud/` module

**Files:**
- Create: `lib/ptx/fraud/data/disposable-domains.ts`
- Create: `lib/ptx/fraud/sybil.ts`
- Create: `lib/ptx/fraud/velocity.ts`
- Create: `lib/ptx/fraud/patterns.ts`
- Create: `lib/ptx/fraud/audit.ts`
- Create: `lib/ptx/fraud/index.ts`

- [ ] **Step 1: Create `lib/ptx/fraud/data/disposable-domains.ts`**

```typescript
/**
 * Static blocklist of disposable / temporary email domains.
 * Maintained manually. ADR-PTX-014.
 *
 * Update protocol: add a domain → bump version → ADR addendum.
 */

export const DISPOSABLE_EMAIL_DOMAINS_VERSION = 1;

export const DISPOSABLE_EMAIL_DOMAINS: readonly string[] = [
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "tempmail.com", "tempmailo.com", "10minutemail.com", "10minutemail.net",
  "throwawaymail.com", "yopmail.com", "yopmail.net", "yopmail.fr",
  "trashmail.com", "trashmail.net", "trashmail.de",
  "dispostable.com", "fakeinbox.com", "getairmail.com",
  "mintemail.com", "mailcatch.com", "mohmal.com",
  "sharklasers.com", "spam4.me", "tempr.email", "tmpmail.org",
  "throwam.com", "binkmail.com", "spambox.us", "burnermail.io",
  "tempinbox.com", "maildrop.cc", "moakt.com", "tempemailaddress.com",
  "fakemail.net", "discard.email", "tempmail.dev", "internxt.com",
  "0wnd.net", "1secmail.com", "33mail.com", "anonbox.net",
  "burner.kiwi", "byom.de", "ezehe.com", "fictionaldomain.com",
  "harakirimail.com", "incognitomail.com", "mailbox.org", "noctmail.com",
  "pokemail.net",
];

const SET = new Set(DISPOSABLE_EMAIL_DOMAINS.map((d) => d.toLowerCase()));

export function isDisposableEmailDomain(emailOrDomain: string): boolean {
  const lower = emailOrDomain.toLowerCase().trim();
  const domain = lower.includes("@") ? lower.split("@")[1] : lower;
  return SET.has(domain);
}
```

- [ ] **Step 2: Create `lib/ptx/fraud/sybil.ts`**

```typescript
/**
 * Sybil signal collector. ADR-PTX-014. Spec §19.1.
 *
 * v1 implements:
 *   - IP class (anonymized /24 v4, /48 v6)
 *   - Email domain (disposable blocklist)
 *   - Account age vs activity ratio
 *
 * Deferred to v2 (ADR-PTX-014): canvas fingerprint, behavioral clustering.
 */

import { isDisposableEmailDomain } from "./data/disposable-domains";

export interface SybilContext {
  email?: string;
  ip_class_v4_24?: string;        // e.g., "203.0.113.0/24"
  ip_class_v6_48?: string;        // e.g., "2001:db8::/48"
  account_age_days: number;
  activity_count: number;
}

export interface SybilResult {
  score: number;                  // 0-100
  decision: "allow" | "review" | "block";
  reasons: string[];
}

export function evaluateSybilSignals(ctx: SybilContext): SybilResult {
  let score = 0;
  const reasons: string[] = [];

  if (ctx.email && isDisposableEmailDomain(ctx.email)) {
    score += 60;
    reasons.push("disposable_email_domain");
  }

  if (ctx.account_age_days < 1 && ctx.activity_count > 20) {
    score += 40;
    reasons.push("excessive_activity_on_new_account");
  } else if (ctx.account_age_days < 7 && ctx.activity_count > 100) {
    score += 25;
    reasons.push("rapid_activity_young_account");
  }

  // ip_class clustering would consult an external aggregate; v1 leaves this as a tag only
  if (ctx.ip_class_v4_24 || ctx.ip_class_v6_48) {
    reasons.push("ip_class_tagged");
  }

  let decision: SybilResult["decision"] = "allow";
  if (score >= 70) decision = "block";
  else if (score >= 50) decision = "review";

  return { score: Math.min(score, 100), decision, reasons };
}
```

- [ ] **Step 3: Create `lib/ptx/fraud/velocity.ts`**

```typescript
/**
 * Velocity controls. Spec §19.2.
 */

import type { PtxSourceType } from "../events/source-types";

export const VELOCITY_LIMITS: Partial<Record<PtxSourceType, { max: number; window_seconds: number }>> = {
  referral_activation: { max: 3, window_seconds: 60 },
  publication:         { max: 1, window_seconds: 3600 },
  lesson_complete:     { max: 2, window_seconds: 600 },
  milestone:           { max: 5, window_seconds: 60 },
};

export interface VelocityResult {
  exceeded: boolean;
  observed: number;
  limit: number;
  window_seconds: number;
}

export function evaluateVelocity(
  sourceType: PtxSourceType,
  observed_count_in_window: number,
): VelocityResult {
  const conf = VELOCITY_LIMITS[sourceType];
  if (!conf) {
    return { exceeded: false, observed: observed_count_in_window, limit: Infinity, window_seconds: 0 };
  }
  return {
    exceeded: observed_count_in_window >= conf.max,
    observed: observed_count_in_window,
    limit: conf.max,
    window_seconds: conf.window_seconds,
  };
}
```

- [ ] **Step 4: Create `lib/ptx/fraud/patterns.ts`**

```typescript
/**
 * Pattern detection. Spec §19.3. Phase 0 returns no detections.
 * Real implementation runs in async cron after wire-up.
 */

import type { PtxUserId } from "../identity/types";

export type PatternKind = "cycle" | "burst_clustering" | "mirror_users" | "inactive_earner";

export interface PatternDetection {
  kind: PatternKind;
  severity: 1 | 2 | 3 | 4 | 5;
  involved_users: PtxUserId[];
  evidence: Record<string, unknown>;
}

export async function detectPatternsAsync(): Promise<PatternDetection[]> {
  // Phase 0: no patterns detected (no data).
  return [];
}
```

- [ ] **Step 5: Create `lib/ptx/fraud/audit.ts`**

```typescript
/**
 * Fraud signal audit trail. Spec §19.4.
 * Phase 0: stub. Real impl writes to ptx_fraud_signals.
 */

import type { PtxUserId } from "../identity/types";

export interface FraudSignal {
  signal_type: string;
  severity: 1 | 2 | 3 | 4 | 5;
  triggered_by: "sybil" | "velocity" | "pattern" | "manual";
  decision: "allow" | "block" | "review_pending";
  context: Record<string, unknown>;
}

export async function writeFraudSignal(
  ptxUserId: PtxUserId,
  signal: FraudSignal,
): Promise<{ signal_id: string }> {
  void ptxUserId; void signal;
  throw new Error("PTX Phase 0: writeFraudSignal not wired. See spec §19.4.");
}
```

- [ ] **Step 6: Create `lib/ptx/fraud/index.ts`**

```typescript
/**
 * Fraud module entry point. Spec §19.
 *
 * Public entry: evaluateEvent — the gatekeeper between rewards.compute and events.emit.
 * Phase 0: stub returns allow with no signals (safe default; engine isn't wired anyway).
 */

import type { PtxRewardContext, PtxRewardOutcome } from "../rewards";

export interface FraudEvaluation {
  decision: "allow" | "block" | "review_pending";
  signals: { kind: string; severity: 1 | 2 | 3 | 4 | 5 }[];
  severity: 1 | 2 | 3 | 4 | 5;
  reason?: string;
}

export async function evaluateEvent(
  ctx: PtxRewardContext,
  outcome: PtxRewardOutcome,
): Promise<FraudEvaluation> {
  void ctx; void outcome;
  // Phase 0 default — engine and emit are both stubs, fraud never runs in prod.
  return { decision: "allow", signals: [], severity: 1 };
}

export { evaluateSybilSignals } from "./sybil";
export type { SybilContext, SybilResult } from "./sybil";
export { evaluateVelocity, VELOCITY_LIMITS } from "./velocity";
export type { VelocityResult } from "./velocity";
export { detectPatternsAsync } from "./patterns";
export type { PatternDetection, PatternKind } from "./patterns";
export { writeFraudSignal } from "./audit";
export type { FraudSignal } from "./audit";
export { isDisposableEmailDomain } from "./data/disposable-domains";
```

- [ ] **Step 7: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/fraud/
git commit -m "feat(ptx): fraud module (sybil, velocity, patterns, audit stubs)"
```

Expected: 0 errors.

---

## Task 14: Build `lib/ptx/migration/` module

**Files:**
- Create: `lib/ptx/migration/anchor.ts`
- Create: `lib/ptx/migration/snapshot.ts`
- Create: `lib/ptx/migration/chain-bindings.ts`
- Create: `lib/ptx/migration/README.md`
- Create: `lib/ptx/migration/index.ts`

- [ ] **Step 1: Create `lib/ptx/migration/anchor.ts`**

```typescript
/**
 * Phase 7 cryptographic anchoring of Merkle root to chain.
 * Phase 0: no-op interface.
 * Spec §29, ADR-PTX-020.
 */

export interface AnchorInput {
  chain_id: number;
  merkle_root: string;
  snapshot_taken_at: string;
}

export interface AnchorResult {
  tx_hash: string;
  block_number: number;
  anchored_at: string;
}

export async function anchorEvent(input: AnchorInput): Promise<AnchorResult> {
  void input;
  throw new Error("PTX Phase 0: anchorEvent not wired (Phase 7 only). See spec §26.");
}
```

- [ ] **Step 2: Create `lib/ptx/migration/snapshot.ts`**

```typescript
/**
 * Phase 9 snapshot for ERC-20 distribution. Phase 0: stub.
 * Spec §26, ADR-PTX-020.
 */

import type { PtxUserId } from "../identity/types";

export interface MigrationSnapshot {
  snapshot_id: string;
  chain_id: number;
  taken_at: string;
  entries: { ptx_user_id: PtxUserId; balance: bigint }[];
  merkle_root: string;
}

export async function snapshotForChain(chainId: number): Promise<MigrationSnapshot> {
  void chainId;
  throw new Error("PTX Phase 0: snapshotForChain not wired (Phase 9 only). See spec §26.");
}
```

- [ ] **Step 3: Create `lib/ptx/migration/chain-bindings.ts`**

```typescript
/**
 * Phase 8 wallet ↔ ptx_user_id binding interface.
 * Phase 0: re-export interface only.
 * Spec §28.
 */

export type { WalletBindingInput, WalletBindingResult } from "../identity/wallet-binding";
export { bindWallet } from "../identity/wallet-binding";
```

- [ ] **Step 4: Create `lib/ptx/migration/README.md`**

```markdown
# lib/ptx/migration — Onchain migration interfaces (DEFERRED)

This subdirectory exposes interfaces for the future onchain migration phases.

| Phase | When | What |
|-------|------|------|
| Phase 7 | FAR FUTURE | Cryptographic anchoring of Merkle roots to chain (monthly). |
| Phase 8 | FAR FUTURE | Wallet binding opt-in (Privy embedded wallets). |
| Phase 9 | FAR FUTURE | Snapshot-based ERC-20 distribution on Base. |
| Phase 10 | FAR FUTURE | Hybrid offchain + onchain steady state. |

**All functions in this directory throw in v1.** They exist purely to lock the interface so future activation does not require rewriting consumers.

Spec sections: §25 (visibility phases), §26 (migration strategy), §27 (chain selection), §28 (wallet strategy).

ADRs: PTX-018 (chain selection), PTX-019 (wallet provider), PTX-020 (snapshot strategy).

No web3 dependencies are imported here. Phase 8 activation will add `@privy-io/react-auth` and others as separate plan.
```

- [ ] **Step 5: Create `lib/ptx/migration/index.ts`**

```typescript
export { anchorEvent } from "./anchor";
export type { AnchorInput, AnchorResult } from "./anchor";
export { snapshotForChain } from "./snapshot";
export type { MigrationSnapshot } from "./snapshot";
export { bindWallet } from "./chain-bindings";
export type { WalletBindingInput, WalletBindingResult } from "./chain-bindings";
```

- [ ] **Step 6: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/migration/
git commit -m "feat(ptx): migration module (anchor, snapshot, wallet binding interfaces)"
```

Expected: 0 errors.

---

## Task 15: Wire `lib/ptx/index.ts` to expose the full public API

**Files:**
- Modify: `lib/ptx/index.ts`

- [ ] **Step 1: Replace `lib/ptx/index.ts` content**

```typescript
/**
 * PTX — Native social currency module for Prediction Trade.
 *
 * Public API surface (ADR-PTX-001). Do not import from submodules directly.
 *
 * Spec: docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
 *
 * NOTE: Phase 0 scaffolding — every async function throws "not wired" until
 * the corresponding phase activates. Synchronous pure functions (multipliers,
 * caps, sybil scoring, validators, hash computation, listing sinks) are usable today.
 */

// IDENTITY
export { getPtxUserId, exportIdentity, bindWallet } from "./identity";
export type {
  PtxUserId,
  PtxIdentityRecord,
  PtxIdentityExport,
  PtxEventExport,
  WalletBindingInput,
  WalletBindingResult,
} from "./identity";

// EVENTS
export {
  emitPtxEvent,
  validatePtxEventInput,
  isPtxEventType,
  isPtxSourceType,
  PTX_EVENT_TYPES,
  PTX_SOURCE_TYPES,
} from "./events";
export type {
  PtxEventType,
  PtxEventInput,
  PtxEventResult,
  PtxRejectionReason,
  PtxSourceType,
} from "./events";

// LEDGER
export {
  getPtxBalance,
  getPtxHistory,
  getUserTodayEarned,
  getUserTodayEarnedBySource,
  getGlobalTodayEarnedBySource,
  getUserLifetimeEarned,
  verifyChainForUser,
  computeEventHash,
} from "./ledger";
export type {
  PtxBalance,
  PtxHistoryEntry,
  PtxHistoryOptions,
  PtxAmount,
  ReconcileResult,
} from "./ledger";

// REWARDS
export {
  computePtxReward,
  combineMultipliers,
  applyMultiplier,
  DEFAULT_MULTIPLIERS,
  applyCaps,
  PTX_RULES,
} from "./rewards";
export type {
  PtxRewardContext,
  PtxRewardOutcome,
  PtxMultiplierBundle,
  PtxCapKind,
  CapContext,
  CappedResult,
  PtxEarningRule,
  EligibilityResult,
} from "./rewards";

// SINKS
export {
  listPtxSinks,
  getPtxSinkCost,
  consumePtx,
  evaluateInflationHealth,
  V1_SINK_REGISTRY,
  CAP_GLOBAL_DAILY_EMISSION,
} from "./sinks";
export type {
  PtxSink,
  PtxSinkCategory,
  ConsumeInput,
  ConsumeResult,
  InflationHealth,
} from "./sinks";

// FRAUD (kept narrow on purpose — fraud is an internal gatekeeper, not user-facing)
export { evaluateEvent as evaluateFraud } from "./fraud";
export type { FraudEvaluation } from "./fraud";

// MIGRATION (all Phase 7+ stubs)
export { anchorEvent, snapshotForChain } from "./migration";
export type {
  AnchorInput,
  AnchorResult,
  MigrationSnapshot,
} from "./migration";

// FLAGS
export { isPtxEnabled, isPtxSubFlagEnabled } from "./flags";
export type { PtxFlagSet, PtxFlagName } from "./flags";

// CONSTANTS (only safe-to-expose)
export { PTX_VERSION, PTX_DECIMALS, PTX_MAX_COMBINED_MULTIPLIER } from "./constants";
```

- [ ] **Step 2: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add lib/ptx/index.ts
git commit -m "feat(ptx): wire public API surface (index.ts) with full re-exports"
```

Expected: 0 errors.

---

## Task 16: Create `types/ptx.ts` re-exports

**Files:**
- Create: `types/ptx.ts`

- [ ] **Step 1: Create the file**

```typescript
/**
 * Convenience type re-exports for PTX. Allows `import type { ... } from "@/types/ptx"`
 * for consumers that prefer types-only imports.
 *
 * The runtime entry point is "@/lib/ptx".
 */

export type {
  PtxUserId,
  PtxIdentityRecord,
  PtxIdentityExport,
  PtxEventExport,
  PtxEventType,
  PtxEventInput,
  PtxEventResult,
  PtxRejectionReason,
  PtxSourceType,
  PtxBalance,
  PtxHistoryEntry,
  PtxHistoryOptions,
  PtxAmount,
  ReconcileResult,
  PtxRewardContext,
  PtxRewardOutcome,
  PtxMultiplierBundle,
  PtxCapKind,
  PtxEarningRule,
  PtxSink,
  PtxSinkCategory,
  ConsumeInput,
  ConsumeResult,
  InflationHealth,
  PtxFlagSet,
  PtxFlagName,
} from "@/lib/ptx";
```

- [ ] **Step 2: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add types/ptx.ts
git commit -m "feat(ptx): types/ptx.ts convenience re-exports"
```

Expected: 0 errors.

---

## Task 17: Write SQL migrations 010 – 013 (identities, events, balances view, seasonal)

**Files:**
- Create: `supabase/migrations/010_ptx_identities.sql`
- Create: `supabase/migrations/011_ptx_events.sql`
- Create: `supabase/migrations/012_ptx_balances_view.sql`
- Create: `supabase/migrations/013_ptx_seasonal_events.sql`

All migrations are INERT — they exist as files but are NOT applied in this task. Operator decides timing in Phase 1 activation plan.

- [ ] **Step 1: Create `supabase/migrations/010_ptx_identities.sql`**

Embed full SQL per spec §2 (`CREATE TABLE public.ptx_identities` block). Verbatim — including RLS enable + comment about pending policy creation.

Full content:

```sql
-- 010_ptx_identities.sql — PTX identity table (separate from auth.users)
-- Spec: docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md §2
-- ADR-PTX-005

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

CREATE INDEX idx_ptx_identities_auth
  ON public.ptx_identities(auth_user_id);

CREATE INDEX idx_ptx_identities_chain
  ON public.ptx_identities(chain_address)
  WHERE chain_address IS NOT NULL;

ALTER TABLE public.ptx_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY ptx_identities_owner_select ON public.ptx_identities
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY ptx_identities_chain_public_select ON public.ptx_identities
  FOR SELECT TO anon
  USING (chain_address IS NOT NULL);
```

- [ ] **Step 2: Create `supabase/migrations/011_ptx_events.sql`**

```sql
-- 011_ptx_events.sql — append-only event log with Merkle chain per user
-- Spec §5, ADR-PTX-002, ADR-PTX-009, ADR-PTX-010

CREATE TABLE public.ptx_events (
  event_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptx_user_id        UUID NOT NULL REFERENCES public.ptx_identities(ptx_user_id),
  event_type         TEXT NOT NULL,
  source_type        TEXT NOT NULL,
  source_id          TEXT NOT NULL,
  amount             NUMERIC(38,0) NOT NULL,
  multiplier_applied NUMERIC(10,4) NOT NULL DEFAULT 1.0,
  context            JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at        TIMESTAMPTZ NOT NULL,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key    TEXT NOT NULL UNIQUE,
  schema_version     SMALLINT NOT NULL DEFAULT 1,
  prev_event_hash    TEXT,
  event_hash         TEXT NOT NULL,
  seq_per_user       BIGINT NOT NULL,
  CONSTRAINT amount_for_system_events CHECK (
    (event_type LIKE 'system.%' AND amount = 0)
    OR (event_type LIKE 'earn.%' AND amount > 0)
    OR (event_type LIKE 'spend.%' AND amount < 0)
  )
);

REVOKE UPDATE, DELETE ON public.ptx_events FROM authenticated, anon, service_role;

CREATE INDEX idx_ptx_events_user_time ON public.ptx_events(ptx_user_id, occurred_at DESC);
CREATE INDEX idx_ptx_events_type ON public.ptx_events(event_type);
CREATE INDEX idx_ptx_events_source ON public.ptx_events(source_type, source_id);
CREATE UNIQUE INDEX idx_ptx_events_user_seq ON public.ptx_events(ptx_user_id, seq_per_user);

ALTER TABLE public.ptx_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY ptx_events_owner_select ON public.ptx_events
  FOR SELECT TO authenticated
  USING (
    ptx_user_id IN (
      SELECT ptx_user_id FROM public.ptx_identities WHERE auth_user_id = auth.uid()
    )
  );
```

- [ ] **Step 3: Create `supabase/migrations/012_ptx_balances_view.sql`**

```sql
-- 012_ptx_balances_view.sql — read-path view for balance + counters
-- Spec §6

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

- [ ] **Step 4: Create `supabase/migrations/013_ptx_seasonal_events.sql`**

```sql
-- 013_ptx_seasonal_events.sql — seasonal events catalog
-- Spec §9.7

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

-- Once snapshot_at is set, the row becomes immutable
CREATE OR REPLACE FUNCTION enforce_season_snapshot_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.snapshot_at IS NOT NULL THEN
    RAISE EXCEPTION 'Seasonal event is snapshotted; no further mutations allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ptx_seasonal_events_immutable_after_snapshot
  BEFORE UPDATE ON public.ptx_seasonal_events
  FOR EACH ROW EXECUTE FUNCTION enforce_season_snapshot_immutability();
```

- [ ] **Step 5: Build + commit (SQL files don't affect TS build, just verify nothing else broke)**

```bash
corepack pnpm build 2>&1 | tail -5
git add supabase/migrations/010_*.sql supabase/migrations/011_*.sql supabase/migrations/012_*.sql supabase/migrations/013_*.sql
git commit -m "feat(ptx): SQL migrations 010-013 (identities, events, balances view, seasonal)"
```

Expected: 0 errors.

---

## Task 18: Write SQL migrations 014 – 017 (OG window, economy metrics, fraud signals, migration snapshot)

**Files:**
- Create: `supabase/migrations/014_ptx_og_window.sql`
- Create: `supabase/migrations/015_ptx_economy_metrics.sql`
- Create: `supabase/migrations/016_ptx_fraud_signals.sql`
- Create: `supabase/migrations/017_ptx_migration_snapshot.sql`

- [ ] **Step 1: Create `supabase/migrations/014_ptx_og_window.sql`**

```sql
-- 014_ptx_og_window.sql — OG window (singleton, irreversible after closure)
-- Spec §9.9, ADR-PTX-013

CREATE TABLE public.ptx_og_window (
  id                BOOLEAN PRIMARY KEY DEFAULT TRUE,
  criteria_jsonb    JSONB NOT NULL,
  opened_at         TIMESTAMPTZ NOT NULL,
  manual_close_at   TIMESTAMPTZ,
  closed_reason     TEXT,
  closed_by         UUID,
  total_og_granted  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT singleton CHECK (id = TRUE)
);

CREATE TABLE public.ptx_og_grants (
  ptx_user_id   UUID PRIMARY KEY REFERENCES public.ptx_identities(ptx_user_id),
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  criteria_met  JSONB NOT NULL
);

-- Once manual_close_at is set, the OG window cannot be re-opened or modified
CREATE OR REPLACE FUNCTION enforce_og_window_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.manual_close_at IS NOT NULL THEN
    RAISE EXCEPTION 'OG window is closed; no further mutations allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER og_window_immutable_after_close
  BEFORE UPDATE ON public.ptx_og_window
  FOR EACH ROW EXECUTE FUNCTION enforce_og_window_immutability();
```

- [ ] **Step 2: Create `supabase/migrations/015_ptx_economy_metrics.sql`**

```sql
-- 015_ptx_economy_metrics.sql — daily aggregate metrics + health
-- Spec §17

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

- [ ] **Step 3: Create `supabase/migrations/016_ptx_fraud_signals.sql`**

```sql
-- 016_ptx_fraud_signals.sql — fraud signal audit trail
-- Spec §19.4

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
  ON public.ptx_fraud_signals(created_at)
  WHERE decision = 'review_pending';
```

- [ ] **Step 4: Create `supabase/migrations/017_ptx_migration_snapshot.sql`**

```sql
-- 017_ptx_migration_snapshot.sql — Phase 9 snapshot for ERC-20 distribution (FAR FUTURE prep)
-- Spec §26, ADR-PTX-020

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

-- Only claimed* fields are mutable post-creation
CREATE OR REPLACE FUNCTION enforce_migration_snapshot_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.ptx_user_id <> NEW.ptx_user_id
     OR OLD.chain_id <> NEW.chain_id
     OR OLD.balance_at_snapshot <> NEW.balance_at_snapshot
     OR OLD.snapshot_taken_at <> NEW.snapshot_taken_at
     OR (OLD.merkle_proof IS DISTINCT FROM NEW.merkle_proof) THEN
    RAISE EXCEPTION 'Migration snapshot is immutable except for claimed fields.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ptx_migration_snapshot_immutable
  BEFORE UPDATE ON public.ptx_migration_snapshot
  FOR EACH ROW EXECUTE FUNCTION enforce_migration_snapshot_immutability();
```

- [ ] **Step 5: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add supabase/migrations/014_*.sql supabase/migrations/015_*.sql supabase/migrations/016_*.sql supabase/migrations/017_*.sql
git commit -m "feat(ptx): SQL migrations 014-017 (OG window, metrics, fraud, snapshot)"
```

Expected: 0 errors.

---

## Task 19: Update `eslint.config.mjs` to enforce module boundary

**Files:**
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Read current eslint.config.mjs**

```bash
cat eslint.config.mjs
```

Note the existing structure so the new rule is added consistently.

- [ ] **Step 2: Add the no-restricted-imports rule block**

Insert at the end of the `export default [...]` array (before the closing bracket) a new config object:

```javascript
  {
    // PTX module boundary — ADR-PTX-001 + ADR-PTX-021
    files: ["**/*.{ts,tsx}"],
    ignores: ["lib/ptx/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: [
              "@/lib/ptx/events/*",
              "@/lib/ptx/ledger/*",
              "@/lib/ptx/rewards/*",
              "@/lib/ptx/sinks/*",
              "@/lib/ptx/fraud/*",
              "@/lib/ptx/identity/*",
              "@/lib/ptx/migration/*",
              "@/lib/ptx/constants",
            ],
            message: "Import from @/lib/ptx (public API) only. ADR-PTX-001.",
          },
        ],
      }],
    },
  },
  {
    // Stricter — leaderboard/profile-helpers cannot import PTX at all (ADR-PTX-021)
    files: [
      "app/leaderboard/**/*.{ts,tsx}",
      "app/api/leaderboard/**/*.{ts,tsx}",
      "components/leaderboard/**/*.{ts,tsx}",
      "lib/demo-leaderboard.ts",
      "lib/profile-helpers.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["@/lib/ptx", "@/lib/ptx/**"],
            message: "Leaderboard/profile-helpers cannot import PTX. ADR-PTX-003 + ADR-PTX-021.",
          },
        ],
      }],
    },
  },
```

- [ ] **Step 3: Verify lint passes with no PTX-related imports in existing code**

```bash
corepack pnpm lint 2>&1 | tail -10
```

Expected: 0 ESLint errors (no existing file imports `@/lib/ptx`, so the rules don't trip).

- [ ] **Step 4: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add eslint.config.mjs
git commit -m "feat(ptx): enforce module boundary via ESLint no-restricted-imports"
```

Expected: build 0 errors.

---

## Task 20: Update `.env.example` with PTX flag stubs (commented)

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Append to `.env.example`**

Append the following block at the end:

```bash

# ============================================================
# PTX Economy v1 — feature flags (Phase 0: all default to false)
# Spec: docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md §3
# All flags MUST remain unset/false in production until phase activation.
# ============================================================

# Master kill switch. Supports "false" | "true" | "allowlist:uid1,uid2,..."
# PTX_ENABLED=false

# Sub-flags (inherit from master — if master OFF for user, all sub-flags return false)
# PTX_EVENTS_WRITE_ENABLED=false
# PTX_REWARDS_ENABLED=false
# PTX_SINKS_ENABLED=false
# PTX_REFERRALS_ENABLED=false
# PTX_SPONSOR_ENABLED=false
# PTX_CREATOR_ENABLED=false
# PTX_ONBOARDING_ENABLED=false
# PTX_LEARNING_ENABLED=false
# PTX_SEASONAL_ENABLED=false
# PTX_OG_WINDOW_OPEN=false        # WARNING: once set true in prod and then closed, irreversible. See ADR-PTX-013.
# PTX_ANTI_FRAUD_ENABLED=false
```

- [ ] **Step 2: Build + commit**

```bash
corepack pnpm build 2>&1 | tail -5
git add .env.example
git commit -m "feat(ptx): add PTX_* flag stubs to .env.example (commented, default off)"
```

Expected: 0 errors.

---

## Task 21: Final verification

**Files:** none modified

- [ ] **Step 1: Verify all expected files exist**

```bash
find lib/ptx -type f | wc -l                 # Expect ~50 files
find supabase/migrations -name "01[0-7]_ptx*.sql" | wc -l  # Expect 8
find docs/superpowers/decisions -name "PTX-*.md" | wc -l   # Expect 21
ls docs/superpowers/specs/2026-05-19-ptx-* docs/superpowers/plans/2026-05-19-ptx-*
ls types/ptx.ts eslint.config.mjs .env.example
```

Expected counts: ~50, 8, 21. All ls outputs successful.

- [ ] **Step 2: Verify build clean**

```bash
corepack pnpm build 2>&1 | tail -10
```

Expected: TypeScript 0 errors, "Compiled successfully".

- [ ] **Step 3: Verify lint clean**

```bash
corepack pnpm lint 2>&1 | tail -10
```

Expected: 0 ESLint errors.

- [ ] **Step 4: Verify zero web3 dependencies were added**

```bash
grep -E "(wagmi|viem|ethers|@ethersproject|privy|magic-sdk|web3auth|walletconnect)" package.json
```

Expected: no matches.

- [ ] **Step 5: Verify scaffolding is inert at runtime**

Quick sanity check that PTX functions throw "not wired" when called and constants are loadable:

```bash
node --experimental-vm-modules -e "
const m = require('./lib/ptx/constants.ts');
console.log('PTX_VERSION =', m.PTX_VERSION);
"
```

Actually, since this is TypeScript and won't run directly through node, replace step 5 with type-level verification:

```bash
corepack pnpm tsc --noEmit lib/ptx/index.ts 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 6: Verify git state**

```bash
git log --oneline | head -25
git status --short
```

Expected: ~22 new commits since `673690d` (spec commit); working tree clean.

- [ ] **Step 7: Verify reversibility command**

Dry-run (no actual removal):

```bash
echo "If reversal needed, run:"
echo "  rm -rf lib/ptx supabase/migrations/01[0-7]_ptx_*.sql types/ptx.ts \\"
echo "         docs/superpowers/specs/2026-05-19-ptx-* docs/superpowers/decisions/PTX-* \\"
echo "         docs/superpowers/plans/2026-05-19-ptx-* \\"
echo "  && git checkout eslint.config.mjs .env.example"
```

No execution required — verify the command syntax is sound by reading it.

- [ ] **Step 8: Final summary commit (optional)**

If desired, write a `brain/NEXT-SESSION.md` entry documenting Phase 0 ship. Skip if the user prefers to do this manually.

---

## Post-implementation: Activation Roadmap (NOT part of this plan)

This plan delivers Phase 0 only — inert scaffolding. The 10-phase roadmap that follows (spec §25) requires separate plans, each with explicit operator approval:

| Next plan | Phase | What it does | User-visible result |
|-----------|------:|--------------|---------------------|
| `2026-XX-XX-ptx-phase-1-alpha-whitelist.md` | 1 | Apply migrations 010-016, build hidden `/ptx/me` page, set operator whitelist | First PTX balance visible to whitelisted users only (operator first) |
| `2026-XX-XX-ptx-phase-2-onboarding-progress.md` | 2 | Wire onboarding milestone detection → emitPtxEvent, build `<OnboardingProgress />` in /profile | All users see milestone progress in their profile |
| `2026-XX-XX-ptx-phase-3-balance-referrals-cosmetics.md` | 3 | PTX balance widget in profile header; 6 avatar frames available; referral codes in /settings/referrals; sponsor mechanic | **First PTX balance visible to all users.** Referrals and first cosmetics live. |
| `2026-XX-XX-ptx-phase-4-creator-economy.md` | 4 | New `/discover` page; creator publication detection; tipping; profile-pinned content | Creator economy + community gestures live |
| `2026-XX-XX-ptx-phase-5-learning-seasonal.md` | 5 | Academy lesson rewards; first seasonal event | Long-term retention drivers live |
| `2026-XX-XX-ptx-phase-6-og-window.md` | 6 | OG window opens, irreversible closure mechanism | Founder-cohort identity established |
| `…` | 7–10 | FAR FUTURE — anchoring, wallet binding, ERC-20 distribution, hybrid steady state | Separate business + legal decision per phase |

Each subsequent plan requires:
- Operator decision to advance (criteria in spec §25)
- Migration application authorization
- ESLint rule maintenance
- New `pnpm` deps (only at Phase 8+ for web3 libs)

The Phase 1 plan should be the next plan written after this Phase 0 plan is executed.

---

## Self-Review Checklist (executed before publishing this plan)

**1. Spec coverage:**

| Spec section | Plan task(s) |
|--------------|--------------|
| §1 Module Boundary | Task 1 (README), Task 15 (index.ts), Task 19 (ESLint) |
| §2 Identity Model | Task 7 (lib/ptx/identity), Task 17 (010_ptx_identities.sql) |
| §3 Feature Flags | Task 3 (flags.ts), Task 20 (.env.example) |
| §4 Event Model | Task 8 (lib/ptx/events) |
| §5 Ledger Schema + Merkle | Task 9 (lib/ptx/ledger), Task 17 (011, 012) |
| §7-§12 Reward Engine | Task 10 (engine, multipliers, caps), Task 11 (rules) |
| §13 Retention/Virality matrix | Implicit in rules; no separate task (it's analysis, not code) |
| §15 Sink Catalog | Task 12 (lib/ptx/sinks + v1-catalog) |
| §16 Quantum Table | Task 2 (constants.ts) |
| §17 Economy Metrics | Task 12 (jobs/economy-snapshot.ts), Task 18 (015) |
| §18 Circuit Breakers | Task 12 (inflation-control.ts) |
| §19 Anti-Fraud | Task 13 (lib/ptx/fraud), Task 18 (016) |
| §20 Visibility | Implicit in sinks catalog (creator_highlights + pinned); §20.1's `/discover` page is Phase 4 plan |
| §21 Creator Monetization | Task 11 (creator rules) + Task 12 (tipping sink) |
| §25 Phased Visibility Plan | Post-implementation: Activation Roadmap section |
| §26 Migration Strategy | Task 14 (migration module), Task 18 (017) |
| §27 Chain Selection | Task 6 (ADR-PTX-018) |
| §28 Wallet Strategy | Task 14 (chain-bindings.ts), Task 6 (ADR-PTX-019) |
| §29 Identity Portability | Task 7 (portability.ts) |
| §30 Implementation Skeleton | All scaffolding tasks (1-16) |
| §31 ADR list (21) | Tasks 4, 5, 6 |

All sections covered.

**2. Placeholder scan:** No "TBD", "TODO", "implement later", or vague directives remain. Every step embeds the exact code or exact command.

**3. Type consistency:** `PtxUserId`, `PtxSourceType`, `PtxEventType`, `PtxRewardContext`, `PtxRewardOutcome`, `PtxEarningRule`, `PtxSink`, `PtxFlagName`, etc. — all referenced consistently across tasks. The temporary `PtxSourceType` in Task 2 is explicitly replaced in Task 8 Step 5.

**4. Constants:** every numeric constant from spec §16 lands in Task 2's `constants.ts` and is imported by the corresponding rule/cap/multiplier/sink consumer.

**5. Build verification:** every task ends with `corepack pnpm build` clean. Task 10/11 has a documented expected mid-task build failure that resolves at Task 11 step 12.

Plan is internally consistent and complete for Phase 0 scaffolding.

---

> **End of plan.**

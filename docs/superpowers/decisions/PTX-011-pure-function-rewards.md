# ADR-PTX-011: Reward engine is a pure function

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

A reward engine that performs database I/O internally is hard to test, hard to dry-run, and hard to extract. Testability, dry-run capability, and a possible future library extraction (ADR-PTX-008) all demand a side-effect-free computation core.

## Decision

`computePtxReward(ctx: PtxRewardContext): PtxRewardOutcome` performs zero database I/O and has no side effects. The caller assembles the `PtxRewardContext` (aggregates needed for cap enforcement, flag state, multipliers from `constants.ts`) and passes it in. The engine returns a `PtxRewardOutcome` containing the amount, the rule applied, and any cap-clamp metadata. The caller then invokes `emitPtxEvent` with the outcome's deterministic `idempotency_key` (ADR-PTX-002).

The engine is deterministic by construction: given the same context, it returns the same outcome.

## Consequences

**Positive:**
- Trivially testable: the entire engine is exercised by passing context objects and asserting outcomes.
- Dry-run is a normal call path; an admin tool can preview rewards without writing to the ledger.
- A future extraction of the engine to a standalone package is mechanical.

**Negative / accepted tradeoffs:**
- The caller is responsible for assembling the context, which means each call site must know which aggregates and flags the engine will read.
- Stale context (e.g., aggregates read seconds before the engine runs) can yield outdated outcomes. The idempotency key absorbs the safety risk; ordering is the caller's concern.

## Alternatives considered

- **Engine fetches its own data.** Rejected: hides dependencies, complicates dry-run, blocks library extraction.
- **Engine writes the event itself.** Rejected: collapses compute and emit, defeats the point of separating reward semantics from ledger semantics.

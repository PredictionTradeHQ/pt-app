# ADR-PTX-008: Trigger criteria for splitting pt-app → ptx-economy

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

The PTX module is delivered v1 inside `pt-app` as a strictly-bounded subdirectory (ADR-PTX-001). The locked strategy memory anticipates a future repo separation (`ptx-economy`) once complexity justifies the operational cost. Committing to the split prematurely drains velocity; deferring it indefinitely undermines the contract that makes the split easy.

## Decision

The split is triggered when any of the following becomes true:

- `lib/ptx/` exceeds ~5,000 lines of code.
- Solidity (or other smart-contract) development begins.
- The number of standalone cron workers serving PTX exceeds 3.
- The operator review surface (UI for OG window control, fraud appeals, etc.) becomes substantial enough to warrant its own deployment.

Until one of these triggers fires, the single-repo arrangement plus the module boundary contract (ADR-PTX-001) suffices.

## Consequences

**Positive:**
- Development velocity is preserved while PTX is still small and tightly coupled with PT product changes.
- The future split is a mechanical operation: move `lib/ptx/`, move the eight PTX migrations, and copy the ESLint boundary rule.
- The split decision is no longer a "when do we feel ready" judgment call — it is criterion-driven.

**Negative / accepted tradeoffs:**
- Some early cross-cutting changes that would have been cleaner across two repos must absorb a small amount of single-repo coupling cost.

## Alternatives considered

- **Dual repo from day 1.** Rejected: at v1 scope, PTX changes ride alongside PT product changes; coordinating across repos for tiny changes is friction without benefit.
- **Never split.** Rejected: the operational reality of contracts, cron workers, and operator tooling will eventually make a single-repo arrangement untenable. Deferring the decision indefinitely guarantees a painful split when it is finally forced.

/**
 * Reward engine — pure function, no I/O.
 * Spec §7, §12. ADR-PTX-011.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "../events/source-types";
import type { PtxEventType, PtxRejectionReason } from "../events/types";
import { applyMultiplier, type PtxMultiplierBundle } from "./multipliers";
import { applyCaps, type PtxCapKind, type CapContext } from "./caps";
import { PTX_RULES, type PtxEarningRule } from "./rules";

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
  // Multiple rules can share a source_type; they are discriminated by
  // eligibility (spec §12: "find rules matching ctx.source_type; for each
  // rule: eligibility check..."). Select the first eligible rule. A rule that
  // returns "rule_not_matched" is signalling "not my case" — skip it and try
  // the next matching rule.
  const matching = PTX_RULES.filter((r) => r.source_types.includes(ctx.source_type));

  if (matching.length === 0) {
    return rejected("rule_not_matched", ctx);
  }

  let rule: PtxEarningRule | null = null;
  let fallback: { reason: PtxRejectionReason; ruleId: string } | null = null;

  for (const candidate of matching) {
    const elig = candidate.eligibility(ctx);
    if (elig.eligible) {
      rule = candidate;
      break;
    }
    // Prefer the reason from a rule that recognized the event (any reason other
    // than "rule_not_matched") over a sibling rule's "not my case" signal.
    const reason = elig.reason ?? "user_ineligible";
    if (fallback === null || (fallback.reason === "rule_not_matched" && reason !== "rule_not_matched")) {
      fallback = { reason, ruleId: candidate.id };
    }
  }

  if (!rule) {
    return rejected(fallback!.reason, ctx, fallback!.ruleId);
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

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

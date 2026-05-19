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

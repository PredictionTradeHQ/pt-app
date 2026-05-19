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
    const p = ctx.payload as unknown as ReferralCascadePayload;
    return `ref-cas:${p.ancestor_id}:${p.descendant_event_id}:v1`;
  },
};

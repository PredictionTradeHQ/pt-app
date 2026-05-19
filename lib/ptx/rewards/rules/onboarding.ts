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
    const p = ctx.payload as unknown as OnboardingPayload;
    return ONBOARDING_REWARDS[p.milestone_id] ?? 0n;
  },
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as OnboardingPayload;
    return `onboarding:${p.milestone_id}:${ctx.ptx_user_id}`;
  },
};

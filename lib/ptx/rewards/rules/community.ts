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
    const p = ctx.payload as unknown as CommunityQualityPayload;
    return BigInt(p.approved_amount);
  },
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as CommunityQualityPayload;
    return `community:${p.approval_id}`;
  },
};

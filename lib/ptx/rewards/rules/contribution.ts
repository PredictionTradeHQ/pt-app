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
    const p = ctx.payload as unknown as ContributionPayload;
    return BigInt(p.approved_amount);
  },
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as ContributionPayload;
    return `contrib:${p.approval_id}`;
  },
};

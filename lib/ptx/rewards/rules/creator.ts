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
    const p = ctx.payload as unknown as AudienceMilestonePayload;
    return CREATOR_AUDIENCE_MILESTONES[p.threshold] ?? 0n;
  },
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as AudienceMilestonePayload;
    return `creator-aud:${p.author_ptx_user_id}:${p.threshold}:v1`;
  },
};

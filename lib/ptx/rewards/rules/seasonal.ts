/**
 * Seasonal participation + completion. Spec §9.7.
 */

import type { PtxEarningRule } from "./types";
import {
  SEASONAL_PARTICIPATION_PTX,
  SEASONAL_COMPLETION_PTX,
} from "../../constants";

interface SeasonalPayload {
  season_id: string;
  phase: "participation" | "completion";
  user_eligible: boolean;
  user_completed: boolean;
}

export const seasonalParticipationV1: PtxEarningRule = {
  id: "seasonal.participation.v1",
  source_types: ["season_event"],
  flag_required: "PTX_SEASONAL_ENABLED",
  emits: "earn.seasonal.participation",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<SeasonalPayload>;
    if (!p.season_id) return { eligible: false, reason: "user_ineligible" };
    if (p.phase !== "participation") return { eligible: false, reason: "rule_not_matched" };
    if (!p.user_eligible) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => SEASONAL_PARTICIPATION_PTX,
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as SeasonalPayload;
    return `season:${p.season_id}:participation:${ctx.ptx_user_id}`;
  },
};

export const seasonalCompletionV1: PtxEarningRule = {
  id: "seasonal.completion.v1",
  source_types: ["season_event"],
  flag_required: "PTX_SEASONAL_ENABLED",
  emits: "earn.seasonal.completion",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<SeasonalPayload>;
    if (!p.season_id) return { eligible: false, reason: "user_ineligible" };
    if (p.phase !== "completion") return { eligible: false, reason: "rule_not_matched" };
    if (!p.user_completed) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => SEASONAL_COMPLETION_PTX,
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as SeasonalPayload;
    return `season:${p.season_id}:completion:${ctx.ptx_user_id}`;
  },
};

import type { PtxSourceType } from "../../events/source-types";
import type { PtxEventType, PtxRejectionReason } from "../../events/types";
import type { PtxRewardContext } from "../engine";
import type { PtxFlagName } from "../../flags";

export interface EligibilityResult {
  eligible: boolean;
  reason?: PtxRejectionReason;
}

export interface PtxEarningRule {
  id: string;
  source_types: PtxSourceType[];
  flag_required: PtxFlagName;
  emits: PtxEventType;
  eligibility(ctx: PtxRewardContext): EligibilityResult;
  compute(ctx: PtxRewardContext): bigint;
  idempotency(ctx: PtxRewardContext): string;
}

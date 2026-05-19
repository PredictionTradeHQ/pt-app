import type { PtxEarningRule } from "./types";
import { referralActivatedV1, referralCascadeV1 } from "./referral";
import { creatorPublicationV1, creatorAudienceMilestoneV1 } from "./creator";
import { onboardingMilestoneV1 } from "./onboarding";
import { learningCompletionV1 } from "./learning";
import { seasonalParticipationV1, seasonalCompletionV1 } from "./seasonal";
import { contributionManualV1 } from "./contribution";
import { communityQualityV1 } from "./community";
import { ogEarlyAdopterV1 } from "./og";

/**
 * Closed registry. Order is significant for matching when multiple rules share a source_type.
 * The first match wins.
 */
export const PTX_RULES: readonly PtxEarningRule[] = [
  referralActivatedV1,
  referralCascadeV1,
  creatorPublicationV1,
  creatorAudienceMilestoneV1,
  onboardingMilestoneV1,
  learningCompletionV1,
  seasonalParticipationV1,
  seasonalCompletionV1,
  contributionManualV1,
  communityQualityV1,
  ogEarlyAdopterV1,
] as const;

export type { PtxEarningRule, EligibilityResult } from "./types";

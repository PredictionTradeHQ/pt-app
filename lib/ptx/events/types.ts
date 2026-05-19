/**
 * Closed enum of PtxEventType + payload contract.
 * Spec §4, ADR-PTX-010.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "./source-types";

export type PtxEventType =
  // EARN
  | "earn.referral.activated"
  | "earn.referral.cascade"
  | "earn.creator.publication"
  | "earn.creator.audience_milestone"
  | "earn.onboarding.milestone"
  | "earn.learning.completion"
  | "earn.seasonal.participation"
  | "earn.seasonal.completion"
  | "earn.contribution.help"
  | "earn.community.quality_engagement"
  | "earn.og.early_adopter"
  | "earn.tipping.received"
  // SPEND
  | "spend.cosmetic.unlock"
  | "spend.tipping.peer"
  | "spend.visibility.feed_boost"
  | "spend.premium.access"
  | "spend.sponsor.referred"
  // SYSTEM
  | "system.fraud.flagged"
  | "system.fraud.cleared"
  | "system.fraud.frozen"
  | "system.fraud.burned"
  | "system.reconcile.checkpoint"
  | "system.migration.snapshot"
  | "system.migration.anchor";

export const PTX_EVENT_TYPES: readonly PtxEventType[] = [
  "earn.referral.activated", "earn.referral.cascade",
  "earn.creator.publication", "earn.creator.audience_milestone",
  "earn.onboarding.milestone", "earn.learning.completion",
  "earn.seasonal.participation", "earn.seasonal.completion",
  "earn.contribution.help", "earn.community.quality_engagement",
  "earn.og.early_adopter", "earn.tipping.received",
  "spend.cosmetic.unlock", "spend.tipping.peer",
  "spend.visibility.feed_boost", "spend.premium.access",
  "spend.sponsor.referred",
  "system.fraud.flagged", "system.fraud.cleared",
  "system.fraud.frozen", "system.fraud.burned",
  "system.reconcile.checkpoint",
  "system.migration.snapshot", "system.migration.anchor",
] as const;

export interface PtxEventInput {
  ptx_user_id: PtxUserId;
  event_type: PtxEventType;
  source_type: PtxSourceType;
  source_id: string;
  amount: bigint;
  multiplier_applied: number;
  context: Record<string, unknown>;
  occurred_at: string;
  idempotency_key: string;
}

export interface PtxEventResult {
  event_id: string;
  accepted: boolean;
  reason?: PtxRejectionReason;
  new_balance: bigint | null;
}

export type PtxRejectionReason =
  | "flag_disabled"
  | "rule_not_matched"
  | "cap_exhausted"
  | "fraud_blocked"
  | "duplicate_attempt"
  | "user_ineligible";

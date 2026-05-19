/**
 * Closed enum of PtxSourceType — what kind of action produced an event.
 * Spec §4, ADR-PTX-010.
 */

export type PtxSourceType =
  | "referral_activation"
  | "publication"
  | "milestone"
  | "lesson_complete"
  | "season_event"
  | "moderation_action"
  | "engagement_quality"
  | "og_window"
  | "sink_consumption"
  | "tip_received"
  | "sponsor_action"
  | "fraud_audit"
  | "reconcile_job"
  | "migration_op";

export const PTX_SOURCE_TYPES: readonly PtxSourceType[] = [
  "referral_activation", "publication", "milestone", "lesson_complete",
  "season_event", "moderation_action", "engagement_quality", "og_window",
  "sink_consumption", "tip_received", "sponsor_action",
  "fraud_audit", "reconcile_job", "migration_op",
] as const;

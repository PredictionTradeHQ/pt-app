/**
 * PTX — Constants & Quantum Table v1 (single source of truth)
 *
 * Every PTX number lives in this file. Rules, engines, and tests reference
 * these constants; no PTX number is hardcoded elsewhere in the module.
 *
 * Spec: docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md §16
 * ADR-PTX-004: constants registry.
 *
 * Phase 0 — inert scaffolding. Treat each numeric value as a load-bearing
 * decision; do not modify without an ADR.
 */

import type { PtxSourceType } from "./events/source-types";

export const PTX_VERSION = 1;
export const PTX_DECIMALS = 18;
export const PTX_MAX_COMBINED_MULTIPLIER = 2.5;

// EARNING QUANTUM
export const REFERRAL_ACTIVATION_PTX = 250n;
export const REFERRAL_CASCADE_L2_FACTOR = 0.10;
export const REFERRAL_MAX_ACTIVATIONS_PER_30D_PER_USER = 20;

export const CREATOR_PUBLICATION_BASE_PTX = 50n;
export const CREATOR_PUBLICATION_MAX_PTX = 200n;
export const CREATOR_PUBLICATION_WAIT_MS = 72 * 60 * 60 * 1000;
export const CREATOR_PUBLICATION_MIN_VIEWERS = 25;
export const CREATOR_PUBLICATION_MIN_ENGAGEMENT = 5;
export const CREATOR_AUDIENCE_MILESTONES: Record<number, bigint> = {
  10: 100n, 50: 200n, 100: 400n, 500: 1000n, 1000: 2500n, 5000: 7500n,
};
export const CREATOR_MILESTONE_STABILITY_DAYS = 7;

export const ONBOARDING_REWARDS: Record<string, bigint> = {
  first_prediction:        50n,
  first_resolution_seen:   25n,
  first_correct_call:      100n,
  first_streak_3:          75n,
  first_follow_received:   50n,
  first_share_action:      50n,
};

export const LEARNING_PER_LESSON_PTX = 25n;
export const LEARNING_MAX_LESSONS_PER_DAY_REWARDED = 4;
export const LEARNING_SERIES_BONUS_PTX = 100n;

export const SEASONAL_PARTICIPATION_PTX = 100n;
export const SEASONAL_COMPLETION_PTX = 500n;

export const CONTRIBUTION_MIN_PTX = 50n;
export const CONTRIBUTION_MAX_PTX_PER_APPROVAL = 200n;

export const OG_MULTIPLIER = 1.5;

// CAPS
export const CAP_L1_PER_USER_PER_DAY = 1500n;
export const CAP_L2_PER_USER_PER_SOURCE_PER_DAY: Partial<Record<PtxSourceType, bigint>> = {
  referral_activation: 1000n,
  publication: 500n,
  lesson_complete: 100n,
  season_event: 1000n,
  moderation_action: 500n,
  engagement_quality: 200n,
};
export const CAP_L3_GLOBAL_PER_SOURCE_PER_DAY: Partial<Record<PtxSourceType, bigint>> = {
  referral_activation: 50000n,
  publication: 20000n,
  lesson_complete: 10000n,
  moderation_action: 5000n,
};
export const CAP_L4_USER_LIFETIME_SOFT_THRESHOLD = 100000n;

// SINK PRICING
export const SINK_PRICING: Record<string, bigint> = {
  "cosmetic.avatar_frame.basic": 200n,
  "cosmetic.avatar_frame.seasonal": 1500n,
  "cosmetic.profile_theme": 500n,
  "cosmetic.username_color": 300n,
  "status.custom_title": 750n,
  "visibility.creator_highlights_feature.1d": 2000n,
  "visibility.profile_pinned_explanation.7d": 100n,
  "community.tip_peer.min": 50n,
  "community.sponsor_referred_milestone": 200n,
  "accessory.export_premium.30d": 500n,
  "accessory.advanced_filtering.30d": 750n,
  "accessory.early_access_pass.90d": 1500n,
};

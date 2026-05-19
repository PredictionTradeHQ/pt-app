/**
 * Time-windowed aggregates per user / per source.
 * Used by reward engine context (caps L1-L4).
 * Phase 0: stubs. Spec §11.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "../events/source-types";

export interface UserDailyAggregate {
  ptx_user_id: PtxUserId;
  date_utc: string;
  total_earned: bigint;
  by_source: Partial<Record<PtxSourceType, bigint>>;
}

export async function getUserTodayEarned(ptxUserId: PtxUserId): Promise<bigint> {
  void ptxUserId;
  throw new Error("PTX Phase 0: getUserTodayEarned not wired.");
}

export async function getUserTodayEarnedBySource(
  ptxUserId: PtxUserId,
  sourceType: PtxSourceType,
): Promise<bigint> {
  void ptxUserId; void sourceType;
  throw new Error("PTX Phase 0: getUserTodayEarnedBySource not wired.");
}

export async function getGlobalTodayEarnedBySource(sourceType: PtxSourceType): Promise<bigint> {
  void sourceType;
  throw new Error("PTX Phase 0: getGlobalTodayEarnedBySource not wired.");
}

export async function getUserLifetimeEarned(ptxUserId: PtxUserId): Promise<bigint> {
  void ptxUserId;
  throw new Error("PTX Phase 0: getUserLifetimeEarned not wired.");
}

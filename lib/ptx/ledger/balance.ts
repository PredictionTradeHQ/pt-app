/**
 * Balance read path. Reads from ptx_balances view.
 * Phase 0: stubs. Spec §6.
 */

import type { PtxUserId } from "../identity/types";
import type { PtxSourceType } from "../events/source-types";

export type PtxAmount = bigint;

export interface PtxBalance {
  ptx_user_id: PtxUserId;
  balance: PtxAmount;
  earn_events: number;
  spend_events: number;
  last_event_at: string | null;
}

export interface PtxHistoryEntry {
  event_id: string;
  event_type: string;
  source_type: PtxSourceType;
  source_id: string;
  amount: PtxAmount;
  occurred_at: string;
  context: Record<string, unknown>;
}

export interface PtxHistoryOptions {
  limit?: number;
  before?: string;
  sourceTypes?: PtxSourceType[];
}

export async function getPtxBalance(ptxUserId: PtxUserId): Promise<PtxBalance> {
  void ptxUserId;
  throw new Error("PTX Phase 0: getPtxBalance not wired. See spec §6.");
}

export async function getPtxHistory(
  ptxUserId: PtxUserId,
  opts?: PtxHistoryOptions,
): Promise<PtxHistoryEntry[]> {
  void ptxUserId; void opts;
  throw new Error("PTX Phase 0: getPtxHistory not wired. See spec §6.");
}

/**
 * Identity export for GDPR portability and future onchain claim.
 * Spec §29.
 */

import type { PtxUserId, PtxIdentityExport } from "./types";

/**
 * Export a user's full PTX identity: events chain + balance snapshot + multiplier history.
 *
 * Phase 0: throws — function exists for typing and future wire-up.
 */
export async function exportIdentity(ptxUserId: PtxUserId): Promise<PtxIdentityExport> {
  void ptxUserId;
  throw new Error("PTX Phase 0: exportIdentity not wired. See spec §29.");
}

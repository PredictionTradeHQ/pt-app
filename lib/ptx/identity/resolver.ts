/**
 * Lazy resolver: auth.user_id → ptx_user_id.
 * Stub for Phase 0. Real implementation in Phase 1 (writes to ptx_identities).
 * Spec §2, ADR-PTX-005.
 */

import type { PtxUserId } from "./types";

/**
 * Get or lazily create the ptx_user_id for an auth user.
 *
 * Phase 0: throws — function exists for typing only.
 */
export async function getPtxUserId(authUserId: string): Promise<PtxUserId> {
  void authUserId;
  throw new Error("PTX Phase 0: resolver not wired. See spec §2.");
}

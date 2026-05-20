/**
 * Merkle chain verifier per user. ADR-PTX-009.
 * Phase 0: stub.
 */

import { createHash } from "node:crypto";
import type { PtxUserId } from "../identity/types";

export interface ReconcileResult {
  ok: boolean;
  expected_chain_root: string;
  observed_chain_root: string;
  diverged_at_seq?: number;
}

export async function verifyChainForUser(ptxUserId: PtxUserId): Promise<ReconcileResult> {
  void ptxUserId;
  throw new Error("PTX Phase 0: verifyChainForUser not wired. See spec §5.1.");
}

/**
 * Canonical hash computation for an event (deterministic, ADR-PTX-009).
 * Pure function — safe to call without DB. Implemented eagerly because Tasks 14+
 * unit-verify the format via direct invocation later.
 */
export function computeEventHash(input: {
  prev_event_hash: string | null;
  event_type: string;
  source_type: string;
  source_id: string;
  amount: bigint;
  occurred_at: string;
  context_canonical_json: string;
  schema_version: number;
}): string {
  const parts = [
    input.prev_event_hash ?? "0".repeat(64),
    input.event_type,
    `${input.source_type}:${input.source_id}`,
    input.amount.toString(),
    input.occurred_at,
    sha256Hex(input.context_canonical_json),
    String(input.schema_version),
  ];
  return sha256Hex(parts.join("|"));
}

// Real SHA-256. Server-runtime only (node:crypto). computeEventHash is pure and
// deterministic, so the chain root it produces is meaningful and stable from
// day one — it will match the same SHA-256 chain recomputed at verification or
// anchored on-chain later (ADR-PTX-009).
function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

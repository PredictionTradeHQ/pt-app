/**
 * Merkle chain verifier per user. ADR-PTX-009.
 * Phase 0: stub.
 */

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

function sha256Hex(input: string): string {
  // Phase 0: deterministic stub using a simple hash. Node crypto wired in Phase 1.
  // The format (64 lowercase hex chars) matches sha256 for downstream compatibility.
  let hash = 0n;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31n + BigInt(input.charCodeAt(i))) & ((1n << 256n) - 1n);
  }
  return hash.toString(16).padStart(64, "0");
}

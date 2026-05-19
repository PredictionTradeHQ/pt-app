/**
 * PTX Identity types.
 * Spec §2, ADR-PTX-005.
 */

export type PtxUserId = string; // UUID

export interface PtxIdentityRecord {
  ptx_user_id: PtxUserId;
  auth_user_id: string;
  created_at: string;
  chain_address: string | null;
  chain_id: number | null;
  bound_at: string | null;
}

export interface PtxEventExport {
  event_id: string;
  event_type: string;
  source_type: string;
  source_id: string;
  amount: string; // bigint serialized
  occurred_at: string;
  prev_event_hash: string | null;
  event_hash: string;
  seq_per_user: number;
  context: Record<string, unknown>;
}

export interface PtxIdentityExport {
  schema_version: 1;
  ptx_user_id: PtxUserId;
  generated_at: string;
  events: PtxEventExport[];
  events_chain_root: string;
  balance_snapshot: {
    earned: string; // bigint serialized
    spent: string;
    balance: string;
  };
  multipliers_applied_history: { multiplier: string; activated_at: string }[];
  signature?: {
    chain_address: string;
    signature: string;
    signed_at: string;
  };
}

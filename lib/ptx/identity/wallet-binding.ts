/**
 * Phase 8 (FAR FUTURE) wallet binding interface.
 * Spec §28, ADR-PTX-019. v1 has zero web3 deps.
 */

import type { PtxUserId } from "./types";

export interface WalletBindingInput {
  ptx_user_id: PtxUserId;
  chain_id: number;       // 8453 = Base mainnet
  chain_address: string;
  signature: string;      // EIP-712 signature proving wallet ownership
  signed_at: string;
}

export interface WalletBindingResult {
  bound: boolean;
  reason?: string;
}

/**
 * Bind a wallet address to a ptx_user_id.
 *
 * Phase 0/1: throws — function exists for typing and Phase 8 wire-up only.
 */
export async function bindWallet(input: WalletBindingInput): Promise<WalletBindingResult> {
  void input;
  throw new Error("PTX Phase 0: bindWallet not wired (Phase 8 only). See spec §28.");
}

/**
 * Multiplier bundle + combiner. Pure functions, no I/O.
 * Spec §10, ADR-PTX-011.
 */

import { PTX_MAX_COMBINED_MULTIPLIER } from "../constants";

export interface PtxMultiplierBundle {
  base: number;       // 1.0 default
  og: number;         // 1.5 if OG, 1.0 otherwise
  cascade: number;    // 1.0 / 0.3 / 0.1 by referral chain depth
  seasonal: number;   // 1.0 default; > 1.0 during active seasons
}

export const DEFAULT_MULTIPLIERS: PtxMultiplierBundle = {
  base: 1.0,
  og: 1.0,
  cascade: 1.0,
  seasonal: 1.0,
};

export function combineMultipliers(bundle: PtxMultiplierBundle): number {
  const raw = bundle.base * bundle.og * bundle.cascade * bundle.seasonal;
  return Math.min(raw, PTX_MAX_COMBINED_MULTIPLIER);
}

export function applyMultiplier(baseAmount: bigint, bundle: PtxMultiplierBundle): bigint {
  const factor = combineMultipliers(bundle);
  // bigint × float: round to nearest integer
  return BigInt(Math.round(Number(baseAmount) * factor));
}

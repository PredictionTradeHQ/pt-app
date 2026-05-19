/**
 * OG early adopter grant rule. Spec §9.9.
 * NOTE: OG rule grants STATUS (and a permanent multiplier elsewhere applied),
 * not a PTX one-shot. compute() returns 0 — the side effect is recording the OG grant
 * in ptx_og_grants (handled by caller).
 */

import type { PtxEarningRule } from "./types";

interface OgEligibilityPayload {
  criteria_met: Record<string, boolean | number>;
  window_still_open: boolean;
}

export const ogEarlyAdopterV1: PtxEarningRule = {
  id: "og.early_adopter.v1",
  source_types: ["og_window"],
  flag_required: "PTX_OG_WINDOW_OPEN",
  emits: "earn.og.early_adopter",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<OgEligibilityPayload>;
    if (!p.window_still_open) return { eligible: false, reason: "flag_disabled" };
    if (!p.criteria_met) return { eligible: false, reason: "user_ineligible" };
    return { eligible: true };
  },
  compute: () => 0n,                          // Status grant, not PTX amount
  idempotency: (ctx) => `og-grant:${ctx.ptx_user_id}`,
};

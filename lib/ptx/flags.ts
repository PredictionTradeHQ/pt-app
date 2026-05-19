/**
 * Feature flag reader for PTX.
 *
 * Phase 0: all flags default to false. Production reads from process.env.
 *
 * Master flag PTX_ENABLED supports:
 *   - "false" (default) — entire module inert
 *   - "true" — all users
 *   - "allowlist:user_id_a,user_id_b,..." — only listed auth user_ids
 *
 * Sub-flags inherit gating from master. If master is OFF for a given user,
 * all sub-flags return false for that user.
 *
 * Spec: §3, ADR-PTX-006.
 */

export const FLAG_DEFAULTS = {
  PTX_ENABLED: false,
  PTX_EVENTS_WRITE_ENABLED: false,
  PTX_REWARDS_ENABLED: false,
  PTX_SINKS_ENABLED: false,
  PTX_REFERRALS_ENABLED: false,
  PTX_SPONSOR_ENABLED: false,
  PTX_CREATOR_ENABLED: false,
  PTX_ONBOARDING_ENABLED: false,
  PTX_LEARNING_ENABLED: false,
  PTX_SEASONAL_ENABLED: false,
  PTX_OG_WINDOW_OPEN: false,
  PTX_ANTI_FRAUD_ENABLED: false,
} as const;

export type PtxFlagSet = typeof FLAG_DEFAULTS;
export type PtxFlagName = keyof PtxFlagSet;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

/**
 * Returns true if PTX_ENABLED master is on for the given user (or all users).
 * Phase 0: always returns false in prod because PTX_ENABLED unset → defaults to false.
 */
export function isPtxEnabled(authUserId?: string): boolean {
  const raw = readEnv("PTX_ENABLED");
  if (!raw || raw === "false") return false;
  if (raw === "true") return true;
  if (raw.startsWith("allowlist:")) {
    if (!authUserId) return false;
    const list = raw.slice("allowlist:".length).split(",").map((s) => s.trim());
    return list.includes(authUserId);
  }
  return false;
}

/**
 * Returns true if the given sub-flag is on AND master is on for this user.
 */
export function isPtxSubFlagEnabled(flag: PtxFlagName, authUserId?: string): boolean {
  if (flag === "PTX_ENABLED") return isPtxEnabled(authUserId);
  if (!isPtxEnabled(authUserId)) return false;
  const raw = readEnv(flag);
  return raw === "true";
}

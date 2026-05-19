/**
 * Lightweight TS guards for event payloads. Replaces a zod dependency in v1.
 * Spec §4.
 */

import type { PtxEventInput, PtxEventType } from "./types";
import { PTX_EVENT_TYPES } from "./types";
import { PTX_SOURCE_TYPES, type PtxSourceType } from "./source-types";

export function isPtxEventType(value: unknown): value is PtxEventType {
  return typeof value === "string" && (PTX_EVENT_TYPES as readonly string[]).includes(value);
}

export function isPtxSourceType(value: unknown): value is PtxSourceType {
  return typeof value === "string" && (PTX_SOURCE_TYPES as readonly string[]).includes(value);
}

/**
 * Validates event shape and amount-sign convention (earn > 0, spend < 0, system = 0).
 * Throws on invalid input.
 */
export function validatePtxEventInput(input: PtxEventInput): void {
  if (!isPtxEventType(input.event_type)) {
    throw new Error(`Invalid PtxEventType: ${input.event_type}`);
  }
  if (!isPtxSourceType(input.source_type)) {
    throw new Error(`Invalid PtxSourceType: ${input.source_type}`);
  }
  if (!input.idempotency_key || input.idempotency_key.length < 4) {
    throw new Error("idempotency_key is required and must be non-trivial");
  }
  if (input.event_type.startsWith("earn.") && input.amount <= 0n) {
    throw new Error(`earn events require amount > 0; got ${input.amount.toString()}`);
  }
  if (input.event_type.startsWith("spend.") && input.amount >= 0n) {
    throw new Error(`spend events require amount < 0; got ${input.amount.toString()}`);
  }
  if (input.event_type.startsWith("system.") && input.amount !== 0n) {
    throw new Error(`system events require amount === 0; got ${input.amount.toString()}`);
  }
}

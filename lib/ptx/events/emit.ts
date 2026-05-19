/**
 * Event emission (write path).
 *
 * Phase 0: throws — function exists for typing.
 * Phase 1+: writes to ptx_events table with Merkle chain + idempotency.
 *
 * Spec §5, §12.
 */

import type { PtxEventInput, PtxEventResult } from "./types";
import { validatePtxEventInput } from "./validators";

export async function emitPtxEvent(input: PtxEventInput): Promise<PtxEventResult> {
  validatePtxEventInput(input);
  // Phase 0: no DB write. Real implementation lands when migrations 010-011 are applied.
  throw new Error("PTX Phase 0: emitPtxEvent not wired. See spec §5, §12.");
}

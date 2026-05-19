/**
 * Learning completion + series bonus. Spec §9.4.
 */

import type { PtxEarningRule } from "./types";
import {
  LEARNING_PER_LESSON_PTX,
  LEARNING_SERIES_BONUS_PTX,
} from "../../constants";

interface LearningPayload {
  lesson_id: string;
  series_id?: string;
  series_completed_with_this_lesson?: boolean;
  attention_signals_passed: boolean;
}

export const learningCompletionV1: PtxEarningRule = {
  id: "learning.completion.v1",
  source_types: ["lesson_complete"],
  flag_required: "PTX_LEARNING_ENABLED",
  emits: "earn.learning.completion",
  eligibility: (ctx) => {
    const p = ctx.payload as Partial<LearningPayload>;
    if (!p.lesson_id) return { eligible: false, reason: "user_ineligible" };
    if (!p.attention_signals_passed) return { eligible: false, reason: "fraud_blocked" };
    return { eligible: true };
  },
  compute: (ctx) => {
    const p = ctx.payload as unknown as LearningPayload;
    const base = LEARNING_PER_LESSON_PTX;
    if (p.series_completed_with_this_lesson && p.series_id) {
      return base + LEARNING_SERIES_BONUS_PTX;
    }
    return base;
  },
  idempotency: (ctx) => {
    const p = ctx.payload as unknown as LearningPayload;
    return `learning:${p.lesson_id}:${ctx.ptx_user_id}`;
  },
};

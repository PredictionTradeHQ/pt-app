import { describe, it, expect } from "vitest";
import { computePtxReward, type PtxRewardContext } from "../rewards/engine";
import { DEFAULT_MULTIPLIERS } from "../rewards/multipliers";
import type { PtxSourceType } from "../events/source-types";

function makeCtx(
  source_type: PtxSourceType,
  payload: Record<string, unknown>,
  overrides: Partial<PtxRewardContext> = {},
): PtxRewardContext {
  return {
    ptx_user_id: "ptx-user-1",
    source_type,
    source_id: "src-1",
    payload,
    occurred_at: "2026-05-20T00:00:00.000Z",
    user_age_days: 30,
    user_lifetime_earned: 0n,
    user_today_earned: 0n,
    user_today_earned_by_source: 0n,
    global_today_earned_by_source: 0n,
    active_multipliers: DEFAULT_MULTIPLIERS,
    ...overrides,
  };
}

// These two source_types each have TWO rules in the registry that share the
// source_type and are discriminated only by payload/eligibility. The engine
// must reach the correct rule (spec §12: "for each matching rule: eligibility").
describe("reward engine dispatch — rules sharing a source_type", () => {
  it("dispatches a season_event completion to seasonal.completion.v1", () => {
    const ctx = makeCtx("season_event", {
      season_id: "s1",
      phase: "completion",
      user_completed: true,
    });
    const outcome = computePtxReward(ctx);
    expect(outcome.rule_matched).toBe("seasonal.completion.v1");
    expect(outcome.rejected).toBe(false);
    expect(outcome.granted_amount).toBeGreaterThan(0n);
  });

  it("dispatches a season_event participation to seasonal.participation.v1", () => {
    const ctx = makeCtx("season_event", {
      season_id: "s1",
      phase: "participation",
      user_eligible: true,
    });
    const outcome = computePtxReward(ctx);
    expect(outcome.rule_matched).toBe("seasonal.participation.v1");
    expect(outcome.rejected).toBe(false);
    expect(outcome.granted_amount).toBeGreaterThan(0n);
  });

  it("dispatches a publication audience-milestone to creator.audience_milestone.v1", () => {
    const ctx = makeCtx("publication", {
      author_ptx_user_id: "u1",
      threshold: 10,
      current_followers: 100,
      stable_since: "2020-01-01T00:00:00.000Z",
    });
    const outcome = computePtxReward(ctx);
    expect(outcome.rule_matched).toBe("creator.audience_milestone.v1");
    expect(outcome.rejected).toBe(false);
    expect(outcome.granted_amount).toBeGreaterThan(0n);
  });

  it("dispatches a standard publication to creator.publication.v1", () => {
    const ctx = makeCtx("publication", {
      publication_id: "p1",
      author_ptx_user_id: "u1",
      published_at: "2020-01-01T00:00:00.000Z",
      unique_viewers: 100,
      meaningful_engagement: 50,
      author_recent_flagged_count: 0,
    });
    const outcome = computePtxReward(ctx);
    expect(outcome.rule_matched).toBe("creator.publication.v1");
    expect(outcome.rejected).toBe(false);
    expect(outcome.granted_amount).toBeGreaterThan(0n);
  });

  it("rejects when no rule matching the source_type is eligible", () => {
    // Both season rules require a season_id; an empty one is ineligible for both.
    const outcome = computePtxReward(makeCtx("season_event", { season_id: "" }));
    expect(outcome.rejected).toBe(true);
    expect(outcome.granted_amount).toBe(0n);
  });

  it("reports the recognizing rule's reason, not another rule's rule_not_matched", () => {
    // phase=completion routes past the participation rule (which says "not my
    // case") to the completion rule, which recognizes the event but rejects
    // because the user has not completed. The reason must reflect that.
    const outcome = computePtxReward(
      makeCtx("season_event", { season_id: "s1", phase: "completion", user_completed: false }),
    );
    expect(outcome.rejected).toBe(true);
    expect(outcome.rejection_reason).toBe("user_ineligible");
  });
});

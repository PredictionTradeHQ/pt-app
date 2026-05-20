import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { computeEventHash } from "../ledger/reconcile";

function realSha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

describe("ledger event hash (ADR-PTX-009 Merkle chain)", () => {
  it("computeEventHash is real SHA-256 over the canonical string", () => {
    const input = {
      prev_event_hash: null,
      event_type: "earn.creator.publication",
      source_type: "publication",
      source_id: "p1",
      amount: 50n,
      occurred_at: "2026-01-01T00:00:00.000Z",
      context_canonical_json: '{"k":"v"}',
      schema_version: 1,
    };

    const innerContextHash = realSha256(input.context_canonical_json);
    const canonical = [
      "0".repeat(64),
      input.event_type,
      `${input.source_type}:${input.source_id}`,
      input.amount.toString(),
      input.occurred_at,
      innerContextHash,
      String(input.schema_version),
    ].join("|");

    expect(computeEventHash(input)).toBe(realSha256(canonical));
  });

  it("produces 64 lowercase hex chars and is deterministic", () => {
    const input = {
      prev_event_hash: "a".repeat(64),
      event_type: "earn.referral.activated",
      source_type: "referral_activation",
      source_id: "r1",
      amount: 250n,
      occurred_at: "2026-02-02T00:00:00.000Z",
      context_canonical_json: "{}",
      schema_version: 1,
    };
    const h = computeEventHash(input);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(computeEventHash(input)).toBe(h);
  });
});

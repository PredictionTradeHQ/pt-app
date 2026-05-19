# ADR-PTX-014: v1 Sybil detection uses cheap, privacy-respectful signals only

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

Sybil resistance can be built with invasive techniques (canvas fingerprinting, behavioral clustering, biometric signals, device-graph tracking) or with cheap, observable signals. The invasive techniques are more powerful but introduce significant privacy surface, require ML overhead, and turn the platform into a surveillance posture that contradicts the social-first framing of PTX.

In v1, abuse is mitigated socially and heuristically. The architecture explicitly avoids identity systems that would make PTX feel like a surveillance product.

## Decision

v1 Sybil detection uses exactly these signals:

- **IP class, anonymized.** Stored as a `/24` (IPv4) or `/48` (IPv6) prefix bucket, not as a raw address. Used for "many accounts from same network" heuristics only.
- **Email domain against a static disposable-provider blocklist.** No reputation API, no provider lookup, no per-email risk scoring.
- **Account-age vs. activity ratio.** A new account exhibiting unusually high reward velocity is flagged for review.

The following are explicitly out of scope for v1: canvas fingerprinting, browser-feature fingerprinting, behavioral biometric clustering, device-graph correlation, third-party identity-risk APIs, ML-based scoring, and any signal that requires user-visible permission prompts. Re-evaluating this scope requires its own ADR.

## Consequences

**Positive:**
- Privacy-respectful by construction: no user is identified beyond what is necessary for social mitigation.
- Cheap to compute: every signal is a lookup or a small aggregation — no ML pipeline, no third-party calls.
- The architecture does not encode a posture that would be hard to walk back later.

**Negative / accepted tradeoffs:**
- A determined adversary with rotating IPs and unique email domains can evade v1 detection. The threat model accepts this and relies on the cap layers (ADR-PTX-012) and the audit trail (ADR-PTX-009) to limit damage rather than prevent it absolutely.
- Heuristic signals produce false positives. The fraud module surfaces signals to operators for review; it does not block automatically.

## Alternatives considered

- **Canvas fingerprinting and behavioral clustering in v1.** Rejected: heavy privacy surface, ML overhead, and an architectural posture that contradicts the platform's social-first framing.
- **Third-party identity-risk providers.** Rejected: external dependency, monthly cost, opaque scoring, and exposes user metadata to a third party.

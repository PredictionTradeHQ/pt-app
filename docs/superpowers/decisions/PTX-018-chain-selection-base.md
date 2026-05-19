# ADR-PTX-018: Chain selection — Base mainnet (chain_id 8453)

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

If and when an onchain phase is approved as a separate business and legal decision (no earlier than Phase 9), the offchain ledger snapshot must publish to a specific deployment substrate. The choice affects transaction fees, confirmation times, audience association, and the practical cost of any future bridge.

The decision is about deployment substrate, not ideology. The chain is where the contract lives, not where the platform's identity lives.

## Decision

Base mainnet (`chain_id 8453`) is the primary deployment target for any future ERC-20 PTX contract. Polygon is explicitly rejected: Polygon's brand association leans toward financial-product use cases, which would import a "financial prediction market" identity that Prediction Trade is deliberately avoiding. EVM-compatible alternatives (Arbitrum, Optimism) are noted as substrate-swappable should pricing, audience, or feature considerations change.

## Consequences

**Positive:**
- Low transaction fees and consumer-friendly confirmation times.
- Brand-consistent: Base is associated with consumer onchain apps rather than derivatives or financial speculation.
- EVM compatibility means a substrate swap is mechanical if needed later.

**Negative / accepted tradeoffs:**
- Choosing a specific L2 imports L2-specific operational considerations (e.g., sequencer reliability). These are accepted given the consumer-UX benefit.

## Alternatives considered

- **Polygon.** Rejected: brand association with financial-product use cases would import an identity that the platform is deliberately avoiding.
- **Ethereum L1.** Rejected: fees and confirmation times are incompatible with consumer claim flows.
- **Solana.** Rejected: non-EVM compatibility would force a separate contract codebase and abandon the existing EVM tooling.

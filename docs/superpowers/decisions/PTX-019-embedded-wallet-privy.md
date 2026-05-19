# ADR-PTX-019: Embedded wallet — Privy primary, Coinbase Smart Wallet fallback

**Status:** Accepted (2026-05-19)
**Spec:** docs/superpowers/specs/2026-05-19-ptx-economy-architecture-design.md
**Locks honored:** project_pt_ptx_social_currency_layer.md (2026-05-18)

## Context

If and when wallet binding becomes relevant (no earlier than Phase 8), the consumer-facing product must abstract the wallet entirely. A user creating an account, claiming PTX, or holding cosmetics should not be required to install a browser extension, manage a seed phrase, or understand what a wallet is. The choice of wallet provider is therefore a UX decision, not a culture decision.

## Decision

Privy is the primary choice. Reasons: consumer-grade UX (passkeys, social login, account abstraction), multi-chain support, and pricing aligned with consumer scale. Coinbase Smart Wallet is the documented fallback if Privy's pricing or feature direction becomes unfavorable, given Coinbase Smart Wallet's native Base support and account-abstraction-first design. v1 adds zero web3 dependencies; the Privy or Coinbase Smart Wallet SDK enters the codebase only when Phase 8 activates.

## Consequences

**Positive:**
- Users never see wallet terminology in the product surface; PTX appears as an ordinary social balance.
- A fallback provider is pre-identified, so the eventual choice is not a single-vendor lock-in.
- The decision does not require any v1 code change.

**Negative / accepted tradeoffs:**
- Both options are third-party SaaS providers with their own pricing and reliability profiles. The fallback hedges this risk but does not eliminate it.

## Alternatives considered

- **Self-hosted wallet infrastructure.** Rejected: building wallet UX is a product in itself and far outside Prediction Trade's scope.
- **No embedded wallet (the user installs their own).** Rejected: the friction is incompatible with a consumer social product. Most target users do not have a wallet and should not need one to participate.

# PT Brain — Master Strategic Document

> **Read this first.** This document is the entry point for all strategic work on Prediction Trade.
> Last updated: 2026-05-13 | Phase: Strategic Expansion v1.0

---

## What PT Is

Prediction Trade is a **social forecasting platform** — not a broker, not a gambling app, not a Polymarket clone.

PT is the place where **culture meets prediction**. It is built for a generation that consumes information through TikTok, trades opinions on X, follows creators on YouTube, and wants to feel smart, not speculative.

**Core identity:** A fun, visual, AI-native platform where anyone can express opinions about the future — and build a reputation for being right.

---

## What PT Is NOT

| Not this | Why it matters |
|---|---|
| A Polymarket clone | PT is consumer-social, not DeFi-native |
| A broker / trading terminal | No financial complexity, no P&L anxiety |
| A gambling platform | No real money, no betting vibes |
| An enterprise product | That's PMS — PT is simple, fast, and fun |
| A politics-only platform | Politics is one category among many |

---

## The One-Line Positioning

> **"The social platform for people who love being right about the future."**

Secondary: *"Predict. Compete. Share. Learn."*

---

## Current Platform State (2026-05-13)

**Exists today:**
- Demo trading terminal (`/demo`) with $100k virtual balance
- Public market browser (`/markets`) via Polymarket Gamma API
- Arcade game (`/play`) — Prediction Flash
- Academy (`/academy`) — educational content
- Leaderboard (`/leaderboard`) — public ranking
- Dashboard (`/dashboard`) — broker-style portfolio view
- Auth system (Supabase), profiles, activity logs

**What's missing for the vision:**
- Social feed & trending UI
- Shareable prediction cards
- AI copilot / AI insights layer
- Creator profiles & public prediction records
- Content engine (automated market content)
- Category-first market browsing
- Streak / badge / gamification system
- Onboarding quiz / personalization

---

## Brain Document Index

| Document | Purpose |
|---|---|
| `MASTER.md` ← you are here | Strategic overview, read first |
| `VISION.md` | Platform identity, positioning, narrative |
| `MARKET-CATEGORIES.md` | Category architecture for content & UX |
| `CONTENT-ENGINE.md` | Content system for TikTok, X, Instagram |
| `UX-SOCIAL-LOOPS.md` | UX direction, social features, engagement design |
| `AI-NATIVE.md` | AI-first experience roadmap |
| `GROWTH-SYSTEMS.md` | Growth loops, creator economy, viral mechanics |

---

## Strategic Priorities (Ordered)

1. **Platform positioning & narrative** — who we are, what we say
2. **Category architecture** — how we organize markets for engagement
3. **Content engine** — how we generate and distribute content
4. **UX social loops** — what makes users come back daily
5. **AI-native layer** — what makes PT feel intelligent
6. **Growth systems** — how PT grows itself

---

## Separation Rule

PT and PMS are **completely separate ecosystems**.

| | PT | PMS |
|---|---|---|
| Nature | Consumer / social / demo | B2B / infrastructure / enterprise |
| Audience | Anyone curious about predictions | Operators building platforms |
| Tone | Fun, social, modern | Professional, technical, AI-first |
| Path | `Documents\PREDICTION TRADE\` | `Documents\PREDICTION MARKETS SOLUTIONS\` |

Never mix them. Never reference PMS from PT publicly.

---

## Development Rules

- **Language:** Talk to the operator in Spanish. All docs, code, commits in English.
- **Balance:** Starting balance is always $100,000. Never change this.
- **Stack:** Next.js + Supabase + Tailwind + shadcn/ui. No new frameworks without discussion.
- **Deploy:** `npx vercel --prod` from `pt-merged/`
- **Build:** TypeScript strict mode — always run `pnpm build` before deploy

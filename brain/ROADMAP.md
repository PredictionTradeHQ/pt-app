# PT Strategic Roadmap

> **Document:** Execution Roadmap — Strategic Expansion
> **Phase:** v1.0
> **Date:** 2026-05-13

---

## Where We Are Today

PT is a solid demo trading platform with: markets browser, paper trading terminal, arcade game, academy, leaderboard, and Supabase-backed auth. The foundation is stable, TypeScript-strict, and deployed.

**What PT is missing to become the vision:** Social layer, AI layer, content engine, creator tools, and category-first UX.

---

## Phase Breakdown

### Phase 0 — Foundation (DONE ✅)
- [x] Next.js app deployed and stable
- [x] Markets browser with Polymarket integration
- [x] Demo trading terminal ($100k virtual)
- [x] Leaderboard, profiles, activity logs
- [x] TypeScript strict build — 0 errors
- [x] GitHub + Vercel pipeline clean

---

### Phase 1 — Social Foundation
**Goal:** Make PT social and shareable. First viral moment.
**Timeline:** 4–8 weeks

#### UX
- [ ] Shareable prediction cards (generated on prediction, on outcome)
- [ ] "Called It" outcome reveal card
- [ ] Streak system (consecutive daily predictions)
- [ ] Basic badge system (First Blood, Called It, Streak milestones)
- [ ] Public profiles — `/profile/[username]` visible without auth

#### Content
- [ ] Content calendar system (see CONTENT-ENGINE.md)
- [ ] Weekly market recap post (manual at first)
- [ ] Market spotlight posts (3x/week)
- [ ] "Would you predict this?" polls on X

#### Categories
- [ ] Category tags on market cards
- [ ] Category filter tabs on `/markets`
- [ ] 6 core categories assigned to Polymarket markets

---

### Phase 2 — AI Layer
**Goal:** PT feels intelligent and ambient.
**Timeline:** 6–10 weeks (starts after Phase 1)

#### AI Features
- [ ] Market summary generator (API route + Supabase cache)
- [ ] "Explain this market" button on market cards
- [ ] Pre-prediction advisor panel
- [ ] Category auto-tagger for incoming Polymarket markets
- [ ] Trend indicator labels on market cards (rule-based)
- [ ] Outcome narrative generator (AI recap on resolution)

#### Infrastructure
- [ ] `/api/ai/market-summary` route
- [ ] Supabase table for AI summary cache
- [ ] Prompt templates (see AI-NATIVE.md)
- [ ] Rate limiting + cost controls

---

### Phase 3 — Growth & Creator
**Goal:** PT grows itself. Creator economy starts.
**Timeline:** 8–12 weeks (starts after Phase 2)

#### Social Loops
- [ ] Trending feed on home page (replaces static hero)
- [ ] "New in your categories" feed personalization
- [ ] Category leaderboards (per-category rankings)
- [ ] Creator profile cards (shareable performance card)
- [ ] "Featured Predictors" section on leaderboard

#### Content Engine
- [ ] Automated market content generation (Claude API)
- [ ] Outcome reveal content auto-draft
- [ ] AI insight cards (3x/week batch)
- [ ] Weekly recap auto-generation

#### Growth
- [ ] Outcome-triggered share notifications
- [ ] Streak at-risk notification
- [ ] Leaderboard rank change notification
- [ ] Product Hunt launch preparation

---

### Phase 4 — AI Copilot
**Goal:** PT has a conversational AI layer.
**Timeline:** TBD (after Phase 3 proves retention)

#### Copilot Features
- [ ] Lightweight AI assistant panel
- [ ] "What should I predict today?" recommendations
- [ ] Performance insights per user ("Your accuracy in Crypto is...")
- [ ] Personalized market feed based on prediction history
- [ ] AI onboarding guide (step-by-step first session)

---

## Feature Priority Matrix

| Feature | Phase | Impact | Complexity | Status |
|---|---|---|---|---|
| Shareable prediction cards | 1 | Very High | Medium | 🔲 Not started |
| Streak system | 1 | High | Low | 🔲 Not started |
| Badge system | 1 | High | Medium | 🔲 Not started |
| Public profiles | 1 | Very High | Medium | 🔲 Not started |
| Category tags on markets | 1 | High | Low | 🔲 Not started |
| Content calendar | 1 | High | Low | 🔲 Not started |
| Market summary AI | 2 | High | Medium | 🔲 Not started |
| "Explain this market" | 2 | High | Low | 🔲 Not started |
| Pre-prediction advisor | 2 | Medium | Medium | 🔲 Not started |
| Outcome narrator AI | 2 | High | Low | 🔲 Not started |
| Trending home feed | 3 | Very High | High | 🔲 Not started |
| Category leaderboards | 3 | Medium | Low | 🔲 Not started |
| Auto content engine | 3 | Very High | High | 🔲 Not started |
| AI onboarding | 4 | High | Medium | 🔲 Not started |
| AI copilot panel | 4 | High | High | 🔲 Not started |

---

## What NOT to Build (in this phase)

- Real money / financial integrations
- Complex DeFi or wallet features
- Enterprise admin dashboard
- Market creation by users (Phase 4+ if ever)
- Complex analytics / BI dashboards
- Native mobile app (web-first, then PWA)

---

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-05-13 | No market creation by users in Phase 1-3 | Quality control — markets come from Polymarket |
| 2026-05-13 | Streaks based on daily predictions, not wins | Rewards participation, not just accuracy |
| 2026-05-13 | AI summaries cached 30 min | Cost control on Claude API |
| 2026-05-13 | Content in English primarily | Global audience; Spanish subtitles secondary |
| 2026-05-13 | Dark mode default | Modern feel; aligns with target audience |
| 2026-05-13 | Starting balance stays $100k | Anchored throughout codebase; don't change |

---

## Success Definition

**Phase 1 complete when:**
- A user can make a prediction, get a shareable card, and post it to X
- Users have streaks visible on their profile
- Market cards show category badges

**Phase 2 complete when:**
- Every market has an AI-generated summary
- "Explain this market" returns useful, non-jargon text
- Outcome recaps are generated automatically

**Phase 3 complete when:**
- PT is publishing 5+ pieces of content per week
- Creator profiles are shareable and compelling
- Growth is measurably driven by content + shares (not just organic search)

**PT is successful when:**
- A user shares a "Called It" card and 3 friends join
- A creator builds an audience around their PT prediction record
- PT content goes viral around a major market outcome

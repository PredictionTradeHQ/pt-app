# PT Strategic Roadmap

> **Document:** Execution Roadmap — Strategic Expansion
> **Phase:** v2.1
> **Last updated:** 2026-05-15

---

## Where We Are Today

PT has evolved from a demo trading platform into a gamified social forecasting platform with cloud sync, real accuracy tracking, and a full social identity layer. Foundation is stable, TypeScript-strict, deployed, and Supabase-backed.

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

### Phase 1 — Social Foundation (DONE ✅ — commit 65e72aa + 4254d4d)
- [x] Shareable prediction cards (OG image route `/api/og/streak`)
- [x] "Called It" badge system
- [x] Streak system (consecutive daily predictions, Zustand persist)
- [x] Badge system: First Blood, Streak milestones, Contrarian, Sharp, Called It
- [x] Public profiles — `/profile/[username]` visible without auth
- [x] PT category system (6 core: AI&Tech, Crypto, Sports, Gaming, Entertainment, Internet Culture)
- [x] Category tags on market cards
- [x] Share achievement modal (X tweet, copy link, download OG)

---

### Phase 2 — Social Identity Layer (DONE ✅ — commit 52cc1d8)
- [x] Forecasters leaderboard (streak / accuracy / badges / activity tabs)
- [x] Demo anchor users (12 realistic users as community backdrop)
- [x] Real user injected at correct rank client-side
- [x] Home social widgets (Top Streakers, Hot Categories, Community Stats)
- [x] Social sharing card (OG PNG, 1200×630, edge runtime)
- [x] `ShareAchievementModal` component
- [x] `PublicProfileClient` component

---

### Phase 3 — Supabase Sync + Real Accuracy (DONE ✅ — commit de1e4e6)
**Supabase SQL executed: 2026-05-13. Tables live in production.**

- [x] `user_gamification` table with RLS (select/insert/update own row)
- [x] `public_leaderboard` VIEW — server-side accuracy_pct, readable by anon+authenticated
- [x] Performance indexes (best_streak, total_predictions, correct_count)
- [x] `lib/supabase-sync.ts` — push/pull/merge gamification state
- [x] Merge strategy: max streak, union badges, union predictions (deduped by id)
- [x] Real accuracy engine via Polymarket Gamma API resolution detection
- [x] `checkResolutions()` — polls up to 5 unresolved markets on profile visit
- [x] "Called It" detection (correct prediction when your side had <20% probability)
- [x] New badges: Contrarian (🎲), Sharp (🎯), Called It (💡)
- [x] `AccuracyStats` component (4-cell grid, color-coded, min 5 resolved)
- [x] `PredictionHistory` component (per-prediction status, contrarian flag)
- [x] Zustand store v2 migration (adds predictions[], resolvedCount, correctCount, calledItCount)
- [x] `brain/SUPABASE-SCHEMA.md` documentation
- [x] Ownership: sole operator is aventurarte.23@gmail.com (all Kevin refs removed)

---

### Phase 4 — Real Leaderboard + Social Viral UX (IN PROGRESS)
**Goal:** PT feels intelligent, alive, and social. Real data. Frictionless betting. Viral loops.

#### Phase 4a — Real Leaderboard (DONE ✅ — commit 5591936)
- [x] `/api/leaderboard/forecasters` route reading `public_leaderboard` view
- [x] Merge real users with demo anchors if fewer than 10 real entries
- [x] Display names from `profiles` table (joined server-side)
- [x] Real users highlighted with "Real" badge in UI
- [x] Logged-in user highlighted as "YOU" via Supabase auth client-side check
- [x] Loading skeleton (10 animated rows) during fetch
- [x] SWR with 60s refresh interval
- [x] #1 Spotlight card with amber glow above rank list

#### Phase 4b — Real Public Profiles (DONE ✅ — commit 11c2aa7)
- [x] `slugify()` utility in `lib/utils.ts` — shared URL slug generation
- [x] `/api/profile/[username]` — public lookup: display_name slug → gamification data
- [x] `RealPublicProfile` component — streak, accuracy, badge grid, CTA
- [x] `/profile/[username]` — handles demo users + real Supabase users; own profile → /profile
- [x] Leaderboard real user rows now link to `/profile/[username]`

#### Phase 4c — Market Intelligence Signals (DONE ✅ — commit 54a3f56)
- [x] `lib/market-signals.ts` — pure rule-based signal engine, $0, zero external APIs
- [x] 9 signal types: closing-urgent, closing-today, moving-fast, tossup, consensus, closing-soon, hot, new
- [x] Signal badges on market cards (replace static Hot/New)
- [x] Community labels: "71% say YES", "Leaning NO · 68%", "Community split"
- [x] Time urgency coloring (red/amber/yellow by proximity to resolution)
- [x] Community Momentum panel in MarketDetailModal
- [x] Signal system in LiveMarketsPreview (home page cards)

#### Phase 4d — Social Live Feeling (DONE ✅ — commits 1a1fdb2, 72a6308, 06c1098)
- [x] `ActivityTicker` — horizontally scrolling live trade feed (CSS animation, no library)
- [x] `StreakAtRiskBanner` — orange warning when streak ≥2 and no prediction today
- [x] `CategoryAccuracy` component — per-category accuracy bars from local Zustand predictions
- [x] Social proof bar: total traders, hot markets count, closing today count
- [x] Top Predictors sidebar widget (demo anchors, links to profiles)
- [x] Heat gradient strip on hot market cards + orange border for hot markets
- [x] Green pulse dot on active traders count
- [x] `hotCategoryId` memo — highlights category with highest 24h volume

#### Phase 4e — Viral Social Loops (DONE ✅ — commits 3fcb40b, 2068c9f)
- [x] Share Profile button in `/profile` account card — copies URL with clipboard feedback
- [x] Fix `ShareAchievementModal.handleCopy` — was copying `/leaderboard`, now copies profile URL
- [x] `MilestoneCelebration` modal — pure CSS confetti (no library), fires at streak 3/7/30
- [x] First Prediction Today streak context note in bet celebration strip
- [x] Streak milestone detection in `confirmBet()` with 8s auto-dismiss
- [x] Hero social proof CTA: "4,200+ predictions made · Join free →" (static, $0)
- [x] `@{username}` display in profile account card header

#### Phase 4f — Bet Flow Stability & UX Polish (DONE ✅ — commits aebb24f, 49aca71)
**Root cause fixed:** `persistPortfolio` did 3 sequential API calls (GET+PUT+PUT), each triggering
Supabase middleware `getUser()`. If JWT was near expiry, token refresh + `Set-Cookie` could emit
`onAuthStateChange` on client and disrupt UI. Fixed to 2 parallel writes, no intermediate GET.

- [x] `activityLog` local state — hydrated on mount, updated on bet, sent to persist
- [x] `persistPortfolio` — now `Promise.all([walletPUT, portfolioPUT])` — 2 parallel, no GET
- [x] `isSubmitting` state — prevents double-click, shows spinner on Place Bet button
- [x] Custom amount input in confirmation modal (`type="number" inputMode="numeric"`)
- [x] `lastBetAmountRef` — remembers last bet amount across bets (no re-renders)
- [x] Remove amount chips from MarketCards — cards are now clean YES/NO only
- [x] `handleQuickBet` no longer takes amount from card — uses last-used amount from ref
- [x] `MarketDetailModal` — `onBet` prop wired, "Connect Wallet to Trade" → "Make Prediction"
- [x] "Virtual funds only — no real money involved" footer in detail modal
- [x] Confirmation modal summary: `toLocaleString()`, `Math.max(0, balance-amount)`, price=0 guard
- [x] `type="button"` on all modal buttons (prevent accidental form submit)

#### Phase 5c — Credibility Pass (DONE ✅ — commit `3891faf`)
- [x] `/api/stats/platform` — real forecaster + prediction counts from `public_leaderboard`
- [x] Hero dynamic stat: real count from Supabase, honest fallback when empty
- [x] Community section: removed fake support cards, replaced with real platform feature cards
- [x] Features grid: reframed from "trading tools" to "forecasting reputation" language
- [x] Onboarding guide: social identity framing, "track record from day one"

#### Phase 5d — Public Profile Identity (DONE ✅ — commit `be4158c`)
- [x] `lib/profile-helpers.ts` — shared server-side helpers (no route.ts/page.tsx duplication)
  - `computeCategoryStats()` — groups by category, min 3 resolved, sorted by accuracy %
  - `computeTopCalls()` — contrarian correct predictions (prob <30%), top 3 most contrarian
  - `normalizeRecentPredictions()` — last 10 by date desc
- [x] `/api/profile/[username]` updated — returns `categoryStats` and `topCalls`
- [x] `/profile/[username]/page.tsx` updated — uses shared helpers, same data shape
- [x] `RealPublicProfile` full rebuild:
  - `buildHeadline()` — auto one-liner: "63% accurate · 🔥 7-day streak · Best at Crypto 🤖"
  - Stats grid with accuracy highlight (green when ≥60%)
  - Category accuracy bars ("Best at X" + per-category progress)
  - Biggest Calls section (top 3 contrarian correct predictions)
  - Category tags on each prediction row
  - Share on X + Copy Link with dynamic copy text
- [x] `supabase/migrations/003_public_leaderboard_predictions.sql` — VIEW includes `predictions`
- ⚠️ Migration 003 NOT YET RUN IN SUPABASE — sections have graceful empty fallbacks until then

---

#### Phase 4g — AI Layer (NOT STARTED — requires ANTHROPIC_API_KEY)
- [ ] Market summary generator (`/api/ai/market-summary`)
- [ ] "Explain this market" button on market cards
- [ ] Pre-prediction advisor panel (show AI context before betting)
- [ ] Outcome narrative generator (AI recap on resolution)
- [ ] AI summary Supabase cache table (30 min TTL)
- [ ] Rate limiting + cost controls on AI routes

---

### Phase 5 — Growth & Creator (after Phase 4g)
- [ ] Trending feed on home page (dynamic, replaces static hero)
- [ ] Category leaderboards (per-category rankings on `/leaderboard`)
- [ ] Creator profile cards (shareable performance card PNG)
- [ ] Automated content engine (Claude API → Buffer)
- [ ] Outcome-triggered share notifications
- [ ] Product Hunt launch preparation
- [ ] Onboarding flow (category select → first prediction guided)

---

## Feature Priority Matrix

| Feature | Phase | Impact | Complexity | Status |
|---|---|---|---|---|
| Shareable prediction cards | 1 | Very High | Medium | ✅ Done |
| Streak system | 1 | High | Low | ✅ Done |
| Badge system | 1 | High | Medium | ✅ Done |
| Public profiles | 1 | Very High | Medium | ✅ Done |
| Category tags on markets | 1 | High | Low | ✅ Done |
| Social leaderboard | 2 | High | Medium | ✅ Done |
| Home social widgets | 2 | Medium | Low | ✅ Done |
| Supabase gamification sync | 3 | Very High | Medium | ✅ Done |
| Real accuracy engine | 3 | High | Medium | ✅ Done |
| Called It system | 3 | High | Low | ✅ Done |
| Real leaderboard API | 4a | High | Low | ✅ Done |
| Real public profiles | 4b | High | Medium | ✅ Done |
| Market intelligence signals | 4c | High | Low | ✅ Done |
| Activity ticker + live feeling | 4d | Medium | Low | ✅ Done |
| Milestone celebration + share profile | 4e | High | Low | ✅ Done |
| Bet flow stability + UX polish | 4f | Critical | Medium | ✅ Done |
| Credibility pass — honest copy + real stats | 5c | High | Low | ✅ Done |
| Public profile identity (category acc, top calls) | 5d | Very High | Medium | ✅ Done (needs migration 003) |
| Market summary AI | 4g | High | Medium | 🔲 Not started |
| "Explain this market" | 4g | High | Low | 🔲 Not started |
| Pre-prediction advisor | 4g | Medium | Medium | 🔲 Not started |
| Trending home feed | 5 | Very High | High | 🔲 Not started |
| Category leaderboards | 5 | Medium | Low | 🔲 Not started |
| Auto content engine | 5 | Very High | High | 🔲 Not started |
| Onboarding flow | 5 | High | Medium | 🔲 Not started |

---

## What NOT to Build (current phases)

- Real money / financial integrations
- Complex DeFi or wallet features
- Enterprise admin dashboard
- Market creation by users
- Complex analytics / BI dashboards
- Native mobile app (web-first, then PWA)

> **PTX native social currency (added 2026-05-19).** A separate, inert module (`lib/ptx/`) tracked outside this web-product roadmap — see `lib/ptx/README.md` + `docs/superpowers/`. v1 is consistent with the bans above: off-chain, no real money, no wallet/DeFi (the Privy wallet + Base ERC-20 future is deferred to Phase 8–9 and would require revisiting this list + a business/legal decision). Phase 0 is inert; Phase 0 → 1 needs explicit operator sign-off.

---

## Known Friction Points (as of 2026-05-14)

These are documented, non-critical, to address in future sessions:

| Issue | Impact | Fix direction |
|---|---|---|
| Bet celebration strip not visible when scrolled down on mobile | Low | Viewport-fixed toast notification (replace strip) |
| `MarketDetailModal` amount input doesn't show user's real balance | Low | Add balance display + cap input at balance |
| `CategoryAccuracy` on public `/profile/[username]` shows nothing (reads local Zustand only) | Low | Serve category accuracy from `user_gamification` Supabase table |
| Hero "4,200+ predictions made" is hardcoded | Very low | Connect to real `user_gamification` row count (optional) |
| `supabase/migrations/002_profiles_username.sql` not yet executed | Low | Optional: execute in Supabase dashboard for indexed username lookup |
| Activity ticker resets CSS animation every 6s when new simulated trade is added | Very low | Acceptable as-is |

---

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-05-13 | No market creation by users in Phase 1-4 | Quality control — markets come from Polymarket |
| 2026-05-13 | Streaks based on daily predictions, not wins | Rewards participation, not just accuracy |
| 2026-05-13 | AI summaries cached 30 min | Cost control on Claude API |
| 2026-05-13 | Content in English primarily | Global audience |
| 2026-05-13 | Dark mode default | Modern feel; aligns with target audience |
| 2026-05-13 | Starting balance stays $100k | Anchored throughout codebase |
| 2026-05-13 | localStorage is source of truth; Supabase is sync layer | Offline resilience; cross-device sync on login |
| 2026-05-13 | Demo anchor pattern for leaderboard | Community feel without requiring multi-user DB |
| 2026-05-13 | Accuracy requires ≥5 resolved predictions | Prevents misleading 100% from 1 correct prediction |
| 2026-05-13 | TikTok excluded from content pipeline | Operator decision |
| 2026-05-14 | Market signals rule-based only, $0, no LLM | Cost constraint + instant performance |
| 2026-05-14 | Amount chips removed from MarketCards | Cards were re-rendering all 50+ on every chip click; modal has full amount control |
| 2026-05-14 | `persistPortfolio` — 2 parallel writes, no intermediate GET | Reduces Supabase middleware auth checks from 3 to 2, prevents JWT-refresh UI disruption |
| 2026-05-14 | `lastBetAmountRef` (ref, not state) for bet amount memory | Persists within session, zero re-renders |
| 2026-05-14 | "Make Prediction" replaces "Connect Wallet to Trade" | Previous copy implied crypto wallet integration that doesn't exist |

---

## Success Definition

**Phase 3 complete when (NOW ✅):**
- User predictions sync to Supabase on profile visit
- Real accuracy computed from resolved Polymarket markets
- "Called It" badge awarded for low-probability correct predictions

**Phase 4a-f complete ✅ (as of 2026-05-14):**
- Leaderboard shows real users merged with demo anchors
- Market cards have intelligent signals without external APIs
- Platform feels social, live, and active
- Bet flow is stable — no post-bet page disruptions
- Share loops working end-to-end (profile, streak milestones, predictions)

**Phase 4g complete when (next milestone):**
- Every market has an AI-generated summary (requires `ANTHROPIC_API_KEY` in Vercel env)
- "Explain this market" returns useful, plain-English text
- Supabase cache prevents API cost on repeated views

**Phase 5 complete when:**
- PT is publishing 5+ pieces of content per week automatically
- Creator profiles are shareable and compelling
- Growth is measurably driven by content + shares

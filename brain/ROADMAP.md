# PT Strategic Roadmap

> **Document:** Execution Roadmap — Strategic Expansion
> **Phase:** v2.0
> **Last updated:** 2026-05-13

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

### Phase 4 — Real Leaderboard + AI Layer (IN PROGRESS)
**Goal:** PT feels intelligent. Leaderboard shows real users. AI adds ambient value.

#### Real Leaderboard (DONE ✅ — commit 5591936)
- [x] `/api/leaderboard/forecasters` route reading `public_leaderboard` view
- [x] Merge real users with demo anchors if fewer than 10 real entries
- [x] Display names from `profiles` table (joined server-side)
- [x] Real users highlighted with "Real" badge in UI
- [x] Logged-in user highlighted as "YOU" via Supabase auth client-side check
- [x] Loading skeleton (10 animated rows) during fetch
- [x] Empty state if no data
- [x] SWR with 60s refresh interval
- [ ] Category accuracy breakdown per user (extend `category_predictions` JSONB)

#### Real Public Profiles (DONE ✅ — commit 11c2aa7)
- [x] `slugify()` utility in `lib/utils.ts` — shared URL slug generation
- [x] `/api/profile/[username]` — public lookup: display_name slug → gamification data
- [x] `RealPublicProfile` component — streak, accuracy, badge grid, CTA
- [x] `/profile/[username]` — handles demo users + real Supabase users; own profile → /profile
- [x] Leaderboard real user rows now link to `/profile/[username]`
- [x] `supabase/migrations/002_profiles_username.sql` — optional username column + backfill

#### AI Layer
- [ ] Market summary generator (`/api/ai/market-summary`)
- [ ] "Explain this market" button on market cards
- [ ] Pre-prediction advisor panel (show AI context before betting)
- [ ] Outcome narrative generator (AI recap on resolution)
- [ ] AI summary Supabase cache table (30 min TTL)
- [ ] Rate limiting + cost controls on AI routes

---

### Phase 5 — Growth & Creator (after Phase 4)
- [ ] Trending feed on home page
- [ ] Category leaderboards (per-category rankings)
- [ ] Creator profile cards (shareable performance card)
- [ ] Automated content engine (Claude API → Buffer)
- [ ] Outcome-triggered share notifications
- [ ] Streak at-risk notification
- [ ] Product Hunt launch preparation

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
| Real leaderboard API | 4 | High | Low | ✅ Done |
| Market summary AI | 4 | High | Medium | 🔲 Not started |
| "Explain this market" | 4 | High | Low | 🔲 Not started |
| Pre-prediction advisor | 4 | Medium | Medium | 🔲 Not started |
| Trending home feed | 5 | Very High | High | 🔲 Not started |
| Auto content engine | 5 | Very High | High | 🔲 Not started |
| AI copilot panel | 5 | High | High | 🔲 Not started |

---

## What NOT to Build (current phases)

- Real money / financial integrations
- Complex DeFi or wallet features
- Enterprise admin dashboard
- Market creation by users
- Complex analytics / BI dashboards
- Native mobile app (web-first, then PWA)

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

---

## Success Definition

**Phase 3 complete when (NOW ✅):**
- User predictions sync to Supabase on profile visit
- Real accuracy computed from resolved Polymarket markets
- "Called It" badge awarded for low-probability correct predictions

**Phase 4 complete when:**
- Leaderboard shows real users (not just demo anchors)
- Every market has an AI-generated summary
- "Explain this market" returns useful, non-jargon text

**Phase 5 complete when:**
- PT is publishing 5+ pieces of content per week automatically
- Creator profiles are shareable and compelling
- Growth is measurably driven by content + shares

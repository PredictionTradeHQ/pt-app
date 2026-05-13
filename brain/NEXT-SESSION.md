# NEXT SESSION START HERE

> Last updated: 2026-05-13 | Read this before touching anything.

---

## Production Status

| System | Status |
|---|---|
| predictiontrade.online | ✅ Live and healthy |
| GitHub main | ✅ Clean — last commit `5591936` |
| Vercel | ✅ Auto-deploy triggered on push |
| Supabase `user_gamification` + `public_leaderboard` | ✅ Live in production |
| TypeScript build | ✅ Strict — 0 errors |

---

## What Is Completed

### Phase 0 — Foundation
Next.js 16.2, Supabase auth, Vercel deploy, TypeScript strict, markets browser, demo terminal ($100k), arcade, academy, leaderboard.

### Phase 1 — Social Foundation
- Streak system (Zustand persist, daily tracking)
- Badge system: first_blood, streak_3/7/30, contrarian 🎲, sharp 🎯, called_it 💡, prolific
- Shareable prediction cards (OG PNG via `/api/og/streak`, 1200×630, edge runtime)
- Share modal: post to X, copy link, download
- PT category system: AI&Tech, Crypto, Sports, Gaming, Entertainment, Internet Culture
- Public profiles: `/profile/[username]`

### Phase 2 — Social Identity Layer
- Forecasters leaderboard (4 tabs: Streak / Accuracy / Badges / Activity)
- Demo anchor users (12 realistic users as community backdrop)
- Real user injected at correct rank client-side (amber highlight + "YOU" badge)
- Home social widgets: Top Streakers, Hot Categories, Community Stats
- `PublicProfileClient` component with stats + badge grid

### Phase 3 — Supabase Sync + Real Accuracy
- `user_gamification` table + RLS + `public_leaderboard` VIEW — **live in production**
- `lib/supabase-sync.ts`: push/pull/merge (max streak, union badges, union predictions)
- Real accuracy engine: polls Polymarket Gamma API for up to 5 unresolved markets per visit
- Resolution detection: `closed: true` AND `outcomePrices[0] >= 0.99/0.01`
- Called It system: correct prediction when your side had <20% probability
- `AccuracyStats` component (min 5 resolved to show %)
- `PredictionHistory` component with contrarian flag
- Zustand store v2 with migration from v1
- Ownership cleanup: sole operator aventurarte.23@gmail.com

### Phase 4 — Real Leaderboard (DONE ✅ — commit 5591936)
- `/api/leaderboard/forecasters` reads `public_leaderboard` view via Supabase anon key
- Joins `profiles` for display names
- Sort by best_streak / accuracy_pct / badge_count / total_predictions
- Nulls-last on accuracy (users with < 5 resolved predictions appear last)
- `ForecastersLeaderboard` fetches real data via SWR (60s refresh)
- Merge: real users + demo anchors fill gaps up to 10 entries
- Current user detected via Supabase auth client-side → "YOU" amber highlight
- Real users show "Real" badge to distinguish from demo anchors
- 10-row animated skeleton during loading
- Graceful empty state

---

## What Is Pending (Phase 4 AI Layer)

### Priority 1 — "Explain this market" (low complexity, high impact)
- Add button to market cards in `components/markets-app.tsx`
- `app/api/ai/market-summary/route.ts` — Claude API call, Supabase cache (30 min TTL)
- Requires: `ANTHROPIC_API_KEY` in `.env.local`

### Priority 2 — Pre-prediction advisor panel
- Show AI context (risk level, crowd sentiment, key factors) before confirming bet
- Requires: Claude API + market data

### Priority 3 — Real public profiles for real users
- `/profile/[username]` currently only supports demo users
- Real users get redirected to `/profile` (their own profile)
- To enable real public profiles: add `username` slug to `profiles` table, update route

---

## Architecture — Current State

```
Zustand (localStorage v2)
  ↕ on profile visit
lib/supabase-sync.ts
  ↕ push/pull/merge
Supabase user_gamification
  ↕ VIEW
public_leaderboard (anon readable)
  ↕ API
/api/leaderboard/forecasters
  ↕ SWR 60s
ForecastersLeaderboard component
```

---

## Risks / Watch Out For

- **Supabase anon key** in `.env.local` — do not expose service role key client-side (already correct)
- **Zustand v2 migration** — do not bump version again without adding a migration for v2
- **Demo anchor usernames** are hardcoded in `lib/demo-leaderboard.ts` — do not rename them (profile links depend on stability)
- **OG image route** is edge runtime — do not import Node-only modules into `/api/og/streak/route.tsx`
- **Polymarket API** sometimes returns `outcomePrices` as JSON string — `checkResolutions()` handles with `JSON.parse` fallback
- **TypeScript strict** — always run `pnpm build` before `npx vercel --prod`
- **`createClient()` in `lib/supabase/client.ts`** returns `any` when env vars missing — cast to `SupabaseClient` when type inference is needed

---

## Recommended Next Actions (in order)

1. **Get Anthropic API key** — add to `.env.local` + Vercel env vars to unlock AI layer
2. **"Explain this market"** — simplest AI feature, Claude API call on market card click
3. **Market summary cache** — Supabase table `ai_market_summaries` (market_id, summary, cached_at)
4. **Real public profiles** — add `username` slug to `profiles` table for real user profile URLs

---

## Key File Locations

| What | Where |
|---|---|
| Gamification store | `stores/gamification.ts` |
| Supabase sync | `lib/supabase-sync.ts` |
| Badge definitions | `lib/badges.ts` |
| Demo leaderboard data | `lib/demo-leaderboard.ts` |
| Forecasters leaderboard UI | `components/leaderboard/forecasters-leaderboard.tsx` |
| **Real forecasters API** | `app/api/leaderboard/forecasters/route.ts` |
| Public profile page | `app/profile/[username]/page.tsx` |
| OG image route | `app/api/og/streak/route.tsx` |
| SQL migration | `supabase/migrations/001_gamification.sql` |
| Schema docs | `brain/SUPABASE-SCHEMA.md` |
| Full roadmap | `brain/ROADMAP.md` |
| Strategic vision | `brain/MASTER.md` |

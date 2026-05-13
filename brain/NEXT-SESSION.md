# NEXT SESSION START HERE

> Last updated: 2026-05-13 | Read this before touching anything.

---

## Production Status

| System | Status |
|---|---|
| predictiontrade.online | ✅ Live and healthy |
| GitHub main | ✅ Clean — last commit `6ab1efb` |
| Vercel | ✅ READY — deployment `dpl_aCjZ7rX9hqPaa4ziHPkA3VkM7SLH` |
| Supabase `user_gamification` | ✅ Table live in production (executed 2026-05-13) |
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

---

## What Is Pending (Phase 4)

### Priority 1 — Real Leaderboard (low complexity, high impact)
The `public_leaderboard` VIEW is live. Just needs an API route to expose it.

**Files to create/modify:**
- `app/api/leaderboard/forecasters/route.ts` — reads `public_leaderboard` view via Supabase
- `components/leaderboard/forecasters-leaderboard.tsx` — switch from pure demo data to API + demo fallback
- Merge strategy: if fewer than 10 real users, fill with demo anchors

### Priority 2 — AI Layer
- `app/api/ai/market-summary/route.ts` — Claude API call, Supabase cache (30 min TTL)
- Add "Explain this market" button to market cards in `components/markets-app.tsx`
- Pre-prediction advisor panel (show AI context before confirming bet)
- Requires: Anthropic API key in `.env.local` as `ANTHROPIC_API_KEY`
- Note: Claude API account setup is tracked in `memory/project_predictiontrade.md`

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
```

```
User makes prediction in /demo or /markets
  → recordPrediction(categoryId, details)
  → PredictionRecord saved in Zustand
  → On /profile visit: checkResolutions()
    → Polymarket Gamma API per marketId
    → If closed + price settled: mark resolved + correct/incorrect
    → Award badges if earned
  → push to Supabase (debounced 2s)
```

---

## Risks / Watch Out For

- **Supabase anon key** in `.env.local` — do not expose service role key client-side (already correct)
- **Zustand v2 migration** — v1 users without `predictions[]` get migrated on next store hydration. Do not bump version again without adding a migration for v2.
- **Demo anchor usernames** are hardcoded in `lib/demo-leaderboard.ts` — public profile links like `/profile/alex-morgan` depend on these being stable
- **OG image route** is edge runtime — do not import Node-only modules into `/api/og/streak/route.tsx`
- **Polymarket API** sometimes returns `outcomePrices` as a JSON string, not array — `checkResolutions()` handles this with `JSON.parse` fallback
- **TypeScript strict** — always run `pnpm build` before `npx vercel --prod`

---

## Recommended Next Actions (in order)

1. **Build real leaderboard API** — `/api/leaderboard/forecasters` reading `public_leaderboard` view. Merge with demo data if <10 real rows.
2. **Get Anthropic API key** — needed for Phase 4 AI features (see `memory/project_predictiontrade.md` for Make.com pipeline status)
3. **Add "Explain this market"** — simplest AI feature, high perceived value, low cost
4. **Market summary cache** — Supabase table `ai_market_summaries` with `market_id`, `summary`, `cached_at`

---

## Key File Locations

| What | Where |
|---|---|
| Gamification store | `stores/gamification.ts` |
| Supabase sync | `lib/supabase-sync.ts` |
| Badge definitions | `lib/badges.ts` |
| Demo leaderboard data | `lib/demo-leaderboard.ts` |
| Forecasters leaderboard UI | `components/leaderboard/forecasters-leaderboard.tsx` |
| Public profile page | `app/profile/[username]/page.tsx` |
| OG image route | `app/api/og/streak/route.tsx` |
| SQL migration | `supabase/migrations/001_gamification.sql` |
| Schema docs | `brain/SUPABASE-SCHEMA.md` |
| Full roadmap | `brain/ROADMAP.md` |
| Strategic vision | `brain/MASTER.md` |

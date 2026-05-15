# NEXT SESSION START HERE

> Last updated: 2026-05-15 | Read this before touching anything.

---

## Production Status

| System | Status |
|---|---|
| predictiontrade.online | ✅ Live and healthy |
| GitHub main | ✅ Clean — last commit `3891faf` |
| Vercel | ✅ Auto-deploy active (PT Vercel workspace) |
| TypeScript build | ✅ Strict — 0 errors |
| Supabase `user_gamification` | ✅ Live in production |
| Supabase `public_leaderboard` VIEW | ✅ Live in production |

---

## Completed Phases

### Phase 0 — Foundation
Next.js 16.2, Supabase auth, Vercel deploy, TypeScript strict, markets browser, demo terminal ($100k), arcade, academy, leaderboard.

### Phase 1 — Social Foundation
Streak system, badge system (first_blood, streak_3/7/30, contrarian🎲, sharp🎯, called_it💡, prolific), shareable OG cards, PT category system, public profiles.

### Phase 2 — Social Identity Layer
Forecasters leaderboard (4 tabs), demo anchor users (12), real user highlight ("YOU" badge), home social widgets.

### Phase 3 — Supabase Sync + Real Accuracy
`user_gamification` table + RLS + `public_leaderboard` VIEW live in production. Real accuracy engine polling Polymarket. Called It system. Zustand store v2 → v3.

### Phase 4a–4f — Real Leaderboard + Bet Flow
Real leaderboard API from Supabase, real public profiles via slugify, market intelligence signals (9 types, $0 cost), ActivityTicker, StreakAtRiskBanner, CategoryAccuracy, viral share loops, parallel API writes for bet stability.

### Phase 5a–5c — UX Polish
Mobile toast, balance modal, real ticker, Called It flow, welcome banner, smart empty states, leaderboard nudge, removed fake tabs, honest community stats, social hero reframe ("Predict the Future. Prove You're Right.").

### AI Skills Layer
`.claude/PT-TONE-GUIDE.md`, `pt-called-it-post.md`, `pt-market-brief.md`.

### Social Viral Loops
`lib/share-copy.ts` (template engine: called-it, streak-milestone, leaderboard-climb), `app/api/ai/share-copy/route.ts` (stub — ready for Claude API), `called-it-modal.tsx`, `leaderboard-climb-toast.tsx`, `first-prediction-guide.tsx`.

---

## Pending — Priority Order

### Priority 1 — Phase 4g: AI Layer (recommended next)

**What:** Activate Claude API features already stubbed.

**Steps:**
1. Add `ANTHROPIC_API_KEY` to `.env.local` + Vercel env vars
2. Uncomment 10 lines in `app/api/ai/share-copy/route.ts` → AI share copy live
3. Create `/api/ai/market-summary/route.ts` — Claude API call + Supabase cache (30 min TTL)
4. Add "Explain this market" button to `components/markets-app.tsx`

**Files to edit:**
- `app/api/ai/share-copy/route.ts` (already stubbed — minimal change)
- `app/api/ai/market-summary/route.ts` (new file)
- `components/markets-app.tsx` (add button)

### Priority 2 — CategoryAccuracy on public profiles

**What:** `/profile/[username]` shows nothing for CategoryAccuracy because it reads local Zustand, not Supabase.

**Fix:** Read `user_gamification` from Supabase (join with `profiles` by user_id) in `app/profile/[username]/page.tsx`.

### Priority 3 — Username slug in real profiles (optional)

**What:** Real users get redirected to `/profile` instead of having a public URL.

**Fix:** Execute `supabase/migrations/002_profiles_username.sql` in Supabase dashboard, then update `/api/profile/[username]/route.ts` to lookup by `username` column.

### Priority 4 — Phase 5 Growth (longer term)

- Trending feed dynamic in home (replaces static hero section)
- Category leaderboards in `/leaderboard`
- Automated content engine (Claude API → Buffer)

---

## Architecture — Current State

```
Zustand gamification store v3 (localStorage)
  ↕ on profile visit + login + 2s debounce
lib/supabase-sync.ts (push/pull/merge)
  ↕
Supabase user_gamification table
  ↕ VIEW
public_leaderboard (anon readable, server-side accuracy_pct)
  ↕ SWR 60s refresh
/api/leaderboard/forecasters → ForecastersLeaderboard component

lib/share-copy.ts (template engine)
  → called-it-modal.tsx (X + WhatsApp + Copy)
  → leaderboard-climb-toast.tsx (climb moment share)
  → app/api/ai/share-copy/route.ts (stub — Claude API ready)
```

---

## Risks — Watch Out For

| Risk | Mitigation |
|---|---|
| Supabase anon key client-side only | `SUPABASE_SERVICE_ROLE_KEY` never exposed to browser |
| Zustand v3 migration | Do not bump version again without adding v3→v4 migration |
| Demo anchor usernames | Hardcoded in `lib/demo-leaderboard.ts` — do not rename (profile links break) |
| OG image route (edge runtime) | Do not import Node-only modules into `/api/og/streak/route.tsx` |
| Polymarket `outcomePrices` format | Sometimes returns JSON string — `checkResolutions()` handles with JSON.parse fallback |
| TypeScript strict mode | Always `pnpm build` before `npx vercel --prod` |
| PMS contamination | Never reference PMS code, skills, or Supabase from PT codebase |

---

## Key File Locations

| What | Where |
|---|---|
| Gamification store | `stores/gamification.ts` |
| Supabase sync | `lib/supabase-sync.ts` |
| Badge definitions | `lib/badges.ts` |
| Demo leaderboard data | `lib/demo-leaderboard.ts` |
| Forecasters leaderboard UI | `components/leaderboard/forecasters-leaderboard.tsx` |
| Real forecasters API | `app/api/leaderboard/forecasters/route.ts` |
| Public profile page | `app/profile/[username]/page.tsx` |
| Share copy engine | `lib/share-copy.ts` |
| AI share copy route (stub) | `app/api/ai/share-copy/route.ts` |
| Called It modal | `components/called-it-modal.tsx` |
| Leaderboard climb toast | `components/leaderboard-climb-toast.tsx` |
| First prediction guide | `components/onboarding/first-prediction-guide.tsx` |
| OG image route | `app/api/og/streak/route.tsx` |
| SQL migration (gamification) | `supabase/migrations/001_gamification.sql` |
| SQL migration (username, pending) | `supabase/migrations/002_profiles_username.sql` |
| Schema docs | `brain/SUPABASE-SCHEMA.md` |
| Full roadmap | `brain/ROADMAP.md` |
| Strategic vision | `brain/MASTER.md` |

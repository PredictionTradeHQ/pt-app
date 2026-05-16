# NEXT SESSION START HERE

> Last updated: 2026-05-15 | Read this before touching anything.

---

## Production Status

| System | Status |
|---|---|
| predictiontrade.online | ✅ Live and healthy |
| GitHub main | ✅ Clean — last commit `e588e18` |
| Vercel | ✅ Auto-deploy active (PT Vercel workspace) |
| TypeScript build | ✅ Strict — 0 errors |
| Supabase `user_gamification` | ✅ Live in production |
| Supabase `public_leaderboard` VIEW | ✅ Live — but WITHOUT `predictions` column yet |
| Public profile category accuracy | ⚠️ PARTIAL — needs migration 003 (see below) |

---

## ⚠️ MIGRATION 003 — PARTIAL BLOCKER — RUN BEFORE NEXT DEV SESSION

**File:** `supabase/migrations/003_public_leaderboard_predictions.sql`

**What it does:** Recreates `public_leaderboard` VIEW to include the `predictions` JSONB column, which powers category accuracy bars and "Biggest Calls" sections on public profiles.

**URL:** https://supabase.com/dashboard/project/dvevwlhshcyvnsubyvzw/sql/new

**SQL to run:**
```sql
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  user_id,
  current_streak,
  best_streak,
  last_prediction_date,
  total_predictions,
  resolved_count,
  correct_count,
  called_it_count,
  CASE
    WHEN resolved_count >= 5
    THEN ROUND((correct_count::float / resolved_count) * 100)::integer
    ELSE NULL
  END AS accuracy_pct,
  jsonb_array_length(badges) AS badge_count,
  badges,
  category_predictions,
  predictions,
  updated_at
FROM user_gamification;

GRANT SELECT ON public_leaderboard TO anon, authenticated;
```

**Impact if NOT run:**
- ✅ Nothing breaks — all graceful fallbacks in place
- ✅ General profile stats (streak, accuracy %, badge count) still show correctly
- ❌ "Best at [Category]" section empty on public profiles
- ❌ "Biggest Calls" section empty on public profiles
- ❌ Category accuracy bars empty on public profiles
- ❌ Recent predictions list empty on public profiles

**Impact once run:**
- ✅ All new profile sections activate automatically — no code changes needed
- ✅ Works for all real Supabase users with predictions stored in `user_gamification`

---

## What Was Built — 2026-05-15 Session

### Credibility Pass (commit `3891faf`)
**Problem:** PT had multiple fake/dishonest elements that broke user trust:
- Hero stat "4,200+ predictions made" was hardcoded
- Community section had fake support cards ("Live Chat 24/7", "Help Center") that led nowhere
- Onboarding copy felt like a trading platform, not a social forecasting product
- Features grid pointed to `/dashboard` instead of `/leaderboard`

**Solution:**
- `components/hero.tsx` — dynamic stat fetch from `/api/stats/platform` (real count from `public_leaderboard`); honest fallback when no data
- `app/api/stats/platform/route.ts` — new public endpoint, 5-min cache, reads `public_leaderboard`
- `components/community.tsx` — replaced fake support cards with real platform feature cards (Leaderboard, Academy, Live Markets)
- `components/features-grid.tsx` — reframed from "trading tools" to "forecasting reputation" language
- `components/onboarding/first-prediction-guide.tsx` — social identity framing, "track record from day one"

**Strategic impact:** Removed credibility-destroying fake elements. PT now only shows what actually exists.

### Public Profile Rebuild (commit `be4158c`)
**Problem:** Public profiles of real users showed basic stats but nothing that communicated *reputation* or *identity*:
- CategoryAccuracy read from local Zustand (invisible to profile visitors)
- No "best at X" callout
- No contrarian/biggest calls section
- No shareable headline

**Solution:**
- `lib/profile-helpers.ts` — shared server-side helpers (no duplication between API route and page)
  - `computeCategoryStats()` — groups predictions by category, min 3 resolved, sorted by accuracy %
  - `computeTopCalls()` — contrarian correct predictions (prob <30%), top 3 most contrarian
  - `normalizeRecentPredictions()` — last 10 predictions, sorted by date
- `app/api/profile/[username]/route.ts` — now returns `categoryStats` and `topCalls` in `RealProfileData`
- `app/profile/[username]/page.tsx` — `fetchRealProfile` updated to use shared helpers
- `components/profile/real-public-profile.tsx` — full rebuild:
  - `buildHeadline()` auto-generates one-liner: "63% accurate · 🔥 7-day streak · Best at Crypto 🤖"
  - Stats grid with accuracy highlight (green border/bg when ≥60%)
  - CategoryAccuracy section: "Best at X" + per-category progress bars
  - "Biggest Calls" section: top contrarian correct predictions
  - Category tag on each prediction row
  - Share on X + Copy Link buttons with dynamic copy text

**Strategic impact:** Public profiles are now *identity artifacts* — shareable, competitive, reputational. The foundation for viral loops via profile sharing.

**Activation status:**
- Code: ✅ Deployed to production
- Data layer: ⚠️ Needs migration 003 in Supabase (see above)

---

## Completed Phases

- ✅ Phase 0 — Foundation (Next.js, Supabase, Vercel, TypeScript strict)
- ✅ Phase 1 — Social Foundation (streaks, badges, OG cards, categories, public profiles)
- ✅ Phase 2 — Social Identity Layer (leaderboard, demo anchors, home widgets)
- ✅ Phase 3 — Supabase Sync + Real Accuracy (user_gamification live, accuracy engine, Called It)
- ✅ Phase 4a — Real Leaderboard (Supabase VIEW, #1 Spotlight, real+demo merge)
- ✅ Phase 4b — Real Public Profiles (slugify, RealPublicProfile, /api/profile/[username])
- ✅ Phase 4c — Market Intelligence Signals (lib/market-signals.ts, 9 signal types, $0 cost)
- ✅ Phase 4d — Social Live Feeling (ActivityTicker, StreakAtRiskBanner, CategoryAccuracy)
- ✅ Phase 4e — Viral Social Loops (share engine, MilestoneCelebration, hero CTA)
- ✅ Phase 4f — Bet Flow Stability (parallel API writes, custom amount, no auth disruption)
- ✅ Phase 5a — UX Polish (mobile toast, balance modal, real ticker, Called It flow)
- ✅ Phase 5b — Lightweight Onboarding (auth callback → /markets, welcome banner, nudges)
- ✅ Phase 5c — Credibility Pass (honest stats, no fake features, social-first copy)
- ✅ Phase 5d — Public Profile Identity (server-side category accuracy, top calls, shareable headline)

---

## Pending — Priority Order

### Priority 0 — Run Migration 003 (NOT a dev task — operator action, 2 minutes)
Run SQL in Supabase dashboard (see above). Unlocks full public profile data immediately.
No code changes needed after running.

### Priority 1 — Phase 4g: AI Layer (high impact, requires ANTHROPIC_API_KEY)

**What:** Activate Claude API features already stubbed.

**Steps:**
1. Add `ANTHROPIC_API_KEY` to `.env.local` AND Vercel env vars (PT Vercel workspace)
2. Uncomment 10 lines in `app/api/ai/share-copy/route.ts` → AI share copy live
3. Create `/api/ai/market-summary/route.ts` — Claude API call + Supabase cache table (30 min TTL)
4. Add "Explain this market" button on market cards in `components/markets-app.tsx`

**Files to edit:**
- `app/api/ai/share-copy/route.ts` (already stubbed — minimal change)
- `app/api/ai/market-summary/route.ts` (new file)
- `components/markets-app.tsx` (add button)

**Cost estimate:** ~$0.002 per market summary (claude-haiku-4-5). 1,000 summaries/month ≈ $2.

### Priority 2 — ActivityTicker with real data
Currently shows simulated activity because no real users have prediction history yet.
Once real users accumulate data, the ticker will auto-populate from `activity_logs` table.
No immediate action needed — monitor as user base grows.

### Priority 3 — Category leaderboards (medium term)
Add a "Best in Category" tab to `/leaderboard` reading from `public_leaderboard` and
filtering by `category_predictions` JSONB keys. Useful once >20 real users exist.

### Priority 4 — Migration 002 (optional, low urgency)
`supabase/migrations/002_profiles_username.sql` — adds `username` column for indexed slug lookup.
Current slug matching works fine (scans 500 rows max). Not urgent until >200 users.

---

## Architecture — Current State

```
Zustand gamification store v3 (localStorage)
  ↕ on profile visit + login + 2s debounce
lib/supabase-sync.ts (push/pull/merge)
  ↕
Supabase user_gamification table (RLS: own row only)
  ↕ VIEW (anon readable)
public_leaderboard → accuracy_pct, badges, predictions (after migration 003)
  ↕
Server-side computation (lib/profile-helpers.ts)
  → categoryStats (accuracy by category, min 3 resolved)
  → topCalls (contrarian correct predictions, top 3)
  → recentPredictions (last 10, sorted by date)
  ↕
/api/profile/[username] + /profile/[username]/page.tsx
  → RealPublicProfile component (headline, stats, categories, calls, badges, predictions)

lib/share-copy.ts (template engine)
  → called-it-modal.tsx (X + WhatsApp + Copy)
  → leaderboard-climb-toast.tsx (climb moment share)
  → app/api/ai/share-copy/route.ts (stub — Claude API ready when key is set)
```

---

## Do NOT Touch Without Reading Context First

| Area | Risk | Read first |
|---|---|---|
| Zustand store version | Bumping breaks localStorage for existing users | `stores/gamification.ts` migrations |
| Demo anchor usernames | Renaming breaks all profile links | `lib/demo-leaderboard.ts` |
| OG image route | Edge runtime — no Node-only imports | `app/api/og/streak/route.tsx` |
| Starting balance | Hardcoded in 6+ places | Search `100000` across codebase |
| `public_leaderboard` VIEW | Re-creating drops grants — always include GRANT | `supabase/migrations/003_*.sql` |

---

## Risks — Watch Out For

| Risk | Mitigation |
|---|---|
| Supabase anon key client-side only | `SUPABASE_SERVICE_ROLE_KEY` never exposed to browser |
| Zustand v3 migration | Do not bump version again without adding v3→v4 migration |
| Demo anchor usernames | Hardcoded in `lib/demo-leaderboard.ts` — do not rename (profile links break) |
| OG image route (edge runtime) | Do not import Node-only modules into `/api/og/streak/route.tsx` |
| Polymarket `outcomePrices` format | Sometimes returns JSON string — `checkResolutions()` handles with JSON.parse fallback |
| TypeScript strict mode | Always `pnpm build` before `git push` |
| PMS contamination | Never reference PMS code, skills, or Supabase from PT codebase |

---

## Key File Locations

| What | Where |
|---|---|
| Gamification store | `stores/gamification.ts` |
| Supabase sync | `lib/supabase-sync.ts` |
| Profile helpers (server) | `lib/profile-helpers.ts` |
| Badge definitions | `lib/badges.ts` |
| Demo leaderboard data | `lib/demo-leaderboard.ts` |
| Forecasters leaderboard UI | `components/leaderboard/forecasters-leaderboard.tsx` |
| Real forecasters API | `app/api/leaderboard/forecasters/route.ts` |
| Platform stats API | `app/api/stats/platform/route.ts` |
| Public profile page | `app/profile/[username]/page.tsx` |
| Public profile API | `app/api/profile/[username]/route.ts` |
| Public profile component | `components/profile/real-public-profile.tsx` |
| Share copy engine | `lib/share-copy.ts` |
| AI share copy route (stub) | `app/api/ai/share-copy/route.ts` |
| Called It modal | `components/called-it-modal.tsx` |
| Leaderboard climb toast | `components/leaderboard-climb-toast.tsx` |
| First prediction guide | `components/onboarding/first-prediction-guide.tsx` |
| OG image route | `app/api/og/streak/route.tsx` |
| SQL migration 001 (gamification) | `supabase/migrations/001_gamification.sql` |
| SQL migration 002 (username, optional) | `supabase/migrations/002_profiles_username.sql` |
| SQL migration 003 (predictions VIEW) | `supabase/migrations/003_public_leaderboard_predictions.sql` |
| Schema docs | `brain/SUPABASE-SCHEMA.md` |
| Full roadmap | `brain/ROADMAP.md` |
| Strategic vision | `brain/MASTER.md` |

# PT Supabase Schema — Phase 5d

> **Document:** Database Schema & Sync Architecture
> **Phase:** Phase 5d — Public Profile Identity
> **Last updated:** 2026-05-15

---

## Status

| Component | Status |
|---|---|
| Migration 001 — `user_gamification` table | ✅ Executed in production |
| Migration 002 — `username` column | ⏸ Optional — not executed (scan-500 works fine for now) |
| Migration 003 — `predictions` in VIEW | ⚠️ **NOT YET RUN — partial blocker for public profile sections** |
| `public_leaderboard` VIEW | ✅ Live — but WITHOUT `predictions` column until migration 003 |
| Sync layer | ✅ Live (`lib/supabase-sync.ts`) |
| Profile helpers | ✅ Live (`lib/profile-helpers.ts`) |

---

## ⚠️ Migration 003 — Run This Next

**File:** `supabase/migrations/003_public_leaderboard_predictions.sql`
**URL:** https://supabase.com/dashboard/project/vkizidrsuwsreepsbbuy/sql/new

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

**Without it:** category accuracy bars, "Best at X", "Biggest Calls", and recent predictions on public profiles will be empty (graceful fallbacks — no errors).
**With it:** all new profile sections activate automatically. No code changes needed.

---

## Setup Instructions

### Migration 001 — Already Done ✅
`supabase/migrations/001_gamification.sql` — creates `user_gamification` table + RLS + `public_leaderboard` VIEW.

### Migration 003 — Pending ⚠️
`supabase/migrations/003_public_leaderboard_predictions.sql` — recreates `public_leaderboard` VIEW to include `predictions` JSONB column. See section above.

### Migration 002 — Optional ⏸
`supabase/migrations/002_profiles_username.sql` — adds indexed `username` column to `profiles` table. Current slug matching scans up to 500 rows — sufficient until >200 real users.

---

## Schema: `user_gamification`

```sql
CREATE TABLE user_gamification (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id),
  current_streak      INTEGER DEFAULT 0,
  best_streak         INTEGER DEFAULT 0,
  last_prediction_date DATE,
  total_predictions   INTEGER DEFAULT 0,
  category_predictions JSONB DEFAULT '{}'::jsonb,   -- { "ai-tech": 5, "crypto": 2 }
  predictions         JSONB DEFAULT '[]'::jsonb,    -- PredictionRecord[]
  resolved_count      INTEGER DEFAULT 0,
  correct_count       INTEGER DEFAULT 0,
  called_it_count     INTEGER DEFAULT 0,
  badges              JSONB DEFAULT '[]'::jsonb,    -- EarnedBadge[]
  updated_at          TIMESTAMPTZ DEFAULT now()
);
```

### JSONB Field: `predictions` (array of PredictionRecord)

```typescript
interface PredictionRecord {
  id: string           // "{marketId}-{prediction}-{timestamp}"
  marketId: string     // Polymarket market ID
  marketTitle: string  // full question text
  category: string     // PT category id ("ai-tech", "crypto", etc.)
  prediction: "YES" | "NO"
  probAtTime: number   // 0-100 — YES probability at time of bet
  amount: number       // virtual $$ wagered
  createdAt: string    // ISO 8601
  resolved: boolean
  outcome?: "YES" | "NO"  // set when market resolves
  correct?: boolean        // prediction === outcome
}
```

### JSONB Field: `badges` (array of EarnedBadge)

```typescript
interface EarnedBadge {
  id: string      // badge definition id
  earnedAt: string // ISO 8601
}
```

---

## Row Level Security

All policies use `auth.uid() = user_id`:
- **SELECT** — user can read their own row
- **INSERT** — user can create their own row
- **UPDATE** — user can update their own row

The `public_leaderboard` VIEW:
- Readable by `anon` and `authenticated` roles
- Computes `accuracy_pct` server-side (prevents spoofing)
- Exposes only non-PII fields

---

## Sync Layer Architecture (`lib/supabase-sync.ts`)

### `pushGamification(userId, snapshot)`
- Upserts the user's full gamification state to Supabase
- Uses `onConflict: "user_id"` for upsert semantics
- Silently ignores errors if tables don't exist yet (error code 42P01)
- Called from:
  - `profile-client.tsx` on mount (initial push)
  - `profile-client.tsx` on state change (debounced 2s)

### `pullGamification(userId)`
- Reads the user's row from Supabase
- Returns `null` if row doesn't exist or table doesn't exist
- Called from `profile-client.tsx` on mount

### `mergeSnapshots(local, remote)`
- **Streak**: max of both
- **Badges**: union of both (keep earnedAt from source that has it)
- **Predictions**: union, deduplicated by id, resolved state wins
- **Category predictions**: max per category
- **Accuracy stats**: recomputed from merged predictions

### Source of Truth

**localStorage is always the source of truth.** Supabase is the persistence/sync layer:
- If Supabase is unavailable → localStorage works fine
- If localStorage is cleared → pull from Supabase on next login
- Cross-device sync → pull from Supabase on login, merge, push merged back

---

## Accuracy Engine (`stores/gamification.ts`)

### `checkResolutions()` — Resolution check

Called from `profile-client.tsx` on mount. Checks up to 5 unresolved predictions at a time.

**Resolution check logic:**
```
Fetch: GET https://gamma-api.polymarket.com/markets/{marketId}

Resolved when:
  data.closed === true
  AND data.outcomePrices parses to prices where:
    prices[0] >= 0.99 → outcome = "YES"
    prices[0] <= 0.01 → outcome = "NO"
```

**Why this works:**
- Polymarket sets outcome prices to 1.0/0.0 on resolution
- `closed: true` is the Polymarket signal for resolved markets
- This is the same data the CLOB uses — reliable source

### Accuracy Calculation

```
resolvedCount = predictions.filter(p => p.resolved).length
correctCount  = predictions.filter(p => p.correct).length
accuracyPct   = resolvedCount >= 5
                ? round(correctCount / resolvedCount * 100)
                : null  // show "—" when sample too small
```

Minimum 5 resolved predictions before showing accuracy (avoids misleading 100% from 1/1).

### "Called It" Detection

```
calledItCount = predictions.filter(p =>
  p.correct &&
  (
    (p.prediction === "YES" && p.probAtTime < 20) ||
    (p.prediction === "NO"  && (100 - p.probAtTime) < 20)
  )
).length
```

---

## Badges Added in Phase 3

| Badge | ID | Trigger | Rarity |
|---|---|---|---|
| 🎲 Contrarian | `contrarian` | Predicted when your side had <20% probability | Uncommon |
| 🎯 Sharp | `sharp` | 70%+ accuracy over ≥10 resolved predictions | Rare |
| 💡 Called It | `called_it` | Correct prediction when your side had <20% probability | Legendary |

---

## Profile Data Flow (Phase 5d)

```
user_gamification.predictions (JSONB array)
  ↓ exposed via public_leaderboard VIEW (after migration 003)
  ↓ fetched server-side in /profile/[username]/page.tsx
  ↓ processed by lib/profile-helpers.ts
    → computeCategoryStats()  — accuracy by category (min 3 resolved, sorted desc)
    → computeTopCalls()       — contrarian correct predictions (prob <30%), top 3
    → normalizeRecentPredictions() — last 10 by date
  ↓ passed as props to RealPublicProfile component
    → buildHeadline()         — "63% accurate · 🔥 7-day streak · Best at Crypto 🤖"
    → CategoryAccuracySection — "Best at X" + progress bars
    → TopCallRow              — contrarian big calls
    → PredictionRow           — recent predictions with category tags
```

Also available via API: `/api/profile/[username]` returns same `RealProfileData` shape.

## What NOT to Build Next (in Supabase)

- Service role key exposure to client — anon key only in browser
- Storing real money or financial data
- Complex analytics tables — compute from existing JSONB arrays instead
- Per-market resolution cache — Polymarket Gamma API is the source of truth

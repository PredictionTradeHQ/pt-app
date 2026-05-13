# PT Supabase Schema — Phase 3

> **Document:** Database Schema & Sync Architecture
> **Phase:** Phase 3 — Supabase Sync + Real Accuracy
> **Date:** 2026-05-13

---

## Status

| Component | Status |
|---|---|
| SQL migration file | ✅ Ready (`supabase/migrations/001_gamification.sql`) |
| Sync layer | ✅ Ready (`lib/supabase-sync.ts`) |
| Tables in Supabase | ⚠️ **Pending — run SQL in Supabase dashboard** |
| Sync activation | Auto (once tables exist) |

---

## Setup Instructions (One Time)

1. Go to Supabase SQL Editor:
   `https://supabase.com/dashboard/project/dvevwlhshcyvnsubyvzw/sql/new`

2. Paste the entire contents of `supabase/migrations/001_gamification.sql`

3. Click **Run**

4. Done — sync activates automatically on next user login.

**No code changes needed after running the SQL.**

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

## Phase 4 Roadmap

### Real Public Leaderboard
Once SQL runs, the `public_leaderboard` view is live. Upgrade `ForecastersLeaderboard` to:
1. Fetch from `/api/leaderboard/forecasters` (reads `public_leaderboard` view)
2. Merge with demo data if fewer than 10 real users
3. Show real usernames (display_name from `user_metadata`)

### Category Accuracy Breakdown
Per-category accuracy stored in `category_predictions` — extend to include `correct` per category for deeper analytics.

### Prediction Timelines
Full public prediction history on `/profile/[username]` when user opts in.

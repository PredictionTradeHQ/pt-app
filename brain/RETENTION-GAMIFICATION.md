# PT Retention & Gamification System

> **Document:** Gamification Architecture & Retention Loops
> **Phase:** Strategic Expansion v1.0
> **Date:** 2026-05-13

---

## Design Philosophy

PT gamification is built on one principle: **identity, not addiction**.

The goal is not to trap users with dopamine loops or dark patterns. The goal is to give users a reason to have a *relationship* with PT — to feel like a forecaster, not a gambler. Every gamification element should make the user feel smarter, more capable, or more recognized. Nothing should create anxiety.

**Anti-patterns explicitly avoided:**
- Loss-freak notifications ("You're losing your streak!")
- Streak freezes / streak shields (gambling mechanic)
- Leaderboard pressure (we show rank, we don't weaponize it)
- Artificial urgency (no countdown timers on badges)
- Pay-to-win or pay-to-restore mechanics

---

## Architecture Overview

### Storage Layer

All gamification state is persisted via **Zustand + localStorage** (key: `pt-gamification`).

| Why localStorage | Why not Supabase (Phase 1) |
|---|---|
| Zero latency — instant feedback | No service role key for schema migration |
| Works for logged-out users | PT is a demo — cross-device sync is Phase 2 |
| Survives refreshes and tab closes | Zustand persist is established pattern |
| Matches the demo/educational identity | |

**Phase 2 plan:** Sync gamification store to Supabase `user_gamification` table on login. Merge logic: take the max streak, union of badges.

### Store: `stores/gamification.ts`

```typescript
interface GamificationState {
  currentStreak: number          // consecutive days with ≥1 prediction
  bestStreak: number             // all-time peak streak
  lastPredictionDate: string     // "YYYY-MM-DD" UTC
  totalPredictions: number       // lifetime count
  categoryPredictions: Record<string, number>  // per-category count
  badges: EarnedBadge[]          // { id, earnedAt }
}
```

### Streak Logic

```
Today == lastPredictionDate  → no change (already predicted today)
Today == yesterday + 1       → streak + 1 (consecutive)
Else                         → streak resets to 1 (gap detected)
```

Streak is calculated in UTC to be consistent globally. A "day" is a calendar day, not a 24-hour window.

---

## Streak System

### Rules
- **Earn:** Make at least 1 prediction in a calendar day (UTC)
- **Maintain:** Predict again the following calendar day
- **Break:** Miss a day → streak resets to 1 on next prediction
- **Multiple predictions/day:** Only first prediction of the day advances the streak. All predictions count toward total + category counts.

### Visual Design

| Context | Component | Design |
|---|---|---|
| Markets sidebar | `StreakWidget variant="sidebar"` | Compact pill: 🔥 12-day streak / Best: 18d |
| Profile page | `StreakWidget variant="profile"` | Large card with 7-day dot trail |
| Market card compact | `StreakWidget variant="compact"` | Inline 🔥 12 |

**Day dots:** A 7-dot trail shows the last 7 days. Filled dots = predicted. Empty = missed. Today's dot pulses if streak is at risk.

### Retention Loop
```
User predicts → Streak increments → Sidebar shows new count
→ "Predict today to continue" prompt tomorrow morning
→ User returns → Predicts → Streak continues
→ At 3/7 days → Badge unlocks → Share moment
→ Friends see badge → Join PT
```

---

## Badge System

### Architecture

Badge definitions live in `lib/badges.ts` as a static Record. This is intentional:
- Zero API calls to display badges
- Easy to extend (add new badge, ship)
- Frontend rendering only — no backend dependency in Phase 1

```typescript
interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  rarity: "common" | "uncommon" | "rare" | "legendary"
  category?: string  // pt category id for category badges
}
```

### Badge Catalog

| Badge | Trigger | Rarity |
|---|---|---|
| 🩸 First Blood | First prediction ever | Common |
| 🔥 On a Roll | 3-day streak | Common |
| ⭐ Early Adopter | First prediction (early user signal) | Rare |
| ⚡ Hot Streak | 7-day streak | Uncommon |
| 👑 Streak Legend | 30-day streak | Legendary |
| 🤖 AI Forecaster | 5 predictions in AI & Tech | Uncommon |
| ₿ Crypto Predictor | 5 predictions in Crypto | Uncommon |
| 🏆 Sports Oracle | 5 predictions in Sports | Uncommon |
| 🎮 Gaming Analyst | 5 predictions in Gaming | Uncommon |
| 🌐 Trend Hunter | 5 predictions in Internet Culture | Uncommon |
| 🎬 Culture Analyst | 5 predictions in Entertainment | Uncommon |
| 🗺️ Market Explorer | Predicted in 3+ categories | Uncommon |
| 📊 Prolific | 25 total predictions | Rare |

### Rarity Colors
- Common: `#94A3B8` (slate)
- Uncommon: `#10B981` (emerald)
- Rare: `#6366F1` (indigo)
- Legendary: `#F59E0B` (amber)

### Badge Award Flow
1. User makes prediction → `recordPrediction(categoryId)` called in `confirmBet`
2. Store checks all badge conditions against updated state
3. Returns `newBadgeIds[]` for newly earned badges
4. `markets-app.tsx` receives array → triggers `BadgeEarnedToast`
5. Toast appears at bottom center, cycles through each badge (3s each), auto-dismisses

### Badge UI Components

| Component | Used in | Purpose |
|---|---|---|
| `BadgeCard size="md"` | Profile badges grid | Full badge card (earned/locked) |
| `BadgeCard size="sm"` | Compact profile | Small tile view |
| `BadgesGrid` | Profile page | Full grid with progress bar |
| `BadgeEarnedToast` | markets-app | Bottom notification on earn |

---

## Retention Loops

### Loop 1 — Daily Prediction Habit
```
Streak widget shows → User wants to maintain streak → Predicts → Streak increments
```
**Key moment:** Streak widget in sidebar showing "Predict today to continue" when streak is at risk.

### Loop 2 — Category Identity
```
User predicts crypto markets repeatedly → "Crypto Predictor" badge unlocks
→ Toast appears → User shares badge → PT gains social proof
→ User identifies as "crypto forecaster" → Returns specifically for crypto markets
```

### Loop 3 — Badge Completionism
```
User sees BadgesGrid on profile with locked badges → Wants to unlock more
→ Predicts in categories they haven't tried → "Market Explorer" unlocks
→ Completionism loop drives cross-category exploration
```

### Loop 4 — Milestone Moments
```
First prediction → "First Blood" badge → Toast
→ Small dopamine hit → User feels recognized
→ Makes second prediction → Streak starts
→ Day 3 → "On a Roll" badge → Loop strengthens
```

---

## Social Identity Layer

Badges are designed to become social identity markers:
- "I'm a 🤖 AI Forecaster on PT"
- "🔥 21-day streak — come challenge me"
- "Just unlocked ⭐ Early Adopter"

Phase 2: Badges visible on public profiles → shareable badge cards → creator identity on PT.

---

## Future Phases

### Phase 2 — DB Sync
- Supabase `user_gamification` table (requires service role key)
- Sync on login: merge local + remote state
- Cross-device streak continuity

### Phase 3 — Public Badges
- Badges visible on public `/profile/[username]`
- Shareable badge cards (like prediction cards)
- "Top Streakers" section on leaderboard

### Phase 4 — Outcome-Based Badges
- "Sharp" badge: 70%+ accuracy over 10+ predictions
- "Contrarian": won a bet when you were in the 20% minority
- "Called It": first to predict YES on a market that later hit 90%

### Phase 5 — Seasonal Badges
- Time-limited badges for events (World Cup, Oscars season)
- Creates urgency + collectability without dark patterns

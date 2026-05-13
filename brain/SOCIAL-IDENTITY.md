# PT Social Identity System

> **Document:** Social Identity Layer — Phase 2
> **Phase:** Strategic Expansion v2.0
> **Date:** 2026-05-13

---

## Philosophy

PT's social layer is built on one idea: **forecasters have identity, not just scores**.

A leaderboard that shows only a number produces anxiety and competition.
A social identity system that shows *who you are as a forecaster* produces belonging and pride.

The difference:
- Score-based: "You're #47 — try harder."
- Identity-based: "You're a 🤖 AI Forecaster with a 14-day streak. Your accuracy puts you in the top 30%."

---

## Architecture

### Data Layer — Phase 2 (localStorage)

All social identity data in Phase 2 is client-side first:
- **Gamification store** (`stores/gamification.ts`) — streak, badges, predictions (Zustand persist)
- **Demo users** (`lib/demo-leaderboard.ts`) — 12 realistic anchors for leaderboard backdrop
- **Real user injection** — user's live stats merged into leaderboard at runtime client-side

Phase 3 will sync gamification to Supabase and enable true cross-user social graphs.

### User Identity Model

```typescript
interface ForecasterIdentity {
  username: string           // slug derived from displayName
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  accuracy: number           // % correct (Phase 3 — from resolved markets)
  badgeCount: number
  badgeIds: string[]
  favoriteCategory: string   // highest prediction count category
}
```

---

## Leaderboard System

### URL: `/leaderboard`

Two main tabs:
1. **Forecasters** — gamification-based social ranking (primary)
2. **Flash Players** — Prediction Flash game scores (legacy, remains)

### Forecasters Leaderboard — Sort Modes

| Tab | Sort Key | Primary Value | Secondary |
|---|---|---|---|
| 🔥 Streaks | `currentStreak` desc | `🔥 42d` | `Best: 42d` |
| 🎯 Accuracy | `accuracy` desc | `67%` | `87 predictions` |
| 🏅 Badges | `badgeCount` desc | `🏅 6` | `87 predictions` |
| 📊 Activity | `totalPredictions` desc | `142` | `🔥 14 streak` |

### User Injection Logic

```
getSortedLeaderboard(sort) → DemoUser[]
↓
computeRealUserScore(sort, gamificationStore)
↓
insertAt: first position where demoScore ≤ realUserScore
↓
render with amber highlight + "YOU" badge
```

This gives a realistic "where do I stand?" experience without requiring multi-user database.

### Demo Anchor Users

12 pre-defined users covering all PT categories:
- Range: 1d to 42d streak
- Range: 50% to 71% accuracy
- Range: 1 to 8 badges
- Each has a `favoriteCategory` + emoji
- Profiles accessible at `/profile/[username]`

---

## Public Profiles

### URL: `/profile/[username]`

**Routing logic:**
1. Match username to `DEMO_USERS` array → show demo profile
2. Match username to logged-in user's slug → redirect to `/profile`
3. No match → `notFound()` (404)

**Username slug**: `displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')`

**Profile page shows:**
- Avatar (initials, rarity-colored)
- Display name + username
- Favorite category + join date
- Stats grid: Current Streak | Best Streak | Predictions | Accuracy
- Earned badges (full display, no interaction)
- Share button → `ShareAchievementModal`

**Phase 3:** Real user profiles backed by Supabase, public badge walls, follow system.

---

## Shareable Achievement Cards

### Streak Card — `/api/og/streak`

```
Params: username, streak, best, total
Output: 1200×630 PNG (edge runtime)
Design: Dark bg, amber glow, large streak number, PT branding
```

### Badge Card (future: `/api/og/badge`)

Will generate 1200×630 PNG for individual badge unlocks.

### Share Modal — `ShareAchievementModal`

Supports two achievement types:
- `streak` — shows streak card preview + share actions
- `badge` — shows badge card preview + share actions

Actions: Post on X | Copy Link | Download image

---

## Home Social Widgets

### Component: `HomeSocialWidgets`

Positioned between `LiveMarketsPreview` and `HowItWorks` on the home page.

**Left column (2/3):**
- "Top Streaks" list with 3 demo users
- Real user injected at correct rank if they have a streak
- Each entry links to `/profile/[username]`

**Right column (1/3):**
- Hot Categories — PT_CATEGORIES quick links → `/markets`
- Community Stats — prediction count, forecaster count, market count

**Design:** Dark cards, subtle borders, flame icons, medal emojis for top 3.

---

## Identity Loops

### Loop 1 — Rank Visibility
```
User predicts → Streak grows → Appears in leaderboard
→ Sees own rank → Motivated to maintain/improve
→ Predicts tomorrow → Streak continues
```

### Loop 2 — Profile Pride
```
Badge earned → Toast appears → "Share" button prominent
→ User shares streak card on X → @PredictionTrade tagged
→ Followers click link → Land on /leaderboard
→ See "You" card → Sign up
```

### Loop 3 — Completionism via Profiles
```
User views other forecaster profiles → Sees badges they don't have
→ Returns to /markets → Predicts in new categories
→ "Market Explorer" badge unlocks → Shares → Loop continues
```

### Loop 4 — Category Specialization
```
User has 🤖 AI Forecaster badge → Identity forms
→ Checks leaderboard Accuracy tab
→ Sees AI/Tech players above them → Predicts more AI markets
→ Accuracy improves → Rank climbs
```

---

## Future Phases

### Phase 3 — Real Social Graph
- Supabase `user_gamification` table synced on login
- True `/profile/[username]` for any registered user
- Follow / unfollow system
- "Followers' predictions" feed

### Phase 4 — Creator Identity
- Public prediction history visible on profile
- "Called It" moments — predictions that aged well
- Shareable prediction history card
- Creator badges for content impact

### Phase 5 — Seasonal Competition
- Weekly leaderboard resets with prize badges
- "Season Champion" — top predictor per category each month
- Time-limited badges for events (Oscars, World Cup, elections)

---

## Design Principles for Social Layer

| Principle | Implementation |
|---|---|
| Identity > Score | Show categories, badges, style — not just number |
| Pride > Anxiety | Amber "YOU" highlight, never shame-messaging |
| Belonging > Competition | Demo users feel like a community, not opponents |
| Discovery > Pressure | Leaderboard links to profiles — exploration, not FOMO |
| Sharing = Growth | Every achievement has a 1-click share to X |

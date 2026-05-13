# PT UX & Social Loops

> **Document:** UX Direction & Social Feature Design
> **Phase:** Strategic Expansion v1.0
> **Date:** 2026-05-13

---

## Design Principle

PT should feel like **scrolling a social feed, not using a trading terminal**.

Every session should have a reason to return tomorrow. Every interaction should have a social dimension — shareable, competitive, or identity-building.

---

## Current UX Assessment

| Page | Current state | Direction |
|---|---|---|
| `/` Home | Hero + live markets | Add trending feed, social proof, AI insight widget |
| `/markets` | Market list browser | Add category tabs, trending badges, AI summaries per market |
| `/demo` | Trading terminal | Evolve toward prediction card UX |
| `/dashboard` | Broker-style P&L | Simplify — focus on "prediction record" not P&L |
| `/leaderboard` | Global ranking | Add category filters, streaks, badges |
| `/profile` | Basic user profile | Add public prediction record, badges, shareable card |
| `/play` | Arcade flash game | Keep as fun entry point, add streak tracking |
| `/academy` | Course content | Add AI-generated market explanations |

---

## Key UX Features to Build

### 1. Trending Feed
**Route:** Make `/` home page dynamic with a trending market feed
**Design:**
- Card-based vertical scroll (like a social feed)
- Each card shows: category badge, market title, probability bar, volume, time remaining, trend arrow
- Trending markets float to top based on: volume + recent probability shift + time sensitivity
- Filter tabs: All | Following | [Categories]
**Why it works:** Habit loop — users check "what's trending" daily

---

### 2. Prediction Cards (Shareable)
**Trigger:** After user makes a prediction
**Design:**
```
┌─────────────────────────────────┐
│  PREDICTION TRADE               │
│  ─────────────────────────────  │
│  Will GPT-5 launch before Sep?  │
│                                 │
│  [USERNAME] says: ✅ YES         │
│  Community: 71% YES             │
│                                 │
│  Predicted on: May 13, 2026     │
│  predictiontrade.online         │
└─────────────────────────────────┘
```
**Behavior:** One-click share to X, Instagram Stories, or download PNG
**Why it works:** Organic growth — users share, friends join

---

### 3. Outcome Reveal Cards (Shareable)
**Trigger:** When a market resolves and user was correct
**Design:**
```
┌─────────────────────────────────┐
│  🎯 CALLED IT.                  │
│  ─────────────────────────────  │
│  Will GPT-5 launch before Sep?  │
│                                 │
│  [USERNAME] said: ✅ YES         │
│  Result: ✅ YES                  │
│                                 │
│  Prediction accuracy: 71%       │
│  predictiontrade.online         │
└─────────────────────────────────┘
```
**Why it works:** "I was right" is the highest-motivation share

---

### 4. Streak System
**Logic:**
- Streak = consecutive days with at least 1 prediction
- Streak breaks if no prediction in 24h
- Streak bonuses at: 7, 30, 100 days
**Display:** Visible on profile, dashboard, and leaderboard
**Notification:** "Your 7-day streak is at risk! Make a prediction today."
**Why it works:** Duolingo-proven — daily return habit

---

### 5. Badge System
**Category:** Achievement badges (permanent, displayed on profile)

| Badge | Trigger | Visual |
|---|---|---|
| First Blood | First prediction ever | 🩸 |
| Called It | First correct prediction | 🎯 |
| Streak Starter | 3-day streak | 🔥 |
| On Fire | 7-day streak | 🔥🔥 |
| Streak Legend | 30-day streak | ⚡ |
| AI Whisperer | 5 correct AI & Tech predictions | 🤖 |
| Crypto Oracle | 5 correct Crypto predictions | ₿ |
| Sports Prophet | 5 correct Sports predictions | ⚽ |
| Culture Curator | 5 correct Internet Culture predictions | 🌐 |
| Top 10 | Reach top 10 on leaderboard | 🏆 |
| Category Expert | 70%+ accuracy in a category (25+ predictions) | 💎 |
| First Predictor | Among first 10 to predict a market | ⚡ |

---

### 6. Public Profile & Prediction Record
**Route:** `/profile/[username]` (public, no auth required to view)
**Design:**
```
┌─────────────────────────────────────────┐
│  [Avatar]  @username                    │
│  Joined: March 2026 | 🔥 12-day streak  │
│  ─────────────────────────────────────  │
│  Predictions: 47  |  Correct: 31 (66%)  │
│  ─────────────────────────────────────  │
│  Top Category: AI & Tech   💎 Expert    │
│  ─────────────────────────────────────  │
│  Recent predictions:                    │
│  ✅ Will GPT-5 launch? → YES (Correct)  │
│  ⏳ Will BTC hit $120k? → YES (Pending) │
│  ❌ Oscars Best Picture → Wrong          │
└─────────────────────────────────────────┘
```
**Shareable as card:** One-click generates a shareable profile card
**Why it works:** Public accountability → motivation → content creation

---

### 7. Category Leaderboards
**Route:** `/leaderboard` with category tabs
**Design:**
- Global leaderboard (existing)
- Per-category leaderboard: AI & Tech | Crypto | Sports | Gaming | etc.
- Weekly + All-time views
- Show: rank, username, predictions made, accuracy %, streak
**Why it works:** Competition + identity ("I'm the #3 crypto predictor")

---

### 8. Market Detail Social Layer
**Route:** `/markets/[marketId]`
**New elements:**
- AI summary: "What this market is about" (2-3 sentences, plain English)
- Community sentiment: "Most active predictors are in: AI & Tech"
- Recent activity: "[12 people] predicted in the last hour"
- Prediction distribution visualization (not just %)
- Share button: generates pre-filled X post + prediction card
**Why it works:** Context reduces friction → more predictions

---

### 9. Simplified Onboarding
**Current:** Login → Dashboard (cold start)
**New flow:**
1. Welcome: "Welcome to Prediction Trade. Your $100k starts now."
2. Category select: "Pick 3 topics you care about"
3. First market: AI shows 1 recommended market from their categories
4. Prediction: Make their first prediction (guided)
5. Confirmation: "Done. You're in. Check back when [market resolves date]."
6. Profile created with first badge: "First Blood 🩸"

**Total time:** Under 90 seconds
**Why it works:** Investment before exploration → retention

---

### 10. AI Insight Widget
**Location:** Sidebar on `/markets`, widget on home
**Design:** "🤖 AI Insight — What's moving right now"
```
3 markets with significant movement in the last 24h:
→ GPT-5 Launch: +18 points (now 71% YES)
→ Bitcoin $120k: -7 points (now 44% YES)
→ Champions League: +5 points (now 61% Bayern)
```
**Updates:** Every 30 minutes (like LiveMarketsPreview)
**Why it works:** Authority signal — PT feels intelligent and real-time

---

## Social Loop Architecture

### Loop 1 — The Daily Check-in Loop
```
Notification: "Market moves" → User opens PT → Checks trending feed
→ Makes a prediction → Sees streak increment → Returns tomorrow
```

### Loop 2 — The "I Was Right" Share Loop
```
Market resolves → User was correct → Outcome card generated
→ User shares to X/Instagram → Friends see → Friends join PT
→ New users make predictions → Loop restarts
```

### Loop 3 — The Competition Loop
```
User sees leaderboard → Wants to rank higher → Makes more predictions
→ Accuracy improves → Rank rises → Profile badge unlocked
→ User shares badge → Loop restarts (brings new users)
```

### Loop 4 — The Creator Loop
```
Creator makes predictions publicly → Builds track record on PT
→ Shares prediction cards with audience → Audience follows creator on PT
→ Creator gains PT followers → Creator status drives more content creation
```

### Loop 5 — The Content Loop
```
PT posts viral market content (TikTok/X) → Viewers discover PT
→ Sign up to make prediction → Outcome resolves → PT posts outcome
→ Users share their win → New content → Loop restarts
```

---

## UX Anti-Patterns to Avoid

| Anti-pattern | Why to avoid |
|---|---|
| P&L displayed prominently | Creates loss aversion, gambling anxiety |
| Complex order books | Feels like a broker, not a game |
| Too many numbers on one screen | Cognitive overload |
| Dark patterns for retention | PT is educational, not addictive |
| Forced daily notifications | Opt-in only, not mandatory |
| Financial jargon | Every term must be explained or avoided |

---

## Responsive & Mobile-First

- All social features must work on mobile (60%+ of traffic will be mobile)
- Prediction cards generated in mobile-optimized format
- Swipe gesture on market feed (future)
- Bottom navigation bar on mobile: Feed | Markets | Predict | Profile | Leaderboard

---

## Implementation Priority

| Feature | Priority | Complexity | Impact |
|---|---|---|---|
| Shareable prediction cards | 🔴 High | Medium | Very High |
| Streak system | 🔴 High | Low | High |
| Public profiles | 🔴 High | Medium | Very High |
| Badge system | 🟡 Medium | Medium | High |
| Trending feed (home) | 🟡 Medium | High | Very High |
| Category leaderboards | 🟡 Medium | Low | Medium |
| AI insight widget | 🟡 Medium | Medium | High |
| Onboarding quiz | 🟢 Later | Medium | High |
| Outcome reveal cards | 🟢 Later | Medium | Very High |
| Market social layer | 🟢 Later | High | High |

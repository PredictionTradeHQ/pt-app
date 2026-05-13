# PT Market Categories — Architecture

> **Document:** Category System Design
> **Phase:** Strategic Expansion v1.0
> **Date:** 2026-05-13

---

## Why Categories Matter

Categories are not just filters — they are **identity anchors**. Users self-select a category and build an identity around it ("I'm a crypto predictor", "I crush gaming markets"). Categories drive:

- Content targeting (TikTok for gaming users, X for crypto users)
- Onboarding personalization (which markets to show first)
- Creator profiles (category-specific track records)
- Leaderboards (global + per-category)
- AI insights (category-specific trend context)

---

## Category Architecture

### Tier 1 — Core Categories (launch with these)

| Category | Slug | Icon | Why it works |
|---|---|---|---|
| **AI & Tech** | `ai-tech` | 🤖 | Fastest-growing audience; high virality |
| **Crypto** | `crypto` | ₿ | Highly opinionated audience; frequent outcomes |
| **Sports** | `sports` | ⚽ | Massive audience; clear outcomes; engagement spikes |
| **Gaming** | `gaming` | 🎮 | Young, digital-native; events are predictable |
| **Entertainment** | `entertainment` | 🎬 | Awards, releases, drama — all viral |
| **Internet Culture** | `internet-culture` | 🌐 | Memes, creators, viral moments — highest shareability |

### Tier 2 — Expansion Categories (add after launch)

| Category | Slug | Icon | Why it comes later |
|---|---|---|---|
| **Creators & Streaming** | `creators` | 📹 | Requires curation; builds creator economy angle |
| **Global News** | `global-news` | 📰 | Broad but less viral; needs careful framing |
| **Science & Space** | `science` | 🚀 | Niche but passionate audience |
| **Business & Startups** | `business` | 💼 | Less emotional, more analytical |

### Tier 3 — Future Categories (later phases)

| Category | Slug | Notes |
|---|---|---|
| **Climate** | `climate` | Longer time horizons |
| **Music** | `music` | Chart outcomes, album releases |
| **Health & Medicine** | `health` | Drug approvals, health milestones |

---

## Category Profiles

### 🤖 AI & Tech
**Audience:** Tech enthusiasts, AI researchers, developers, investors
**Market types:** Model launches, feature releases, company valuations, founder moves
**Example markets:**
- "Will GPT-5 be released before September 2026?"
- "Will Nvidia break $200 by end of Q2?"
- "Will Apple launch an AI model in 2026?"
**Content angle:** "The AI community is betting on..." — authoritative, forward-looking
**Virality driver:** Rapid outcomes, high stakes culturally, strong opinions

### ₿ Crypto
**Audience:** Crypto-native, DeFi adjacent, retail investors, curious mainstream
**Market types:** Price milestones, regulatory events, protocol launches, exchange events
**Example markets:**
- "Will Bitcoin hit $120k before December?"
- "Will Ethereum ETF flows exceed $1B in 60 days?"
- "Will a major exchange face regulatory action in Q3?"
**Content angle:** "The market is pricing in..." — creates authority without financial advice
**Virality driver:** Rapid price moves, 24/7 news cycle, tribal communities

### ⚽ Sports
**Audience:** Global sports fans, fantasy sports players, prediction enthusiasts
**Market types:** Championship outcomes, player performance, trade rumors, coaching changes
**Example markets:**
- "Will the NBA Finals go to 7 games?"
- "Which team wins the Champions League?"
- "Will [player] win MVP this season?"
**Content angle:** "Fans are predicting..." — community voice, not financial framing
**Virality driver:** Live events, emotional outcomes, large fanbases

### 🎮 Gaming
**Audience:** Gamers (16–30), esports fans, game industry followers
**Market types:** Game releases, esports tournaments, studio announcements, console launches
**Example markets:**
- "Will GTA 6 launch in 2025?"
- "Who wins The International Dota 2 2026?"
- "Will Xbox release a new console before 2027?"
**Content angle:** "The gaming community is calling..." — insider framing
**Virality driver:** Passionate communities, clear announcement events, long build-up payoffs

### 🎬 Entertainment
**Audience:** Pop culture enthusiasts, movie/TV fans, award season followers
**Market types:** Award winners, box office, show renewals, celebrity events
**Example markets:**
- "Will Dune 3 gross $800M globally?"
- "Which film wins Best Picture at the Oscars?"
- "Will [show] be renewed for another season?"
**Content angle:** "Hollywood insiders are saying..." — aspirational prediction
**Virality driver:** Award shows, massive cultural events, strong opinions

### 🌐 Internet Culture
**Audience:** Gen Z, TikTok/X/YouTube natives, meme culture participants
**Market types:** Viral moments, creator milestones, trend outcomes, platform events
**Example markets:**
- "Will MrBeast hit 500M YouTube subscribers by 2027?"
- "Which meme format dominates summer 2026?"
- "Will [creator] launch their own platform?"
**Content angle:** "The internet is predicting..." — meta, self-referential, shareable
**Virality driver:** Extremely high shareability, participatory culture, rapid cycles

---

## Category System in the App

### Market Card Metadata
Every market card should display:
```
[Category Badge] [Market Title]
[Probability Bar] [% Yes / % No]
[Volume] [Time remaining] [Trend indicator]
```

### Category Landing Pages (future route)
`/markets/ai-tech` → filtered view with:
- Top trending markets in category
- Category leaderboard (who predicts this best)
- Recent outcomes in category
- AI insight about category trends

### Onboarding Category Selection
New user flow: "Which topics do you follow?" → select 1-3 categories → personalized market feed

### Category Badges on Profiles
Users earn category expertise badges based on prediction accuracy per category:
- 🥉 Apprentice (10+ predictions, 50%+ accuracy)
- 🥈 Analyst (25+ predictions, 60%+ accuracy)
- 🥇 Expert (50+ predictions, 70%+ accuracy)
- 💎 Oracle (100+ predictions, 75%+ accuracy)

---

## Polymarket Category Mapping

Polymarket tags → PT categories:

| Polymarket tags | PT Category |
|---|---|
| `technology`, `ai`, `nvidia`, `apple`, `microsoft` | AI & Tech |
| `crypto`, `bitcoin`, `ethereum`, `defi` | Crypto |
| `sports`, `nba`, `nfl`, `soccer`, `tennis` | Sports |
| `gaming`, `esports`, `playstation`, `xbox` | Gaming |
| `entertainment`, `oscars`, `grammys`, `box-office` | Entertainment |
| `internet`, `social-media`, `youtube`, `tiktok` | Internet Culture |
| `politics`, `elections`, `geopolitics` | Global News |

This mapping is used by the AI content engine to auto-tag markets.

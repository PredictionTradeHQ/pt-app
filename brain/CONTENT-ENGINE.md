# PT Content Engine

> **Document:** Content System Design
> **Phase:** Strategic Expansion v1.0
> **Date:** 2026-05-13

---

## Purpose

The PT Content Engine is the system that turns prediction market data into social content automatically. Every market movement, every resolved outcome, every trending prediction is a content opportunity. This engine captures those opportunities and distributes content across TikTok, Reels, X/Twitter, and Instagram.

**Goal:** PT should feel like a media brand, not just an app.

---

## Content Strategy Overview

| Platform | Format | Frequency | Primary angle |
|---|---|---|---|
| TikTok | Short video (15–60s) | 1–2/day | Trending market + hook |
| Instagram Reels | Same as TikTok | 1/day | Visual card + reel |
| Instagram Feed | Static image | 1/day | Probability card |
| X / Twitter | Text + image | 2–3/day | Market take + poll |
| Instagram Stories | Quick update | 2–3/day | Outcome reveals |

---

## Content Types

### Type 1 — Market Hook
**Format:** Short video or X thread
**Trigger:** New trending market with high volume or big price movement
**Structure:**
1. Hook (0–3s): "This market just moved 20 points overnight."
2. Context (3–15s): "Here's what the community is predicting about [X]."
3. Probability reveal (15–25s): "Right now, 73% say YES."
4. CTA (25–30s): "What do you think? Make your prediction at predictiontrade.online"

**Example:**
> "The AI community just shifted. 73% are now betting GPT-5 launches before September.
> Two weeks ago, that number was 41%.
> Something changed. Make your call →"

---

### Type 2 — Outcome Reveal
**Format:** Video or carousel
**Trigger:** Market resolves with clear outcome
**Structure:**
1. Recap: "We asked: Will [X] happen?"
2. Community vote reveal: "67% said YES. 33% said NO."
3. Outcome: "The answer: [YES/NO]"
4. Insight: "The market was right/wrong — and here's why it matters."
5. CTA: "Next prediction is live now."

**Example:**
> "RESULT: Did Bitcoin hit $100k?
> The community said: 71% YES.
> What happened: YES ✅
> The market saw it coming. Did you?"

---

### Type 3 — Trending Market Spotlight
**Format:** Static image card or carousel
**Trigger:** Weekly editorial — manually or AI-selected top 3 markets
**Structure:**
- Market title
- Current probability
- Volume (as social proof)
- Category tag
- CTA

**Example (Instagram card):**
```
🔥 TRENDING ON PREDICTION TRADE
━━━━━━━━━━━━━━━━━━━━━━
"Will Nvidia hit $200 before Q3?"
📊 YES: 64%   NO: 36%
👥 2,847 predictions
🏷️ AI & Tech
━━━━━━━━━━━━━━━━━━━━━━
Make your call → predictiontrade.online
```

---

### Type 4 — AI Insight Post
**Format:** Text-first (X) or text card (Instagram)
**Trigger:** Significant market movement or unusual divergence
**Structure:**
- Observation: "Something interesting just happened in [market]"
- AI insight: "Our AI flagged a 15-point shift in 24 hours"
- Context: "This correlates with [recent news/event]"
- Invitation: "Are you tracking this? Join the prediction →"

---

### Type 5 — Weekly Recap
**Format:** Carousel (Instagram) or Thread (X)
**Trigger:** Every Monday
**Content:**
- Top 3 markets of the week
- Biggest probability shifts
- Last week's resolved outcomes
- Community winners (anonymized)
- What's trending this week

---

### Type 6 — "Would You Predict This?" Engagement Post
**Format:** Poll (X) or Stories poll (Instagram)
**Trigger:** On demand, 3x/week
**Structure:**
- Present a market question as a direct question to the audience
- Run a poll
- 24h later: "Here's what the PT community is saying..."
- Link to actual market

**Example (X):**
> "Quick poll: Will Apple announce an AI model at WWDC 2026?
> 🔵 YES
> 🔴 NO
> (The real market is live at predictiontrade.online — and it's interesting)"

---

## Hook Library

### Opening Hooks (use in first 3 seconds of video / first line of post)

**Urgency hooks:**
- "This market just shifted 18 points overnight."
- "Something is moving. Here's what the data says."
- "72 hours left. The community is split."

**Curiosity hooks:**
- "The internet is betting on [X]. Here's the number."
- "What do 3,000 people think will happen to [X]?"
- "The prediction market knows something."

**Outcome hooks:**
- "We asked. 2,400 people answered. Here's what they said."
- "The result is in. Did the community get it right?"
- "Final answer: YES/NO. The market called it."

**Identity hooks:**
- "Are you a crypto predictor or a tech forecaster?"
- "Only 23% got this one right. Are you in that group?"
- "Your prediction record says a lot about how you think."

---

## Caption System

### Formula
```
[Hook — 1 line]
[Context — 1-2 lines]
[Probability or outcome — 1 line]
[CTA — 1 line]
[Hashtags — 5–8 tags]
```

### Hashtag Sets by Category

**AI & Tech:**
`#AIpredictions #TechForecast #ArtificialIntelligence #Nvidia #OpenAI #PredictionTrade #Forecasting #TechTrends`

**Crypto:**
`#CryptoPredictions #Bitcoin #Ethereum #CryptoMarkets #PredictionTrade #Forecasting #CryptoTrading #BTCprice`

**Sports:**
`#SportsPredictions #NBA #NFL #Soccer #PredictionTrade #Forecasting #SportsAnalysis #GameDay`

**Gaming:**
`#GamingPredictions #Esports #GTA6 #PredictionTrade #Forecasting #GamingCommunity #GameRelease`

**Entertainment:**
`#EntertainmentPredictions #Oscars #BoxOffice #PredictionTrade #Forecasting #Hollywood #PopCulture`

**Internet Culture:**
`#InternetCulture #CreatorEconomy #PredictionTrade #Forecasting #TrendingNow #Viral #MrBeast`

---

## TikTok / Reels Structure Templates

### Template A — "The Market Says" (30s)
```
0–3s:   Hook text on screen: "The market is saying something."
3–8s:   Show market title + probability bar animation
8–18s:  Context VO: "X number of people are predicting [outcome]. Here's why this matters."
18–25s: Insight: "If you look at [trend], this makes sense because [reason]."
25–30s: CTA: "Make your prediction. Link in bio."
```

### Template B — "The Outcome" (20s)
```
0–2s:   "The result is in." (text reveal)
2–8s:   "We asked: [Market question]"
8–14s:  "The community said: YES 67% / NO 33%"
14–18s: "What happened: [RESULT]" (big text, sound effect)
18–20s: "Next prediction is live. Link in bio."
```

### Template C — "Would You Get This Right?" (45s)
```
0–5s:   Hook: "Quick question. Think carefully."
5–15s:  Present market question as a genuine question
15–25s: "Most people say [X]%. But [context]."
25–40s: Explain the nuance / why it's tricky
40–45s: "Make your own call at predictiontrade.online"
```

---

## X / Twitter Format Templates

### Thread Template — "Market Deep Dive"
```
Tweet 1: The hook (market + probability)
Tweet 2: Context — why this market exists
Tweet 3: The bullish case (YES)
Tweet 4: The bearish case (NO)
Tweet 5: What the data shows (volume, trend)
Tweet 6: Your personal take
Tweet 7: CTA — link to market
```

### Single Tweet Template
```
[Emoji] [Market question]

Current community prediction:
✅ YES: [X]%
❌ NO: [Y]%

[1 line of context]

Make your call → [link]
```

### Poll Tweet Template
```
[Market question — phrased as a question]

🔵 YES
🔴 NO

(Real market live at predictiontrade.online — numbers will surprise you)
```

---

## AI Content Workflow

### Step 1 — Market Detection
- Query Polymarket API for top markets by volume and recency
- Filter by: volume > threshold, time remaining > 24h, not resolved
- Score by: volume × recency × category virality weight

### Step 2 — Content Generation (Claude API)
Prompt structure:
```
You are a social media content creator for Prediction Trade, a social forecasting platform.
Market: [title]
Current probability: [YES%] / [NO%]
Category: [category]
Volume: [number of predictions]
Time remaining: [duration]

Generate:
1. A TikTok/Reels hook (3 seconds, max 10 words)
2. A 30-second VO script
3. An Instagram caption (hook + context + CTA + hashtags)
4. An X/Twitter tweet (max 280 chars)

Tone: Modern, social, engaging. No financial advice. Fun but smart.
```

### Step 3 — Visual Generation
- Fill prediction card template with: market title, category color, probability bar
- Generate shareable card image (1:1 for feed, 9:16 for stories/reels)

### Step 4 — Distribution
- Schedule via Buffer: Instagram Feed + Instagram Stories + YouTube Shorts
- Post directly to X (via API or manual)
- TikTok: manual or via third-party scheduler

### Step 5 — Outcome Tracking
- Monitor resolved markets
- Auto-generate outcome reveal content within 2h of resolution
- "The community got it right/wrong" → engagement spike

---

## Content Calendar Template

| Day | Format | Category | Type |
|---|---|---|---|
| Monday | Carousel | All | Weekly recap |
| Tuesday | Video (TikTok/Reels) | AI & Tech | Market hook |
| Wednesday | Static card | Crypto | Trending spotlight |
| Thursday | X thread | Sports/Entertainment | Deep dive |
| Friday | Video | Internet Culture | "Would you predict this?" |
| Saturday | Stories | All | Outcome reveals |
| Sunday | Static card | Gaming | Weekend market |

---

## Distribution Rules

- Never frame content as financial advice
- Always include "virtual / paper trading / educational" in bio
- CTA always points to `predictiontrade.online`
- All content in English (primary audience is global English-speaking)
- Spanish subtitles / captions for Latin American reach (secondary)

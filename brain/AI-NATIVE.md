# PT AI-Native Experience

> **Document:** AI-First Feature Roadmap
> **Phase:** Strategic Expansion v1.0
> **Date:** 2026-05-13

---

## Philosophy

PT should feel like it has a brain. Not a chatbot — a presence. The AI layer is ambient, contextual, and helpful. It explains things without being asked. It surfaces insights before you think to look. It makes you feel smarter for using PT.

**The AI copilot in PT is not ChatGPT embedded in a sidebar. It's intelligence woven into every surface.**

---

## AI Experience Layers

### Layer 1 — Ambient Intelligence (No interaction required)
AI works in the background, enriching the UI automatically.

| Feature | Description | Where it appears |
|---|---|---|
| Market summaries | 2-sentence plain-English explanation of any market | Market card, detail page |
| Trend indicators | "↑ Moving fast" / "🔥 Heated" labels on markets | Market list, home feed |
| Category tagging | Auto-assigns markets to categories | All market surfaces |
| Probability context | "Higher than average for this category" | Market detail |
| Outcome recaps | Auto-generated recap when a market resolves | Notification, feed |

---

### Layer 2 — On-Demand AI (User triggers)
User taps/clicks to get AI help.

| Feature | Trigger | Output |
|---|---|---|
| "Explain this market" | Button on market card | 3-sentence plain English explanation |
| "Why did this move?" | Button on probability change | AI analysis of recent movement drivers |
| "What should I consider?" | Pre-prediction prompt | 3 factors to think about before predicting |
| "AI Summary" button | Market detail page | Full AI summary: context, both sides, sentiment |
| "What happened?" | Resolved market | Narrative recap: what was predicted vs. what occurred |

---

### Layer 3 — AI Copilot (Conversational, future)
A lightweight assistant that helps users navigate PT intelligently.

| Prompt | AI Response |
|---|---|
| "What should I predict today?" | "Based on your AI & Tech interest, here are 3 active markets" |
| "How am I doing?" | "Your accuracy in Crypto is 71% — above platform average" |
| "Show me something interesting" | "This market just moved 15 points. Here's why." |
| "Explain prediction markets to me" | Contextual onboarding explanation |
| "What's the most controversial market right now?" | Surfaces most 50/50 markets |

---

## AI Feature Specifications

### 1. Market Summary Generator
**Input:** Market title + description + current probability + volume
**Output:** 2-3 sentences in plain English
**Tone:** Smart but casual — like explaining to a smart friend, not a textbook
**Avoid:** Financial language, jargon, hedge words like "potentially" overused
**Example:**
```
Market: "Will GPT-5 be released before September 2026?"
Current: YES 71% | Volume: 3,200

AI Summary:
"OpenAI has been quietly ramping up infrastructure spending and insiders 
have leaked compute cluster expansions. The community is betting GPT-5 
arrives before September — but OpenAI's history of delayed launches keeps 
30% of predictors cautious."
```

---

### 2. Movement Explainer
**Input:** Market title + 24h probability change + category
**Output:** 1-2 sentence explanation of why the market moved
**Data sources:** Market category + public context (injected via prompt)
**Example:**
```
Market: "Will Bitcoin hit $120k?"
Movement: -12 points in 24h (now 44% YES)

AI Explanation:
"The market pulled back after the Fed signaled higher-for-longer rates,
reducing risk appetite across crypto assets. Predictors are now more cautious."
```

---

### 3. Pre-Prediction Advisor
**Timing:** Shown before user submits a prediction
**Design:** Non-blocking — a small expandable panel below the prediction button
**Content:** "Before you predict, consider:"
- Factor 1: [time-sensitive context]
- Factor 2: [relevant historical pattern]
- Factor 3: [counterintuitive consideration]
**Tone:** Neutral — presents both sides, doesn't tell user what to predict
**Why it matters:** Makes PT feel like a learning tool, not just a game

---

### 4. AI Onboarding Guide
**Trigger:** First session after signup
**Flow:**
1. "Welcome to PT. I'll show you how this works."
2. "Here's a market about something you said you're interested in."
3. "This means: 71% of people think YES. Here's why that's interesting."
4. "Now — what do YOU think? Trust your instincts."
5. [User makes prediction]
6. "Done. Your first prediction is on record. We'll let you know when the result is in."
7. "Want to see what's trending?" → redirect to home feed

**Design:** Subtle overlay or step-by-step highlight tour — not a modal wall
**Skip:** Always available — "I know how this works"

---

### 5. AI-Generated Insight Cards
**Format:** Static visual card with AI-written text
**Trigger:** Editorial schedule (3x/week, auto-generated)
**Content types:**
- "Market of the Day" — AI picks most interesting market and explains why
- "Community vs. Expert" — When PT community disagrees with analyst consensus
- "Fastest Moving Market" — Biggest 24h probability shift + explanation
- "Category Spotlight" — Weekly AI summary of one category's top markets

**Distribution:** Posted to Instagram, X, and displayed in app feed

---

### 6. Outcome Narrative Generator
**Trigger:** Market resolves
**Input:** Market title + community prediction % + actual outcome
**Output:** A short narrative (3-5 sentences) that:
- Recalls what the community predicted
- States the actual outcome
- Notes whether the community was right or wrong
- Provides 1 insight about what this means
**Used for:** In-app notification, social content, email newsletter

**Example:**
```
"The community called it. 71% of PT predictors said GPT-5 would launch 
before September — and it did, with OpenAI's surprise announcement on 
August 14th. The remaining 29% were skeptical due to OpenAI's history 
of delays. This one goes in the win column for the PT community."
```

---

## AI Implementation Architecture

### Stack Recommendation
- **Model:** Claude Haiku 4.5 (fast, low cost for ambient features) / Claude Sonnet 4.6 (for quality summaries)
- **API:** Anthropic SDK (direct, no intermediary)
- **Caching:** Prompt cache on system instructions — saves cost on repeated market types
- **Rate limiting:** Server-side — 1 summary per market per 30min refresh cycle
- **Storage:** Cache summaries in Supabase — fetch from DB first, regenerate if stale

### API Route Structure
```
/api/ai/market-summary     → POST { marketId, title, description, probability }
/api/ai/movement-explainer → POST { marketId, change, context }
/api/ai/pre-prediction     → POST { marketId, category, probability }
/api/ai/outcome-recap      → POST { marketId, communityPct, outcome }
/api/ai/insight-card       → POST { type, markets[] }
```

### Prompt Engineering Principles
1. **System prompt:** Always establish PT's identity, tone, and restrictions
2. **No financial advice:** Explicit instruction in every prompt
3. **Plain English:** Explicit — "Explain as if to a curious 18-year-old"
4. **Brevity:** Max output tokens specified per feature
5. **Caching:** Static system prompt + dynamic user message → cache hits on system portion

### Cost Control
- Market summaries: cache in Supabase for 30 minutes
- Movement explainers: generate on-demand, max 1 per market per hour
- Pre-prediction advisor: generate on-demand, rate limit per user session
- Outcome recaps: generate once on resolution, store permanently
- Insight cards: batch job 3x/week, not real-time

---

## AI Roadmap

### Phase 1 — Ambient AI (foundation)
- [ ] Market summary generator (API route + Supabase cache)
- [ ] Category auto-tagger for Polymarket markets
- [ ] Trend indicator labels (rule-based, not LLM)
- [ ] Outcome narrative generator

### Phase 2 — On-Demand AI (interaction)
- [ ] "Explain this market" button on market cards
- [ ] Pre-prediction advisor panel
- [ ] Movement explainer on probability changes
- [ ] AI-powered onboarding flow

### Phase 3 — AI Copilot (conversational)
- [ ] Lightweight chat interface (not full chatbot)
- [ ] "What should I predict?" recommendations
- [ ] Performance insights ("Your accuracy in Crypto is...")
- [ ] Personalized market feed based on history

### Phase 4 — AI Content Engine (autonomous)
- [ ] Auto-generate social content from top markets
- [ ] AI-generated insight cards on schedule
- [ ] Weekly recap generation
- [ ] Outcome reveals auto-drafted for review

---

## What AI Should Never Do

- Tell users what to predict (prediction is the user's act)
- Simulate financial advice, price targets, or investment guidance
- Pretend to have real-time information it doesn't have
- Replace the social experience — AI assists, humans decide
- Generate content that sounds like gambling advice

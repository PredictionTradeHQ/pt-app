---
skill: pt-market-brief
trigger: "explain this market", "what is this about", "give me context", "what does this market mean", user is about to predict and asks for explanation
purpose: Generate a short, plain-language explanation of a prediction market before the user makes a prediction
tone: PT-TONE-GUIDE.md
---

# pt-market-brief

Generate a brief, accessible, social-first explanation of a prediction market.
Designed for someone about to make a prediction — not for financial analysts.

---

## When to activate

- User clicks "Explain this market" on a market card
- User asks what a market is about before predicting
- A pre-prediction advisor panel is shown
- User asks "should I pick YES or NO?" — respond with context, not a recommendation

---

## Input

```
market_title:          [full title of the prediction market]
market_description:    [raw description from Polymarket Gamma API] — optional
current_probability:   [e.g. 67% YES]                             — optional
end_date:              [resolution date]                           — optional
category:              [Sports / Politics / Tech / Culture / Economy / etc.] — optional
```

---

## Output format

A single paragraph of 2–4 sentences. Plain language. No bullet points. No headers.

Structure (flexible — not all parts are required every time):
1. One sentence: what is this actually about?
2. One sentence: translate the probability into plain language (if available)
3. One sentence: what makes it resolve YES vs NO (only if not obvious from the title)
4. One closing sentence: a hook that invites the user to make a call (optional, use when appropriate)

---

## Rules

- Max 4 sentences total — never more
- No financial disclaimers of any kind
- No market structure language: no liquidity, volume, contracts, settlement, spread
- Translate probabilities into human language: "67% means most forecasters currently think YES"
- Use present tense, active voice
- Treat all categories the same — even Economy or Crypto. It's about predicting an outcome, not analyzing a market
- If category is Politics: stay factual. No partisan framing, no opinion. Describe the scenario neutrally.
- If category is Crypto: do NOT use crypto/trading language. "Bitcoin reaching $X" is an outcome, not a trade.
- Never recommend YES or NO — give context, let the forecaster decide
- End with curiosity or invitation, not with analysis

---

## Tone check

Read the output aloud. Does it sound like a curious, informed friend explaining something at a coffee table?
Good — ship it.

Does it sound like a Bloomberg terminal summary, a legal disclaimer, or a financial research note?
Rewrite completely.

Reference: PT-TONE-GUIDE.md

---

## Examples

**Input:**
```
market_title: Will Elon Musk step down as CEO of X before 2027?
current_probability: 23% YES
end_date: December 31, 2026
category: Tech
```

**Output:**
This market asks whether Elon Musk will leave his role as CEO of X — formerly Twitter — before the end of 2026. Right now, most forecasters think it's unlikely: only 23% believe it happens. It resolves YES if Musk officially leaves or is removed from the CEO position. What do you think?

---

**Input:**
```
market_title: Will the Federal Reserve cut interest rates in Q3 2026?
current_probability: 58% YES
end_date: September 30, 2026
category: Economy
```

**Output:**
The Federal Reserve sets interest rates that affect borrowing costs across the US economy. This market asks whether they'll announce a cut before October 2026 — and right now, more forecasters lean YES than NO (58%). It resolves YES on any official rate cut announcement from the Fed. Where do you stand?

---

**Input:**
```
market_title: Will Argentina qualify for the 2026 FIFA World Cup?
current_probability: 91% YES
category: Sports
```

**Output:**
This market asks whether Argentina's national football team will secure a spot in the 2026 FIFA World Cup. At 91% YES, the overwhelming majority of forecasters already consider it a lock — but upsets happen. Do you agree, or do you see something others are missing?

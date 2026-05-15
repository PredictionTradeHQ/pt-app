---
skill: pt-called-it-post
trigger: "called it", "share prediction", "prediction resolved", "share this win", user asks to share a correct prediction result
purpose: Generate shareable social copy celebrating a forecaster's correct prediction
tone: PT-TONE-GUIDE.md
---

# pt-called-it-post

Generate viral, shareable copy for when a forecaster's prediction resolves correctly.
Output is ready to paste into X, Instagram, or WhatsApp.

---

## When to activate

- A prediction resolves YES or NO as the user predicted
- The Called It modal fires in the app
- The user clicks "Share" after a correct resolution
- The user says "help me share this", "write something for my win", or similar

---

## Input

Provide as many of these as available — the more context, the better the output:

```
username:          [display name or @handle]
market_title:      [full title of the prediction market]
predicted_outcome: [YES / NO]
accuracy_rate:     [e.g. 73%]   — only if the user has ≥5 resolved predictions
current_streak:    [number]     — only if streak ≥ 3
badge_earned:      [badge name] — only if a badge was just unlocked (e.g. "Sharp 🎯")
```

---

## Output format

Always produce 3 versions. Label each clearly.

### Version 1 — X / Twitter
≤280 characters. Lead with the win. Include the market topic. End with a question or hook.
No long hashtag lists. 1-2 hashtags max.

### Version 2 — Instagram
≤150 characters + hashtags on a separate line.
More visual language. Emoji ok — use sparingly (1-3 max). Hashtags at the end.

### Version 3 — WhatsApp / text
Conversational. Like texting a friend. 1-2 sentences max.
No hashtags. No emojis required.

---

## Rules

- Always celebrate the forecaster's **skill**, not luck
- Never mention money, portfolio, profit, or trading
- "Called It" is PT's signature moment — use it as the primary victory phrase
- If accuracy_rate provided: add context benchmark ("top X%" or "above average")
- If streak provided: mention it if ≥ 3 days
- If badge_earned provided: name the badge and what it signals
- All three versions must be distinct — not copy-pastes of each other
- Keep every version punchy. No long explanations.

---

## Tone check

Before outputting: read it aloud. Does it sound like celebrating a sports call? Good.
Does it sound like a brokerage app confirming a trade? Rewrite completely.
Reference: PT-TONE-GUIDE.md

---

## Example

**Input:**
```
username: Alex Rivera
market_title: Will the Lakers win the NBA Championship?
predicted_outcome: YES
accuracy_rate: 71%
current_streak: 9
badge_earned: Sharp 🎯
```

**Output:**

**X:**
Called it. Lakers win the championship — and Alex Rivera saw it coming. 9-day streak. 71% accuracy. Just unlocked the Sharp 🎯 badge. Think you can do better? predictiontrade.online #CalledIt

**Instagram:**
Called it. Lakers champs. 9-day streak, 71% accuracy, Sharp 🎯 badge unlocked. Can you beat that? predictiontrade.online
#CalledIt #Forecaster #PredictionTrade #NBA

**WhatsApp:**
Just called the Lakers winning the championship. 9-day streak, 71% accuracy. Come predict with me → predictiontrade.online

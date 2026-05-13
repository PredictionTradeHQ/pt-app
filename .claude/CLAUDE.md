# Prediction Trade — AI Instructions

## Project overview

Prediction Trade (`predictiontrade.online`) is a **social forecasting platform** — demo, educational, AI-native, creator-friendly.
Sole operator and admin: you (aventurarte.23@gmail.com). Technical decisions are made autonomously.

**Purpose:** Social forecasting, demo trading, education, content engine, creator economy.
**Positioning:** "The social platform for people who love being right about the future."
**Tagline:** "Predict. Compete. Share. Learn."

## Brain — read before any strategic or architectural session

```
brain/MASTER.md          ← read first — strategic overview
brain/VISION.md          ← platform identity and positioning
brain/MARKET-CATEGORIES.md ← category architecture
brain/CONTENT-ENGINE.md  ← content system design
brain/UX-SOCIAL-LOOPS.md ← UX direction and social features
brain/AI-NATIVE.md       ← AI-first experience roadmap
brain/GROWTH-SYSTEMS.md  ← growth loops and creator economy
brain/ROADMAP.md         ← execution roadmap by phase
```

---

## Language rules

- Talk to the user **in Spanish**
- All code, docs, comments, commits, prompts, and technical content: **English**

---

## Stack

- Next.js 16.2 App Router + TypeScript + Tailwind + shadcn/ui
- Supabase Auth + DB (project `dvevwlhshcyvnsubyvzw`)
- Vercel deploy → predictiontrade.online
- Zustand (state, with persist), Recharts, Polymarket Gamma API
- pnpm package manager

## Supabase (no CLI — use Management API directly)

- Token: in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- SQL endpoint: `https://api.supabase.com/v1/projects/dvevwlhshcyvnsubyvzw/database/query`
- Use Node `https.request` with bearer token for SQL operations

## Key decisions — do not change

- Starting balance: **$100,000** (not $10k — set everywhere: store, API, components, i18n)
- `/markets` nav always → `/markets` (NOT `/demo`)
- Polymarket API: `cache: "no-store"` — always fresh data
- LiveMarketsPreview: auto-refresh every 30s with `?_t=Date.now()`

---

## Routes

```
/              landing (public)
/markets       market browser (public)
/demo          paper trading terminal (auth required)
/play          Prediction Flash arcade (full-screen, no header/footer)
/academy       courses (public)
/dashboard     broker dashboard (auth required)
/leaderboard   public ranking
/profile       user profile (auth required)
/activity      activity history (auth required)
/help          help page
/predict/*     redirects → /markets (legacy)
/game          redirects → /play (legacy)
```

---

## Automation & AI system

PT is prepared for lightweight automation — not enterprise-level, keep it simple:

- **n8n:** relevant for future workflows (content AI, WhatsApp flows, analytics)
- **Make.com:** configured (Twilio → Claude API → Buffer pipeline, in progress)
- **Claude agents:** primary AI system for content management
- **Social:** Instagram + YouTube (predictiontrade)
- **Buffer:** connected for social publishing

Workflow notes → `../../workflows/`

---

## Ecosystem structure

```
Documents\PREDICTION TRADE\               ← PT ecosystem root
├── pt-infrastructure\pt-merged\          ← this repo (source of truth)
├── assets\investor\                      pitch, PDF, logo
├── docs\content-scripts\                 content drafts
├── workflows\                            n8n, Make.com, Twilio notes
├── published\                            published social content
└── _archive\                             legacy code and experiments
```

Mirrors PMS convention:
- `Documents\PREDICTION MARKETS SOLUTIONS\pms-infrastructure\` → PMS
- `Documents\PREDICTION TRADE\pt-infrastructure\pt-merged\` → PT

---

## Principles

- Keep it simple — PT is a demo, not enterprise software
- UX-first, content-first
- Visual, fast, modern, educational
- Do not add features speculatively
- Do not mix PT and PMS — they are separate ecosystems
- Deploy with: `npx vercel --prod` from this directory

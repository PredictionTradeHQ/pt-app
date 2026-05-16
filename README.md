# Prediction Trade — Web Platform

Social forecasting platform where users predict the future, build a public track record, and compete on the leaderboard.

**URL:** https://predictiontrade.online  
**Tagline:** Predict. Compete. Share.  
**Stack:** Next.js 16 · TypeScript · Tailwind · shadcn/ui · Supabase · Vercel

---

## What it is

Prediction Trade is a **consumer social forecasting platform**. Users predict real-world outcomes using live Polymarket data, build a reputation through accuracy and streaks, compete on public leaderboards, and share wins with shareable prediction cards — all with $100,000 in virtual funds, zero financial risk.

**Core sections:**
- `/markets` — live market browser (Polymarket data, public)
- `/demo` — prediction terminal (auth required)
- `/play` — Prediction Flash arcade game
- `/academy` — educational courses
- `/dashboard` — forecaster dashboard (auth required)
- `/leaderboard` — public ranking
- `/profile/[username]` — public forecaster profiles

---

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Required env vars** — copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Deploy

Connected to Vercel via GitHub (`PredictionTradeHQ/pt-app`).  
Every push to `main` auto-deploys. For manual deploy:

```bash
npx vercel --prod
```

---

## Infrastructure

- **Auth + DB:** Supabase (project `vkizidrsuwsreepsbbuy`)
- **Tables:** `profiles`, `wallets`, `trades`, `activity_logs`, `game_results`, `academy_progress`, `user_gamification`
- **Starting balance:** $100,000 virtual (hardcoded — do not change)
- **Market data:** Polymarket Gamma API, `cache: "no-store"`, auto-refresh every 30s

---

## Project location

```
C:\Users\Usuario\Documents\PREDICTION TRADE\
├── pt-infrastructure\pt-app\   ← this repo (source of truth)
├── assets\                      investor, branding, exports
├── docs\                        content scripts, strategy docs
├── workflows\                   n8n, Make.com, automation notes
├── published\                   published social content
└── _archive\                    legacy versions
```

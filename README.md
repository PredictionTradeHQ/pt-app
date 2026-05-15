# Prediction Trade — Web Platform

Live demo trading platform powered by real Polymarket data.

**URL:** https://predictiontrade.online  
**Tagline:** Learn Before You Earn  
**Stack:** Next.js 16 · TypeScript · Tailwind · shadcn/ui · Supabase · Vercel

---

## What it is

Prediction Trade is a paper trading simulator and educational platform. Users practice prediction market trading with $100,000 in virtual funds using live Polymarket data — zero financial risk.

**Core sections:**
- `/markets` — live market browser (Polymarket data, public)
- `/demo` — trading terminal (auth required)
- `/play` — Prediction Flash arcade game
- `/academy` — educational courses
- `/dashboard` — broker-style dashboard (auth required)
- `/leaderboard` — public ranking

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

Connected to Vercel via GitHub (`PredictionMarketsSolutions/PredictionTradeWEB`).  
Every push to `main` auto-deploys. For manual deploy:

```bash
npx vercel --prod
```

---

## Infrastructure

- **Auth + DB:** Supabase (project `dvevwlhshcyvnsubyvzw`)
- **Tables:** `profiles`, `wallets`, `trades`, `activity_logs`, `game_results`, `academy_progress`
- **Starting balance:** $100,000 virtual (hardcoded — do not change)
- **Market data:** Polymarket Gamma API, `cache: "no-store"`, auto-refresh every 30s

---

## Project location

```
C:\Users\Usuario\PredictionTrade\
├── pt-infrastructure\pt-merged\   ← this repo (source of truth)
├── assets\                         investor, branding, exports
├── docs\                           content scripts, strategy docs
├── workflows\                      n8n, Make.com, automation notes
├── published\                      published social content
└── _archive\                       legacy versions
```
trigger redeploy
test
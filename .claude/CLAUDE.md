# Prediction Trade — AI OS Instructions

> **Communication:** Always reply to the user in **Spanish**. All code, commits, docs, and comments in **English**.

---

## SESSION START PROTOCOL — "Hola PT" / "PT" / "Continúa PT"

When the user writes any of these triggers, execute this checklist **before doing anything else**:

```bash
# 1. Recent commits (what changed last)
git log --oneline -8

# 2. Working tree state (uncommitted changes or new files)
git status --short

# 3. TypeScript check (non-blocking — note errors, don't fix unless asked)
pnpm build 2>&1 | tail -20

# 4. Read brain/NEXT-SESSION.md (pending items and risks)
# 5. Read this file's ## CURRENT STATE section (latest checkpoint)
```

After running the checklist, report to the user **in Spanish**:
- ✅ Estado de Git (branch, last commit, clean/dirty)
- ✅ Estado de TypeScript (0 errors / N errors)
- ✅ Items pendientes más importantes (from NEXT-SESSION.md + CURRENT STATE)
- ✅ Suggested next action (concrete, actionable)

Then ask: "¿Continuamos con eso o tienes otra prioridad?"

---

## PROJECT IDENTITY

**Prediction Trade** (`predictiontrade.online`) is a **consumer social forecasting platform**.
Sole operator: aventurarte.23@gmail.com

- **Tagline:** "Predict. Compete. Share."
- **Hero line:** "Predict the Future. Prove You're Right."
- **Nature:** Social product. Users are **forecasters**, not traders.
- **Core loops:** Gamification → Social identity → Leaderboard → Share → Viral loop
- **GitHub:** `PredictionTradeHQ/pt-app`
- **Vercel workspace:** PT (separate from PMS workspace)

---

## ABSOLUTE SEPARATION — PT vs PMS

PT and PMS are **completely separate ecosystems**. This rule is non-negotiable.

| Dimension | PT (this project) | PMS (other project) |
|---|---|---|
| **Nature** | Consumer social platform | B2B SaaS infrastructure |
| **Path** | `Documents\PREDICTION TRADE\pt-infrastructure\pt-app\` | `Documents\PREDICTION MARKETS SOLUTIONS\pms-infrastructure\pms-core\` |
| **GitHub org** | `PredictionTradeHQ` | `PredictionMarketsSolutions` |
| **Vercel workspace** | PT workspace | PMS workspace |
| **Supabase** | `dvevwlhshcyvnsubyvzw` | separate project |
| **Domain** | `predictiontrade.online` | `predictionmarkets.market` |
| **Brand color** | social-dark UI | emerald `#10B981` |
| **Audience** | End users / forecasters | Operators / enterprises |

**Never cross these boundaries:**
- No shared code, logic, or utilities between PT and PMS
- No shared Supabase projects, Vercel projects, or GitHub orgs
- No shared branding, tone, or copy
- No adapted PMS skills for PT (and vice versa)
- Do not reference PMS from PT code or docs

---

## STACK

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.2 App Router + React 19 + TypeScript 5.7 strict |
| **Styling** | Tailwind CSS 4 + shadcn/ui + Radix UI |
| **State** | Zustand v5 with persist (localStorage) |
| **Database** | Supabase (`dvevwlhshcyvnsubyvzw`) — Auth + PostgreSQL + RLS |
| **Markets data** | Polymarket Gamma API (real-time, no-store cache) |
| **Deploy** | Vercel — auto-deploy on push to `main` |
| **Package manager** | pnpm |
| **Charts** | Recharts |

---

## CRITICAL CONSTANTS — DO NOT CHANGE

These are hardcoded throughout the codebase. Changing one breaks multiple files.

| Constant | Value | Why frozen |
|---|---|---|
| Starting balance | **$100,000** | Set in store, API, components, i18n, SEO |
| Markets nav | **`/markets`** (never `/demo`) | UX and SEO decision |
| Polymarket cache | **`cache: "no-store"`** | Always fresh data requirement |
| LiveMarketsPreview refresh | **30s + `?_t=Date.now()`** | Anti-caching strategy |
| Gamification store key | **`pt-gamification`** (v3) | localStorage key — migration required if changed |
| Zustand persist version | **v3** | Migrations from v1→v2→v3 already applied |
| Demo anchor usernames | **hardcoded in `lib/demo-leaderboard.ts`** | Profile links depend on slug stability |
| Supabase project ref | **`dvevwlhshcyvnsubyvzw`** | All API calls and env vars |
| Accuracy minimum | **≥5 resolved predictions** | Show accuracy% only when statistically meaningful |

---

## ROUTES

```
/                    Landing page — hero, live markets preview, social widgets (public)
/markets             Market browser — Polymarket data, real-time (public)
/demo                Prediction terminal — auth required
/play                Prediction Flash arcade — full-screen, no header/footer (public)
/academy             Educational courses (public)
/dashboard           Forecaster dashboard — auth required
/leaderboard         Public ranking (Forecasters tab + Flash Players tab)
/profile             Own profile — auth required
/profile/[username]  Public profile — demo anchors + real Supabase users by slug
/activity            Activity history — auth required
/help                Help page (public)
/predict/*           Redirects → /markets (legacy)
/game                Redirects → /play (legacy)

API routes:
/api/leaderboard/forecasters  — reads public_leaderboard view
/api/leaderboard/flash-players — game leaderboard
/api/wallet                   — PUT wallet balance
/api/demo-portfolio            — PUT demo portfolio
/api/ai/share-copy             — edge: share copy (templates now, Claude API when key set)
/api/og/streak                 — edge runtime OG PNG 1200×630
/api/profile/[username]        — public profile lookup (gamification data)
```

---

## SUPABASE SCHEMA

No CLI available — use Supabase dashboard for DDL. `.env.local` does **not** have `SUPABASE_SERVICE_ROLE_KEY` locally (client-side only has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Active tables (production):**
- `profiles` — display_name, avatar, bio — auto-created on auth.users insert
- `wallets` — balance $100,000 initial — auto-created on signup
- `trades` — prediction records
- `activity_logs` — user activity feed
- `game_results` — Prediction Flash scores
- `academy_progress` — course completion
- `user_gamification` — ✅ LIVE — streaks, badges, accuracy, resolved predictions
- `public_leaderboard` — ✅ LIVE VIEW — server-side accuracy_pct, readable by anon+authenticated

**Pending SQL (optional, run in Supabase dashboard):**
- `supabase/migrations/002_profiles_username.sql` — `username` column + unique index + RLS UPDATE own

---

## BRAIN FILES — read before strategic/architectural sessions

```
brain/MASTER.md              ← read first — strategic overview and positioning
brain/VISION.md              ← platform identity, narrative, and roadmap vision
brain/ROADMAP.md             ← execution phases (v2.1) — current state + next phases
brain/NEXT-SESSION.md        ← last session state + pending items (read on session start)
brain/SUPABASE-SCHEMA.md     ← schema, gamification, sync architecture
brain/UX-SOCIAL-LOOPS.md     ← UX direction, engagement, viral loops
brain/AI-NATIVE.md           ← AI-first experience roadmap
brain/GROWTH-SYSTEMS.md      ← growth loops, creator economy
brain/CONTENT-ENGINE.md      ← content system design
brain/MARKET-CATEGORIES.md   ← category architecture
```

---

## CURRENT STATE — checkpoint 2026-05-15 ✅ STABLE

**Git:** `main` clean, synced with `origin/main`
**TypeScript:** 0 errors (strict mode)
**Vercel:** ● Ready — predictiontrade.online live

**Last commits:**
```
e588e18  docs(claude): update CURRENT STATE checkpoint to be4158c
be4158c  feat(profiles): server-side category accuracy + top calls on public profiles
3891faf  feat(ux): credibility pass — real stats, honest copy, social-first framing
36babf8  docs(claude): professional CLAUDE.md with session protocol + updated NEXT-SESSION
067e3b2  docs: infrastructure migration cleanup — canonical paths updated
```

**Completed phases:**
- ✅ Phase 0 — Foundation (Next.js, Supabase, Vercel, TypeScript strict)
- ✅ Phase 1 — Social Foundation (streaks, badges, shareable cards, categories, public profiles)
- ✅ Phase 2 — Social Identity Layer (leaderboard, demo anchors, home widgets, OG images)
- ✅ Phase 3 — Supabase Sync + Real Accuracy (user_gamification live, accuracy engine, Called It)
- ✅ Phase 4a — Real Leaderboard (Supabase VIEW, #1 Spotlight, real user merge)
- ✅ Phase 4b — Real Public Profiles (slugify, RealPublicProfile, /api/profile/[username])
- ✅ Phase 4c — Market Intelligence Signals (lib/market-signals.ts, 9 signal types, $0 cost)
- ✅ Phase 4d — Social Live Feeling (ActivityTicker, StreakAtRiskBanner, CategoryAccuracy)
- ✅ Phase 4e — Viral Social Loops (Share Profile, MilestoneCelebration, hero CTA)
- ✅ Phase 4f — Bet Flow Stability (parallel API writes, custom amount, no auth disruption)
- ✅ Phase 5a — UX Polish (mobile toast, balance modal, real ticker, Called It flow)
- ✅ Phase 5b — Lightweight Onboarding (auth callback → /markets, welcome banner, nudges)
- ✅ Phase 5c — Credibility Pass (honest stats, no fake features, social-first copy, real platform stats)
- ✅ Phase 5d — Public Profile Identity (server-side category accuracy, top calls, shareable headline)
- ✅ AI Skills Layer (PT-TONE-GUIDE.md, pt-called-it-post, pt-market-brief)

**⚠️ Pending operator action — NOT a dev task:**
Run `supabase/migrations/003_public_leaderboard_predictions.sql` in Supabase dashboard:
https://supabase.com/dashboard/project/dvevwlhshcyvnsubyvzw/sql/new

Without it: category accuracy bars, "Best at X", "Biggest Calls" empty on public profiles (graceful fallbacks, no errors).
With it: all new profile sections activate instantly. No code changes needed.

**Other friction points (low urgency):**
- `supabase/migrations/002_profiles_username.sql` — optional username column, not needed yet
- Real ActivityTicker shows simulated data until real users accumulate activity

---

## STRATEGIC DIRECTION — decided 2026-05-15

**Active focus:** Social identity platform — profiles, leaderboard, shareability.
**Paused until further notice:**
- Phase 4g (AI Layer / ANTHROPIC_API_KEY) — no AI costs yet
- Phase 5 Growth — no growth push until user base is established
- Any real-money, financial, or enterprise features

PT stays a **virtual social forecasting platform**. No cost integrations. No growth hacks.

---

## PRIORITIES — next sessions

### Priority 0 — Operator action (2 min, not a dev task)
Run `supabase/migrations/003_public_leaderboard_predictions.sql` in Supabase dashboard.
URL: https://supabase.com/dashboard/project/dvevwlhshcyvnsubyvzw/sql/new
Unlocks: category accuracy bars, "Best at X", "Biggest Calls", recent predictions on public profiles.

### Priority 1 — Social / Profiles / Leaderboard polish
After migration 003 runs, evaluate what still feels incomplete in:
- Public profiles (`/profile/[username]`) — does it feel like a real identity artifact?
- Leaderboard (`/leaderboard`) — are forecasters tabs engaging and competitive?
- Own profile (`/profile`) — does it motivate sharing and returning?

Concrete candidates (evaluate in order):
1. **Leaderboard: category tabs** — "Best in AI&Tech", "Best in Crypto" — filter by top forecasters per category using `category_predictions` from `public_leaderboard`
2. **Profile: OG image for sharing** — generate `/api/og/profile/[username]` (reuse edge runtime pattern from `/api/og/streak`) so shared profile links get a rich card on X/WhatsApp
3. **Profile: empty state nudge** — when a real user's profile has no predictions yet, show a specific CTA to make their first call
4. **Leaderboard: streak leaderboard tab** — separate ranking by `current_streak` (already available in VIEW)

### Priority 2 — Shareability artifacts
- Profile share copy should include category specialty: "63% accurate in Crypto · predictiontrade.online/@username"
- Called It modal: pull category from prediction record and mention it in the share copy
- Consider `/api/og/profile/[username]` OG image (see above)

### ⏸ PAUSED — Do not start
- Phase 4g: AI Layer (ANTHROPIC_API_KEY, market summaries, "Explain this market")
- Phase 5: Growth (trending feed, content engine, Product Hunt)
- Migration 002: username column (not needed yet)

---

## DEPLOY WORKFLOW

```bash
# 1. TypeScript check (required before deploy)
pnpm build

# 2. Push to GitHub (triggers Vercel auto-deploy)
git add <files>
git commit -m "type(scope): description"
git push

# 3. Manual deploy if needed
npx vercel --prod

# 4. Verify production
# Open predictiontrade.online — check key pages load
```

**Commit convention:** `type(scope): description`
- `feat(auth):` / `feat(leaderboard):` / `feat(ux):`
- `fix(wallet):` / `fix(profile):`
- `docs(brain):`

---

## TONE & VOICE

Read `.claude/PT-TONE-GUIDE.md` before generating any copy, AI output, or skill content.

**PT sounds like:** "You called it. 7 days in a row." "Only 4% hit this streak."
**PT does NOT sound like:** "Portfolio P&L", "leverage", "settlement", "contracts"

Core test: *"Does this make the user feel like a skilled person in a community, or like a trader in a market?"*

---

## AI SKILLS

| File | Trigger | Purpose |
|---|---|---|
| `.claude/skills/pt-called-it-post.md` | User wants to share a correct prediction | Viral copy for X, Instagram, WhatsApp |
| `.claude/skills/pt-market-brief.md` | "Explain this market" | 2–4 sentence plain-language market summary |

**Never adapt or reuse PMS skills for PT.**

---

## KEY FILES INDEX

| What | File |
|---|---|
| Gamification store (Zustand v3) | `stores/gamification.ts` |
| Supabase sync (push/pull/merge) | `lib/supabase-sync.ts` |
| Badge definitions | `lib/badges.ts` |
| Category system | `lib/categories.ts` |
| Market signals (rule-based) | `lib/market-signals.ts` |
| Share copy engine | `lib/share-copy.ts` |
| Demo anchor data | `lib/demo-leaderboard.ts` |
| URL slug utility | `lib/utils.ts` → `slugify()` |
| Forecasters leaderboard UI | `components/leaderboard/forecasters-leaderboard.tsx` |
| Real forecasters API | `app/api/leaderboard/forecasters/route.ts` |
| Public profile page | `app/profile/[username]/page.tsx` |
| Called It modal | `components/called-it-modal.tsx` |
| Leaderboard climb toast | `components/leaderboard-climb-toast.tsx` |
| First prediction guide | `components/onboarding/first-prediction-guide.tsx` |
| OG image route (edge) | `app/api/og/streak/route.tsx` |
| AI share copy route (stub) | `app/api/ai/share-copy/route.ts` |
| SQL migration (gamification) | `supabase/migrations/001_gamification.sql` |
| SQL migration (username, pending) | `supabase/migrations/002_profiles_username.sql` |

---

## PRINCIPLES

1. This is a social consumer product — keep it simple, UX-first, visual, fast
2. Do not add features speculatively — ship and validate
3. Always run `pnpm build` before deploying — TypeScript strict is non-negotiable
4. PT and PMS are separate ecosystems — never mix them for any reason
5. localStorage is source of truth; Supabase is sync layer (offline resilience preserved)
6. Demo anchor users are a permanent UX pattern — do not remove them
7. Accuracy requires ≥5 resolved predictions before displaying a percentage
8. Polymarket API always fetches fresh — never cache market prices

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
| **Supabase** | `vkizidrsuwsreepsbbuy` | separate project |
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
| **Database** | Supabase (`vkizidrsuwsreepsbbuy`) — Auth + PostgreSQL + RLS |
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
| Supabase project ref | **`vkizidrsuwsreepsbbuy`** | All API calls and env vars |
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
/api/wallet                   — PUT wallet balance
/api/demo-portfolio            — PUT demo portfolio
/api/ai/share-copy             — edge: share copy (templates now, Claude API when key set)
/api/og/streak                 — edge runtime OG PNG 1200×630
/api/profile/[username]        — public profile lookup (gamification data)
```

---

## SUPABASE SCHEMA

No CLI available — use Supabase dashboard for DDL. `.env.local` does **not** have `SUPABASE_SERVICE_ROLE_KEY` locally (client-side only has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Active tables (production) — verified 2026-05-15:**
- `profiles` — ✅ exists (auth trigger on signup)
- `wallets` — ✅ exists (+ UPDATE policy added by migration 004)
- `demo_portfolios` — ✅ created by migration 004 (bet positions + activity)
- `user_gamification` — ❌ NOT CREATED — migration 001 was never run
- `public_leaderboard` VIEW — ❌ NOT CREATED — depends on user_gamification
- `trades`, `activity_logs`, `game_results`, `academy_progress` — unverified (likely exist from initial setup)

**Pending SQL — run in this order:**
1. `supabase/migrations/001_gamification.sql` — ⚠️ BLOCKER for leaderboard, streaks, badges, accuracy. Creates `user_gamification` + `public_leaderboard` VIEW.
2. `supabase/migrations/003_public_leaderboard_predictions.sql` — extends VIEW with `predictions` column (run after 001)
3. `supabase/migrations/002_profiles_username.sql` — optional, adds indexed username column

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

## CURRENT STATE — checkpoint 2026-05-17 ✅ STABLE (observation phase)

**Git:** `main` clean, synced with `origin/main` (HEAD `54d3109`)
**TypeScript:** 0 errors (strict mode) — `pnpm build` ✓ Compiled successfully in 3.1s
**Vercel:** auto-deploy on push to main, predictiontrade.online (apex → www 307 redirect active). Brand fix "Prediction Trade" confirmed live in HTML post-CDN propagation.
**Supabase:** project `vkizidrsuwsreepsbbuy` — all migrations applied (000, 001, 003, 004, 007)
**Follow System v1:** LIVE end-to-end. `public.follows` table live. Organic follows: 0 (observation phase intact).
**Active mode:** 🟢 **Observation/polish.** Do NOT open new sprints or expand surface area without operator confirmation.

**Last commits (this session — Forecaster Identity Alignment Pass A+B+C + Quality & Identity Audit Pass + Profile Identity B1–B5 + Game Feel Sprint #1 Bloque 1):**
```
54d3109  fix(dashboard): align home greeting and CTAs to forecaster identity
a521d0e  fix(auth): align signup/login dictionary to prediction vocabulary
74fbdcd  fix(why-us): reframe advantages section to forecaster identity
787dbb9  fix(how-it-works): reframe landing pillar to forecaster identity narrative
3cf2ac4  docs(claude): session close 2026-05-17 — Quality & Identity Audit Pass LIVE
f38e286  docs(brain): log Quality & Identity Audit Pass — 12 commits 2026-05-17
dca9407  fix(public-profile): stack header actions on mobile to prevent overflow
afddcf5  fix(app-shell): tighten mobile bottom nav for narrow screens
fc9b9a8  fix(leaderboard): replace "traders" with "players" in Flash empty state
3a5c0fa  fix(hero): localize social proof line and CTA for ES users
b80e765  fix(prediction-history): localize labels and use locale-aware dates
5040590  fix(follow-button): localize labels, count noun, and error toast
ece9aad  fix(modals): localize celebration & share surfaces for ES users
26ca9c4  fix(header): use t() for nav items and reframe primary CTA
5f06c54  fix(footer): drop redundant link and neutralize trading-app legalese
8ca05cb  fix(metadata): align page descriptions with PT forecaster identity
619733d  fix(profile): default display name "Trader" -> "Forecaster"
4c76d91  fix(auth): align brand to "Prediction Trade" + localize Email label
c85174c  docs(brain): session close 2026-05-17 — Profile Identity B1-B5 + Game Feel #1 B1 LIVE
e8284f9  feat(profile): Called It celebration layer v1 (T1+T2+T3)
```

**Sprints shipped this session:**
- ✅ **Profile Identity Completeness B1–B5** — shared headline + stats grid + biggest calls + share-on-X button + copy alignment (Forecaster identity, prediction vocab, identity-surface subtitle). 5 commits, all `pnpm build` clean, all smoke 8/8.
- ✅ **Game Feel Sprint #1 — Bloque 1** — Called It celebration layer v1 (T1 arrival ring + T2 "Just called" highlight + T3 batch context pill). 1 commit, 3 files, +37/−6, 0 deps, 0 keyframes, 0 migrations. Reversible with `git revert e8284f9`.
- ✅ **Quality & Identity Audit Pass** — 12 surface-by-surface commits (brand, profile fallback, page metadata, footer cleanup, header t() consistency + primary CTA reframe "Predict / Predecir", 4 modals localized ES, FollowButton ES, PredictionHistory ES + locale-aware dates, hero social proof ES, Flash empty state, mobile bottom nav, public profile mobile actions overflow). Build clean each, smoke 8/8 green post-push, brand fix verified in production HTML. Every commit is a clean `git revert` if needed.
- ✅ **Forecaster Identity Alignment Pass — A+B+C** — 4 commits closing the perception gap between logged-out funnel (was still selling "trading simulator → graduate to Polymarket") and logged-in product (already delivering forecaster identity). A1 reframes `how-it-works` landing pillar (eyebrow, title, intro, 3 steps). A2 reframes `why-us` advantages (eyebrow, title, intro, 5 of 6 features incl. replacing "Ready for Real Trading?" with "Public Profile"). B reworks 13 strings in the auth dictionary (EN+ES, 7 keys × 2 langs minus already-clean `benefitBalance` ES). C polishes 4 strings in active `dashboard-home.tsx` (Trader→Forecaster fallback, CTA "Predict", "Top forecasters" header, empty state "make your first call"). Build clean each, smoke 6/6 green post-push, new copy verified live in production HTML, old copy confirmed absent. Reversible with 4 clean `git revert`s.

**🟢 OBSERVATION CRITERIA (do not iterate before these signal):**
- How resolving multiple predictions actually feels
- Whether `"Just called"` improves continuity
- Whether the T1 pulse is subtle enough (not too visible)
- Whether the T3 batch pill adds real clarity
- Any sign of "too gamified" creeping in
- (Follow System) any organic follow happening
- (Audit) any leftover identity inconsistency the operator spots in real use

**DO NOT auto-propose:**
- Game Feel Sprint #1 Bloque 2 (G4 multi-surface triggers, hot takes, progression rings, rank delta, more animations)
- Activity Feed (Camino B) — still gated on ≥1 organic follow
- AI Layer (Phase 4g), Growth (Phase 5), or any new economy/coins/XP/levels
- Anything resembling sound, haptics, particles, screen-shake
- Another audit pass — wait for operator request after living with current state

**Audit findings status (post Alignment Pass A+B+C 2026-05-17 — documented in brain/NEXT-SESSION.md):**
- ✅ RESOLVED — Auth dictionary keys (`virtualFundsNotice`, `createAccountNotice`, `benefitBalance`, `benefitPractice`, `verifyEmailHelp`, `signUpDescription` + `loginDescription`) aligned to prediction vocabulary in commit `a521d0e`.
- ✅ RESOLVED — `how-it-works.tsx` landing pillar copy reframed in commit `787dbb9`. `why-us.tsx` advantages reframed in `74fbdcd`.
- ✅ PARTIAL — Dashboard `dashboard-home.tsx` greeting + 4 high-visibility strings aligned in commit `54d3109`. The deeper `/dashboard` architectural rework (whether it's a forecasting dashboard or wallet style) is still deferred.
- ⏸ DEFERRED — `app/auth/error/page.tsx` server-component hardcoded EN strings (architecturally separate localization fix)
- ⏸ DEFERRED — Academy content (legitimate trading-vocabulary educational content)
- ⏸ DEFERRED — SEO metadata in `app/layout.tsx` (deliberate top-of-funnel keyword targeting)
- ⏸ DEFERRED — Dead-code purge (4 components confirmed never rendered: `trading-panel.tsx`, `dashboard/dashboard-client.tsx`, `demo-dashboard.tsx`, `rise-in-leaderboard.tsx`)

**Completed phases:**
- ✅ Phase 0 — Foundation (Next.js, Supabase, Vercel, TypeScript strict)
- ✅ Phase 1 — Social Foundation (streaks, badges, shareable cards, categories, public profiles)
- ✅ Phase 2 — Social Identity Layer (leaderboard, demo anchors, home widgets, OG images)
- ✅ Phase 3 — Supabase Sync + Real Accuracy (gamification store, accuracy engine, Called It)
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
- ✅ Phase 5e — Core Loop Stability (new Supabase project, all migrations applied, verified in production)

**✅ SUPABASE SCHEMA — verified 2026-05-16 (new project `vkizidrsuwsreepsbbuy`):**
- `profiles` — ✅ exists (auth trigger on signup)
- `wallets` — ✅ exists + RLS policies (migration 000)
- `demo_portfolios` — ✅ exists + RLS policies (migration 004)
- `user_gamification` — ✅ exists + RLS policies (migration 001)
- `public_leaderboard` VIEW — ✅ exists WITH `predictions` column (migrations 001 + 003)

**No pending migrations.** All tables and views are live. Core loop verified end-to-end.

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

### Priority 0 — ✅ COMPLETE: all Supabase migrations applied (2026-05-16)
All tables live in new project `vkizidrsuwsreepsbbuy`. No pending operator actions.

### Priority 1 — ✅ RESOLVED: bet persistence bug (commit e9e675c)
Root cause: `demo_portfolios` table never existed → PUT /api/demo-portfolio silently 500'd on every bet.
Fix: migration 004 creates `demo_portfolios` + RLS; `persistPortfolio()` now logs errors.
Operator must confirm migration 004 was applied (user confirmed ✅ 2026-05-15).

### Priority 2 — Full end-to-end verification (do this at next session start)
Login → make a prediction → refresh page → confirm balance + positions persisted → leaderboard → public profiles.
Goal: confirm the full core loop is stable after bet crash fix + login fix.
**Specific test:** user with existing bets → login → make new bet → positions tab renders without crash.

### Priority 3 — Social / Profiles / Leaderboard polish
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

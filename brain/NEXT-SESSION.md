# NEXT SESSION START HERE

> Last updated: 2026-05-17 (Arcade Containment B1 LIVE — D1 strict, dashboard lock preserved; prior Shareability Polish Pass LIVE + Arcade audit; prior Observation mode locked post Identity Cohesion Pass II) | Read this before touching anything.

---

## 🆕 Arcade Containment B1 — LIVE 2026-05-17 (this session, D1 strict scope)

Operator-confirmed direction after reading the Shareability + Arcade audit: ship B1 surgical containment with the D1 strict variant — **dashboard lock preserved, no P1 chip-painting, no T1 indirect open**. Goal: isolate `/play` from PT's identity surfaces without touching the arcade gameplay, stores, APIs, or Supabase tables. Preserves optionality for B2 (Forecaster Instinct rework) or B3 (kill `/play`) as future thesis-grade moves.

3 small reversible commits, `pnpm build` clean, pure cleanup (~30 lines added, ~204 lines removed). No new files, no new dependencies, no migrations, no API changes.

| # | Commit | Surface | What shipped |
|---|---|---|---|
| 1 | `5ade016` | `components/leaderboard/leaderboard-page-client.tsx` | Drops the dual-tab switcher ("Forecasters" + "Flash Players") on `/leaderboard`. Page now renders `<ForecastersLeaderboard />` directly under the existing forecaster-aligned title + subtitle. The `LeaderboardClient` component (Flash leaderboard renderer) is **preserved as a dead-import** — file stays on disk, no consumers, but optionality intact if `/play` later wants to embed it. 1 line added / 65 dropped. |
| 2 | `8d6855a` | `app/activity/page.tsx` + `components/activity/activity-client.tsx` | Drops the `game_results` server fetch (only `demo_portfolios.activity` is now queried). Drops the `games` prop, the 3-tab switcher (All / Games / Trades), the cross-source flatten, the game `ActivityRow` branch with WIN/LOSS chrome, and the "or play a game" wording in the empty state (EN + ES). Feed is now trade-only. `game_results` table itself is **preserved** — `/play` still writes to it on each round. 26 lines added / 137 dropped. |
| 3 | `e881038` | `app/play/page.tsx` | Softens metadata away from esports framing. Description: "Ultra-fast ranked prediction game. 7 seconds. One tap. Rise from Bronze to Master." → "A quick-tap reaction sidequest. Real forecasting lives on /markets." OG description similarly reframed. **Title kept as `Prediction Flash — PredictionTrade`** (brand-correct). 2 lines added / 2 dropped. |

**Build:** `pnpm build` ✓ clean (TS strict, 0 errors). Compiled in 2.9s, 33/33 static pages.
**Sync:** main ↔ origin/main `0/0`. HEAD `e881038` (was `5ac5616` after Shareability + brain doc).

### Identity surface state post-B1

| Surface | Before | After |
|---|---|---|
| `/leaderboard` | 2 tabs (Forecasters + Flash Players co-equal) | Single forecaster ranking, no arcade legitimization |
| `/activity` | Mixed feed (game WIN/LOSS rows + trades) | Trade-only feed |
| `/play` metadata | "Ultra-fast ranked prediction game… Bronze to Master… Solo, Ranked, 1v1" | "Quick-tap reaction sidequest. Real forecasting lives on /markets." |

The arcade is now **structurally isolated** from PT's identity layer. A visitor moving through `/`, `/markets`, `/leaderboard`, `/profile`, `/activity` no longer encounters the casino-esports skin in any of those surfaces. `/play` remains accessible (via header nav, dashboard quick-action, footer) but is framed as a sidequest, not as parallel reputation.

### What B1 deliberately did NOT touch (D1 strict)

| Surface | Reason |
|---|---|
| `components/dashboard/dashboard-home.tsx` | **T1 lock active.** Dashboard still serves wallet+Flash (Win rate card, Recent activity card with WIN/LOSS rows, Top forecasters↔Flash data mismatch card P1, "Play Flash" quick-action button, "Game" quick-action tile). Operator chose D1 explicitly: chip-painting the P1 label would not resolve the real mismatch, only mask it. Dashboard waits for T1 re-open trigger (repeated organic signals during real use). |
| `components/arcade/arcade-screen.tsx` | Gameplay UI untouched. Bronze→Master ranks, RP, XP, Daily Challenges, "BUY UP / SELL DOWN", "LONG / SHORT", `#00ff88` / `#ff3366` / `#ff00ff` esports palette — all stay. B2 (Forecaster Instinct rework) is the path that would replace this. |
| `stores/arcade-game.ts` | Game mechanic intact (Brownian-motion price ticker, modes, matchmaking shell). |
| `app/api/game/leaderboard/route.ts` + `app/api/game/save/route.ts` | APIs alive. Still serve internal `/play` reads (and the dashboard "Top forecasters" mismatch card, which we deliberately did not touch). |
| `game_results` Supabase table | Not dropped. Preserves user data + optionality for B2/B3. |
| `components/leaderboard/leaderboard-client.tsx` | Dead-import after this pass (no consumers). NOT deleted — optionality preservation. |
| `components/game/*` (5 archivos dead code from before) | Still dead, still not deleted. Separate cleanup pass. |
| `components/markets-app.tsx` (bet flow) | T3 lock active. |
| `/markets` desktop sidebar (Trading Control Panel) | T2 lock active. |
| `lib/share-copy.ts`, `/api/og/*`, called-it modal | Premium per audit. Just shipped Shareability Pass. |
| home / hero / landing surfaces | No Flash references to clean. |
| Supabase schema | Zero DB ops in B1. |

### Forward paths (NO action without explicit operator go)

- **B2 — Rework `/play` to "Forecaster Instinct"** (sprint-sized). Convert from Brownian-motion arcade to pre-resolved Polymarket prediction puzzles, scored on calibration + contrarian-correctness vs the crowd. Drops Bronze→Master / RP / XP / Daily Challenges / 1v1 / LONG-SHORT / casino palette. Requires: historical resolved-markets dataset, calibration scoring (Brier-score lite), full UX redesign. **~1-2 sessions.** Now framed as future thesis, not immediate sprint.
- **B3 — Kill `/play` entirely.** Redirect to `/markets`, drop `game_results` table, drop `stores/arcade-game.ts`, drop `app/api/game/*`. Cleanest move. Most destructive. Operator declined this path explicitly this session.
- **P1 polish — Dashboard "Top forecasters" mismatch** — operator declined relabel ("chip-painting that does not resolve the real problem"). Will resolve naturally when T1 reopens.

### Why B1 D1 was the correct move (operator's framing)

Operator: "El problema no es que exista un game layer, sino que todavía transmite demasiada energía: flash game, trading simulator, disconnected side-mode. Así que la dirección correcta por ahora probablemente es B1 containment quirúrgico. Objetivo: aislar /play del núcleo identitario de PT, sin destruir optionality futura."

B1 D1 = containment, not pseudo-resolution. Dashboard remains a legacy hybrid temporal. T1 stays clean as a thesis trigger.

### Taste-level risks to observe (NO action)

- `/leaderboard` now single-render — feels lighter, less product surface. Observe if it reads as "less product" rather than "more focused".
- `/activity` empty-state may dominate for users without trades yet. Empty state copy now says "Make your first call to build your history" — observe if it lands as motivating or empty.
- `/play` metadata softer than before. Observe if it changes any session entry behavior (sessions starting from /play instead of /markets).
- Dashboard remains uncovered — observe if the contradiction sharpens or stays flat. This is the T1 signal trigger.

**🟢 Observation mode resumes immediately post-B1.** No further moves on the arcade frontier without explicit operator direction.

---

## 🆕 Shareability Polish Pass — LIVE 2026-05-17 (this session)

Operator-directed session focused on visual / emotional / shareability polish, with an explicit reframe: "no new systems, no gamification layers, no feature creep — better feeling, better presentation, more identity, more pride, more emotional coherence." Two parallel audits ran first (visual polish + shareability surfaces; arcade `/play` conceptual fit) before any code moved. The visual audit landed a single high-leverage gap: **PT had no canonical OG image route for its flagship share moment ("Called It")** — every share emitted plain text + a domain link with no rich preview on X/WhatsApp. This pass closed that gap and added a self-preview so users see the artifact before committing.

3 small reversible commits, `pnpm build` clean, additive only — zero deletions, zero migrations, zero new deps.

| # | Commit | Surface | What shipped |
|---|---|---|---|
| 1 | `46c2332` | `app/api/og/called-it/route.tsx` (new) | Edge runtime, 1200×630 PNG share card. Mirrors `/api/og/streak` + `/api/og/profile/[username]` patterns: dark canvas, category-tinted radial glow, PT brand top-left, optional "🎲 Against the crowd" contrarian pill top-right, big CALLED IT eyebrow in accent, market title (truncates above 80 chars), "I said YES/NO" pill colored by call, identity stats row (accuracy in specialty + streak), footer with `@username` + `predictiontrade.online`. All params optional; renders meaningful states for any subset. |
| 2 | `b25e133` | `components/called-it-modal.tsx` | Builds an `ogPreviewUrl` from the same identity params already driving share-copy (marketTitle, prediction, isContrarian, accuracyPct, category) and renders the upcoming `/api/og/called-it` card inline as a 1200/630-aspect thumbnail above the X / WhatsApp / Copy buttons. Users now see exactly what the share will look like before they click. No props added — fully additive at the call site. |
| 3 | `e06c5cd` | `components/live-markets-preview.tsx` | Cosmetic consistency: post-hero social-proof strip used hardcoded `bg-green-400` / `text-green-400` (one-off bright green vs the brand emerald `--primary`). Switched to `bg-primary` / `text-primary` so the live indicator + count read in the same color system as the rest of the page. Pure visual, no logic change. |

**Build:** `pnpm build` ✓ clean (TS strict, 0 errors) on every commit. `/api/og/called-it` confirmed registered in route map alongside `/api/og/profile/[username]` and `/api/og/streak`.

**Sync:** main ↔ origin/main `0/0`. HEAD `e06c5cd` (was `6857ba2`).

**What this gives the product:**
- The most emotional share moment in PT (Called It) now has a canonical share card. Even though the tweet body still routes to `predictiontrade.online` (the canonical per-call URL is a separate sprint — see deferred below), the OG route is now in place and reusable.
- Users see the share artifact pre-flight. Confidence-builder for the share decision.
- The brand-emerald palette is one tighter across the homepage.

**What it does NOT do (explicit scope discipline):**
- Does NOT create a canonical per-call URL (e.g. `/calls/[username]/[predId]`). That's the bigger leverage move and is sprint-sized (page + metadata + Supabase data shape + visit-time auth/RLS). Documented below as deferred.
- Does NOT touch `share-achievement-modal.tsx`. That modal already hand-renders an in-modal preview (lines 92-148); duplicating with the OG image would be a regression. Confirmed already premium per audit.
- Does NOT touch the OG image used by Twitter card on a shared profile URL (`generateMetadata` in `app/profile/[username]/page.tsx` already wires `/api/og/profile/[username]` correctly — verified during audit).
- Does NOT touch hero, leaderboard rows, accuracy display, prediction card, OG streak, badge colors, or any other surface flagged as already-premium by the visual audit.

**Taste-level risks to observe (NOT acting on):**
- The new in-modal preview adds a 1200×630 image render on every Called It modal open. Edge runtime is fast (~200-400ms) but it's a network round-trip the modal didn't have before. Observe whether the modal feels less snappy. If yes, add `loading="lazy"` (currently `eager` because the modal is just-opened) or pre-decode.
- The OG card's "I said YES/NO" pill is colored by call (YES → accent emerald, NO → red `#EF4444`). Red on a celebration card may read fintech. Observe in real shared artifacts.
- The contrarian "🎲 Against the crowd" pill uses `#FB923C` orange. New color in PT's OG palette. Observe if it lands as rarity-signal or as random color noise.

---

## 🟡 Arcade `/play` conceptual audit — findings documented, NO action this session

Operator opened the session with a second explicit priority: **rework the "jueguito"** because it still drags PT toward "simulator / flash game / casino / disconnected side-mode" energy. A deep audit ran in parallel with the visual audit. Findings below — **NO code changed for the arcade this session**. Operator declined to choose between containment vs. rework vs. kill paths, so this section is purely the documented audit + the three forward paths, ready to resume when operator confirms direction.

### What `/play` actually is today

- Page `app/play/page.tsx` mounts `components/arcade/arcade-screen.tsx` (not `components/game/*` — that directory is **dead code**, no importers anywhere in the codebase; safe to delete in a future cleanup).
- Store `stores/arcade-game.ts` drives a Brownian-motion price ticker game. Modes: Solo / Ranked / 1v1. Bronze→Master rank system with `RP` (rank points). XP + Level system. Daily challenges. `vsOpponent` matchmaking.
- Vocabulary: "BUY UP / SELL DOWN" buttons, "📈 LONG / 📉 SHORT" position chips, "🚀 / 💀" win/loss emojis, hardcoded esports palette (`#00ff88`, `#00ccff`, `#ff00ff`, `#ffb800` — all hex, none from design tokens).
- Mechanic: random Brownian price (no signal, pure noise). 50/50 outcome by design.
- Persistence: results write to Supabase `game_results` table with `profit_pct`, `won`, `position`, `entry_price`, `exit_price`, `duration`.

### How it contaminates identity surfaces

1. **`/leaderboard`** — `leaderboard-page-client.tsx:27-33` shows "Flash Players" tab co-equal with "Forecasters" tab. Visually legitimizes Flash as parallel reputation.
2. **`/activity`** — `activity-client.tsx:151-189` renders game rows (`Prediction Flash WIN/LOSS +X.XX%`) mixed with real prediction trades in the same feed. Users may mistake game results for prediction results.
3. **`/dashboard`** — `dashboard-home.tsx` "Top forecasters" card pulls from `/api/game/leaderboard?sort=profit` (already in polish backlog as P1). Label says forecasters, data is arcade-game profit. Semantic mismatch.

### Three forward paths (operator-pending)

- **B1 — Surgical containment.** /play stays accessible but stops bleeding into identity surfaces. ~4 commits:
  - Drop the "Flash Players" tab from `/leaderboard` (only Forecasters remains).
  - Drop the "Games" filter tab + game rows from `/activity` (only predictions / trades remain).
  - Re-label or remove the dashboard "Top forecasters" card (the P1 polish item resolves here too).
  - Soften `/play` metadata away from "Solo, Ranked, 1v1. Fastest prediction game on the internet" toward sidequest-neutral copy.
  Result: `/play` becomes a disconnected sidequest accessible via direct nav. Identity surfaces stop legitimizing it. Each commit is a clean `git revert`.

- **B2 — Rework `/play` to "Forecaster Instinct"** (sprint-sized, do not start without B1 shipped first and observation period). Convert from Brownian-motion arcade to actual forecasting puzzles: pre-resolved Polymarket markets with hidden outcome, user predicts YES/NO before reveal, scored on calibration + contrarian-correctness vs the crowd. Drops: Bronze→Master, RP, XP, Daily Challenges, 1v1, LONG/SHORT, casino palette. Requires: historical resolved-markets dataset, calibration scoring (Brier-score lite), full UX redesign. ~1-2 sprints.

- **B3 — Kill `/play` entirely.** Redirect `/play` → `/markets`, drop the `game_results` table, drop `stores/arcade-game.ts`, drop `app/api/game/*`. Cleanest narrative move. Most destructive.

### Why no action this session

Operator's session brief was crystal clear on restraint discipline. The shareability frontend (Frente A) was additive, cero-destructive, and high leverage — easy decision. The arcade decision is destructive (B1 deletes visible features, B3 deletes infrastructure) and operator hasn't selected which path. Documented here so the resume point is exact.

---

## 🔒 Observation mode locked — 2026-05-17 (post Identity Cohesion Pass II)

After shipping Identity Cohesion Pass II (5 commits) and producing a deep end-to-end observation report on dashboard tone, leaderboard semantics, profile pride, Biggest Calls impact, density desktop/mobile, and P&L-centric metric residuals, the operator made an explicit lock decision. Identity passes are done for now; the product needs to breathe.

### Five "no touch" rules (active until repeated organic signal)

1. **NO open T1** — Dashboard identity conversion (`/dashboard` reframe from wallet/Flash to forecaster cockpit, pulling from gamification store).
2. **NO new sprint**.
3. **NO touch on dashboard** (`components/dashboard/dashboard-home.tsx`).
4. **NO touch on bet flow** (`components/markets-app.tsx` — "Buy Yes/No", `wagered`, "My Bets", portfolio summary).
5. **NO touch on sidebar architecture** (Trading Control Panel desktop sidebar on `/markets`).

### Deferred candidates from observation report (DO NOT auto-propose)

- **T1 — Dashboard identity conversion** — thesis-grade. The deepest residual: Layer 3 (`/dashboard` data sources) still serves wallet + Flash game leaderboard under a "Forecaster" header, while `/profile` already serves forecaster identity data. Decision-gated, not copy-gated.
- **T2 — Markets desktop sidebar reframe** — Trading Control Panel is the most casino-feeling surface. Mobile hides it by responsive breakpoint, desktop is the delta. Depends on T1.
- **T3 — Bet flow vocabulary** ("Buy Yes/No", wagered, My Bets, Portfolio). Operator declined twice. Depends on T1.

### Polish backlog (NO actionable without explicit go)

- P1: Dashboard "Top forecasters" card label↔data mismatch (currently pulls `/api/game/leaderboard?sort=profit`).
- P2: "Biggest calls" naming doesn't capture contrarian-ness — "Called against the crowd" or similar would communicate the actual filter.
- P3: `/profile` "Activity Overview" card dilutes identity surface (just a link to /dashboard wrapped in card chrome).
- P4: `/profile` "Sign out" card anchors the bottom as settings page (could move to header overflow).
- P5: `/profile` desktop `max-w-3xl` → `max-w-4xl` or 2-col on xl: for less whitespace on wide screens.
- P6: Biggest Calls rarity microcopy ("Called at X% probability") to amplify the "I saw what others missed" signal.

### Trigger for re-opening T1 (the only path forward)

T1 re-opens **only when repeated organic signals appear** during natural product use:
- The dashboard feels emotionally contradictory with the rest of PT.
- `/profile` starts feeling like "the real product" relative to `/dashboard`.
- P&L weight starts eroding the forecaster identity narrative.

One-off feelings do not justify T1. Repeated signals across sessions do. Until then, restraint is the discipline.

### What active polish IS still allowed (unchanged from prior memory)

- Bug fixes localized (1–2 files, zero refactor).
- Doc cleanup / drift resolution.
- Quirurgical polish that closes existing reputation loops (e.g., F1-style: owner sees own follower count).
- Tech debt resolution only if it blocks observation quality.

The Activity Feed gate (`>=1-2 organic follow` in `public.follows`) remains the separate trigger for the social primitive layer. Currently `*/0`. Two gates active in parallel; neither met.

---

## Identity Cohesion Pass II — LIVE 2026-05-17 (this session)

Operator-requested deep cohesion review pass after living with the previous identity work. Goal: eliminate residual "simulator / paper trading / trader / fake brokerage / market utility" framing while keeping the absolute restraint discipline of observation phase. Surfaces audited end-to-end (homepage, landing sections, navigation, onboarding, auth, dashboard, profile, prediction cards, empty states, CTA hierarchy, EN/ES consistency, residual terminology). **No new features, no architecture rewrites, no UI restructure, no new components, no migrations, no API.** 5 small reversible commits, `pnpm build` clean each, 8/8 smoke green post-push, all new copy verified live in production HTML and chunks.

| # | Commit | Surface | What shipped |
|---|---|---|---|
| 1 | `e49c199` | `contexts/language-context.tsx` (`footerBrandDesc`) | The last residual "simulator" framing in user-facing copy. The string renders on EVERY page footer. EN: "Free prediction market simulator with real Polymarket data." → "Build a public forecasting track record on real Polymarket events. Virtual funds, real reputation." ES symmetric. |
| 2 | `fb07d72` | `components/live-markets-preview.tsx` (homepage post-hero) | Section subtitle "Click any market to start trading" → "...to make your call" (EN+ES). Social-proof strip "{N} traders active" → "forecasters active" (EN+ES). Internal variable `totalTraders` preserved (computed heuristic, not user-visible). |
| 3 | `f630cec` | `components/activity/activity-client.tsx` | Auth-gated empty state on /activity: "No activity yet. Start trading or play a game..." → "...Make your first call or play a game..." (EN+ES). |
| 4 | `c875910` | `components/market-detail-modal.tsx` | DialogDescription `sr-only` for screen readers: "trading interface for {market}" → "prediction interface for {market}". Pure accessibility, zero visual impact. |
| 5 | `8775f7d` | `app/help/page.tsx` + `components/help/help-client.tsx` | Help page metadata description (the only `<meta description>` not touched in the prior audit) + FAQ Q1 brand self-description ("free risk-free simulator… practice trading" → "free platform for making public predictions on real-world events… build your forecaster track record") + FAQ Q3/Q4 minor swaps + Q6 Academy reframe + **dropped Q5** entirely because it referenced a non-existent "Demo Trading dashboard" route and a reset feature that the current UI does not expose. EN + ES symmetric. |

**Build:** `pnpm build` ✓ clean (TS strict, 0 errors) on every commit.
**Smoke (post-push):** 8/8 endpoints 200 with fresh `cdg1` X-Vercel-Ids (`/`, `/markets`, `/leaderboard`, `/play`, `/help`, `/academy`, `/auth/login`, `/api/leaderboard/forecasters`). All 8 new strings verified live in production HTML for SSR surfaces; chunk-marker scan confirms "forecasters active" present and "traders active" gone in shipped chunks.
**Sync:** main ↔ origin/main `0/0`. HEAD `8775f7d` (was `54d3109`). 5 commits ahead of prior session.
**Follows orgánicos:** `*/0` sin cambios. Observation phase intact post-pass.

**Cohesion gain:**
- Footer no longer contradicts the rest of the funnel on every render.
- Homepage post-hero strip no longer counts "traders".
- All four `<meta description>` for public/auth pages now read forecaster-identity (last leak was `/help`).
- Help FAQ self-description no longer pitches "trading simulator" to users opening the help page.
- The factually-wrong "Demo Trading dashboard" reset answer is gone.
- One screen-reader announcement aligned with the visual identity.

**Out of scope this pass — preserved deliberately (operator-confirmed, prior memory):**
- `app/layout.tsx` root metadata + keywords ("Free Polymarket Simulator & Paper Trading Platform" + `paper trading prediction markets` keyword list + Twitter card title). Deliberate top-of-funnel SEO targeting per multiple prior memos.
- `components/academy.tsx` — legitimate educational content on Polymarket / paper trading concept. ~30 trading-vocabulary occurrences are inside lesson bodies; reframing would break educational scope.
- `components/dashboard/dashboard-home.tsx` — wallet card with P&L visualization (`balance - 100000`, ± green/red), "Win rate" card, "WIN" / "LOSS" badges on game rows, leaderboard sorted by `profit%`. **Sprint-sized identity conversion declined twice by operator.** Note: the "Top forecasters" card on the dashboard pulls from `/api/game/leaderboard?sort=profit` — semantic mismatch between label (forecasters) and data source (Prediction Flash game profit), but resolving it requires either re-labeling or swapping data sources, both deferred to a future dashboard rethink.
- `components/markets-app.tsx` bet flow ("Buy Yes/No" buttons via `buyYes`/`buyNo` dict keys, `wagered`/`yesWagered`/`noWagered` stats, "My Bets" tab via `myBets`, portfolio summary, "Trading Control Panel" code comment). Same sprint-sized rework deferred.
- `app/auth/error/page.tsx` — server component, hardcoded EN strings. Architecturally separate localization fix.
- Dead components (`contact.tsx`, `market-card.tsx`, `rise-in-leaderboard.tsx`, `demo-dashboard.tsx`, `trading-panel.tsx`, `dashboard/dashboard-client.tsx`) — confirmed never rendered, on deferred dead-code purge bucket.
- Orphan dictionary keys in `language-context.tsx` (`tradeRealWorldEvents`, `goDemo`, `authPanelTitle`, `authPanelDescription`, `startDemoTrading`, `startsWithFunds`) — unused, low priority cleanup.

**Taste-level risks to observe (NOT proposing action):**
- New footer line is slightly longer than the old one — should still wrap cleanly on mobile (Tailwind `leading-relaxed`, no width constraint).
- "forecasters active" / "predictores activos" reads less casino than "traders active" — desired, but observe whether the live-data strip still communicates urgency.
- The single-line "Build a public forecasting track record on real Polymarket events. Virtual funds, real reputation." doubles as a brand mini-pitch — used in OG tooling later if needed.

**🟢 Observation mode resumes immediately.** No further alignment passes proposed automatically. The 5 commits above are exhaustive for the residual identity drift visible on user-facing surfaces. Future identity work would have to touch deferred-sprint territory (dashboard / bet flow) — only on explicit operator request.

---

## Forecaster Identity Alignment Pass — A+B+C LIVE 2026-05-17 (prior, kept for context)

Operator-approved micro-pass after observation revealed PT's logged-out funnel still told a "trading simulator → graduate to Polymarket" story while the logged-in product already delivered "forecaster identity / prediction reputation". Goal: close the perception gap end-to-end without opening architecture or new systems. **Copy/semantics only, 4 small reversible commits, `pnpm build` clean each, no migrations, no API, no UI restructure, no new components.** HEAD: `54d3109`.

| # | Commit | Surface | What shipped |
|---|---|---|---|
| 1 | `787dbb9` (A1) | `components/how-it-works.tsx` | Landing pillar reframed. Eyebrow "Paper Trading / Trading de práctica" → "How it works / Cómo funciona". Title "Learn Before You Earn / Aprende antes de ganar" → "Three steps to your first call / Tres pasos hasta tu primera predicción". Intro rewritten (no more "Most traders lose money…"). Step 1 "paper trading funds" → "virtual balance". Step 2 "Trade Real Markets" → "Call Live Markets". Step 3 "Master the Game / P&L / win rate / ready for the real thing" → "Build Your Reputation / accuracy / streak / public forecaster profile". |
| 2 | `74fbdcd` (A2) | `components/why-us.tsx` | Advantages section reframed. Eyebrow "Why Practice Here / Por qué practicar aquí" → "Why Prediction Trade / Por qué Prediction Trade". Title "The Smartest Way to Learn / La forma más inteligente de aprender" → "The Smartest Way to Start Forecasting / La forma más inteligente de empezar a predecir". Intro replaced ("Most traders lose money / Our simulator…" → "Build your forecasting reputation in the open…"). Features: "Learn Risk-Free" → "Predict Risk-Free"; "Active Community" → "Forecaster Community". **"Ready for Real Trading?" card replaced entirely by "Public Profile"** (drops the "transition to Polymarket" graduation framing). Real Market Data + Track Your Accuracy + Intuitive Interface cards retained with descriptions tightened. |
| 3 | `a521d0e` (B) | `contexts/language-context.tsx` | Auth dictionary aligned. 13 strings reworded across EN + ES (the ES `benefitBalance` was already clean, skipped): `loginDescription`, `virtualFundsNotice`, `signUpDescription`, `benefitBalance`, `benefitPractice`, `createAccountNotice`, `verifyEmailHelp`. Dropped phrasing: "prediction markets demo", "practice trading", "simulador", "operar", "virtual trading balance". New phrasing: "make predictions", "virtual balance", "make your first call", "make your first prediction". |
| 4 | `54d3109` (C) | `components/dashboard/dashboard-home.tsx` | Active dashboard greeting/CTAs aligned. `displayName` fallback "Trader" → "Forecaster" (mirrors `/profile` fix from `619733d`). Primary CTA "Start trading / Operar ahora" → "Make a prediction / Predecir". Card header "Top traders" → "Top forecasters / Top predictores". Recent-activity empty state "place your first trade / haz tu primera operación" → "make your first call / haz tu primera predicción". |

**Build:** `pnpm build` ✓ clean on every commit (TS strict, 0 errors).
**Smoke (post-push):** 6/6 public routes HTTP 200. New copy verified live in production HTML for A1 (`Three steps to your first call`, `Build Your Reputation`, `Call Live Markets`), A2 (`The Smartest Way to Start Forecasting`, `Public Profile`, `Forecaster Community`, `Predict Risk-Free`), and B on `/auth/login`, `/auth/sign-up`, `/auth/sign-up-success` (all serving new strings). Old strings confirmed absent for 12 critical phrases. C surface is auth-required (not curl-testable) but build clean.
**Sync:** main ↔ origin/main `0/0`. HEAD `54d3109`. CDN edge propagated within 20s of first poll.

**Perception shift achieved:**
The landing→sign-up→email-verify→product narrative is now one story end-to-end. Hero ("Predict the Future. Prove You're Right.") + FeaturesGrid ("Build your forecasting reputation") + HowItWorks ("Three steps to your first call") + WhyUs ("The Smartest Way to Start Forecasting") + auth pages ("make predictions and build your track record") + dashboard ("Good morning, Forecaster") all reinforce the same fantasy: forecaster identity / prediction reputation platform. The "graduate to Polymarket" framing is gone from user-facing copy.

**Out of scope this pass — preserved deliberately (operator-confirmed):**
- SEO metadata `app/layout.tsx` — deliberate top-of-funnel keyword targeting around "paper trading prediction markets"
- `components/academy.tsx` — legitimate trading-vocabulary educational content (Polymarket, paper trading as concept)
- `app/auth/error/page.tsx` — server component, hardcoded EN strings, architecturally separate localization fix
- Dashboard rethink profundo — operator declined; deferred until role of `/dashboard` is decided
- Dead code with trading vocabulary — 4 components confirmed never rendered: `components/trading-panel.tsx`, `components/dashboard/dashboard-client.tsx`, `components/demo-dashboard.tsx`, `components/rise-in-leaderboard.tsx` (the last one discovered during post-pass verification). All in deferred D bucket.

**Taste-level risks worth observing (NOT proposing action):**
- "How it works" eyebrow is more generic than the previous "Paper Trading". Coherent but slightly less distinctive — observe.
- "Make a prediction / Predecir" CTA is less action-bait than "Start trading / Operar ahora". Deliberate (identity > action) but operator should sense whether it converts equivalently.
- ES "Predictor" as noun is less culturally established than "Trader". Observe for any ES user feedback.

**🟢 Observation mode resumes immediately.** No further alignment pushes proposed automatically. Live in the product as it is now; decide next moves only on real-usage friction signals.

---

## 🆕 Quality & Identity Audit Pass — 2026-05-17 LIVE

Surface-by-surface consistency + bilingual + mobile polish pass requested by operator. **No new features, no refactors, no system reworks.** 12 small reversible commits, `pnpm build` clean, smoke 8/8 green, brand fix verified live in HTML. HEAD: `dca9407`.

| # | Commit | What shipped |
|---|---|---|
| 1 | `4c76d91` | Auth pages logo "PredictTrade" → "Prediction Trade" (login, sign-up, sign-up-success, error) + new `emailLabel` dictionary key so the form `Email` label flips with locale (Correo / Email). |
| 2 | `619733d` | `/profile` default display name fallback `"Trader"` → `"Forecaster"`. Last spot in the product that still labeled a user as trader. |
| 3 | `8ca05cb` | Page `<meta description>` aligned with forecaster identity on `/leaderboard`, `/markets`, `/dashboard`, `/activity`, `/play` OG. SEO keywords in `app/layout.tsx` left untouched (deliberate top-of-funnel targeting). |
| 4 | `5f06c54` | Footer drops redundant "Demo Trading" link (was duplicate of `/markets`), `t("navAcademy")` for Academy link. Dictionary: `riskDisclosure` "Risk Disclosure / Aviso de riesgo" → "Demo notice / Aviso de demo"; `attrTextMiddle` Polymarket attribution CTA reframed from "Ready to trade with real funds?" to "Want to predict with real funds?". |
| 5 | `26ca9c4` | Header nav uses `t()` for Game / Leaderboard / Dashboard (were hardcoded `isEs ? ... : ...`). Dropdown items My Dashboard / Activity / Profile also via `t()`. New dictionary keys: `navGame`, `navLeaderboard`, `navDashboard`, `navMyDashboard`, `navActivity`, `navProfile`. Primary CTA value `demoTrading` reframed: "Demo Trading / Trading demo" → "Predict / Predecir" (key name unchanged). |
| 6 | `ece9aad` | **Four high-visibility modals localized for ES users:** CalledItModal (the celebration moment), ShareAchievementModal, SharePredictionModal, BadgeEarnedToast. Modal chrome only — share copy generated by `lib/share-copy` stays EN on purpose (tweets/WhatsApp messages broadcast). Each modal calls `useLanguage()` directly. |
| 7 | `5040590` | FollowButton labels, follower-count noun, "Your follower count" tooltip, and sonner error toast all switch with locale (Seguir / Siguiendo / seguidor / seguidores / Acción fallida.). |
| 8 | `b80e765` | PredictionHistory empty state, status labels ("✓ Just called / Recién acertada", "✓ Correct / Acertada", "✗ Wrong / Fallida", "pending / pendiente"), and date formatting (`toLocaleDateString` with `es-ES` when ES) all localized. "🎲 contrarian" jargon kept identical across locales (PT-specific term). |
| 9 | `3a5c0fa` | Landing hero social-proof line (`N predictions made by M forecasters / N predicciones hechas por M predictores`) and empty-state fallback CTA bilingual. Number formatting via `toLocaleString("es-ES")` when ES. |
| 10 | `fc9b9a8` | Flash Players leaderboard empty state "No traders yet / Aún no hay traders" → "No players yet / Aún no hay jugadores". Matches the tab name (Flash Players) and the arcade vocabulary. |
| 11 | `afddcf5` | Mobile bottom nav (`grid-cols-6`, text-[10px]) tightened: added optional `labelMobileEn`/`labelMobileEs` slot on `NavItem`, used for Leaderboard → "Ranks" only when needed. Cells got `min-w-0`, `px-0.5`, `leading-tight`, and a centered truncating span so overflow degrades to ellipsis. |
| 12 | `dca9407` | RealPublicProfile header stacks on mobile (`flex-col sm:flex-row`). Identity block on top, FollowButton + Share + Copy actions wrap below. Resolves the F2 friction (3 inline buttons clipping on narrow phones). Added `min-w-0` + `truncate` on the @username row. |

**Build:** `pnpm build` ✓ Compiled successfully in 3.1s (TS strict, 0 errors).
**Smoke (post-push):** 8/8 endpoints HTTP 200 with fresh X-Vercel-Ids. Brand "PredictTrade" residual check confirmed clean on all 4 auth pages.
**Sync:** main ↔ origin/main `0/0`. HEAD `dca9407`.

**Out of scope this pass — preserved deliberately:**
- Academy content (`components/academy.tsx`) — trading vocabulary is legitimate educational content about Polymarket.
- Dashboard wallet card complete reframe — "Trade" CTA, "Demo P&L", "LONG/SHORT", "Open positions", "Total trades" all still trading-flavored. Operator declined deeper rework; that's a sprint-sized identity conversion of the dashboard role itself.
- SEO metadata in `app/layout.tsx` — deliberate keyword targeting around "paper trading prediction markets" for top-of-funnel.
- `how-it-works.tsx` landing copy ("Paper Trading", "P&L", "Most traders lose money…") — landing pillar that would require a bigger copy rewrite.
- Username slug duplicate (`displayName.toLowerCase()...` vs `slugify()`) — known tech debt, no user impact.
- URL hardcode `predictiontrade.online` vs `www.` — apex redirects; cosmetic.

**Audit findings update (post Alignment Pass A+B+C 2026-05-17):**
- ✅ RESOLVED — Auth dictionary keys reworded in commit `a521d0e`. The 6 flagged keys + `loginDescription` (7 keys × 2 langs = 13 strings) now use prediction vocabulary.
- ✅ PARTIAL — Dashboard greeting + 4 high-visibility strings on `dashboard-home.tsx` aligned in commit `54d3109`. Dashboard-level architectural rework (whether `/dashboard` becomes a forecasting dashboard or stays wallet-style) still deferred consciously.
- ⏸ DEFERRED still — `app/auth/error/page.tsx` strings hardcoded EN. Server component, architecturally separate fix.
- ⏸ DEFERRED still — SEO metadata in `app/layout.tsx` ("paper trading prediction markets" keyword targeting).
- ⏸ DEFERRED still — Academy content (legitimate trading-vocabulary educational content).

---

## 🟢 Active phase: observation/polish (2026-05-17)

Officially in observation mode after Follow System v1 shipped. Disciplined scope: no Activity Feed, no notifications, no recommendations, no following pages, no mutual indicator, no posts/timelines/DMs/stories. Only quirurgical polish that closes existing reputation loops counts. Resolve tech debt only when it blocks observation quality.

**Follows table signal as of last check:** `*/0` (0 organic rows in `public.follows`). Trigger for graduating from observation phase NOT met. Continue polish only.

### 🆕 Profile Identity Completeness — Blocks 1–5 LIVE (2026-05-17)

Camino A elegido conscientemente over Lightweight Activity Feed (Camino B deferred until ≥1 organic follow). Goal: close identity-glance parity gaps between `/profile` (owner) and `/profile/[username]` (public real-user view) without opening new social surfaces.

| Block | Commit | What shipped |
|---|---|---|
| **B1 — Shared headline** | `fc64c2c` | Extracted `buildHeadline()` from `real-public-profile.tsx` to `lib/profile-helpers.ts` as `buildProfileHeadline(stats: ProfileHeadlineStats, categoryStats)`. Owner `/profile` now renders the same one-liner visitors see (and that ships in OG cards + share copy). Single source of truth. |
| **B2 — Shared stats grid** | `26ff281` | Extracted `<StatCard />` from `real-public-profile.tsx` to `components/profile/stat-card.tsx`. Owner now shows the same 4-cell glance grid (Streak / Accuracy / Predictions / Badges) the visitor sees, placed between headline and the existing detailed cards (AccuracyStats / StreakWidget / BadgesGrid stay below as deep-dive). Labels hardcoded EN — paritarian identity vocabulary across surfaces. |
| **B3 — Shared "Biggest calls"** | `87293da` | Extracted `<TopCallRow />` from `real-public-profile.tsx` to `components/profile/top-call-row.tsx`. Owner now sees identity-gold contrarian-correct showcase Card between Streak and Badges (only when `computeTopCalls()` ≥ 1). CardTitle localized per owner pattern; row content shared verbatim with public surface. |
| **B4 — Share on X in owner header** | `3315879` | New `shareOnX()` handler in `profile-client.tsx`. Owner's Account-card header now offers a dedicated X-glyph Share button alongside the existing Copy-link button. Tweet text reuses `headline` from B1 so self-share == visitor-share. Copy-link button label tightened to "Copy link / Copiar enlace" (was "Share profile / Compartir perfil") to disambiguate. |
| **B5 — Copy alignment** | `5cc94ba` | 3 strings in `profile-client.tsx` (O1+O2+O3 complete, operator chose A). Owner ES tagline `Miembro de PredictionTrade` → `Forecaster de PredictionTrade` (cross-language PT identity vocab). Activity Overview body rewritten from stale "trading stats / game results / academy progress" to prediction/streak/accuracy. Subtitle reframed from settings page to identity surface ("Your public profile and account settings"). 1 file · +5 / −5 strings · 0 migrations · 0 API. |

**Build status across all 5 pushes:** `pnpm build` clean (TS strict, 0 errors). Smoke green on each push (`/`, `/markets`, `/leaderboard`, `/play`, `/academy`, `/help`, `/auth/login`, `/profile` 307 → login on www). X-Vercel-Id rotates per deploy. Operator visually verified Blocks 1–3 in production; Blocks 4 + 5 visually verified in same session.

**New shared profile components (single source of truth):**
- `components/profile/stat-card.tsx` (B2)
- `components/profile/top-call-row.tsx` (B3)
- `lib/profile-helpers.ts`: `buildProfileHeadline` + `ProfileHeadlineStats` type (B1)

**Owner-only detail surfaces UNCHANGED and still rendered below the glance layer:** AccuracyStats, CategoryAccuracy, StreakWidget (with its own Share button), BadgesGrid (earned + locked), PredictionHistory, Activity Overview card, Session card.

### 🆕 Game Feel Sprint #1 — Bloque 1 LIVE (2026-05-17)

Operator opened a new mini sprint after Profile Identity B1–B5 closed. Goal: amplify the emotional satisfaction of correct predictions WITHOUT new systems, economies, sound, confetti, or progression engines. Philosophy: smart/social/status, not casino. Commit `e8284f9`. 3 files · +37 / −6 · 0 deps · 0 keyframes · 0 migrations · reversible with `git revert e8284f9`.

| Touch | What shipped |
|---|---|
| **T1 — Arrival ring** | 1-shot ping ring (700ms, `forwards`) around `CheckCircle2` in `CalledItModal`. Inline `animation-iteration-count: 1` so it never loops. Subtle arrival moment, not a casino reward. Reuses Tailwind `ping` keyframe — no new CSS. |
| **T2 — Recent-correct highlight** | New optional prop `newlyCorrectIds?: Set<string>` on `PredictionHistory`. Matching items get `border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/30` and label `"✓ Just called"`. Session-only by design (no localStorage, resets on refresh). Backwards-compatible: without the prop, behavior identical to pre-sprint. |
| **T3 — Batch context pill** | New optional prop `extraCount?: number` on `CalledItModal`. When the resolution batch had >1 correct call, shows `"+N more correct call(s) today"` under the headline. Info-only, no animation, no CTA. |

**Wire in `profile-client.tsx`:** new state `newlyCorrectIds: Set<string>` populated from `checkResolutions().newlyCorrect`, propagated to both consumers. State lives in component only — refresh resets, matches the "session-only" design of the highlight.

**Loop emocional cubierto post-Bloque 1:**

prediction resolves → CalledItModal (with arrival ring + optional batch pill) → close modal → PredictionHistory rows highlighted as "Just called" → reputation record visibly identifies the new wins.

**Philosophy compliance (verified post-impl):**
- ✅ NO confetti in CalledItModal — only the arrival ring
- ✅ NO sound, NO haptics
- ✅ NO notifications, NO toast added
- ✅ NO triggers on /dashboard or /activity (G4 deferred)
- ✅ NO new architectures, NO new components, NO new deps
- ✅ NO backend, NO API, NO migrations, NO keyframes added
- ✅ NO touch to `lib/share-copy.ts` or `TopCallRow`
- ✅ Backwards-compatible (props are optional)

**🟢 OBSERVATION MODE — do NOT iterate without real-usage signal.** Operator explicit instruction: hold before opening Bloque 2 of the Game Feel sprint. Wait for:
- Real "feel" of resolving multiple predictions
- Whether `"Just called"` really improves continuity
- Whether the pulse is subtle enough (not too visible)
- Whether the batch pill adds real clarity
- Any sign of "too gamified" creeping in

**DEFERRED — do not start without operator confirmation (mirrors Follow System v1 discipline):**
- G4: multi-surface triggers (modal on /dashboard or /activity entry)
- Hot take systems / contrarian signals beyond modal-time
- Progression rings on streak widget
- Rank delta indicators in leaderboard
- More animations of any kind
- Anything resembling XP, coins, levels, progression engines, economies
- Sound, haptics, screen-shake, particle systems

Backlog for future Game Feel blocks is stored in memory `project_pt_game_feel_sprint.md` — do NOT auto-propose those items.

### Other polish shipped earlier this phase

- **F1 (commit `a1c1060`):** owner sees own follower count on `/profile` Account card. 1 file, 33 lines, no schema.
- **Tech debt resolved earlier:** stale anon key in `.env.local` refreshed to `sb_publishable_*` format. No commit (gitignored).

**Active frictions deferred (do not touch without operator confirmation):**
- F2 — Mobile header on RealPublicProfile (3 inline buttons) — defer until real mobile signal.
- F3 — Demos non-followable confusion — defer; recommendation is "no surface added".
- F4 — Generic FollowButton error toast — marginal, defer.

---

## ✅ Follow System v1 — LIVE end-to-end (2026-05-17)

Migration `007_follows.sql` applied in production Supabase (`vkizidrsuwsreepsbbuy`). Operator confirmation: `Success. No rows returned.` The follows table exists, RLS active, public read + ownership-safe writes. Full pipeline live: button click → `lib/follows` insert → RLS guard → Supabase row → next render reads new count.

Post-deploy smoke (12 endpoints, 3 auth gates): all green. No regressions. `/api/leaderboard/forecasters` still returns `[]` (zero real users in `public_leaderboard`) — the new batched follows query executes cleanly against the (now-existing) empty `follows` table. No try/catch fallback firing.

### 🆕 What was built — 2026-05-17 (Follow System v1 — "watching forecasters" primitive)

PT graduates from identity artifacts (avatars, OG cards, specialty headlines) to a real social primitive: **a forecaster can follow another forecaster.** Single edge table, ownership-safe RLS, no notifications, no feed, no recommendations. Build primitive → observe → iterate.

### Scope shipped end-to-end

**1) Migration `007_follows.sql`** (pending operator apply in Supabase SQL Editor)
- Table `public.follows (follower_id uuid, followee_id uuid, created_at timestamptz)`.
- PK composite `(follower_id, followee_id)` — idempotent inserts, dupes return PK-conflict (handled as success in `lib/follows.ts`).
- FK to `auth.users(id) ON DELETE CASCADE` — account deletion cleans up.
- `CHECK (follower_id <> followee_id)` — DB-level no-self-follow.
- 2 indexes: `follows_followee_idx` (count followers, list followers), `follows_follower_idx` (count following, list following).
- RLS: SELECT public · INSERT only as `auth.uid() = follower_id` · DELETE only `auth.uid() = follower_id`.
- Grants: `SELECT` to `anon, authenticated`; `INSERT, DELETE` to `authenticated`.

**2) `lib/follows.ts` — minimal client helpers (~85 lines)**
- `followUser(followeeId)` — insert; treats PK-conflict (`23505`) as success.
- `unfollowUser(followeeId)` — delete by `(follower, followee)`.
- `getFollowerCount(userId)`, `getFollowingCount(userId)` — `count: 'exact', head: true` (no payload).
- `isFollowing(followerId, followeeId)` — same headcount, returns boolean.
- All four wrap `createClient()` from `@/lib/supabase/client`. No API routes. RLS is the guardrail.

**3) `components/profile/follow-button.tsx` — single primitive (~140 lines)**
- Self (viewer === followee): renders a passive `<Users /> N followers` chip, no button.
- Logged out: clicking the button bounces to `/auth/login?next=<current path>`.
- Logged in non-self: optimistic toggle + rollback on error. Sonner toast fires ONLY on failure (UI flip is the success signal).
- States: `loading skeleton (h=30 w=110)` → `Follow · N` / `Following · N` (with `UserPlus` / `UserCheck` icons; `Loader2` while pending).
- Self-contained: does its own `isFollowing` fetch on mount so callers only pass `followeeId` + server-rendered `initialCount`.

**4) `RealPublicProfile` header integration**
- `RealProfileData` extended with `userId: string` and `followerCount: number` (both required, additive). Server-side count via single indexed `count(*)` on `follows.followee_id`, wrapped in try/catch so pre-migration the route stays serviceable.
- Both `app/api/profile/[username]/route.ts` and the page-local `fetchRealProfile()` in `app/profile/[username]/page.tsx` updated in lockstep.
- `<FollowButton followeeId={userId} initialCount={followerCount} />` rendered next to the existing Share / Copy buttons in the profile header.

**5) Leaderboard social-proof chip on top 1–10 rows**
- `ForecasterEntry` extended with `followerCount: number` (required, additive).
- `/api/leaderboard/forecasters/route.ts` adds a **single batched query** — `select followee_id from follows where followee_id in (top-50 user_ids)` — and aggregates in memory. O(N) where N = total follow rows pointing at the top 50; fine for v1. When the graph gets large, swap for SQL RPC `get_follower_counts(uuid[])`. Wrapped in try/catch so pre-migration the API stays serviceable (counts all default to 0).
- `LeaderboardRow` accepts new `showFollowerChip: boolean` prop. Chip renders only when `rank ≤ 10 && !isDemo && !isCurrentUser && followerCount > 0`. Style: tiny `<Users />` icon + tabular-nums count, muted pill next to the existing "Real" badge. Signal/noise stays high — no zero-follower spam, no chip on demos or on YOU.

### What v1 explicitly does NOT include (deferred — do not start without operator confirmation)

- ❌ Feed / timeline of any kind
- ❌ Notifications (in-app or email) — no infrastructure for this exists or should exist yet
- ❌ Recommendations / "people you may follow"
- ❌ Mutual-follow indicator
- ❌ Following list page (`/profile/[username]/following`) or followers list page
- ❌ Sortable leaderboard column by follower count
- ❌ Denormalized count columns / triggers / materialized views (counts stay on-demand)
- ❌ Avatar System Phase 4 (OG card avatars) — still deferred

These are *deliberate* cuts. The thesis is: ship the primitive, observe whether real users use it, then expand only where actual usage justifies it. Premature feed-building is the single highest-risk failure mode for a small social product.

### Verification

- ✅ `pnpm build` clean (TS strict, 0 errors). Three new files, three edited files compiled without complaints.
- ✅ Migration `007_follows.sql` applied in production Supabase (`vkizidrsuwsreepsbbuy`) — operator confirmed `Success. No rows returned.`
- ✅ Post-deploy smoke (12 public + 3 auth-gated endpoints): all green, no regressions.
- ✅ Pipeline live end-to-end: FollowButton → `lib/follows` → RLS guard → `public.follows` row → next render reads updated count.
- ✅ Independent REST verification (2026-05-17 post-anon-key-refresh): direct `GET /rest/v1/follows?limit=0` returns `200` + `Content-Range: */0`. Table live, RLS SELECT public works, response header `sb-project-ref: vkizidrsuwsreepsbbuy` matches active project.

**Local dev keys (refreshed 2026-05-17):** `.env.local` now uses the new Supabase publishable-key format (`sb_publishable_*`). The previous JWT-format anon key was stale (referenced an older project `dvevwlhshcyvnsubyvzw`). Production Vercel env vars are independent and were never affected. `.env.local` is gitignored — values never enter the repo.

### Files touched

New:
- `supabase/migrations/007_follows.sql`
- `lib/follows.ts`
- `components/profile/follow-button.tsx`

Edited:
- `app/api/profile/[username]/route.ts` (added `userId`, `followerCount` to `RealProfileData`)
- `app/profile/[username]/page.tsx` (added `userId`, `followerCount` to local `fetchRealProfile`)
- `components/profile/real-public-profile.tsx` (header destructures `userId` + `followerCount`, renders `<FollowButton />`)
- `app/api/leaderboard/forecasters/route.ts` (`ForecasterEntry.followerCount`, batched query)
- `components/leaderboard/forecasters-leaderboard.tsx` (`RowEntry.followerCount`, `showFollowerChip` prop, `Users` icon chip)

### Next major (in roadmap order — do not jump ahead)

1. **Observe Follow System usage.** Wait until at least one real user follows another before iterating. The whole point of v1 is to *see* whether the primitive matters before building on top of it.
2. **Lightweight activity feed** — *only* "X followed Y", "X earned badge Z", "X called it on market M". Bounded list, no infinite scroll, no posting. Forecasting-events only.
3. Weekly challenges / events.
4. Squads / alliances.

⚠️ **Avoid the social-media trap.** No DMs, no stories, no generic posting, no reposts, no comments. PT is a *forecasting reputation network*; every social surface must reinforce prediction identity (Chess.com / Strava / Letterboxd, not Instagram / TikTok / Reddit).

---

## 🎯 PT core social — OFICIALMENTE ESTABLE (2026-05-16)

Operador validó end-to-end en navegador real:
- ✅ Login sin redirect loop
- ✅ Bet flow sin crash en tab Positions
- ✅ Persistencia tras refresh (balance + positions)
- ✅ Navegación estable, console limpia

**PT core social está oficialmente cerrado.** Próxima fase es social/profile polish + reputation loops, no más bug-fixing del core.

---

## 🆕 What was built — 2026-05-16 (identity artifacts begin)

### Avatar / Profile Photo System — Phases 1 + 3 shipped (commits 29a6a9b + 654908d)

PT graduates from "identity polish" to "identity-bearing artifacts". Every circular avatar across the product is now driven by a single component and the data layer is ready to receive uploads.

**Phase 1 — Data layer (commit `29a6a9b`):**
- Migration `005_profiles_avatar_url.sql` — adds `avatar_url text NULL` to `public.profiles`.
- Migration `006_avatars_storage_setup.sql` — creates the `avatars` public Storage bucket (5 MB cap; jpeg/png/webp only) plus four RLS policies on `storage.objects`: public read; authed-owner insert/update/delete bound by `auth.uid()::text = split_part(name, '.', 1)`. Path convention: `<user_id>.<ext>`.
- API extensions (additive, backward-compat):
  - `RealProfileData.avatarUrl: string | null` on `/api/profile/[username]` + `app/profile/[username]/page.tsx`.
  - `ForecasterEntry.avatarUrl: string | null` on `/api/leaderboard/forecasters`.

**Phase 3 — Single source of truth: `<Avatar />` (commit `654908d`):**
- New `components/avatar.tsx`. Props: `{ url?, displayName, size?, className?, accentHex? }`.
- Size presets pixel-fixed (no layout shift): `sm 36px / md 44px / lg 64px / xl 96px`.
- Initials derivation centralized (first letter of first two words, uppercase, "?" fallback).
- Image `loading="lazy" decoding="async"`, `object-cover`, initials sit underneath as load + error fallback (`onError` hides the broken img element).
- Accent: tailwind primary by default; `className` overrides via `twMerge`; `accentHex` for runtime colors (badge-rarity-tier on leaderboard rows).
- Replaces four inline circles:
  - `RealPublicProfile` header (size `lg`, default primary accent)
  - `ProfileClient` Account card (size `lg`, default primary accent)
  - `LeaderboardRow` (size `sm`, `accentHex` from badge rarity)
  - `#1 Spotlight` (size `md`, amber accent via className)
- `PublicProfileClient` (demo anchors) intentionally NOT touched — it's a `rounded-2xl` squircle by design and demos will never carry an `avatar_url`.
- Backward-compat: until anyone uploads an avatar, every surface renders initials pixel-tight to the previous version.

**Window-safety note on Phase 1:**
The SELECT `avatar_url` from `profiles` would error if migration 005 isn't applied yet. The current safety:
- `/api/leaderboard/forecasters` already returns `[]` (no real users) and `/api/profile/[username]` returns `null` for non-demo lookups, so the missing-column error never reaches user-visible state.
- `app/profile/page.tsx` wraps the new SELECT in try/catch and falls through to `avatarUrl = null` (initials).
Result: zero practical regression during the pre-migration window.

**Phase 2 — AvatarUploader shipped (commit `6c4ccbd`):**
Operator confirmed migrations 005 + 006 applied. Bucket reachable (`/storage/v1/object/public/avatars/nonexistent.webp` returns `Object not found`, not `Bucket not found`).
- New `components/profile/avatar-uploader.tsx` wraps `<Avatar />` with a hover-revealed Camera overlay. Click → hidden `<input type="file" accept="image/jpeg,image/png,image/webp" />` → handler:
  1. Validates ≤5 MB, MIME starts with `image/`.
  2. Transcodes: `createImageBitmap` → resize longest edge to ≤512px on canvas → `canvas.toBlob("image/webp", 0.88)`. Bitmap is `.close()`'d in a finally block.
  3. Uploads to `avatars/<user_id>.webp` (single-extension policy: matches storage RLS `split_part(name, '.', 1) = auth.uid()::text`, no orphan dual files). `upsert: true`, `contentType: "image/webp"`, `cacheControl: "0"`.
  4. Reads public URL via `getPublicUrl`, appends `?v=Date.now()` so every CDN layer treats a re-upload as a new resource.
  5. `UPDATE profiles SET avatar_url = $versionedUrl WHERE id = $userId`.
  6. Sonner toast success / error.
- Integrated into `ProfileClient` Account card (`<Avatar />` swapped for `<AvatarUploader />`).
- `app/layout.tsx` now mounts `<Toaster position="top-center" richColors />` from `components/ui/sonner.tsx`. Without this the sonner toasts (used here and reachable for future surfaces) wouldn't render.

**Deploy verification window:** AvatarUploader is split into its own chunk only reachable from authenticated `/profile`. The `"Could not encode image as WebP"` literal isn't present in any chunk reachable from public pages (24 sampled). Smoke 8 endpoints all 200, `/profile` auth-gate intact (`307 → /auth/login?next=/profile`). Deploy presumed live (build clean, push 8+ min ago, Vercel pipeline validated continuously across the day's commits).

**Operator visual smoke (recommended whenever convenient):**
Log in to `/profile`. The Account-card avatar should show a Camera icon overlay on hover. Click → file picker → choose an image → toast "Avatar updated." Avatar should change instantly in the card, and on next refresh should also appear in `RealPublicProfile` and `LeaderboardRow` (if you're on the leaderboard).

**Phase 4 (deferred):** OG profile card avatar rendering inside Satori. Requires `fetch(url) → ArrayBuffer → base64 dataURL` inside the edge route. Skip until upload adoption justifies the complexity.

---

### Activation funnel — last leak closed: 0-pred sign-ins land on /markets (Priority 7 shipped)

**Problem:** The sign-up funnel already routed new users to `/markets?new=1` via the auth callback (and now showed the identity-triad welcome banner there). But returning sign-ins through the email/password form on `/auth/login` went to `/dashboard` unconditionally — including users who had verified their email at some point but never made a single prediction. For those users, `/dashboard` reads as an empty analytics screen instead of the first-call moment the rest of the product now hammers.

**What changed:**
- `app/auth/login/page.tsx`
  - `?next=` still wins (a user bounced from a protected route stays bounced to that route).
  - Otherwise, read `totalPredictions` synchronously from the Zustand gamification store via `useGamification.getState()` and:
    - `0 predictions` → `/markets`  (welcome triad + FirstPredictionGuide are right there)
    - `> 0 predictions` → `/dashboard`  (unchanged behavior)
- Zero other surfaces touched.

**Edge-case note:** for a returning user on a fresh device (empty localStorage, store hydrates with 0), this routes them to `/markets`. That is strictly better than `/dashboard` pre-sync — `/markets` is always meaningful, and gamification sync kicks in on the next profile visit. No data loss, no destructive action.

**Verification:**
- `pnpm build` clean (TS strict).
- Deploy live: the new `totalPredictions === 0 ? "/markets" : "/dashboard"` branch found in the login chunk `/_next/static/chunks/06j14oeefa90..js`.
- Smoke 7 endpoints all 200 (incl. `/auth/login`, `/markets?new=1`, leaderboard, OG profile).
- Sign-up callback path unchanged (still goes through `/auth/callback` → `/markets?new=1`).

**Risk:** Minimal. Pure client-side branch on existing data already in the store. Single file touched. No backend, no env vars. Reversible by removing the ternary.

---

### Identity-aligned first-prediction nudge (Priority 6 shipped)

**Problem:** The signup→markets pipeline existed (callback already redirected to `/markets?new=1`, `MarketsApp` already rendered a welcome banner, `FirstPredictionGuide` already nudged users with `totalPredictions === 0`). But the copy on both surfaces lagged behind the rest of the product:
- Welcome banner talked about "$100,000 virtual balance" and "first badge" — trading-app tone.
- `FirstPredictionGuide` was a generic 3-step "How it works" educational strip (Find / Make / Share).

Neither surface read as the start of a *public reputation*. The user who just confirmed their email landed on something that felt like a casino tutorial instead of "you are now a forecaster, here's what you build."

**What changed:**
- `components/markets-app.tsx`
  - Welcome banner re-copy: `🎯 Welcome, <name>. Make your first call.` + sub-line that names the triad inline (🔥 streak / 🪙 specialty / 🏆 leaderboard).
  - `<FirstPredictionGuide />` now suppressed when the welcome banner is visible (`!showWelcomeBanner`). Avoids two competing first-call narratives stacked on each other for users arriving via `/markets?new=1`. Returning logged-in users with zero predictions still see the guide.
- `components/onboarding/first-prediction-guide.tsx`
  - Full re-do. Was "How it works" / Find / Make / Share. Now reads as identity onboarding:

    ```
    🎯 Make your first call.
    Start your streak, earn your specialty, and appear on the
    leaderboard from your very first prediction.

    [🔥 STREAK]   [🪙 SPECIALTY]   [🏆 LEADERBOARD]

    Virtual only. Your reputation is real.        Explore markets →
    ```

  - Removed unused `next/link` import.
  - `localStorage` key bumped `pt-onboarding-v1` → `pt-first-call-v2` so previously-dismissed users see the refreshed nudge once.
  - Self-dismiss on first prediction preserved.

**Vocabulary coverage — now 7 surfaces use the same triad:**
- OG profile card                       (🪙 Crypto, 🔥 N-day streak)
- Profile headline w/ stats             ("67% accurate · 🔥 7-day streak")
- Profile empty state — private         (🔥 / 🪙 / 🏆 pillars)
- Profile empty state — public          (🔥 / 🪙 / 🏆 pillars, third-person)
- Leaderboard #1 Spotlight              ("🔥 Streak leader · 🪙 Crypto")
- Share copy generators                 ("67% in Crypto 🪙")
- First-call nudge (banner + guide)     (🔥 / 🪙 / 🏆 pillars, post-signup) ← new

**Verification:**
- `pnpm build` clean (TS strict).
- Smoke 10 endpoints all 200 (incl. `/markets?new=1`, sign-up flow, leaderboard sorts, OG profile).
- `/auth/callback` with a fake code → 307 → `/auth/error` (correct — invalid code shouldn't redirect to /markets).
- Deploy live: literal `"appear on the leaderboard from your very first prediction"` (only in this commit) found in `/_next/static/chunks/0v1vb1l68rp_9.js`.

**Risk:** Very low. No backend, no env vars, no schema, no new files, no new route. Pure presentation refresh on top of infra that was already wired end-to-end. The only stateful change is the localStorage key bump, which intentionally re-shows the nudge once for users who dismissed the old version (desired behavior — the new copy is materially different).

---

### Public profile empty-state polish (Priority 5 shipped)

**Problem:** A real Supabase user with `display_name` slug-matched on `/profile/[username]` but zero predictions rendered as: avatar + "Forecaster on PredictionTrade" headline + a flat "No predictions yet" card + the standard viewer CTA. Reading the page felt abandoned, not aspirational — and any share preview of that state produced a dead-account impression. The OG card for the same user is graceful (`@username` + "Forecaster on PredictionTrade" fallback) — but the landing page lagged behind.

**What changed:**
- `components/profile/real-public-profile.tsx`
  - `buildHeadline()` now returns `"🎯 New forecaster"` (was `"Forecaster on PredictionTrade"`) when `gam === null || totalPredictions === 0`. Same 🎯 emoji as the private `EmptyProfileHero` so the share text `${displayName} on @PredictionTrade — 🎯 New forecaster` reads identity-in-progress.
  - The visible headline `<p>` is hidden when there are no stats — the new hero carries the identity copy, removing redundancy.
  - The placeholder "No predictions yet" card is replaced with a new in-file `EmptyPublicProfileHero` sub-component:

    ```
    ✨ Every top predictor starts with a first call.
    Once <FirstName> makes their first prediction, their streak,
    specialty, and leaderboard climb will build right here.

    [🔥 STREAK]            [🪙 SPECIALTY]            [🏆 LEADERBOARD]
    Builds day by day      Earned after 3 correct    Appears from the
    from the first         calls in any one          very first correct
    prediction.            category.                 call.
    ```

  - No CTA inside the hero — the page-level "Make your own predictions / Browse Markets" card at the bottom already serves the *viewer*. The hero stays presentational (about the absent owner), not actionable (about the viewer). Clean separation of audiences.

**Vocabulary now consistent across 6 surfaces:**
- OG profile card                  (🪙 Crypto, 🔥 N-day streak)
- Profile headline (with stats)    ("67% accurate · 🔥 7-day streak")
- Profile empty state — **private**(🔥 / 🪙 / 🏆 pillars, second-person)
- Profile empty state — **public** (🔥 / 🪙 / 🏆 pillars, third-person)  ← new
- Leaderboard #1 Spotlight         ("🔥 Streak leader · 🪙 Crypto")
- Share copy generators            ("67% in Crypto 🪙")

**Verification:**
- `pnpm build` clean (TS strict).
- Real-public-profile chunk is only reachable from `/profile/<x>` pages (not from `/`, `/leaderboard`, etc.). Confirmed deploy live by scanning chunks pulled by `/profile/alex-m`, `/profile/marcus-w`, `/profile/some-random-nonexistent`: literal `"Every top predictor starts"` found in `/_next/static/chunks/0n5qd8cxi4xg0.js`.
- Smoke 10 endpoints all 200 (incl. existing demo profile `alex-m`, leaderboard sorts, OG profile, OG streak, polymarket). `/profile/marcus-w` returns 404 — expected, that username is not a demo anchor and no real Supabase user matches the slug.
- Auth gate on `/profile` intact (`307 → /auth/login?next=/profile`).

**Note on visual verification:** the new hero only renders for a real Supabase user whose `display_name` slug-matches the URL AND who has zero predictions. realUsers ≈ 0 today, so a true end-to-end visual check requires creating a Supabase test user. Logic is provably exercised by the bundle marker; structural review confirms behavior is purely additive — no risk to existing flows.

**Risk:** Very low. Pure presentation. No backend, no env vars, no schema, no new files (sub-component lives at the bottom of the same file). Behavior for profiles with `totalPredictions > 0` is byte-identical to before.

---

### Profile empty-state hero (Priority 4 shipped)

**Problem:** A logged-in user with zero predictions landed on `/profile` and saw four nearly-empty cards (Accuracy/Streak/Badges/History) plus an Activity Overview link to /dashboard. Nothing explained what the platform rewards. The first call felt like a bet, not the start of a public reputation.

**What changed:**
- `components/profile/profile-client.tsx`
  - New in-file `EmptyProfileHero` sub-component. Rendered only when `totalPredictions === 0`.
  - Streak card and Badges card now gated behind `totalPredictions > 0` (Accuracy and History already were).
  - Account card, Activity Overview, and Session card remain unconditional.
- Hero layout: emoji headline (`🎯 Make your first call.`) + identity subcopy ("Start your streak, earn your specialty, and climb the leaderboard.") + three pillar mini-cards (🔥 Streak / 🪙 Specialty / 🏆 Leaderboard) explaining what each prediction builds, then two CTAs (Explore Markets primary, Browse leaderboard secondary).
- Vocabulary is deliberately the same noun set used in: OG profile cards, leaderboard #1 spotlight, and share copy generators. A new user sees the same identity language in every surface.
- Bilingual EN/ES.

**Verification:**
- `pnpm build` clean (TS strict).
- `/profile` is auth-gated (307 → `/auth/login?next=/profile`), so the chunk isn't reachable from a logged-out probe of `/profile` itself. Confirmed live by scanning chunks referenced from public pages (`/`, `/auth/login`, `/leaderboard`, `/markets`, `/help`): literal `"Make your first call"` found in `/_next/static/chunks/15j6p9n0n63e~.js` — a prefetched common chunk pulled in by App Router on those pages.
- Smoke 9 endpoints all 200; `/profile` auth-gate intact (`Location: /auth/login?next=/profile`).

**Risk:** Very low. Pure presentation change — no state, no network, no env vars. Behavior for users with `totalPredictions > 0` is unchanged. Path back to previous behavior is removing the `EmptyProfileHero` render and unwrapping the two new gates.

---

### Category filter chips on the leaderboard (Priority 3 shipped)

**Problem:** The leaderboard was a single global list. Specialty was visible on each row ("🪙 Crypto") but you couldn't slice the board by it. A Crypto forecaster couldn't see "the leaderboard for Crypto specialists" — the tribal/niche identity layer was missing.

**What changed:**
- `components/leaderboard/forecasters-leaderboard.tsx`
  - New `categoryFilter: "all" | <PT category id>` state, default `"all"`.
  - New horizontal chips row above the existing sort tabs: `[All ✦] [Crypto 🪙] [AI & Tech 🤖] [Sports ⚽] [Gaming 🎮] [Entertainment 🎬] [Internet 🌐] [Global News 📰]`. Built from `PT_CATEGORIES`.
  - `visible = useMemo(ranked.filter(r => r.topCategoryId === filter), ...)` — pure client-side filter on top of the existing global ranking. Sort + tie-break are untouched; they apply *inside* the filtered view by construction.
  - **#1 Spotlight** label now includes the active category: `🔥 Streak leader · 🪙 Crypto`. Stays as the base label on "All".
  - **Climb detection** still runs against the GLOBAL `ranked` list, never `visible` — flipping a category filter cannot re-fire climb toasts.
  - **YOU injection** unchanged; user shows in any category tab whose id matches their earned `topCategoryId`. If they haven't earned a specialty yet (under the ≥3-resolved / ≥50%-accuracy threshold), they show only on "All". This is intentional — specialty is earned, not assumed.
  - **Empty state** is category-aware: when 0 specialists exist (e.g. Global News today), surfaces `"No specialists in <Category> yet — be the first forecaster to earn the <Category> title"` with a CTA to `/markets`.
  - New `CategoryChip` sub-component (pill styling, horizontal scroll snap on mobile).

**Verification:**
- `pnpm build` clean (TS strict).
- Node sim (`/tmp/sim-cat-filter.mjs`) over the 12 demo anchors confirms expected slices: Crypto 3, AI & Tech 3, Sports 2, Gaming 2, Entertainment 1, Internet Culture 1, Global News 0 → empty state.
- Prod live: literal `"No specialists in"` (only present in this commit) found in client chunk `/_next/static/chunks/0utya37dqr63e.js`.
- Smoke 11 endpoints all 200 (incl. all four sort modes, OG profile, OG streak, polymarket).

**Risk:** Very low. Purely additive — new state, new chips row, filter applied on top of the existing pipeline. No API change, no DB change, no env vars. Removing the chips row would restore byte-identical behavior to commit 46095e6.

**Trade-off acknowledged:** filter is client-side. The API limits `limit(50)` real rows, so a category with many real users could be undersampled. Today realUsers=[] makes this moot; when the user base grows, the path to server-side filtering is straightforward (add `?category=crypto` param on the existing endpoint).

---

### Streak leaderboard tab — fix + specialty (Priority 2 shipped)

**Problem:** The "Streaks" tab existed but was silently ranking by `best_streak` while the UI surfaced `🔥 currentStreak` as the primary value. A user with `current=0 / best=30` outranked a `current=10 / best=10` user — visually deceptive. No tie-break (indeterminate order on ties). And the row gave no signal about *what kind* of forecaster the person is, breaking continuity with the OG card and share copy.

**What changed:**
- `app/api/leaderboard/forecasters/route.ts`
  - `SORT_COLUMNS.streak` flipped from `best_streak` → `current_streak`. UI and ranking now agree.
  - Deterministic tie-break chain on every sort: primary → `accuracy_pct DESC` (nulls last) → `total_predictions DESC`.
  - SELECT extended with `predictions` JSONB. Server computes `topCategoryId` per row via the existing `topCategoryFromPredictions` helper. New optional field on `ForecasterEntry`.
- `lib/demo-leaderboard.ts` — new `demoCategoryIdFromLabel()` so demo anchors map to PT category ids the same way real users do.
- `components/leaderboard/forecasters-leaderboard.tsx`
  - `RowEntry` gains `topCategoryId`. Populated from `realUsers[i].topCategoryId` and from demo anchors via the new label-to-id helper.
  - Client `compare()` mirrors the server tie-break. `YOU` injection stays coherent with the merged demo+real ordering.
  - Streak row secondary: `Best: 35d · 🪙 Crypto` (or `Best: 35d · 67% accuracy` when specialty isn't earned yet).
  - `#1 Spotlight` now has a sort-aware label (`🔥 Streak leader` / `🎯 Accuracy leader` / `🏅 Most badges` / `🏆 Most active`) and shows `Best at X · 71% accuracy` + `Best: Nd` sub-line when sort=streak. Vocabulary matches the OG profile cards and the share copy.

**Verification:**
- Local `pnpm build` clean (TS strict).
- Node sim of the demo-only sort (`/tmp/sim-streak.mjs`) reproduces the expected order — `#1 Alex M. 🔥 42d / Best at Crypto 🪙`, `#2 Sarah T. 🔥 28d / 71% acc / AI & Tech`, etc.
- Prod smoke: `/api/leaderboard/forecasters?sort=streak|accuracy|badges|activity` all 200. `/leaderboard` page 200. OG profile route 200.
- Deploy confirmed live: the new `"Streak leader"` literal is present in production client chunk `/_next/static/chunks/0zm_oqg8p3fip.js`.

**Risk:** Low. API field is additive; the only behavior change is the `streak` column flip (which is the *intended* fix). Tie-break chain is purely a refinement. Demo merging logic preserved.

---

### Share copy with category specialty (Priority 1 shipped)

**Problem:** OG cards now show "Best at Crypto 🪙" but the actual share string in Called It / Climb / Streak modals was still generic — `"67% accuracy"` with no signal about what the user is *strong at*. Reading the post in someone else's feed told you nothing about the sharer's identity.

**What changed:**
- `lib/share-copy.ts`
  - New `CategoryRef = { id; label; emoji }` type.
  - Optional fields added to all three data interfaces: `marketCategory` + `topCategory` on `CalledItData`, `topCategory` on `StreakMilestoneData` and `LeaderboardClimbData`. All optional — call sites that don't pass them get **byte-identical** output to the previous version (backward-compat verified in prod).
  - New helper `topCategoryFromPredictions(preds)` — mirrors server-side `computeCategoryStats` thresholds (≥3 resolved, ≥50% accuracy) so X/WhatsApp copy claims match what the profile UI claims.
  - New helper `categoryRefById(id)` for inline resolution from a `PredictionRecord.category` id.
- `components/called-it-modal.tsx` — resolves `marketCategory` inline; accepts optional `topCategory` prop.
- `components/profile/profile-client.tsx` — passes `topCategory` computed from the store's `predictions`.
- `components/leaderboard-climb-toast.tsx` — `ClimbInfo` gains optional `topCategory`.
- `components/leaderboard/forecasters-leaderboard.tsx` — populates `topCategory` when constructing the climb event.

**Copy variants shipped (verified live via `POST /api/ai/share-copy`):**
- Called It w/ specialty: `🎯 YES on "<title>" when 80% disagreed 🎲. 67% in Crypto 🪙.`
- Called It w/ per-call tag (no specialty yet): `🎯 NO on "<title>". 🤖 AI & Tech.`
- Leaderboard Climb: `Up 5 spots. Now #7 on @PredictionTrade. 71% in AI & Tech 🤖.`
- Streak Milestone: `⚡ 18-day streak — one full week. Top Sports ⚽ forecaster.`
- Baseline (no category passed): identical to pre-change output.

**Risk:** Very low. Pure additive type changes, all new fields optional, no UI changes, no DB changes, no env vars. Backward-compat proven in prod with a no-category POST.

---

### Profile OG image — `/api/og/profile/[username]` (Priority 1b shipped earlier today)

**Problem:** Sharing a profile link to X / WhatsApp / LinkedIn produced a plain title-only card. No visual identity, no accuracy, no streak — nothing that conveys "this person is a real forecaster". Lowest-cost lever to lift share-driven traffic was missing.

**What changed:**
- New edge route `app/api/og/profile/[username]/route.tsx` — Satori `ImageResponse`, 1200×630, same pattern as `/api/og/streak/route.tsx`.
  - Accepts query overrides (`n`, `a`, `s`, `b`, `t`, `c`) so demo anchors (whose data is local) skip the round-trip; real users fall through to an internal `fetch` to `/api/profile/[username]`.
  - Renders: PT logo + brand, large initials avatar (category-colored border), display name, `@username`, accuracy headline (`X% accurate · 🔥 N-day streak · Best at <Category> <emoji>`), 4-stat row (Accuracy / Streak / Best / Predictions), footer `predictiontrade.online`.
  - Category accent color is pulled from a 7-category map matching `lib/categories.ts` (AI&Tech indigo, Crypto amber, Sports emerald, Gaming violet, Entertainment pink, Internet cyan, Global News slate).
  - **Twemoji gotcha**: `next/og` uses Twemoji, which does not cover `₿` (U+20BF). The OG route remaps Crypto to `🪙` for render only. The rest of the product keeps `₿`.
- `app/profile/[username]/page.tsx` — `generateMetadata` now emits `openGraph` and `twitter` (`summary_large_image`) tags pointing at the new route. Demo users get fully pre-populated query params (no DB hit); real users use the bare endpoint (OG route fetches its own data).

**Verification (local dev server, three variants):**
- ✅ `alex-m` (demo, crypto, amber) — full headline, stats, 🪙 renders
- ✅ `sarah-t` (demo, ai-tech, indigo) — full headline, stats, 🤖 renders
- ✅ `nobody-real` (no data) — graceful fallback: avatar with first initial, "Forecaster on PredictionTrade", em-dashes in stats

**Risk:** Very low. New isolated route, no edits to existing components, no DB changes, no env vars. Edge runtime ($0 marginal cost). Cannot break the core loop because nothing calls it from the rendering tree — only crawlers pull it via meta tags.

**Files touched:**
- `app/api/og/profile/[username]/route.tsx` (new, ~280 lines)
- `app/profile/[username]/page.tsx` (generateMetadata expanded)
- `.claude/launch.json` (new, preview-tool config — not user-facing)

---

## 🛡️ Hardening pass — final consolidated state (2026-05-16)

### Sync verification — 100% consistent ✅

| Layer | State |
|---|---|
| Local HEAD | `55b5112` (clean working tree) |
| GitHub `origin/main` | `55b5112` |
| Vercel production deployment | `dpl_CgfmE4od6sftAKq76ikBGVgBXZFJ` (sha `55b5112`, `source: "git"`, READY) |
| `predictiontrade.online` alias | → latest deployment ✅ |
| `www.predictiontrade.online` alias | → latest deployment ✅ |
| `pt-app-delta.vercel.app` alias | → latest deployment ✅ |
| `pt-app-git-main-*` alias | → latest deployment ✅ |
| DNS `www` CNAME | `f9a241c4d22e4b17.vercel-dns-017.com` (Vercel anycast) ✅ |
| Supabase env vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sensitive, production+preview) ✅ |
| Pipeline | `git push` → webhook → build → READY → aliases reassigned, fully automatic ✅ |

### Production endpoint health (final E2E)

All public pages 200, all auth-required 307 (redirect to login), all auth APIs 401 unauthenticated:
`/`, `/markets`, `/leaderboard`, `/play`, `/auth/login`, `/auth/sign-up`, `/api/wallet`(401), `/api/stats/platform`(200), `/api/leaderboard/forecasters`(200), `/api/user/stats`(401), `/api/demo-portfolio`(401), `/api/og/streak`(200 PNG), `/api/profile/[username]`(200), `/api/polymarket`(200), `/api/game/leaderboard`(200), `/robots.txt`(200), `/sitemap.xml`(200).

### ⚠️ Known tech debt — NOT fixing in this pass, documented for future cleanup

**1. Real PMS-project contamination in PT codebase** (priority for cleanup session)
PT code makes runtime calls to PMS production infrastructure. Violates the absolute PT↔PMS separation rule in CLAUDE.md. The contamination is contained to the `/demo` page route (auth-required, so unauth users never trigger it; auth users probably see errors because `PMS_API_KEY` is not configured in PT's Vercel env). Not breaking production but a structural violation.

Files involved:
- `lib/pms.ts` (466 lines) — PMSClient calling `api.predictionmarkets.market/v1`, also exports `PMS_WS_URL` for `wss://ws.predictionmarkets.market/v1/stream`
- `types/pms.ts` (~190 lines) — TS interfaces for PMS API responses
- `hooks/use-pms-markets.ts` — SWR hook calling `/api/pms`
- `hooks/use-pms-websocket.ts` — opens WebSocket to PMS WS URL
- `app/api/pms/route.ts`, `app/api/pms/[marketId]/history/route.ts`, `app/api/pms/[marketId]/odds/route.ts` — proxy routes calling `pmsClient`
- `components/demo-dashboard.tsx:35` — calls `usePMSMarkets(isSimulating)`

Cleanup options (decide later):
- **A**: Replace `usePMSMarkets` in `demo-dashboard.tsx` with `usePolymarketMarkets` (already-working alternative). Delete `lib/pms.ts`, `types/pms.ts`, hooks, and `app/api/pms/*` routes. Cleanest, removes contamination entirely.
- **B**: If `/demo` is paused or being replaced anyway, just delete `demo-dashboard.tsx` and follow-on (`/demo` already not the main flow — Markets is the main entry).

**2. Duplicate market API route — `/api/markets` (500 in prod, unused)**
`app/api/markets/route.ts` is legacy. Returns 500 because requires `FEATURED_MARKETS_JSON` env var not set in Vercel. NOT called by any component (grep confirmed). The active route is `app/api/polymarket/route.ts`.
Cleanup: delete `app/api/markets/route.ts` + remove `MARKETS_API_TOKEN` and the duplicate `FEATURED_MARKETS_JSON` constant from `.env.local.example` if not used by `/api/polymarket` either.

**3. Stale Vercel alias** (cosmetic, no functional impact)
Alias `pt-app-predictiontrade1-1298-predictiontrade1-1298s-projects.vercel.app` still points to the manual CLI deployment `dpl_6zqD4XsxATRX4meJ2YxMeE1RP5qa` instead of the latest git deployment. Just hit "Promote to production" on the latest git deploy or let Vercel garbage-collect (deployments expire after 30 days per project config).

**4. Duplicate `pt-app` project in PMS Vercel team** (deferred housekeeping)
`prj_VLlZqHZrs6AY2fqUgBjMU2ZghNEY` in `predictionmarketssolutions-7124s-projects` — created by accident during infra audit. Inofensivo (no git link, no domain), pero contamina la separación team-level PT/PMS. Borrar desde cuenta PMS.

**5. Old GitHub repo `PredictionMarketsSolutions/pt-app`** (deferred)
Posiblemente borrado o privado (404 público), but `repoId 1239741806` may still exist. Auditar y borrar si no tiene historia única.

**6. ~~CLAUDE.md drift `/api/leaderboard/flash-players`~~** — ✅ resolved 2026-05-17. Line removed from `.claude/CLAUDE.md` route list. Real route `/api/game/leaderboard` exists (used by `/play`) and is intentionally not in the user-facing route list.

**7. Silent error handlers** (low priority, partly intentional)
20 files use empty `catch {}` blocks. Some are legitimate fire-and-forget patterns (supabase-sync, share-copy). Some could hide bugs (auth flows). Audit when refactoring share/auth surfaces.

**8. Loose typing** (low priority)
13 `: any` / `as any` / `@ts-ignore` occurrences across 11 files. Mostly in Supabase response handling and arcade game state. Not blocking but worth tightening when touching those files.

### Final declaration

**PT infrastructure is officially stable as of commit `55b5112` on 2026-05-16.**
- Auto-deploy pipeline verified end-to-end (twice).
- Production serves the correct commit with all critical fixes applied.
- All sync layers consistent.
- Separation PT↔PMS clean at the account/team/domain level.
- Tech debt is documented above for a calm cleanup session; none of it blocks the next phase.

The next phase (social/profile polish + reputation loops) can proceed on this base without infra concerns.

---

## Production Status

| System | Status |
|---|---|
| predictiontrade.online | ✅ Live — bet crash + login loop fixed (commit `ffa1de2`), CLI redeploy `dpl_6zqD4XsxATRX4meJ2YxMeE1RP5qa` |
| GitHub main | ✅ Clean — last commit `cb33bdc` (this commit will be the next) |
| Vercel project | ✅ `prj_WyzqTDsMjGaCD8cLifn3Oga9utkq` in team `predictiontrade1-1298s-projects` (`prediction.trade1@gmail.com`) |
| Vercel Git link | ✅ Re-linked to `PredictionTradeHQ/pt-app` (was incorrectly pointing at `PredictionMarketsSolutions/pt-app`) |
| Auto-deploy | 🧪 Verifying with this commit |
| TypeScript build | ✅ Strict — 0 errors |
| Supabase project | ✅ New clean project `vkizidrsuwsreepsbbuy` |
| Supabase `wallets` | ✅ Live + RLS (migration 000) |
| Supabase `demo_portfolios` | ✅ Live + RLS (migration 004) |
| Supabase `user_gamification` | ✅ Live + RLS (migration 001) |
| Supabase `public_leaderboard` VIEW | ✅ Live WITH `predictions` column (migrations 001 + 003) |
| Core loop | ✅ login → bet → balance persists → positions persist → leaderboard → profiles |

---

## ✅ MIGRATIONS — ALL COMPLETE (2026-05-16)

New Supabase project `vkizidrsuwsreepsbbuy` — all 4 migrations applied and verified:

| Migration | Table/Object | Status |
|---|---|---|
| `000_wallets.sql` | `wallets` | ✅ applied |
| `001_gamification.sql` | `user_gamification` + `public_leaderboard` VIEW | ✅ applied |
| `003_public_leaderboard_predictions.sql` | VIEW extended with `predictions` | ✅ applied |
| `004_demo_portfolios.sql` | `demo_portfolios` | ✅ applied |

**No pending migrations for next session.**

---

## What Was Built — 2026-05-16 Infra Restore Session (COMPLETE)

### Vercel↔GitHub pipeline restored (commits `323f8a6`)

**Problem:** Production at predictiontrade.online was frozen at the "Initial commit" `29e46d75` since 2026-05-15. Every push to `PredictionTradeHQ/pt-app` failed to auto-deploy. The "fixes" (bet crash + login loop) were in GitHub but never reached production.

**Root cause (audit):** The Vercel project `pt-app` (`prj_WyzqTDsMjGaCD8cLifn3Oga9utkq`) in team `predictiontrade1-1298s-projects` was Git-linked to **`PredictionMarketsSolutions/pt-app`** (repoId `1239741806` — user's personal GitHub) instead of the active org repo **`PredictionTradeHQ/pt-app`** (repoId `1239728341`). These are two distinct GitHub repos, not a transfer. Pushes to the org repo had no Vercel webhook listening.

**Steps taken:**
1. Logged into Vercel CLI as `prediction.trade1@gmail.com` (PT account, separate from PMS account `predictionmarkets.solutions@gmail.com`)
2. Fixed local `.vercel/project.json` to point at the real PT project (was contaminated to a duplicate `pt-app` accidentally created in the PMS team)
3. CLI deploy `vercel --prod` from local HEAD `cb33bdc` → `dpl_6zqD4XsxATRX4meJ2YxMeE1RP5qa` (unblocked production immediately)
4. Operator added GitHub Login Connection to Vercel account + installed Vercel GitHub App on `PredictionTradeHQ` org
5. API call `POST /v9/projects/{id}/link` → re-linked to `PredictionTradeHQ/pt-app` (repoId `1239728341`)
6. Test push of commit `323f8a6` → webhook fired → Vercel built `dpl_8FJjSyZjTHbi4miD8ZLhTsDwqJPX` → READY in ~45s
7. Operator validated in browser: login, bet flow, persistence, console — all clean

**Production state after this session:**
- ✅ Domain `predictiontrade.online` serves the auto-deploy git build
- ✅ Every `git push origin main` now auto-deploys via Vercel webhook
- ✅ Source attribution: deployments show `source: "git"` (not `cli`) — clean pipeline
- ✅ Aliases (`predictiontrade.online`, `www.predictiontrade.online`, `pt-app-delta.vercel.app`, `pt-app-git-main-*`) all reassign automatically on each git deploy

**Vercel canonical state (do not forget):**
- Team: `predictiontrade1-1298s-projects` (`team_zshE08lKGriKwvkxgJGOBufS`) — owner `prediction.trade1@gmail.com`
- Project: `pt-app` (`prj_WyzqTDsMjGaCD8cLifn3Oga9utkq`)
- Git link: `PredictionTradeHQ/pt-app` branch `main`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both sensitive, production+preview)

---

## What Was Built — 2026-05-16 Earlier Sessions

### Core Loop Stability (commits `e9e675c`, `50e20d9`, `b448e04`)

**Problem:** Multiple production failures discovered after credibility pass:
1. Bet positions silently lost on refresh → `demo_portfolios` table never existed
2. "Supabase no está configurado" error → Vercel missing `NEXT_PUBLIC_*` env vars
3. `/api/stats/platform` persistent 404 → ISR cache from broken build without env vars

**Fixes shipped:**
- `supabase/migrations/004_demo_portfolios.sql` — creates `demo_portfolios` table + RLS policies; also adds `wallet_update_own` UPDATE policy to `wallets` if missing
- `components/markets-app.tsx` — `persistPortfolio()` now checks `response.ok` and logs errors
- `.env.local.example` — removed PMS contamination (PMS_API_KEY, PMS_BASE_URL, PMS_WS_URL)
- `app/api/stats/platform/route.ts` — changed from `revalidate = 300` (ISR) to `dynamic = "force-dynamic"` to prevent 404 caching
- Vercel env vars: user added `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Production + Preview; force-redeploy triggered via empty git commit

**Critical discovery:** CLAUDE.md incorrectly stated `user_gamification` was "live in production since 2026-05-13". This was false — migration 001 was never run. All gamification data lives only in localStorage. Docs corrected to reflect true state.

**Status after this session:**
- ✅ `/api/wallet` → 401 (correct — auth required, Supabase connected)
- ✅ `/api/stats/platform` → fix deployed, should return 200 after next Vercel build
- ✅ Bet flow: balance → wallets table, positions → demo_portfolios table (both work with migration 004)
- ✅ Auth flow: login, signup, magic link all functional
- ❌ Leaderboard gamification: needs migration 001 → 003 (operator action)

---

## What Was Built — 2026-05-15 Session

### Credibility Pass (commit `3891faf`)
**Problem:** PT had multiple fake/dishonest elements that broke user trust:
- Hero stat "4,200+ predictions made" was hardcoded
- Community section had fake support cards ("Live Chat 24/7", "Help Center") that led nowhere
- Onboarding copy felt like a trading platform, not a social forecasting product
- Features grid pointed to `/dashboard` instead of `/leaderboard`

**Solution:**
- `components/hero.tsx` — dynamic stat fetch from `/api/stats/platform` (real count from `public_leaderboard`); honest fallback when no data
- `app/api/stats/platform/route.ts` — new public endpoint, 5-min cache, reads `public_leaderboard`
- `components/community.tsx` — replaced fake support cards with real platform feature cards (Leaderboard, Academy, Live Markets)
- `components/features-grid.tsx` — reframed from "trading tools" to "forecasting reputation" language
- `components/onboarding/first-prediction-guide.tsx` — social identity framing, "track record from day one"

**Strategic impact:** Removed credibility-destroying fake elements. PT now only shows what actually exists.

### Public Profile Rebuild (commit `be4158c`)
**Problem:** Public profiles of real users showed basic stats but nothing that communicated *reputation* or *identity*:
- CategoryAccuracy read from local Zustand (invisible to profile visitors)
- No "best at X" callout
- No contrarian/biggest calls section
- No shareable headline

**Solution:**
- `lib/profile-helpers.ts` — shared server-side helpers (no duplication between API route and page)
  - `computeCategoryStats()` — groups predictions by category, min 3 resolved, sorted by accuracy %
  - `computeTopCalls()` — contrarian correct predictions (prob <30%), top 3 most contrarian
  - `normalizeRecentPredictions()` — last 10 predictions, sorted by date
- `app/api/profile/[username]/route.ts` — now returns `categoryStats` and `topCalls` in `RealProfileData`
- `app/profile/[username]/page.tsx` — `fetchRealProfile` updated to use shared helpers
- `components/profile/real-public-profile.tsx` — full rebuild:
  - `buildHeadline()` auto-generates one-liner: "63% accurate · 🔥 7-day streak · Best at Crypto 🤖"
  - Stats grid with accuracy highlight (green border/bg when ≥60%)
  - CategoryAccuracy section: "Best at X" + per-category progress bars
  - "Biggest Calls" section: top contrarian correct predictions
  - Category tag on each prediction row
  - Share on X + Copy Link buttons with dynamic copy text

**Strategic impact:** Public profiles are now *identity artifacts* — shareable, competitive, reputational. The foundation for viral loops via profile sharing.

**Activation status:**
- Code: ✅ Deployed to production
- Data layer: ⚠️ Needs migration 003 in Supabase (see above)

---

## Completed Phases

- ✅ Phase 0 — Foundation (Next.js, Supabase, Vercel, TypeScript strict)
- ✅ Phase 1 — Social Foundation (streaks, badges, OG cards, categories, public profiles)
- ✅ Phase 2 — Social Identity Layer (leaderboard, demo anchors, home widgets)
- ✅ Phase 3 — Supabase Sync + Real Accuracy (user_gamification live, accuracy engine, Called It)
- ✅ Phase 4a — Real Leaderboard (Supabase VIEW, #1 Spotlight, real+demo merge)
- ✅ Phase 4b — Real Public Profiles (slugify, RealPublicProfile, /api/profile/[username])
- ✅ Phase 4c — Market Intelligence Signals (lib/market-signals.ts, 9 signal types, $0 cost)
- ✅ Phase 4d — Social Live Feeling (ActivityTicker, StreakAtRiskBanner, CategoryAccuracy)
- ✅ Phase 4e — Viral Social Loops (share engine, MilestoneCelebration, hero CTA)
- ✅ Phase 4f — Bet Flow Stability (parallel API writes, custom amount, no auth disruption)
- ✅ Phase 5a — UX Polish (mobile toast, balance modal, real ticker, Called It flow)
- ✅ Phase 5b — Lightweight Onboarding (auth callback → /markets, welcome banner, nudges)
- ✅ Phase 5c — Credibility Pass (honest stats, no fake features, social-first copy)
- ✅ Phase 5d — Public Profile Identity (server-side category accuracy, top calls, shareable headline)

---

## Strategic Direction — Decided 2026-05-15

**Active focus:** Social identity — profiles, leaderboard, shareability artifacts.

**Explicitly paused (do not open without operator confirmation):**
- Phase 4g: AI Layer (no ANTHROPIC_API_KEY, no AI costs)
- Phase 5: Growth / content engine / Product Hunt
- Any real-money, financial, or enterprise features

PT stays a **virtual social forecasting platform**. Zero cost integrations for now.

---

## Pending — Priority Order

### 🚀 ACTIVE FOCUS — Next session
Social/profile polish + reputation loops. Operator explicitly chose this path after PT core stabilization on 2026-05-16.

**Already shipped this day:**
- ✅ Profile OG image (commit `92f826c`)
- ✅ Share copy with category specialty (commit `045b2b6`)
- ✅ Streak leaderboard tab fix + specialty (commit `46095e6`)
- ✅ Category filter chips on leaderboard (commit `6c3402a`)
- ✅ Profile empty-state hero — private (commit `f21d018`)
- ✅ Public profile empty state polish (commit `428f642`)
- ✅ Identity-aligned first-prediction nudge (commit `553b9b9`)
- ✅ Sign-in routes 0-pred users to /markets (commit `9f39678`) — last activation-funnel leak closed

**Activation funnel is now end-to-end coherent.** Every entry path (sign-up confirm, sign-in, returning visit to /profile, public profile of a brand-new forecaster, share preview) speaks the same identity language: 🔥 streak / 🪙 specialty / 🏆 leaderboard.

**Avatar System status:** Phases 1 + 2 + 3 shipped end-to-end. Real users can upload, swap, and see their avatar render across all four surfaces collapsed in Phase 3. Phase 4 (OG card rendering inside Satori) deferred.

**Next recommended steps (in order):**
1. **Follow System foundation (next major)** — avatars make this finally worth doing. Proposed shape:
   - Migration `007_follows.sql`: `public.follows (follower_id uuid, followee_id uuid, created_at timestamptz default now(), primary key (follower_id, followee_id))` + RLS (`SELECT public`, `INSERT/DELETE where follower_id = auth.uid()`).
   - New `/api/follows` (POST follow, DELETE unfollow) or direct client `.from('follows').upsert/delete` with the existing auth context.
   - `RealPublicProfile` header: follow button (+1/-1 toggle) next to share buttons; follower count badge.
   - `LeaderboardRow`: tiny follower count on hover or a follow chip for the top N rows.
   - `public_leaderboard` extension or a separate VIEW exposing follower count per user so the leaderboard can show + sort by it.
   - Scope cut: no /feed yet (build follow primitive first, observe).
   Detailed proposal when operator gives the go.
2. **Welcome modal on /markets first visit** — only if activation data shows the banner+guide aren't enough.
3. **Server-side category filter** — once realUsers > a few dozen.
4. **OG profile cache strategy** — explicit `s-maxage=300`. Low priority.
5. **Phase 4 of Avatars** — render the user's photo inside the OG card. Only worth doing once a non-trivial number of users have actually uploaded one.

### 🧹 Deferred housekeeping (do in a calm session, not urgent)
- Cleanup duplicate `pt-app` project in PMS team `predictionmarketssolutions-7124s-projects` (`prj_VLlZqHZrs6AY2fqUgBjMU2ZghNEY`) — created accidentally during infra audit, sin git link, sin dominios, completamente aislado. Requires logout PT → login PMS → DELETE.
- Cleanup old GitHub repo `PredictionMarketsSolutions/pt-app` (repoId `1239741806`) — desconectado de Vercel, posiblemente privado o ya borrado (404 público). Verify no unique history then delete in GitHub UI.
- Rename `lib/pms` → `lib/polymarket-sample` or similar — internal abbreviation that misleadingly suggests PMS-project contamination (it's not, but the name is confusing).
- Remove `/api/markets` route if confirmed unused — currently 500 due to missing `FEATURED_MARKETS_JSON` env var, not called by frontend.

### Priority 0 — ✅ COMPLETE: all migrations applied (2026-05-16)
New Supabase project `vkizidrsuwsreepsbbuy` — all tables live, core loop verified end-to-end.

### Priority 1 — ✅ RESOLVED: bet persistence bug (commit `e9e675c`)
Root cause: `demo_portfolios` never existed. Fix: migration 004 + `persistPortfolio()` error logging.
Applied and verified in production.

### ✅ RESOLVED (2026-05-16): Bet crash — TypeError in formatTimeAgo (commit `ffa1de2`)
Root cause: `UserPosition.timestamp` is stored as `Date` but JSON serialisation converts it to ISO string.
After Supabase hydration, old positions have string timestamps. When the user makes a new bet,
`setActiveTab("positions")` renders old positions and `formatTimeAgo(pos.timestamp)` calls
`string.getTime()` → TypeError → React tree crash. The write to Supabase works fine (fire-and-forget
runs before the crash), which is why the bet appears on reload.
Fix: `formatTimeAgo` now accepts `Date | string` (using `instanceof Date` check). Hydration also
converts timestamps with `new Date()` as a second layer of defence.

### ✅ RESOLVED (2026-05-16): Login redirect loop (commit `ffa1de2`)
Root cause: Login page created its own `createClient()` instance, separate from AuthProvider's.
`signInWithPassword` on one Supabase instance does NOT synchronously notify a different instance's
`onAuthStateChange`; propagation is via storage events (async). `router.push()` fired before the
storage event arrived, so AppShell saw `user: null, isLoading: false` → redirected back to `/auth/login`.
Fix: login page now uses `useAuth().supabase` (same instance as AuthProvider) and `await refresh()`
before navigating — guarantees user state is in context before the next route renders.

---

### Priority 2 — Social / Profiles / Leaderboard polish

Migrations complete — all data layers are live. Assess which areas feel incomplete. Candidates in order:

**1a. Leaderboard: category tabs**
Add "Best in [Category]" filter tabs to `/leaderboard` — top forecasters per category
using `category_predictions` JSONB keys already in `public_leaderboard` VIEW.
Files: `components/leaderboard/forecasters-leaderboard.tsx`, `app/api/leaderboard/forecasters/route.ts`

**1b. Profile OG image**
`/api/og/profile/[username]` — edge runtime PNG with username, accuracy %, streak, top category.
Reuse the Satori pattern from `/api/og/streak/route.tsx`. Makes shared profile links
get a rich card on X and WhatsApp — highest shareability leverage, $0 cost.
Files: new `app/api/og/profile/[username]/route.tsx`; update share button in `RealPublicProfile`.

**1c. Own profile empty state**
When a logged-in user visits `/profile` with 0 predictions, show a "Make your first call" CTA
instead of empty stats. Reduces friction for new users.

**1d. Streak leaderboard tab**
Separate "🔥 Streak" ranking tab in `/leaderboard` sorted by `current_streak` (already in VIEW).

### Priority 3 — Shareability artifacts

- Profile share copy: include top category specialty ("63% accurate in Crypto")
- Called It modal: pull category from prediction and include in share text
- `/api/og/profile/[username]` OG image (see 1b above) — highest leverage

### ⏸ PAUSED — Do not open without operator confirmation

- Phase 4g: AI Layer (ANTHROPIC_API_KEY, market summaries, AI share copy) — no costs yet
- Phase 5: Growth (trending feed, content engine, Product Hunt)
- Migration 002: username column (not needed yet)

---

## Architecture — Current State

```
Zustand gamification store v3 (localStorage)
  ↕ on profile visit + login + 2s debounce
lib/supabase-sync.ts (push/pull/merge)
  ↕
Supabase user_gamification table (RLS: own row only)
  ↕ VIEW (anon readable)
public_leaderboard → accuracy_pct, badges, predictions (after migration 003)
  ↕
Server-side computation (lib/profile-helpers.ts)
  → categoryStats (accuracy by category, min 3 resolved)
  → topCalls (contrarian correct predictions, top 3)
  → recentPredictions (last 10, sorted by date)
  ↕
/api/profile/[username] + /profile/[username]/page.tsx
  → RealPublicProfile component (headline, stats, categories, calls, badges, predictions)

lib/share-copy.ts (template engine)
  → called-it-modal.tsx (X + WhatsApp + Copy)
  → leaderboard-climb-toast.tsx (climb moment share)
  → app/api/ai/share-copy/route.ts (stub — Claude API ready when key is set)
```

---

## Do NOT Touch Without Reading Context First

| Area | Risk | Read first |
|---|---|---|
| Zustand store version | Bumping breaks localStorage for existing users | `stores/gamification.ts` migrations |
| Demo anchor usernames | Renaming breaks all profile links | `lib/demo-leaderboard.ts` |
| OG image route | Edge runtime — no Node-only imports | `app/api/og/streak/route.tsx` |
| Starting balance | Hardcoded in 6+ places | Search `100000` across codebase |
| `public_leaderboard` VIEW | Re-creating drops grants — always include GRANT | `supabase/migrations/003_*.sql` |

---

## Risks — Watch Out For

| Risk | Mitigation |
|---|---|
| Supabase anon key client-side only | `SUPABASE_SERVICE_ROLE_KEY` never exposed to browser |
| Zustand v3 migration | Do not bump version again without adding v3→v4 migration |
| Demo anchor usernames | Hardcoded in `lib/demo-leaderboard.ts` — do not rename (profile links break) |
| OG image route (edge runtime) | Do not import Node-only modules into `/api/og/streak/route.tsx` |
| Polymarket `outcomePrices` format | Sometimes returns JSON string — `checkResolutions()` handles with JSON.parse fallback |
| TypeScript strict mode | Always `pnpm build` before `git push` |
| PMS contamination | Never reference PMS code, skills, or Supabase from PT codebase |

---

## Key File Locations

| What | Where |
|---|---|
| Gamification store | `stores/gamification.ts` |
| Supabase sync | `lib/supabase-sync.ts` |
| Profile helpers (server) | `lib/profile-helpers.ts` |
| Badge definitions | `lib/badges.ts` |
| Demo leaderboard data | `lib/demo-leaderboard.ts` |
| Forecasters leaderboard UI | `components/leaderboard/forecasters-leaderboard.tsx` |
| Real forecasters API | `app/api/leaderboard/forecasters/route.ts` |
| Platform stats API | `app/api/stats/platform/route.ts` |
| Public profile page | `app/profile/[username]/page.tsx` |
| Public profile API | `app/api/profile/[username]/route.ts` |
| Public profile component | `components/profile/real-public-profile.tsx` |
| Share copy engine | `lib/share-copy.ts` |
| AI share copy route (stub) | `app/api/ai/share-copy/route.ts` |
| Called It modal | `components/called-it-modal.tsx` |
| Leaderboard climb toast | `components/leaderboard-climb-toast.tsx` |
| First prediction guide | `components/onboarding/first-prediction-guide.tsx` |
| OG image route | `app/api/og/streak/route.tsx` |
| SQL migration 001 (gamification) | `supabase/migrations/001_gamification.sql` |
| SQL migration 002 (username, optional) | `supabase/migrations/002_profiles_username.sql` |
| SQL migration 003 (predictions VIEW) | `supabase/migrations/003_public_leaderboard_predictions.sql` |
| Schema docs | `brain/SUPABASE-SCHEMA.md` |
| Full roadmap | `brain/ROADMAP.md` |
| Strategic vision | `brain/MASTER.md` |

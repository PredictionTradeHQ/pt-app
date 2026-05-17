# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Full session context, project state, and strategic direction live in `.claude/CLAUDE.md` — read that first for any non-trivial work.

---

## Commands

```bash
pnpm dev          # start dev server at localhost:3000
pnpm build        # TypeScript check + production build (run before every commit)
pnpm lint         # ESLint
```

There are no tests. `pnpm build` is the canonical correctness check — TypeScript strict mode is enforced and the build must stay clean.

Required env vars in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Architecture

### Request flow

```
Browser → Next.js middleware (Supabase session refresh)
       → App Router page (RSC or client)
       → [Polymarket Gamma API | Supabase | internal API routes]
```

Middleware at `middleware.ts` runs on every request to refresh the Supabase session cookie. It delegates to `lib/supabase/middleware.ts`.

### State architecture: localStorage-first with Supabase sync

The core gamification state lives in **Zustand v5 with `persist`** (key `pt-gamification`, version 3). This is the source of truth for streaks, predictions, badges, and accuracy. Supabase (`user_gamification` table) is a sync layer — pushed after each prediction, pulled on login to merge remote state.

`stores/gamification.ts` — main Zustand store  
`lib/supabase-sync.ts` — `pushGamification()` / `pullGamification()` / `mergeGamification()`  
`stores/demo-portfolio.ts` — wallet balance and bet positions (separate store)

The offline-first design means the app works without auth; data persists to Supabase only when a user is signed in.

### Data sources

**Polymarket markets:** `lib/polymarket.ts` fetches from `https://gamma-api.polymarket.com`. All fetches use `cache: "no-store"` — never cache market prices. The `RealtimePricesContext` polls every 30s with a `?_t=Date.now()` cache-buster.

**Leaderboard:** `app/api/leaderboard/forecasters/route.ts` reads the `public_leaderboard` Supabase VIEW, which joins `user_gamification` + `profiles`. Demo anchor users from `lib/demo-leaderboard.ts` are merged in on the client.

**Public profiles:** `app/api/profile/[username]/route.ts` resolves a username slug to a real Supabase user and returns their gamification snapshot. `lib/utils.ts → slugify()` is the canonical slug function used everywhere.

### Context providers (root layout)

```
LanguageProvider     → EN/ES toggle, flat key-value dictionary (inline in language-context.tsx)
  AuthProvider       → Supabase auth state, exposes useAuth()
    RealtimePricesContext → 30s Polymarket price polling
```

`AuthProvider` wraps everything — never render auth-dependent UI outside it.

### i18n pattern

No i18n library. `LanguageContext` holds a flat dictionary of string keys for both `en` and `es`. Components call `const { t } = useLanguage()` and render `t("keyName")`. All dictionary entries live inside `contexts/language-context.tsx`. To add a string: add the key to both `en` and `es` objects.

### Routing

`/play` uses a full-screen layout (no header/footer) — `app/play/layout.tsx` renders without `AppShell`. All other authenticated pages wrap with `AppShell` from `components/app-shell/app-shell.tsx`.

Legacy redirects: `/predict/*` → `/markets`, `/game` → `/play` (defined in `app/` folder page files).

### API routes

Edge runtime is used only for OG image generation (`app/api/og/streak/route.tsx`). All other API routes are standard Node.js serverless. The `SUPABASE_SERVICE_ROLE_KEY` is **not** available locally — server-side routes that need it only work in Vercel production.

### Arcade game state

`stores/arcade-game.ts` and `stores/game.ts` manage Prediction Flash game state separately from main gamification. Game results are stored in the `game_results` Supabase table.

---

## Key invariants

- **Starting balance is $100,000** — hardcoded in store, API, components, and i18n strings. Do not change.
- **Zustand persist version is v3** — migrations from v1→v2→v3 are already applied in `stores/gamification.ts`. If the schema changes, increment the version and add a migration.
- **Polymarket fetches must never be cached** — always `cache: "no-store"`.
- **Accuracy % is only shown when `resolvedCount >= 5`** — enforced in all display components.
- **Demo anchor users** in `lib/demo-leaderboard.ts` have stable slugs — profile links depend on them.
- **`/markets` is the canonical market browser** — never link to `/demo` for market navigation.

import { PT_CATEGORIES, getCategoryById } from "@/lib/categories"

// ─── Types ────────────────────────────────────────────────────────────────────
// This interface is the stable contract between components and the copy layer.
// When Phase 4g adds Claude API, the same interface is returned — components
// never change, only the generator implementation changes.

export interface ShareCopy {
  x: string        // ≤280 chars, ready for x.com/intent/tweet?text=
  whatsapp: string // conversational, for wa.me/?text= encoding
  text: string     // plain copy for clipboard (no platform assumption)
}

export type ShareType = "called-it" | "streak-milestone" | "leaderboard-climb"

// Minimal category reference used by all share generators.
// `emoji` is the OG-safe glyph — generators consume it as-is for X / WhatsApp
// (system fonts there render ₿ etc. just fine, unlike Twemoji in /api/og/*).
export interface CategoryRef {
  id: string
  label: string
  emoji: string
}

export interface CalledItData {
  username: string
  marketTitle: string
  prediction: "YES" | "NO"
  isContrarian: boolean
  accuracyPct?: number | null
  currentStreak?: number
  /** Category of the market that was called. */
  marketCategory?: CategoryRef
  /** User's overall specialty category (highest accuracy ≥50% with ≥3 resolved). */
  topCategory?: CategoryRef
}

export interface StreakMilestoneData {
  username: string
  streak: number
  topCategory?: CategoryRef
}

export interface LeaderboardClimbData {
  username: string
  previousRank: number
  currentRank: number
  accuracyPct?: number | null
  topCategory?: CategoryRef
}

export type ShareData = CalledItData | StreakMilestoneData | LeaderboardClimbData

// ─── Internal helpers ─────────────────────────────────────────────────────────

const BASE = "predictiontrade.online"

function pick<T>(arr: T[], seed: string): T {
  const h = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return arr[h % arr.length]
}

function trunc(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…"
}

// ─── Called It ────────────────────────────────────────────────────────────────

function calledItCopy(d: CalledItData): ShareCopy {
  const title = trunc(d.marketTitle, 70)
  // Identity-bearing accuracy line — "67% in Crypto 🪙" when the user has a
  // specialty, otherwise the plain "67% accuracy." fallback.
  const acc = d.accuracyPct
    ? d.topCategory
      ? ` ${d.accuracyPct}% in ${d.topCategory.label} ${d.topCategory.emoji}.`
      : ` ${d.accuracyPct}% accuracy.`
    : ""
  const crowd = d.isContrarian ? " Against the crowd." : ""
  // Per-call category tag — shown only when no specialty-driven accuracy line
  // is present (avoids double-tagging when "67% in Crypto 🪙" already exists).
  const marketCat =
    d.marketCategory && !(d.accuracyPct && d.topCategory)
      ? ` ${d.marketCategory.emoji} ${d.marketCategory.label}.`
      : ""

  const xVariants = [
    `Called it. "${title}" — I said ${d.prediction}.${crowd}${acc}${marketCat} ${BASE}`,
    `🎯 ${d.prediction} on "${title}"${d.isContrarian ? " when 80% disagreed 🎲" : ""}.${acc}${marketCat} ${BASE}`,
  ]

  const waVariants = [
    `Just called ${title} correctly${d.isContrarian ? " — against 80% of the crowd" : ""}.${acc}${marketCat} Come predict with me → ${BASE}`,
    `I said ${d.prediction} on "${title}" and nailed it${d.isContrarian ? " (contrarian call!)" : ""}.${acc}${marketCat} ${BASE}`,
  ]

  const seed = d.marketTitle + d.prediction
  const x = pick(xVariants, seed)
  const whatsapp = pick(waVariants, seed)
  return { x, whatsapp, text: x }
}

// ─── Streak Milestone ─────────────────────────────────────────────────────────

function streakMilestoneCopy(d: StreakMilestoneData): ShareCopy {
  const { streak } = d
  const emoji    = streak >= 30 ? "🏆" : streak >= 7 ? "⚡" : "🔥"
  const context  = streak >= 30 ? "a prediction machine" : streak >= 7 ? "one full week" : "building momentum"
  const specialty = d.topCategory ? ` Top ${d.topCategory.label} ${d.topCategory.emoji} forecaster.` : ""

  const x = `${emoji} ${streak}-day prediction streak on @PredictionTrade — ${context}.${specialty} Can you beat me? ${BASE}`
  const whatsapp = `I've predicted ${streak} days in a row on PredictionTrade${d.topCategory ? ` (${d.topCategory.label} ${d.topCategory.emoji})` : ""}. ${streak >= 7 ? "Come compete" : "Join me"} → ${BASE}`

  return { x, whatsapp, text: x }
}

// ─── Leaderboard Climb ────────────────────────────────────────────────────────

function leaderboardClimbCopy(d: LeaderboardClimbData): ShareCopy {
  const moved = d.previousRank - d.currentRank
  // Same identity-bearing accuracy line as Called It — "67% in Crypto 🪙"
  // when the user has a specialty, otherwise the plain accuracy fallback.
  const acc = d.accuracyPct
    ? d.topCategory
      ? ` ${d.accuracyPct}% in ${d.topCategory.label} ${d.topCategory.emoji}.`
      : ` ${d.accuracyPct}% accuracy.`
    : d.topCategory
      ? ` Top ${d.topCategory.label} ${d.topCategory.emoji} forecaster.`
      : ""

  const xVariants = [
    `Climbed from #${d.previousRank} → #${d.currentRank} on the PredictionTrade leaderboard (+${moved} spots).${acc} ${BASE}/leaderboard`,
    `Up ${moved} spots. Now #${d.currentRank} on @PredictionTrade.${acc} ${BASE}/leaderboard`,
  ]

  const seed = `${d.previousRank}-${d.currentRank}`
  const x = pick(xVariants, seed)
  const whatsapp = `I'm now #${d.currentRank} on the PredictionTrade leaderboard (was #${d.previousRank})${d.topCategory ? ` — ${d.topCategory.label} ${d.topCategory.emoji} specialty` : ""}. Come compete → ${BASE}/leaderboard`

  return { x, whatsapp, text: x }
}

// ─── Top-category helper ─────────────────────────────────────────────────────
// Mirrors the server-side `computeCategoryStats` thresholds in
// lib/profile-helpers.ts so X/WhatsApp copy matches what the profile UI claims.

const MIN_CATEGORY_RESOLVED = 3
const MIN_CATEGORY_PCT = 50

type PredLike = {
  resolved?: boolean
  correct?: boolean
  category?: string
}

/** Returns the user's strongest category (≥3 resolved, ≥50% accuracy) or null. */
export function topCategoryFromPredictions(preds: PredLike[]): CategoryRef | null {
  const byCat = new Map<string, { total: number; correct: number }>()
  for (const p of preds) {
    if (!p.resolved || p.correct === undefined || !p.category) continue
    const e = byCat.get(p.category) ?? { total: 0, correct: 0 }
    e.total += 1
    if (p.correct) e.correct += 1
    byCat.set(p.category, e)
  }
  let best: { catId: string; pct: number } | null = null
  for (const [catId, s] of byCat) {
    if (s.total < MIN_CATEGORY_RESOLVED) continue
    const pct = Math.round((s.correct / s.total) * 100)
    if (pct < MIN_CATEGORY_PCT) continue
    if (!best || pct > best.pct) best = { catId, pct }
  }
  if (!best) return null
  return categoryRefById(best.catId)
}

/** Resolves a PT category id to a CategoryRef, or null if id is unknown. */
export function categoryRefById(catId: string | undefined | null): CategoryRef | null {
  if (!catId) return null
  const cat = PT_CATEGORIES.find((c) => c.id === catId)
  if (!cat) return null
  return { id: cat.id, label: cat.label, emoji: cat.emoji }
}

/** Convenience alias for callers that already trust the id exists. */
export function categoryRefFromKnownId(catId: string): CategoryRef {
  const cat = getCategoryById(catId)
  return { id: cat.id, label: cat.label, emoji: cat.emoji }
}

// ─── Main export ──────────────────────────────────────────────────────────────
// Single synchronous function — always instant, no network, no cost.
// Phase 4g upgrade path: components call /api/ai/share-copy which returns the
// same ShareCopy shape — generated by Claude when ANTHROPIC_API_KEY is set.

export function generateShareCopy(type: "called-it", data: CalledItData): ShareCopy
export function generateShareCopy(type: "streak-milestone", data: StreakMilestoneData): ShareCopy
export function generateShareCopy(type: "leaderboard-climb", data: LeaderboardClimbData): ShareCopy
export function generateShareCopy(type: ShareType, data: ShareData): ShareCopy {
  switch (type) {
    case "called-it":        return calledItCopy(data as CalledItData)
    case "streak-milestone": return streakMilestoneCopy(data as StreakMilestoneData)
    case "leaderboard-climb":return leaderboardClimbCopy(data as LeaderboardClimbData)
  }
}

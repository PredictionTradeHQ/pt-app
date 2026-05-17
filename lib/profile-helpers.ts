/**
 * Shared server-side helpers for computing public profile stats
 * from the predictions JSONB array in public_leaderboard.
 *
 * Used by:
 *  - app/api/profile/[username]/route.ts  (API consumer)
 *  - app/profile/[username]/page.tsx      (server component)
 */

import { PT_CATEGORIES } from "@/lib/categories"
import type {
  PublicPredictionRecord,
  CategoryStat,
  TopCall,
} from "@/app/api/profile/[username]/route"

export type RawPred = {
  marketTitle?: string
  prediction?: string
  outcome?: string
  resolved?: boolean
  correct?: boolean
  createdAt?: string
  probAtTime?: number
  category?: string
  marketId?: string
}

const MIN_CATEGORY_RESOLVED = 3

export function computeCategoryStats(rawPreds: RawPred[]): CategoryStat[] {
  const byCategory = new Map<string, { total: number; correct: number }>()

  for (const p of rawPreds) {
    if (!p.resolved || p.correct === undefined || !p.category) continue
    const entry = byCategory.get(p.category) ?? { total: 0, correct: 0 }
    entry.total++
    if (p.correct) entry.correct++
    byCategory.set(p.category, entry)
  }

  return Array.from(byCategory.entries())
    .filter(([, s]) => s.total >= MIN_CATEGORY_RESOLVED)
    .map(([catId, s]) => ({
      catId,
      total: s.total,
      correct: s.correct,
      pct: Math.round((s.correct / s.total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)
}

export function computeTopCalls(rawPreds: RawPred[]): TopCall[] {
  return rawPreds
    .filter((p): p is RawPred & {
      marketTitle: string
      prediction: string
      outcome: string
      createdAt: string
    } => {
      if (!p.resolved || !p.correct || !p.marketTitle || !p.createdAt || !p.outcome) return false
      const prob = p.probAtTime ?? 50
      return (p.prediction === "YES" && prob < 30) || (p.prediction === "NO" && 100 - prob < 30)
    })
    .sort((a, b) => {
      const aOdds = a.prediction === "YES" ? (a.probAtTime ?? 50) : 100 - (a.probAtTime ?? 50)
      const bOdds = b.prediction === "YES" ? (b.probAtTime ?? 50) : 100 - (b.probAtTime ?? 50)
      return aOdds - bOdds
    })
    .slice(0, 3)
    .map((p) => ({
      marketTitle: p.marketTitle,
      prediction: p.prediction === "YES" ? "YES" as const : "NO" as const,
      probAtTime: p.probAtTime ?? 50,
      outcome: p.outcome === "YES" ? "YES" as const : "NO" as const,
      createdAt: p.createdAt,
    }))
}

// ─── Profile headline — single source of truth ────────────────────────────────
//
// Rendered on /profile (owner), /profile/[username] (public), and used by the
// share copy + OG card surfaces. Identity must read identically across all
// three so the owner sees the same one-liner that visitors do.

export type ProfileHeadlineStats = {
  totalPredictions: number
  accuracyPct: number | null
  currentStreak: number
  calledItCount: number
}

export function buildProfileHeadline(
  stats: ProfileHeadlineStats | null,
  categoryStats: CategoryStat[],
): string {
  // Empty profile reads aspirational, not abandoned — same 🎯 emoji used by
  // the private EmptyProfileHero so a brand-new forecaster's headline still
  // says "identity in progress" instead of "dead account".
  if (!stats || stats.totalPredictions === 0) return "🎯 New forecaster"

  const parts: string[] = []

  if (stats.accuracyPct !== null) parts.push(`${stats.accuracyPct}% accurate`)
  if (stats.currentStreak >= 2) parts.push(`🔥 ${stats.currentStreak}-day streak`)
  if (stats.calledItCount > 0) {
    parts.push(
      `${stats.calledItCount} ${stats.calledItCount === 1 ? "Called It" : "Called Its"} 💡`,
    )
  }

  const best = categoryStats[0]
  if (best && best.pct >= 50) {
    const cat = PT_CATEGORIES.find((c) => c.id === best.catId)
    if (cat) parts.push(`Best at ${cat.label} ${cat.emoji}`)
  }

  return parts.length > 0 ? parts.join(" · ") : `${stats.totalPredictions} predictions made`
}

export function normalizeRecentPredictions(rawPreds: RawPred[]): PublicPredictionRecord[] {
  return rawPreds
    .filter((p) => p.marketTitle && p.prediction && p.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 10)
    .map((p) => ({
      marketTitle: p.marketTitle!,
      prediction: p.prediction === "YES" ? "YES" as const : "NO" as const,
      outcome: p.outcome === "YES" ? "YES" : p.outcome === "NO" ? "NO" : undefined,
      resolved: p.resolved ?? false,
      correct: p.correct,
      createdAt: p.createdAt!,
      probAtTime: p.probAtTime ?? 50,
      category: p.category,
    }))
}

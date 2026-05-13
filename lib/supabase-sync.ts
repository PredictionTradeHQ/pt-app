"use client"

import { createClient } from "@/lib/supabase/client"
import type { EarnedBadge, PredictionRecord } from "@/stores/gamification"

export interface GamificationSnapshot {
  currentStreak: number
  bestStreak: number
  lastPredictionDate: string | null
  totalPredictions: number
  categoryPredictions: Record<string, number>
  predictions: PredictionRecord[]
  resolvedCount: number
  correctCount: number
  calledItCount: number
  badges: EarnedBadge[]
}

// ─── Push: local → Supabase ────────────────────────────────────────────────────

export async function pushGamification(
  userId: string,
  snapshot: GamificationSnapshot
): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("user_gamification").upsert(
      {
        user_id: userId,
        current_streak: snapshot.currentStreak,
        best_streak: snapshot.bestStreak,
        last_prediction_date: snapshot.lastPredictionDate,
        total_predictions: snapshot.totalPredictions,
        category_predictions: snapshot.categoryPredictions,
        predictions: snapshot.predictions.slice(0, 100), // store last 100
        resolved_count: snapshot.resolvedCount,
        correct_count: snapshot.correctCount,
        called_it_count: snapshot.calledItCount,
        badges: snapshot.badges,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    if (error) {
      // Table may not exist yet — silently ignore
      if (
        !error.message?.includes("relation") &&
        !error.message?.includes("does not exist") &&
        !error.message?.includes("42P01")
      ) {
        console.warn("[pt-sync] push error:", error.message)
      }
    }
  } catch {
    // Network or auth failure — localStorage remains source of truth
  }
}

// ─── Pull: Supabase → local ────────────────────────────────────────────────────

export async function pullGamification(
  userId: string
): Promise<GamificationSnapshot | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) return null

    return {
      currentStreak: data.current_streak ?? 0,
      bestStreak: data.best_streak ?? 0,
      lastPredictionDate: data.last_prediction_date ?? null,
      totalPredictions: data.total_predictions ?? 0,
      categoryPredictions: (data.category_predictions as Record<string, number>) ?? {},
      predictions: (data.predictions as PredictionRecord[]) ?? [],
      resolvedCount: data.resolved_count ?? 0,
      correctCount: data.correct_count ?? 0,
      calledItCount: data.called_it_count ?? 0,
      badges: (data.badges as EarnedBadge[]) ?? [],
    }
  } catch {
    return null
  }
}

// ─── Merge: take the best of both ─────────────────────────────────────────────

export function mergeSnapshots(
  local: GamificationSnapshot,
  remote: GamificationSnapshot
): GamificationSnapshot {
  // Merge strategy: take the more advanced state for each field
  const localBadgeIds = new Set(local.badges.map((b) => b.id))
  const remoteBadgeIds = new Set(remote.badges.map((b) => b.id))

  // Union of badges (keep earnedAt from whichever source has it)
  const allBadgeIds = new Set([...localBadgeIds, ...remoteBadgeIds])
  const mergedBadges: EarnedBadge[] = []
  for (const id of allBadgeIds) {
    const fromLocal = local.badges.find((b) => b.id === id)
    const fromRemote = remote.badges.find((b) => b.id === id)
    mergedBadges.push(fromLocal ?? fromRemote!)
  }

  // Union of predictions (deduplicate by id)
  const predMap = new Map<string, PredictionRecord>()
  for (const p of [...remote.predictions, ...local.predictions]) {
    // Local wins on conflict (more recent resolution data)
    if (!predMap.has(p.id) || !predMap.get(p.id)?.resolved) {
      predMap.set(p.id, p)
    }
  }
  const mergedPredictions = Array.from(predMap.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200)

  // Merge category predictions (max per category)
  const mergedCategoryPredictions: Record<string, number> = {}
  const allCatKeys = new Set([
    ...Object.keys(local.categoryPredictions),
    ...Object.keys(remote.categoryPredictions),
  ])
  for (const key of allCatKeys) {
    mergedCategoryPredictions[key] = Math.max(
      local.categoryPredictions[key] ?? 0,
      remote.categoryPredictions[key] ?? 0
    )
  }

  // Recompute resolved stats from merged predictions
  const resolvedPreds = mergedPredictions.filter((p) => p.resolved)
  const correctPreds = resolvedPreds.filter((p) => p.correct)
  const calledItPreds = correctPreds.filter(
    (p) =>
      (p.prediction === "YES" && p.probAtTime < 20) ||
      (p.prediction === "NO" && 100 - p.probAtTime < 20)
  )

  return {
    currentStreak: Math.max(local.currentStreak, remote.currentStreak),
    bestStreak: Math.max(local.bestStreak, remote.bestStreak),
    lastPredictionDate:
      local.lastPredictionDate && remote.lastPredictionDate
        ? local.lastPredictionDate > remote.lastPredictionDate
          ? local.lastPredictionDate
          : remote.lastPredictionDate
        : local.lastPredictionDate ?? remote.lastPredictionDate,
    totalPredictions: Math.max(local.totalPredictions, remote.totalPredictions),
    categoryPredictions: mergedCategoryPredictions,
    predictions: mergedPredictions,
    resolvedCount: resolvedPreds.length,
    correctCount: correctPreds.length,
    calledItCount: calledItPreds.length,
    badges: mergedBadges,
  }
}

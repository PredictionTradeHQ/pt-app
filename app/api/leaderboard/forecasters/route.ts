import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { topCategoryFromPredictions } from "@/lib/share-copy"

export type ForecasterEntry = {
  userId: string
  displayName: string
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  accuracyPct: number | null
  badgeCount: number
  calledItCount: number
  /** Specialty category id (≥3 resolved, ≥50% accuracy). Optional. */
  topCategoryId?: string
}

// "streak" tab ranks by the *active* streak (current_streak), matching the UI
// which surfaces 🔥 currentStreak as the primary value. Until now this was
// silently sorted by best_streak — a user with current=0 but best=30 outranked
// a current=10 user. Fixed.
const SORT_COLUMNS: Record<string, string> = {
  streak: "current_streak",
  accuracy: "accuracy_pct",
  badges: "badge_count",
  activity: "total_predictions",
}

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") ?? "streak"
  const col = SORT_COLUMNS[sort] ?? "current_streak"

  try {
    const supabase = await createClient()

    // `predictions` is the JSONB array from public_leaderboard VIEW —
    // needed server-side to compute the specialty (topCategoryId).
    let query = supabase
      .from("public_leaderboard")
      .select(
        "user_id, current_streak, best_streak, total_predictions, accuracy_pct, badge_count, called_it_count, predictions"
      )
      .limit(50)

    // Primary sort
    query =
      sort === "accuracy"
        ? query.order(col, { ascending: false, nullsFirst: false })
        : query.order(col, { ascending: false })

    // Tie-break: keep streak-tab tie order deterministic and meaningful —
    // higher accuracy first, then more total predictions. Apply the same
    // chain to every tab (accuracy/badges/activity also benefit).
    if (sort !== "accuracy") {
      query = query.order("accuracy_pct", { ascending: false, nullsFirst: false })
    }
    if (sort !== "activity") {
      query = query.order("total_predictions", { ascending: false })
    }

    const { data: rows, error } = await query

    if (error || !rows || rows.length === 0) {
      return NextResponse.json([])
    }

    // Fetch display names from profiles (publicly readable)
    const userIds = rows.map((r) => r.user_id)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds)

    const nameMap: Record<string, string> = {}
    for (const p of profiles ?? []) {
      nameMap[p.id] = p.display_name ?? "Forecaster"
    }

    const result: ForecasterEntry[] = rows.map((r) => {
      const rawPreds = Array.isArray(r.predictions) ? r.predictions : []
      const topCat = topCategoryFromPredictions(rawPreds)
      return {
        userId: r.user_id,
        displayName: nameMap[r.user_id] ?? "Forecaster",
        currentStreak: r.current_streak ?? 0,
        bestStreak: r.best_streak ?? 0,
        totalPredictions: r.total_predictions ?? 0,
        accuracyPct: r.accuracy_pct ?? null,
        badgeCount: r.badge_count ?? 0,
        calledItCount: r.called_it_count ?? 0,
        topCategoryId: topCat?.id,
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

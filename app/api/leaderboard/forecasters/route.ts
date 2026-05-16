import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { topCategoryFromPredictions } from "@/lib/share-copy"

export type ForecasterEntry = {
  userId: string
  displayName: string
  /** Public avatar URL from Supabase Storage `avatars` bucket. Null → initials. */
  avatarUrl: string | null
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  accuracyPct: number | null
  badgeCount: number
  calledItCount: number
  /** Specialty category id (≥3 resolved, ≥50% accuracy). Optional. */
  topCategoryId?: string
  /** Follower count (Follow System v1). 0 when nobody follows or pre-migration 007. */
  followerCount: number
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

    // Fetch display names + avatars from profiles (publicly readable)
    const userIds = rows.map((r) => r.user_id)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds)

    const nameMap: Record<string, string> = {}
    const avatarMap: Record<string, string | null> = {}
    for (const p of profiles ?? []) {
      nameMap[p.id] = p.display_name ?? "Forecaster"
      avatarMap[p.id] = p.avatar_url ?? null
    }

    // Follower counts — single batched query, in-memory aggregation. O(N) where
    // N = total follow rows pointing at any of the top-50 forecasters. Fine for
    // v1; if/when the graph gets large, swap for a SQL RPC `get_follower_counts(uuid[])`.
    // Wrapped in try/catch so pre-migration 007 the endpoint stays serviceable.
    const followerCountMap: Record<string, number> = {}
    try {
      const { data: followRows } = await supabase
        .from("follows")
        .select("followee_id")
        .in("followee_id", userIds)
      for (const row of followRows ?? []) {
        const k = row.followee_id as string
        followerCountMap[k] = (followerCountMap[k] ?? 0) + 1
      }
    } catch {
      // leave map empty → all counts default to 0 below
    }

    const result: ForecasterEntry[] = rows.map((r) => {
      const rawPreds = Array.isArray(r.predictions) ? r.predictions : []
      const topCat = topCategoryFromPredictions(rawPreds)
      return {
        userId: r.user_id,
        displayName: nameMap[r.user_id] ?? "Forecaster",
        avatarUrl: avatarMap[r.user_id] ?? null,
        currentStreak: r.current_streak ?? 0,
        bestStreak: r.best_streak ?? 0,
        totalPredictions: r.total_predictions ?? 0,
        accuracyPct: r.accuracy_pct ?? null,
        badgeCount: r.badge_count ?? 0,
        calledItCount: r.called_it_count ?? 0,
        topCategoryId: topCat?.id,
        followerCount: followerCountMap[r.user_id] ?? 0,
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

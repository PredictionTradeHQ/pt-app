import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export type ForecasterEntry = {
  userId: string
  displayName: string
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  accuracyPct: number | null
  badgeCount: number
  calledItCount: number
}

const SORT_COLUMNS: Record<string, string> = {
  streak: "best_streak",
  accuracy: "accuracy_pct",
  badges: "badge_count",
  activity: "total_predictions",
}

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") ?? "streak"
  const col = SORT_COLUMNS[sort] ?? "best_streak"

  try {
    const supabase = await createClient()

    const query = supabase
      .from("public_leaderboard")
      .select(
        "user_id, current_streak, best_streak, total_predictions, accuracy_pct, badge_count, called_it_count"
      )
      .limit(50)

    // nulls last for accuracy (users with < 5 resolved predictions)
    const ordered =
      sort === "accuracy"
        ? query.order(col, { ascending: false, nullsFirst: false })
        : query.order(col, { ascending: false })

    const { data: rows, error } = await ordered

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

    const result: ForecasterEntry[] = rows.map((r) => ({
      userId: r.user_id,
      displayName: nameMap[r.user_id] ?? "Forecaster",
      currentStreak: r.current_streak ?? 0,
      bestStreak: r.best_streak ?? 0,
      totalPredictions: r.total_predictions ?? 0,
      accuracyPct: r.accuracy_pct ?? null,
      badgeCount: r.badge_count ?? 0,
      calledItCount: r.called_it_count ?? 0,
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

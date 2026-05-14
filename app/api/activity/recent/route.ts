import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface RecentActivityEntry {
  user: string
  market: string
  outcome: "YES" | "NO"
  amount: number
  ts: number // unix ms
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch top 25 active users' predictions (server-side — bypasses RLS)
    const { data: gamRows, error: gamErr } = await supabase
      .from("user_gamification")
      .select("user_id, predictions")
      .order("total_predictions", { ascending: false })
      .limit(25)

    if (gamErr || !gamRows?.length) {
      return NextResponse.json([])
    }

    // Fetch display names for those users
    const userIds = gamRows.map((r) => r.user_id)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds)

    const nameMap: Record<string, string> = {}
    for (const p of profiles ?? []) {
      if (p.display_name) nameMap[p.id] = p.display_name
    }

    // Flatten predictions from all users, keeping last 5 per user
    type RawPred = {
      marketTitle?: string
      prediction?: string
      amount?: number
      createdAt?: string
    }

    const entries: RecentActivityEntry[] = []

    for (const row of gamRows) {
      const preds: RawPred[] = Array.isArray(row.predictions) ? row.predictions : []
      const displayName = nameMap[row.user_id] ?? "Forecaster"

      // Take the 5 most recent predictions from this user
      const recent = preds
        .filter((p) => p.marketTitle && p.prediction && p.createdAt)
        .sort((a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )
        .slice(0, 5)

      for (const p of recent) {
        const outcome = p.prediction === "YES" || p.prediction === "NO"
          ? p.prediction
          : null
        if (!outcome) continue

        entries.push({
          user: displayName,
          market: (p.marketTitle ?? "").slice(0, 50),
          outcome,
          amount: typeof p.amount === "number" ? p.amount : 50,
          ts: new Date(p.createdAt!).getTime(),
        })
      }
    }

    // Sort all entries by timestamp desc and return the freshest 20
    entries.sort((a, b) => b.ts - a.ts)
    const result = entries.slice(0, 20)

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch {
    return NextResponse.json([])
  }
}

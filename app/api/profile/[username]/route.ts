import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"

export type PublicPredictionRecord = {
  marketTitle: string
  prediction: "YES" | "NO"
  outcome?: "YES" | "NO"
  resolved: boolean
  correct?: boolean
  createdAt: string
  probAtTime: number
}

export type RealProfileData = {
  displayName: string
  username: string
  gamification: {
    currentStreak: number
    bestStreak: number
    totalPredictions: number
    resolvedCount: number
    correctCount: number
    accuracyPct: number | null
    badgeCount: number
    calledItCount: number
    badges: Array<{ id: string; earnedAt: string }>
  } | null
  recentPredictions: PublicPredictionRecord[]
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  try {
    const supabase = await createClient()

    // 1. Fetch all profiles to find the one matching this slug.
    //    Profiles are publicly readable (SELECT granted to anon by Supabase default
    //    or by the existing policy that allows leaderboard lookups).
    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, display_name")
      .not("display_name", "is", null)
      .limit(500)

    if (profilesErr || !profiles?.length) {
      return NextResponse.json(null)
    }

    // 2. Find the profile whose display_name slug matches the URL param.
    const match = profiles.find(
      (p) => p.display_name && slugify(p.display_name) === username
    )

    if (!match) {
      return NextResponse.json(null)
    }

    // 3. Fetch their gamification data from the public leaderboard view.
    const { data: gam } = await supabase
      .from("public_leaderboard")
      .select(
        "current_streak, best_streak, total_predictions, resolved_count, correct_count, accuracy_pct, badge_count, called_it_count, badges"
      )
      .eq("user_id", match.id)
      .maybeSingle()

    // 4. Fetch recent predictions from user_gamification (server-side, last 10)
    type RawPred = {
      marketTitle?: string
      prediction?: string
      outcome?: string
      resolved?: boolean
      correct?: boolean
      createdAt?: string
      probAtTime?: number
    }
    const { data: gamRow } = await supabase
      .from("user_gamification")
      .select("predictions")
      .eq("user_id", match.id)
      .maybeSingle()

    const rawPreds: RawPred[] = Array.isArray(gamRow?.predictions) ? gamRow.predictions : []
    const recentPredictions: PublicPredictionRecord[] = rawPreds
      .filter((p) => p.marketTitle && p.prediction && p.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10)
      .map((p) => ({
        marketTitle: p.marketTitle!,
        prediction: p.prediction === "YES" ? "YES" : "NO",
        outcome: p.outcome === "YES" ? "YES" : p.outcome === "NO" ? "NO" : undefined,
        resolved: p.resolved ?? false,
        correct: p.correct,
        createdAt: p.createdAt!,
        probAtTime: p.probAtTime ?? 50,
      }))

    const result: RealProfileData = {
      displayName: match.display_name,
      username,
      gamification: gam
        ? {
            currentStreak: gam.current_streak ?? 0,
            bestStreak: gam.best_streak ?? 0,
            totalPredictions: gam.total_predictions ?? 0,
            resolvedCount: gam.resolved_count ?? 0,
            correctCount: gam.correct_count ?? 0,
            accuracyPct: gam.accuracy_pct ?? null,
            badgeCount: gam.badge_count ?? 0,
            calledItCount: gam.called_it_count ?? 0,
            badges: Array.isArray(gam.badges) ? gam.badges : [],
          }
        : null,
      recentPredictions,
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(null)
  }
}

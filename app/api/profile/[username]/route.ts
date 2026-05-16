import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import {
  computeCategoryStats,
  computeTopCalls,
  normalizeRecentPredictions,
} from "@/lib/profile-helpers"

// ─── Public types ─────────────────────────────────────────────────────────────

export type PublicPredictionRecord = {
  marketTitle: string
  prediction: "YES" | "NO"
  outcome?: "YES" | "NO"
  resolved: boolean
  correct?: boolean
  createdAt: string
  probAtTime: number
  category?: string
}

export type CategoryStat = {
  catId: string
  total: number
  correct: number
  pct: number
}

export type TopCall = {
  marketTitle: string
  prediction: "YES" | "NO"
  probAtTime: number
  outcome: "YES" | "NO"
  createdAt: string
}

export type RealProfileData = {
  displayName: string
  username: string
  /** Public URL of the uploaded avatar (Supabase Storage `avatars` bucket). NULL → render initials. */
  avatarUrl: string | null
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
  categoryStats: CategoryStat[]
  topCalls: TopCall[]
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  try {
    const supabase = await createClient()

    // 1. Find the profile whose display_name slug matches the URL param.
    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .not("display_name", "is", null)
      .limit(500)

    if (profilesErr || !profiles?.length) return NextResponse.json(null)

    const match = profiles.find(
      (p) => p.display_name && slugify(p.display_name) === username
    )
    if (!match) return NextResponse.json(null)

    // 2. Fetch from public_leaderboard view (anon-accessible).
    //    `predictions` column available after migration 003 is applied.
    //    Falls back to empty array if column is absent (pre-migration state).
    const { data: gam } = await supabase
      .from("public_leaderboard")
      .select(
        "current_streak, best_streak, total_predictions, resolved_count, correct_count, accuracy_pct, badge_count, called_it_count, badges, predictions"
      )
      .eq("user_id", match.id)
      .maybeSingle()

    const rawPreds = Array.isArray(gam?.predictions) ? gam.predictions : []

    const result: RealProfileData = {
      displayName: match.display_name,
      username,
      avatarUrl: match.avatar_url ?? null,
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
      recentPredictions: normalizeRecentPredictions(rawPreds),
      categoryStats: computeCategoryStats(rawPreds),
      topCalls: computeTopCalls(rawPreds),
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(null)
  }
}

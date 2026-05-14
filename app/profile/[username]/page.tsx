import { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell/app-shell"
import { PublicProfileClient } from "@/components/public-profile-client"
import { RealPublicProfile } from "@/components/profile/real-public-profile"
import { getDemoUser } from "@/lib/demo-leaderboard"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import type { RealProfileData } from "@/app/api/profile/[username]/route"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params

  const demoUser = getDemoUser(username)
  if (demoUser) {
    return {
      title: `${demoUser.displayName} (@${demoUser.username}) — PredictionTrade`,
      description: `${demoUser.displayName} has a ${demoUser.currentStreak}-day streak and ${demoUser.badgeCount} badges on PredictionTrade.`,
    }
  }

  return {
    title: `@${username} — PredictionTrade`,
    description: `Forecaster profile on PredictionTrade.`,
  }
}

async function fetchRealProfile(username: string): Promise<RealProfileData | null> {
  try {
    const supabase = await createClient()

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .not("display_name", "is", null)
      .limit(500)

    if (!profiles?.length) return null

    const match = profiles.find(
      (p) => p.display_name && slugify(p.display_name) === username
    )
    if (!match) return null

    const { data: gam } = await supabase
      .from("public_leaderboard")
      .select(
        "current_streak, best_streak, total_predictions, resolved_count, correct_count, accuracy_pct, badge_count, called_it_count, badges"
      )
      .eq("user_id", match.id)
      .maybeSingle()

    return {
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
    }
  } catch {
    return null
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  // 1. Demo users (fast — local data, no DB)
  const demoUser = getDemoUser(username)
  if (demoUser) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || ""
    const ownSlug = slugify(displayName)
    const isOwnProfile = ownSlug === username

    return (
      <AppShell>
        <PublicProfileClient user={demoUser} isOwnProfile={isOwnProfile} />
      </AppShell>
    )
  }

  // 2. Real Supabase users — look up by display_name slug
  const realProfile = await fetchRealProfile(username)

  if (realProfile) {
    // If this is the logged-in user's own profile, redirect to /profile (full private view)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || ""
      if (slugify(displayName) === username) {
        const { redirect } = await import("next/navigation")
        redirect("/profile")
      }
    }

    return (
      <AppShell>
        <RealPublicProfile data={realProfile} />
      </AppShell>
    )
  }

  notFound()
}

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell/app-shell"
import { PublicProfileClient } from "@/components/public-profile-client"
import { RealPublicProfile } from "@/components/profile/real-public-profile"
import { getDemoUser } from "@/lib/demo-leaderboard"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import {
  computeCategoryStats,
  computeTopCalls,
  normalizeRecentPredictions,
} from "@/lib/profile-helpers"
import type { RealProfileData } from "@/app/api/profile/[username]/route"

interface Props {
  params: Promise<{ username: string }>
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.predictiontrade.online"

const DEMO_CATEGORY_ID: Record<string, string> = {
  "AI & Tech": "ai-tech",
  "Crypto": "crypto",
  "Sports": "sports",
  "Gaming": "gaming",
  "Entertainment": "entertainment",
  "Internet Culture": "internet-culture",
  "Global News": "global-news",
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profileUrl = `${SITE_URL}/profile/${username}`

  const demoUser = getDemoUser(username)
  if (demoUser) {
    const catId = DEMO_CATEGORY_ID[demoUser.favoriteCategory] ?? ""
    const ogParams = new URLSearchParams({
      n: demoUser.displayName,
      a: String(demoUser.accuracy),
      s: String(demoUser.currentStreak),
      b: String(demoUser.bestStreak),
      t: String(demoUser.totalPredictions),
    })
    if (catId) ogParams.set("c", catId)
    const ogUrl = `${SITE_URL}/api/og/profile/${username}?${ogParams.toString()}`

    const desc = `${demoUser.accuracy}% accurate · 🔥 ${demoUser.currentStreak}-day streak · Best at ${demoUser.favoriteCategory} ${demoUser.favoriteCategoryEmoji}`

    return {
      title: `${demoUser.displayName} (@${demoUser.username}) — PredictionTrade`,
      description: `${demoUser.displayName} has a ${demoUser.currentStreak}-day streak and ${demoUser.badgeCount} badges on PredictionTrade.`,
      openGraph: {
        title: `${demoUser.displayName} on PredictionTrade`,
        description: desc,
        url: profileUrl,
        type: "profile",
        images: [
          {
            url: ogUrl,
            width: 1200,
            height: 630,
            alt: `${demoUser.displayName} — forecaster profile`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${demoUser.displayName} on PredictionTrade`,
        description: desc,
        images: [ogUrl],
      },
    }
  }

  const ogUrl = `${SITE_URL}/api/og/profile/${username}`
  return {
    title: `@${username} — PredictionTrade`,
    description: `Forecaster profile on PredictionTrade.`,
    openGraph: {
      title: `@${username} on PredictionTrade`,
      description: `Forecaster reputation, accuracy, and streak.`,
      url: profileUrl,
      type: "profile",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `@${username} — forecaster profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `@${username} on PredictionTrade`,
      description: `Forecaster on PredictionTrade.`,
      images: [ogUrl],
    },
  }
}

async function fetchRealProfile(username: string): Promise<RealProfileData | null> {
  try {
    const supabase = await createClient()

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .not("display_name", "is", null)
      .limit(500)

    if (!profiles?.length) return null

    const match = profiles.find(
      (p) => p.display_name && slugify(p.display_name) === username
    )
    if (!match) return null

    // public_leaderboard is anon-accessible; `predictions` available after migration 003
    const { data: gam } = await supabase
      .from("public_leaderboard")
      .select(
        "current_streak, best_streak, total_predictions, resolved_count, correct_count, accuracy_pct, badge_count, called_it_count, badges, predictions"
      )
      .eq("user_id", match.id)
      .maybeSingle()

    const rawPreds = Array.isArray(gam?.predictions) ? gam.predictions : []

    return {
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
  } catch {
    return null
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  // 1. Demo users — local data, fast, no DB
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

  // 2. Real Supabase user — look up by display_name slug
  const realProfile = await fetchRealProfile(username)

  if (realProfile) {
    // Redirect own profile to /profile (private full view)
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

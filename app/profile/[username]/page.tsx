import { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell/app-shell"
import { PublicProfileClient } from "@/components/public-profile-client"
import { getDemoUser } from "@/lib/demo-leaderboard"
import { createClient } from "@/lib/supabase/server"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = getDemoUser(username)
  if (!user) return { title: "Profile — PredictionTrade" }
  return {
    title: `${user.displayName} (@${user.username}) — PredictionTrade`,
    description: `${user.displayName} has a ${user.currentStreak}-day streak and ${user.badgeCount} badges on PredictionTrade.`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const demoUser = getDemoUser(username)

  if (!demoUser) {
    // Check if it's the logged-in user's own public profile
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) notFound()

    const displayName =
      user.user_metadata?.display_name || user.email?.split("@")[0] || "Trader"
    const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    if (slug !== username) notFound()

    // Redirect to /profile for own profile (they have real gamification data there)
    const { redirect } = await import("next/navigation")
    redirect("/profile")
  }

  // Check if viewing own profile (demo user match unlikely, but graceful)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || ""
  const ownSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const isOwnProfile = ownSlug === username

  return (
    <AppShell>
      <PublicProfileClient user={demoUser!} isOwnProfile={isOwnProfile} />
    </AppShell>
  )
}

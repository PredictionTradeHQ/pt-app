"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Flame, Trophy, BarChart2, Share2, Medal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BADGE_DEFINITIONS, RARITY_COLORS } from "@/lib/badges"
import { ShareAchievementModal, type AchievementType } from "@/components/share-achievement-modal"
import type { DemoUser } from "@/lib/demo-leaderboard"

interface PublicProfileClientProps {
  user: DemoUser
  isOwnProfile: boolean
}

export function PublicProfileClient({ user, isOwnProfile }: PublicProfileClientProps) {
  const [shareOpen, setShareOpen] = useState(false)

  const initials = user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const earnedBadges = user.badgeIds
    .map((id) => BADGE_DEFINITIONS[id])
    .filter(Boolean)

  const topRarityColor =
    user.badgeCount >= 7
      ? RARITY_COLORS.legendary
      : user.badgeCount >= 5
      ? RARITY_COLORS.rare
      : user.badgeCount >= 3
      ? RARITY_COLORS.uncommon
      : RARITY_COLORS.common

  const streakAchievement = {
    type: "streak" as AchievementType,
    streak: user.currentStreak,
    bestStreak: user.bestStreak,
    totalPredictions: user.totalPredictions,
    username: user.username,
  }

  const stats = [
    {
      icon: Flame,
      label: "Current streak",
      value: `🔥 ${user.currentStreak}d`,
      color: "#F59E0B",
    },
    {
      icon: Flame,
      label: "Best streak",
      value: `${user.bestStreak} days`,
      color: "var(--muted-foreground)",
    },
    {
      icon: BarChart2,
      label: "Predictions",
      value: `${user.totalPredictions}`,
      color: "var(--muted-foreground)",
    },
    {
      icon: Trophy,
      label: "Accuracy",
      value: `${user.accuracy}%`,
      color: user.accuracy >= 65 ? "#10B981" : user.accuracy >= 55 ? "#F59E0B" : "#EF4444",
    },
  ]

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-2xl">
      {/* Back link */}
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Leaderboard
      </Link>

      {/* Profile header */}
      <Card className="mb-6 overflow-hidden">
        {/* Color strip */}
        <div
          className="h-20"
          style={{
            background: `linear-gradient(135deg, ${topRarityColor}22, ${topRarityColor}08)`,
            borderBottom: `1px solid ${topRarityColor}20`,
          }}
        />
        <CardContent className="pt-0 pb-6">
          {/* Avatar — overlaps color strip */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-4 border-card"
              style={{
                background: topRarityColor + "22",
                color: topRarityColor,
                boxShadow: `0 0 0 1px ${topRarityColor}40`,
              }}
            >
              {initials}
            </div>

            <div className="flex gap-2 pb-1">
              {isOwnProfile && (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/profile">Edit profile</Link>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </Button>
            </div>
          </div>

          <h1 className="text-xl font-bold mb-0.5">{user.displayName}</h1>
          <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
          <p className="text-xs text-muted-foreground">
            {user.favoriteCategoryEmoji} {user.favoriteCategory} · Joined {user.joinedMonthYear}
          </p>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p
                className="text-xl font-black leading-tight mb-0.5"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">
              Badges
              <span className="text-muted-foreground font-normal ml-1">({earnedBadges.length})</span>
            </p>
          </div>

          {earnedBadges.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No badges earned yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {earnedBadges.map((badge) => {
                if (!badge) return null
                const color = RARITY_COLORS[badge.rarity]
                return (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl text-center"
                    style={{ background: color + "12", border: `1px solid ${color}25` }}
                  >
                    <span className="text-2xl leading-none">{badge.emoji}</span>
                    <p className="text-[11px] font-semibold text-foreground leading-tight">{badge.name}</p>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                      style={{ background: color + "20", color }}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ShareAchievementModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        achievement={{ ...streakAchievement, type: "streak" }}
      />
    </main>
  )
}

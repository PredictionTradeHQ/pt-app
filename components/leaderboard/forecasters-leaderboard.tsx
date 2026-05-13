"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Flame, Trophy, BarChart2, Activity, Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGamification } from "@/stores/gamification"
import {
  DEMO_USERS,
  getSortedLeaderboard,
  type DemoUser,
  type LeaderboardSortKey,
} from "@/lib/demo-leaderboard"
import { RARITY_COLORS } from "@/lib/badges"

const SORT_TABS: { key: LeaderboardSortKey; label: string; labelEs: string; icon: React.ElementType }[] = [
  { key: "streak",   label: "Streaks",  labelEs: "Rachas",       icon: Flame },
  { key: "accuracy", label: "Accuracy", labelEs: "Precisión",    icon: Trophy },
  { key: "badges",   label: "Badges",   labelEs: "Insignias",    icon: Medal },
  { key: "activity", label: "Activity", labelEs: "Actividad",    icon: Activity },
]

interface RealUser {
  displayName: string
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  badgeCount: number
  username: string
}

interface ForcastersLeaderboardProps {
  isEs: boolean
}

export function ForecastersLeaderboard({ isEs }: ForcastersLeaderboardProps) {
  const [sort, setSort] = useState<LeaderboardSortKey>("streak")
  const { currentStreak, bestStreak, totalPredictions, badges } = useGamification()

  const hasActivity = totalPredictions > 0

  const realUser: RealUser | null = hasActivity
    ? {
        displayName: "You",
        currentStreak,
        bestStreak,
        totalPredictions,
        badgeCount: badges.length,
        username: "me",
      }
    : null

  const ranked = useMemo(() => {
    const base = getSortedLeaderboard(sort)

    if (!realUser) return base

    // Inject real user into the ranked list at the correct position
    const merged: (DemoUser | RealUser)[] = [...base]

    const getScore = (u: DemoUser | RealUser): number => {
      switch (sort) {
        case "streak":   return "currentStreak" in u ? u.currentStreak : 0
        case "accuracy": return "accuracy" in u ? u.accuracy : 50
        case "badges":   return u.badgeCount
        case "activity": return u.totalPredictions
      }
    }

    const userScore = getScore(realUser)
    let insertAt = merged.findIndex((u) => getScore(u) <= userScore)
    if (insertAt === -1) insertAt = merged.length
    merged.splice(insertAt, 0, realUser)

    return merged
  }, [sort, realUser, currentStreak, bestStreak, totalPredictions, badges.length])

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-6 overflow-x-auto">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center",
              sort === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 shrink-0" />
            {isEs ? tab.labelEs : tab.label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="w-8 text-center">#</span>
        <span className="flex-1">{isEs ? "Predictor" : "Forecaster"}</span>
        <span className="w-24 text-right">{isEs ? SORT_TABS.find(t=>t.key===sort)?.labelEs : SORT_TABS.find(t=>t.key===sort)?.label}</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {ranked.map((entry, i) => {
          const isRealUser = "username" in entry && (entry as RealUser).username === "me"
          const isDemo = !isRealUser
          const rank = i + 1
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null

          return (
            <LeaderboardRow
              key={isRealUser ? "real-user" : (entry as DemoUser).id}
              rank={rank}
              medal={medal}
              entry={entry}
              sort={sort}
              isRealUser={isRealUser}
              isDemo={isDemo}
              isEs={isEs}
            />
          )
        })}
      </div>

      {!hasActivity && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          {isEs
            ? "Haz tu primera predicción para aparecer en el ranking."
            : "Make your first prediction to appear on the leaderboard."}
        </p>
      )}
    </div>
  )
}

function LeaderboardRow({
  rank,
  medal,
  entry,
  sort,
  isRealUser,
  isEs,
}: {
  rank: number
  medal: string | null
  entry: DemoUser | RealUser
  sort: LeaderboardSortKey
  isRealUser: boolean
  isDemo: boolean
  isEs: boolean
}) {
  const name = entry.displayName
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)

  const topBadgeColor = isRealUser
    ? "#6366F1"
    : (() => {
        const demo = entry as DemoUser
        const top = demo.badgeIds[demo.badgeIds.length - 1]
        // rough rarity color guess by position
        if (demo.badgeCount >= 7) return RARITY_COLORS.legendary
        if (demo.badgeCount >= 5) return RARITY_COLORS.rare
        if (demo.badgeCount >= 3) return RARITY_COLORS.uncommon
        return RARITY_COLORS.common
      })()

  const primaryValue = (() => {
    switch (sort) {
      case "streak":   return `🔥 ${entry.currentStreak}`
      case "accuracy": return `${"accuracy" in entry ? (entry as DemoUser).accuracy : 50}%`
      case "badges":   return `🏅 ${entry.badgeCount}`
      case "activity": return `${entry.totalPredictions}`
    }
  })()

  const secondaryValue = (() => {
    switch (sort) {
      case "streak":   return isEs ? `Mejor: ${entry.bestStreak}d` : `Best: ${entry.bestStreak}d`
      case "accuracy": return `${entry.totalPredictions} ${isEs ? "pred." : "pred."}`
      case "badges":   return `${entry.totalPredictions} ${isEs ? "predicciones" : "predictions"}`
      case "activity": return `🔥 ${entry.currentStreak} ${isEs ? "racha" : "streak"}`
    }
  })()

  const rowContent = (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors",
        isRealUser
          ? "bg-amber-500/8 border-l-2 border-amber-500/60 hover:bg-amber-500/12"
          : "hover:bg-muted/30"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {medal ? (
          <span className="text-xl leading-none">{medal}</span>
        ) : (
          <span className={cn("text-sm font-bold", rank <= 3 ? "text-primary" : "text-muted-foreground")}>
            {rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: topBadgeColor + "22", color: topBadgeColor, border: `1.5px solid ${topBadgeColor}40` }}
      >
        {initials}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("font-semibold text-sm truncate", isRealUser && "text-amber-400")}>
            {name}
          </p>
          {isRealUser && (
            <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30 shrink-0">
              {isEs ? "TÚ" : "YOU"}
            </span>
          )}
        </div>
        {"favoriteCategory" in entry && (
          <p className="text-[11px] text-muted-foreground">
            {(entry as DemoUser).favoriteCategoryEmoji} {(entry as DemoUser).favoriteCategory}
          </p>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className={cn("font-bold text-sm", isRealUser ? "text-amber-400" : "text-foreground")}>
          {primaryValue}
        </p>
        <p className="text-[11px] text-muted-foreground">{secondaryValue}</p>
      </div>
    </div>
  )

  if (!isRealUser && "username" in entry) {
    return (
      <Link href={`/profile/${(entry as DemoUser).username}`} className="block">
        {rowContent}
      </Link>
    )
  }

  return rowContent
}

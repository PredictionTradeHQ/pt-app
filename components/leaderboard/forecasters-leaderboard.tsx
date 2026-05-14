"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Flame, Trophy, Activity, Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGamification } from "@/stores/gamification"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  DEMO_USERS,
  getSortedLeaderboard,
  type LeaderboardSortKey,
} from "@/lib/demo-leaderboard"
import { RARITY_COLORS } from "@/lib/badges"
import { slugify } from "@/lib/utils"
import type { ForecasterEntry } from "@/app/api/leaderboard/forecasters/route"

// ─── Types ────────────────────────────────────────────────────────────────────

type RowEntry = {
  id: string
  displayName: string
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  accuracy: number | null  // null = not enough data
  badgeCount: number
  isCurrentUser: boolean
  isDemo: boolean
  profileSlug?: string    // only demo users have navigable profiles for now
  category?: string
  categoryEmoji?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_ROWS = 10

const SORT_TABS: {
  key: LeaderboardSortKey
  label: string
  labelEs: string
  icon: React.ElementType
}[] = [
  { key: "streak",   label: "Streaks",  labelEs: "Rachas",    icon: Flame },
  { key: "accuracy", label: "Accuracy", labelEs: "Precisión", icon: Trophy },
  { key: "badges",   label: "Badges",   labelEs: "Insignias", icon: Medal },
  { key: "activity", label: "Activity", labelEs: "Actividad", icon: Activity },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  isEs: boolean
}

export function ForecastersLeaderboard({ isEs }: Props) {
  const [sort, setSort] = useState<LeaderboardSortKey>("streak")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const {
    currentStreak,
    bestStreak,
    totalPredictions,
    badges,
    resolvedCount,
    correctCount,
  } = useGamification()

  // Get current user's Supabase ID for "YOU" highlighting
  useEffect(() => {
    const supabase = createClient() as SupabaseClient
    void supabase.auth.getUser().then((result) => {
      setCurrentUserId(result.data.user?.id ?? null)
    })
  }, [])

  const { data: realUsers, isLoading } = useSWR<ForecasterEntry[]>(
    `/api/leaderboard/forecasters?sort=${sort}`,
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false }
  )

  const hasLocalActivity = totalPredictions > 0

  // Local accuracy (same logic as the accuracy engine)
  const localAccuracyPct =
    resolvedCount >= 5
      ? Math.round((correctCount / resolvedCount) * 100)
      : null

  const ranked = useMemo(() => {
    const real = Array.isArray(realUsers) ? realUsers : []

    // Normalize real users into RowEntry
    const realRows: RowEntry[] = real.map((u) => ({
      id: `real-${u.userId}`,
      displayName: u.displayName,
      currentStreak: u.currentStreak,
      bestStreak: u.bestStreak,
      totalPredictions: u.totalPredictions,
      accuracy: u.accuracyPct,
      badgeCount: u.badgeCount,
      isCurrentUser: u.userId === currentUserId,
      isDemo: false,
      profileSlug: slugify(u.displayName),
    }))

    // Fill with demo anchors if fewer than MIN_ROWS real users
    const demoSorted = getSortedLeaderboard(sort)
    const demoRows: RowEntry[] = demoSorted.map((u) => ({
      id: `demo-${u.id}`,
      displayName: u.displayName,
      currentStreak: u.currentStreak,
      bestStreak: u.bestStreak,
      totalPredictions: u.totalPredictions,
      accuracy: u.accuracy,
      badgeCount: u.badgeCount,
      isCurrentUser: false,
      isDemo: true,
      profileSlug: u.username,
      category: u.favoriteCategory,
      categoryEmoji: u.favoriteCategoryEmoji,
    }))

    // Merge: real users first, then demo anchors to reach MIN_ROWS
    const combined: RowEntry[] =
      realRows.length >= MIN_ROWS
        ? realRows
        : [...realRows, ...demoRows.slice(0, MIN_ROWS - realRows.length)]

    // Sort combined list by active sort key
    const getScore = (u: RowEntry): number => {
      switch (sort) {
        case "streak":   return u.currentStreak
        case "accuracy": return u.accuracy ?? -1  // nulls last
        case "badges":   return u.badgeCount
        case "activity": return u.totalPredictions
      }
    }
    combined.sort((a, b) => getScore(b) - getScore(a))

    // Inject "YOU" from local state if user is not already in real list
    const currentUserInReal = realRows.some((u) => u.isCurrentUser)
    if (hasLocalActivity && !currentUserInReal) {
      const youRow: RowEntry = {
        id: "you",
        displayName: isEs ? "Tú" : "You",
        currentStreak,
        bestStreak,
        totalPredictions,
        accuracy: localAccuracyPct,
        badgeCount: badges.length,
        isCurrentUser: true,
        isDemo: false,
      }
      const score = getScore(youRow)
      let insertAt = combined.findIndex((u) => getScore(u) <= score)
      if (insertAt === -1) insertAt = combined.length
      combined.splice(insertAt, 0, youRow)
    }

    return combined
  }, [
    realUsers,
    sort,
    currentUserId,
    hasLocalActivity,
    currentStreak,
    bestStreak,
    totalPredictions,
    localAccuracyPct,
    badges.length,
    isEs,
  ])

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
        <span className="w-24 text-right">
          {isEs
            ? SORT_TABS.find((t) => t.key === sort)?.labelEs
            : SORT_TABS.find((t) => t.key === sort)?.label}
        </span>
      </div>

      {/* #1 Spotlight */}
      {!isLoading && ranked.length > 0 && (() => {
        const top = ranked[0]
        const initials = top.displayName
          .split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2)
        const primaryValue =
          sort === "accuracy" && top.accuracy !== null ? `${top.accuracy}%` :
          sort === "badges" ? `🏅 ${top.badgeCount}` :
          sort === "activity" ? `${top.totalPredictions} pred.` :
          `🔥 ${top.currentStreak}d`
        return (
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-3">
              🏆 {isEs ? "Mejor predictor" : "Top Predictor"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{top.displayName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {top.totalPredictions} {isEs ? "predicciones" : "predictions"} · {top.badgeCount} {isEs ? "insignias" : "badges"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-amber-400">{primaryValue}</p>
                {top.accuracy !== null && sort !== "accuracy" && (
                  <p className="text-[11px] text-muted-foreground">{top.accuracy}% {isEs ? "precisión" : "accuracy"}</p>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Rows */}
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <SkeletonRows count={MIN_ROWS} />
        ) : ranked.length === 0 ? (
          <EmptyState isEs={isEs} />
        ) : (
          ranked.map((entry, i) => {
            const rank = i + 1
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null
            return (
              <LeaderboardRow
                key={entry.id}
                rank={rank}
                medal={medal}
                entry={entry}
                sort={sort}
                isEs={isEs}
              />
            )
          })
        )}
      </div>

      {!isLoading && !hasLocalActivity && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          {isEs
            ? "Haz tu primera predicción para aparecer en el ranking."
            : "Make your first prediction to appear on the leaderboard."}
        </p>
      )}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({
  rank,
  medal,
  entry,
  sort,
  isEs,
}: {
  rank: number
  medal: string | null
  entry: RowEntry
  sort: LeaderboardSortKey
  isEs: boolean
}) {
  const name = entry.displayName
  const initials = name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Avatar color: real users get indigo, demo gets badge-rarity color
  const avatarColor = entry.isCurrentUser
    ? "#F59E0B"
    : entry.isDemo
    ? (() => {
        if (entry.badgeCount >= 7) return RARITY_COLORS.legendary
        if (entry.badgeCount >= 5) return RARITY_COLORS.rare
        if (entry.badgeCount >= 3) return RARITY_COLORS.uncommon
        return RARITY_COLORS.common
      })()
    : RARITY_COLORS.rare

  const primaryValue = (() => {
    switch (sort) {
      case "streak":
        return `🔥 ${entry.currentStreak}`
      case "accuracy":
        return entry.accuracy !== null ? `${entry.accuracy}%` : (isEs ? "—" : "—")
      case "badges":
        return `🏅 ${entry.badgeCount}`
      case "activity":
        return `${entry.totalPredictions}`
    }
  })()

  const secondaryValue = (() => {
    switch (sort) {
      case "streak":
        return isEs ? `Mejor: ${entry.bestStreak}d` : `Best: ${entry.bestStreak}d`
      case "accuracy":
        return `${entry.totalPredictions} ${isEs ? "pred." : "pred."}`
      case "badges":
        return `${entry.totalPredictions} ${isEs ? "predicciones" : "predictions"}`
      case "activity":
        return `🔥 ${entry.currentStreak} ${isEs ? "racha" : "streak"}`
    }
  })()

  const rowContent = (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors",
        entry.isCurrentUser
          ? "bg-amber-500/8 border-l-2 border-amber-500/60 hover:bg-amber-500/12"
          : "hover:bg-muted/30"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {medal ? (
          <span className="text-xl leading-none">{medal}</span>
        ) : (
          <span
            className={cn(
              "text-sm font-bold",
              rank <= 3 ? "text-primary" : "text-muted-foreground"
            )}
          >
            {rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: avatarColor + "22",
          color: avatarColor,
          border: `1.5px solid ${avatarColor}40`,
        }}
      >
        {initials}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "font-semibold text-sm truncate",
              entry.isCurrentUser && "text-amber-400"
            )}
          >
            {name}
          </p>
          {entry.isCurrentUser && (
            <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30 shrink-0">
              {isEs ? "TÚ" : "YOU"}
            </span>
          )}
          {!entry.isDemo && !entry.isCurrentUser && (
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 shrink-0">
              {isEs ? "Real" : "Real"}
            </span>
          )}
        </div>
        {entry.category && (
          <p className="text-[11px] text-muted-foreground">
            {entry.categoryEmoji} {entry.category}
          </p>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            "font-bold text-sm",
            entry.isCurrentUser ? "text-amber-400" : "text-foreground"
          )}
        >
          {primaryValue}
        </p>
        <p className="text-[11px] text-muted-foreground">{secondaryValue}</p>
      </div>
    </div>
  )

  // Both demo and real users link to their public profile (not the logged-in user — they can use /profile)
  if (!entry.isCurrentUser && entry.profileSlug) {
    return (
      <Link href={`/profile/${entry.profileSlug}`} className="block">
        {rowContent}
      </Link>
    )
  }

  return rowContent
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-8 h-5 bg-muted/60 rounded animate-pulse shrink-0" />
          <div className="w-9 h-9 rounded-full bg-muted/60 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-muted/60 rounded animate-pulse w-28" />
            <div className="h-2.5 bg-muted/40 rounded animate-pulse w-16" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-3.5 bg-muted/60 rounded animate-pulse w-12 ml-auto" />
            <div className="h-2.5 bg-muted/40 rounded animate-pulse w-8 ml-auto" />
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isEs }: { isEs: boolean }) {
  return (
    <div className="py-12 text-center">
      <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">
        {isEs
          ? "Aún no hay predictores. ¡Sé el primero!"
          : "No forecasters yet. Be the first!"}
      </p>
    </div>
  )
}

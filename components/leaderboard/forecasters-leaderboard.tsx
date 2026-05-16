"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Flame, Trophy, Activity, Medal, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGamification } from "@/stores/gamification"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  getSortedLeaderboard,
  demoCategoryIdFromLabel,
  type LeaderboardSortKey,
} from "@/lib/demo-leaderboard"
import { RARITY_COLORS } from "@/lib/badges"
import { slugify } from "@/lib/utils"
import type { ForecasterEntry } from "@/app/api/leaderboard/forecasters/route"
import { LeaderboardClimbToast, type ClimbInfo } from "@/components/leaderboard-climb-toast"
import { topCategoryFromPredictions } from "@/lib/share-copy"
import { PT_CATEGORIES, getCategoryById } from "@/lib/categories"
import { Avatar } from "@/components/avatar"

type CategoryFilter = "all" | string  // "all" or a PT category id

// ─── Types ────────────────────────────────────────────────────────────────────

type RowEntry = {
  id: string
  displayName: string
  /** Uploaded avatar URL. Null for demos and real users without an upload. */
  avatarUrl?: string | null
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
  /** Resolved PT category id ("crypto", "ai-tech", ...). Drives specialty chip. */
  topCategoryId?: string
  /** Follower count (Follow System v1). 0 for demos, real number for real users. */
  followerCount: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_ROWS = 10

const SORT_TABS: {
  key: LeaderboardSortKey
  label: string
  labelEs: string
  description: string
  descriptionEs: string
  icon: React.ElementType
}[] = [
  { key: "streak",   label: "Streaks",  labelEs: "Rachas",    icon: Flame,     description: "Days in a row with a prediction",           descriptionEs: "Días consecutivos prediciendo" },
  { key: "accuracy", label: "Accuracy", labelEs: "Precisión", icon: Trophy,    description: "Win rate across 5+ resolved predictions",   descriptionEs: "Tasa de acierto en 5+ predicciones resueltas" },
  { key: "badges",   label: "Badges",   labelEs: "Insignias", icon: Medal,     description: "Total badges earned across all activity",   descriptionEs: "Total de insignias ganadas" },
  { key: "activity", label: "Activity", labelEs: "Actividad", icon: Activity,  description: "Total predictions made all time",           descriptionEs: "Total de predicciones hechas" },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  isEs: boolean
}

export function ForecastersLeaderboard({ isEs }: Props) {
  const [sort, setSort] = useState<LeaderboardSortKey>("streak")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [climbInfo, setClimbInfo] = useState<ClimbInfo | null>(null)
  const hasCheckedClimb = useRef(false)

  const {
    currentStreak,
    bestStreak,
    totalPredictions,
    badges,
    resolvedCount,
    correctCount,
    predictions,
    setLeaderboardRank,
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

  const localTopCategoryId = useMemo(
    () => topCategoryFromPredictions(predictions)?.id,
    [predictions]
  )

  const ranked = useMemo(() => {
    const real = Array.isArray(realUsers) ? realUsers : []

    // Normalize real users into RowEntry
    const realRows: RowEntry[] = real.map((u) => ({
      id: `real-${u.userId}`,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      currentStreak: u.currentStreak,
      bestStreak: u.bestStreak,
      totalPredictions: u.totalPredictions,
      accuracy: u.accuracyPct,
      badgeCount: u.badgeCount,
      isCurrentUser: u.userId === currentUserId,
      isDemo: false,
      profileSlug: slugify(u.displayName),
      topCategoryId: u.topCategoryId,
      followerCount: u.followerCount ?? 0,
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
      topCategoryId: demoCategoryIdFromLabel(u.favoriteCategory),
      followerCount: 0,
    }))

    // Merge: real users first, then demo anchors to reach MIN_ROWS
    const combined: RowEntry[] =
      realRows.length >= MIN_ROWS
        ? realRows
        : [...realRows, ...demoRows.slice(0, MIN_ROWS - realRows.length)]

    // Sort combined list by active sort key, with deterministic tie-break:
    // primary by sort key, then accuracy DESC (nulls last), then total DESC.
    const primary = (u: RowEntry): number => {
      switch (sort) {
        case "streak":   return u.currentStreak
        case "accuracy": return u.accuracy ?? -1  // nulls last
        case "badges":   return u.badgeCount
        case "activity": return u.totalPredictions
      }
    }
    const compare = (a: RowEntry, b: RowEntry): number => {
      const p = primary(b) - primary(a)
      if (p !== 0) return p
      const accA = a.accuracy ?? -1
      const accB = b.accuracy ?? -1
      if (accB !== accA) return accB - accA
      return b.totalPredictions - a.totalPredictions
    }
    combined.sort(compare)

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
        topCategoryId: localTopCategoryId,
        followerCount: 0,
      }
      let insertAt = combined.findIndex((u) => compare(u, youRow) > 0)
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
    localTopCategoryId,
  ])

  // Detect leaderboard rank improvement on initial data load (once per session).
  // Climb detection always runs against the GLOBAL ranking, never the filtered
  // view — otherwise switching the category filter would re-trigger toasts.
  useEffect(() => {
    if (isLoading || !ranked.length || hasCheckedClimb.current) return
    hasCheckedClimb.current = true

    const myIndex = ranked.findIndex((e) => e.isCurrentUser)
    if (myIndex === -1) return

    const currentRank = myIndex + 1
    const result = setLeaderboardRank(currentRank)
    if (result.climbed && result.previousRank !== null) {
      setClimbInfo({
        previousRank: result.previousRank,
        currentRank,
        accuracyPct: localAccuracyPct,
        topCategory: topCategoryFromPredictions(predictions),
      })
    }
  }, [isLoading, ranked, setLeaderboardRank, localAccuracyPct, predictions])

  const dismissClimb = useCallback(() => setClimbInfo(null), [])

  // Apply category filter on top of the globally-ranked list. Rows without
  // a topCategoryId (real users below the ≥3-resolved threshold) are hidden
  // when a specific category is active — specialty is earned, not assumed.
  const visible = useMemo(() => {
    if (categoryFilter === "all") return ranked
    return ranked.filter((r) => r.topCategoryId === categoryFilter)
  }, [ranked, categoryFilter])

  const activeCategory =
    categoryFilter === "all" ? null : getCategoryById(categoryFilter)

  return (
    <>
      <LeaderboardClimbToast climb={climbInfo} onDismiss={dismissClimb} />
    <div>
      {/* Category filter chips */}
      <div className="flex gap-1.5 overflow-x-auto mb-3 -mx-1 px-1 pb-1 snap-x snap-mandatory scrollbar-none">
        <CategoryChip
          active={categoryFilter === "all"}
          onClick={() => setCategoryFilter("all")}
          label={isEs ? "Todas" : "All"}
          emoji="✦"
        />
        {PT_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            active={categoryFilter === c.id}
            onClick={() => setCategoryFilter(c.id)}
            label={c.label}
            emoji={c.emoji}
          />
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto mb-2">
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
      {/* Active tab description */}
      {(() => {
        const active = SORT_TABS.find((t) => t.key === sort)
        return active ? (
          <p className="text-[11px] text-muted-foreground text-center mb-5">
            {isEs ? active.descriptionEs : active.description}
          </p>
        ) : null
      })()}

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
      {!isLoading && visible.length > 0 && (() => {
        const top = visible[0]
        const primaryValue =
          sort === "accuracy" && top.accuracy !== null ? `${top.accuracy}%` :
          sort === "badges" ? `🏅 ${top.badgeCount}` :
          sort === "activity" ? `${top.totalPredictions} pred.` :
          `🔥 ${top.currentStreak}d`
        const baseLabel =
          sort === "streak"   ? (isEs ? "🔥 Líder de racha"     : "🔥 Streak leader") :
          sort === "accuracy" ? (isEs ? "🎯 Líder en precisión" : "🎯 Accuracy leader") :
          sort === "badges"   ? (isEs ? "🏅 Más insignias"      : "🏅 Most badges") :
                                (isEs ? "🏆 Más activo"         : "🏆 Most active")
        const spotlightLabel = activeCategory
          ? `${baseLabel} · ${activeCategory.emoji} ${activeCategory.label}`
          : baseLabel
        const topCat = top.topCategoryId ? getCategoryById(top.topCategoryId) : null
        return (
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-3">
              {spotlightLabel}
            </p>
            <div className="flex items-center gap-3">
              <Avatar
                size="md"
                url={top.avatarUrl}
                displayName={top.displayName}
                className="bg-amber-500/15 border-amber-500/30 text-amber-400"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{top.displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {sort === "streak" && topCat ? (
                    <>
                      {isEs ? "Mejor en" : "Best at"} {topCat.label} {topCat.emoji}
                      {top.accuracy !== null && (
                        <> · {top.accuracy}% {isEs ? "precisión" : "accuracy"}</>
                      )}
                    </>
                  ) : (
                    <>
                      {top.totalPredictions} {isEs ? "predicciones" : "predictions"} · {top.badgeCount} {isEs ? "insignias" : "badges"}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-amber-400">{primaryValue}</p>
                {sort === "streak"
                  ? <p className="text-[11px] text-muted-foreground">{isEs ? "Mejor" : "Best"}: {top.bestStreak}d</p>
                  : top.accuracy !== null && sort !== "accuracy" && (
                      <p className="text-[11px] text-muted-foreground">{top.accuracy}% {isEs ? "precisión" : "accuracy"}</p>
                    )
                }
              </div>
            </div>
          </div>
        )
      })()}

      {/* Rows */}
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <SkeletonRows count={MIN_ROWS} />
        ) : visible.length === 0 ? (
          <EmptyState isEs={isEs} category={activeCategory} />
        ) : (
          visible.map((entry, i) => {
            const rank = i + 1
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null
            // Social proof — render a small followers chip ONLY for the top 10
            // rows, and only when the count is non-zero. Demos always show 0.
            const showFollowerChip = rank <= 10
            return (
              <LeaderboardRow
                key={entry.id}
                rank={rank}
                medal={medal}
                entry={entry}
                sort={sort}
                isEs={isEs}
                showFollowerChip={showFollowerChip}
              />
            )
          })
        )}
      </div>

      {!isLoading && !hasLocalActivity && (
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">
            {isEs ? "¿Listo para aparecer aquí?" : "Ready to appear here?"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {isEs
              ? "Tu primera predicción te coloca en el ranking automáticamente."
              : "Your first prediction places you on this leaderboard instantly."}
          </p>
          <a
            href="/markets"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            🎯 {isEs ? "Hacer mi primera predicción" : "Make my first prediction"}
          </a>
        </div>
      )}
    </div>
    </>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({
  rank,
  medal,
  entry,
  sort,
  isEs,
  showFollowerChip,
}: {
  rank: number
  medal: string | null
  entry: RowEntry
  sort: LeaderboardSortKey
  isEs: boolean
  showFollowerChip: boolean
}) {
  const name = entry.displayName
  // Chip only shows for real, non-self forecasters with at least one follower.
  // Demos and "YOU" never carry the chip — keeps signal/noise high.
  const renderFollowerChip =
    showFollowerChip &&
    !entry.isDemo &&
    !entry.isCurrentUser &&
    entry.followerCount > 0

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

  const topCat = entry.topCategoryId ? getCategoryById(entry.topCategoryId) : null
  const secondaryValue = (() => {
    switch (sort) {
      case "streak": {
        const best = isEs ? `Mejor: ${entry.bestStreak}d` : `Best: ${entry.bestStreak}d`
        if (topCat) return `${best} · ${topCat.emoji} ${topCat.label}`
        if (entry.accuracy !== null) {
          return isEs
            ? `${best} · ${entry.accuracy}% precisión`
            : `${best} · ${entry.accuracy}% accuracy`
        }
        return best
      }
      case "accuracy":
        return topCat
          ? `${topCat.emoji} ${topCat.label}`
          : `${entry.totalPredictions} ${isEs ? "pred." : "pred."}`
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
      <Avatar
        size="sm"
        url={entry.avatarUrl}
        displayName={name}
        accentHex={avatarColor}
      />

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
          {renderFollowerChip && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full border border-border shrink-0 tabular-nums"
              title={`${entry.followerCount} ${entry.followerCount === 1 ? "follower" : "followers"}`}
            >
              <Users className="w-2.5 h-2.5" />
              {entry.followerCount}
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

function EmptyState({
  isEs,
  category,
}: {
  isEs: boolean
  category?: { id: string; label: string; emoji: string } | null
}) {
  if (category) {
    return (
      <div className="py-12 text-center">
        <span className="text-3xl block mb-3" aria-hidden>{category.emoji}</span>
        <p className="text-sm font-semibold text-foreground mb-1">
          {isEs
            ? `Aún nadie destaca en ${category.label}`
            : `No specialists in ${category.label} yet`}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          {isEs
            ? `Sé el primer predictor que se gane el título de ${category.label}.`
            : `Be the first forecaster to earn the ${category.label} title.`}
        </p>
        <a
          href="/markets"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          {category.emoji} {isEs ? "Predecir en esta categoría" : "Predict in this category"}
        </a>
      </div>
    )
  }

  return (
    <div className="py-12 text-center">
      <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm font-semibold text-foreground mb-1">
        {isEs ? "¡El ranking está vacío!" : "The leaderboard is empty!"}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {isEs ? "Sé el primero en aparecer aquí." : "Be the first name on this board."}
      </p>
      <a
        href="/markets"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
      >
        🎯 {isEs ? "Empezar ahora" : "Start predicting"}
      </a>
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean
  onClick: () => void
  label: string
  emoji: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 snap-start border transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
      )}
    >
      <span className="leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

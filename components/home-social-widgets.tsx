"use client"

import Link from "next/link"
import { Flame, ArrowRight, TrendingUp } from "lucide-react"
import { useGamification } from "@/stores/gamification"
import { DEMO_USERS } from "@/lib/demo-leaderboard"
import { PT_CATEGORIES } from "@/lib/categories"
import { RARITY_COLORS } from "@/lib/badges"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function HomeSocialWidgets() {
  const { language } = useLanguage()
  const isEs = language === "es"
  const { currentStreak, totalPredictions, badges } = useGamification()

  // Top 3 demo streakers + real user if they have a streak
  const topDemoStreakers = DEMO_USERS.slice(0, 3)

  const hasUserStreak = currentStreak > 0

  // Hot categories — take first 5 PT categories (all are "hot" for demo)
  const hotCategories = PT_CATEGORIES.slice(0, 5)

  const communityStats = {
    predictions: "47,293",
    forecasters: "8,140",
    markets: "1,200+",
  }

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary text-xs font-semibold tracking-wider uppercase mb-2">
              {isEs ? "Comunidad" : "Community"}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              {isEs ? "Predictores activos" : "Active Forecasters"}
            </h2>
          </div>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isEs ? "Ver ranking" : "View leaderboard"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {/* Top Streakers */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {isEs ? "Mejores rachas" : "Top Streaks"}
            </p>

            {/* Real user card (if has streak) */}
            {hasUserStreak && (
              <StreakCard
                name={isEs ? "Tú" : "You"}
                streak={currentStreak}
                badgeCount={badges.length}
                category={isEs ? "Tu categoría" : "Your category"}
                categoryEmoji="⭐"
                isYou
              />
            )}

            {topDemoStreakers.map((user, i) => (
              <Link key={user.id} href={`/profile/${user.username}`}>
                <StreakCard
                  name={user.displayName}
                  streak={user.currentStreak}
                  badgeCount={user.badgeCount}
                  category={user.favoriteCategory}
                  categoryEmoji={user.favoriteCategoryEmoji}
                  rank={hasUserStreak ? i + 2 : i + 1}
                />
              </Link>
            ))}
          </div>

          {/* Right column: Hot Categories + Stats */}
          <div className="space-y-4">
            {/* Hot Categories */}
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                {isEs ? "Categorías activas" : "Hot Categories"}
              </p>
              <div className="space-y-2">
                {hotCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href="/markets"
                    className="flex items-center gap-2.5 py-1.5 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-base leading-none">{cat.emoji}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{cat.label}</span>
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: cat.color }}
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Community counter */}
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {isEs ? "Estadísticas" : "Community Stats"}
              </p>
              <div className="space-y-3">
                <StatRow label={isEs ? "Predicciones hechas" : "Predictions made"} value={communityStats.predictions} />
                <StatRow label={isEs ? "Predictores activos" : "Active forecasters"} value={communityStats.forecasters} />
                <StatRow label={isEs ? "Mercados abiertos" : "Open markets"} value={communityStats.markets} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StreakCard({
  name,
  streak,
  badgeCount,
  category,
  categoryEmoji,
  rank,
  isYou = false,
}: {
  name: string
  streak: number
  badgeCount: number
  category: string
  categoryEmoji: string
  rank?: number
  isYou?: boolean
}) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors",
        isYou
          ? "bg-amber-500/8 border-amber-500/30"
          : "bg-card/50 border-border hover:border-border/80 hover:bg-card"
      )}
    >
      {/* Rank / medal */}
      <div className="w-7 text-center shrink-0">
        {medal ? (
          <span className="text-lg leading-none">{medal}</span>
        ) : rank ? (
          <span className="text-xs font-bold text-muted-foreground">{rank}</span>
        ) : null}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          isYou ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"
        )}
      >
        {name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", isYou && "text-amber-400")}>{name}</p>
        <p className="text-[11px] text-muted-foreground">
          {categoryEmoji} {category} · {badgeCount} badges
        </p>
      </div>

      {/* Streak */}
      <div className="text-right shrink-0">
        <p className={cn("text-sm font-bold", isYou ? "text-amber-400" : "text-foreground")}>
          🔥 {streak}d
        </p>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

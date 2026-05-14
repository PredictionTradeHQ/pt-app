"use client"

import Link from "next/link"
import { Flame, Target, Medal, Trophy, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCard } from "@/components/badge-card"
import { BADGE_DEFINITIONS, BADGE_DISPLAY_ORDER } from "@/lib/badges"
import { cn } from "@/lib/utils"
import type { RealProfileData } from "@/app/api/profile/[username]/route"

interface Props {
  data: RealProfileData
}

export function RealPublicProfile({ data }: Props) {
  const { displayName, username, gamification: gam } = data

  const initials = displayName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const earnedBadgeIds = new Set((gam?.badges ?? []).map((b) => b.id))
  const earnedBadges = (gam?.badges ?? []) as Array<{ id: string; earnedAt: string }>
  const earnedMap = new Map(earnedBadges.map((b) => [b.id, b.earnedAt]))

  const hasStats = gam !== null && gam.totalPredictions > 0

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{displayName}</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
          <p className="text-xs text-muted-foreground mt-1">
            PredictionTrade Forecaster
          </p>
        </div>
      </div>

      {!hasStats && (
        <Card className="mb-6">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            This forecaster hasn&apos;t made any predictions yet.
          </CardContent>
        </Card>
      )}

      {hasStats && gam && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="Current Streak"
              value={`${gam.currentStreak}d`}
              sub={`Best: ${gam.bestStreak}d`}
            />
            <StatCard
              icon={<Target className="w-4 h-4 text-primary" />}
              label="Accuracy"
              value={gam.accuracyPct !== null ? `${gam.accuracyPct}%` : "—"}
              sub={
                gam.accuracyPct !== null
                  ? `${gam.resolvedCount} resolved`
                  : "Need ≥5 resolved"
              }
            />
            <StatCard
              icon={<Trophy className="w-4 h-4 text-yellow-400" />}
              label="Predictions"
              value={String(gam.totalPredictions)}
              sub={`${gam.resolvedCount} resolved`}
            />
            <StatCard
              icon={<Medal className="w-4 h-4 text-primary" />}
              label="Badges"
              value={String(gam.badgeCount)}
              sub={
                gam.calledItCount > 0
                  ? `${gam.calledItCount} Called It`
                  : "Earned"
              }
            />
          </div>

          {/* Badges */}
          {earnedBadgeIds.size > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Badges earned · {earnedBadgeIds.size} / {BADGE_DISPLAY_ORDER.length}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BADGE_DISPLAY_ORDER.filter((id) => earnedBadgeIds.has(id)).map(
                    (id) => {
                      const def = BADGE_DEFINITIONS[id]
                      if (!def) return null
                      return (
                        <BadgeCard
                          key={id}
                          badge={def}
                          earned
                          earnedAt={earnedMap.get(id)}
                          size="md"
                        />
                      )
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Make your own predictions</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Build a streak, earn badges, and appear on the leaderboard.
            </p>
          </div>
          <Link
            href="/markets"
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold text-primary",
              "hover:underline shrink-0"
            )}
          >
            Browse Markets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

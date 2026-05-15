"use client"

import Link from "next/link"
import { useState } from "react"
import { Flame, Target, Medal, Trophy, ArrowRight, CheckCircle2, XCircle, Clock, Share2, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCard } from "@/components/badge-card"
import { BADGE_DEFINITIONS, BADGE_DISPLAY_ORDER } from "@/lib/badges"
import { cn } from "@/lib/utils"
import type { RealProfileData, PublicPredictionRecord } from "@/app/api/profile/[username]/route"

interface Props {
  data: RealProfileData
}

export function RealPublicProfile({ data }: Props) {
  const { displayName, username, gamification: gam } = data
  const [copied, setCopied] = useState(false)

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

  const shareProfile = () => {
    const url = `${window.location.origin}/profile/${username}`
    const text = gam && gam.accuracyPct !== null
      ? `Check out ${displayName}'s prediction track record on @PredictionTrade — ${gam.accuracyPct}% accuracy, ${gam.totalPredictions} predictions. 🎯`
      : `Check out ${displayName}'s prediction profile on @PredictionTrade 🎯`

    if (navigator.share) {
      navigator.share({ title: `${displayName} — PredictionTrade`, text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
    }
  }

  const shareOnX = () => {
    const url = `${window.location.origin}/profile/${username}`
    const text = gam && gam.accuracyPct !== null
      ? `${displayName} is ${gam.accuracyPct}% accurate on ${gam.totalPredictions} predictions. See their full track record on @PredictionTrade 🎯`
      : `Check out ${displayName}'s prediction profile on @PredictionTrade 🎯`
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    )
  }

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
        {/* Share buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={shareOnX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-border/80 hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground"
            title="Share on X"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.859L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share
          </button>
          <button
            onClick={shareProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-border/80 hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground"
            title="Copy profile link"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>
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

      {/* Recent Predictions */}
      {data.recentPredictions.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Recent predictions · {data.recentPredictions.length}
            </p>
            <div className="space-y-2">
              {data.recentPredictions.map((p, i) => (
                <PredictionRow key={i} prediction={p} />
              ))}
            </div>
          </CardContent>
        </Card>
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

function PredictionRow({ prediction: p }: { prediction: PublicPredictionRecord }) {
  const timeAgo = (() => {
    const diffMs = Date.now() - new Date(p.createdAt).getTime()
    const days = Math.floor(diffMs / 86_400_000)
    if (days > 30) return `${Math.floor(days / 30)}mo ago`
    if (days > 0) return `${days}d ago`
    const hours = Math.floor(diffMs / 3_600_000)
    if (hours > 0) return `${hours}h ago`
    return "just now"
  })()

  const statusIcon = p.resolved
    ? p.correct
      ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
      : <XCircle className="w-4 h-4 text-destructive shrink-0" />
    : <Clock className="w-4 h-4 text-muted-foreground shrink-0" />

  const isContrarian =
    (p.prediction === "YES" && p.probAtTime < 20) ||
    (p.prediction === "NO" && 100 - p.probAtTime < 20)

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg p-3 text-sm",
      p.resolved && p.correct ? "bg-primary/5 border border-primary/15" : "bg-muted/40"
    )}>
      <div className="mt-0.5">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs leading-snug line-clamp-2 text-foreground">
          {p.marketTitle}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            p.prediction === "YES"
              ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive"
          )}>
            {p.prediction}
          </span>
          {isContrarian && (
            <span className="text-[10px] text-orange-400 font-semibold">contrarian 🎲</span>
          )}
          {p.resolved && p.outcome && (
            <span className="text-[10px] text-muted-foreground">
              → resolved {p.outcome}
            </span>
          )}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo}</span>
    </div>
  )
}

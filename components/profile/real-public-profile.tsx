"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Flame, Target, Medal, Trophy, ArrowRight,
  CheckCircle2, XCircle, Clock, Share2, Check, Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCard } from "@/components/badge-card"
import { Avatar } from "@/components/avatar"
import { FollowButton } from "@/components/profile/follow-button"
import { StatCard } from "@/components/profile/stat-card"
import { BADGE_DEFINITIONS, BADGE_DISPLAY_ORDER } from "@/lib/badges"
import { PT_CATEGORIES } from "@/lib/categories"
import { buildProfileHeadline } from "@/lib/profile-helpers"
import { cn } from "@/lib/utils"
import type {
  RealProfileData,
  PublicPredictionRecord,
  CategoryStat,
  TopCall,
} from "@/app/api/profile/[username]/route"

interface Props {
  data: RealProfileData
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RealPublicProfile({ data }: Props) {
  const { userId, displayName, username, avatarUrl, followerCount, gamification: gam, recentPredictions, categoryStats, topCalls } = data
  const [copied, setCopied] = useState(false)

  const earnedBadgeIds = new Set((gam?.badges ?? []).map((b) => b.id))
  const earnedBadges = (gam?.badges ?? []) as Array<{ id: string; earnedAt: string }>
  const earnedMap = new Map(earnedBadges.map((b) => [b.id, b.earnedAt]))

  const hasStats = gam !== null && gam.totalPredictions > 0
  const headline = buildProfileHeadline(gam, categoryStats)

  const shareText = `${displayName} on @PredictionTrade — ${headline}`
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${username}`
    : `/profile/${username}`

  const shareOnX = () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/profile/${username}`
      : `/profile/${username}`
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      "_blank"
    )
  }

  const copyLink = () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/profile/${username}`
      : `/profile/${username}`
    if (navigator.share) {
      navigator.share({ title: `${displayName} — PredictionTrade`, text: shareText, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
    }
  }

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">

      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-3">
        <Avatar size="lg" url={avatarUrl} displayName={displayName} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{displayName}</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">PredictionTrade Forecaster</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <FollowButton followeeId={userId} initialCount={followerCount} />
          <button
            onClick={shareOnX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors text-xs font-semibold"
            title="Share on X"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.859L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors text-xs font-semibold"
            title="Copy profile link"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-primary" />
              : <Share2 className="w-3.5 h-3.5" />
            }
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {/* ── Headline ── (only when stats exist; empty hero carries the identity copy otherwise) */}
      {hasStats && (
        <p className="text-sm text-muted-foreground mb-6 pl-1">{headline}</p>
      )}

      {/* ── New-forecaster hero ── */}
      {!hasStats && (
        <EmptyPublicProfileHero displayName={displayName} />
      )}

      {hasStats && gam && (
        <>
          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="Streak"
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
              highlight={gam.accuracyPct !== null && gam.accuracyPct >= 60}
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
              sub={gam.calledItCount > 0 ? `${gam.calledItCount} Called It 💡` : "Earned"}
            />
          </div>

          {/* ── Category accuracy ── */}
          {categoryStats.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <SectionLabel>Category accuracy</SectionLabel>
                <CategoryAccuracySection stats={categoryStats} />
              </CardContent>
            </Card>
          )}

          {/* ── Top contrarian calls ── */}
          {topCalls.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <SectionLabel>
                  <Zap className="w-3 h-3 inline mr-1 text-yellow-400" />
                  Biggest calls
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60">
                    — correct predictions against the crowd
                  </span>
                </SectionLabel>
                <div className="space-y-3">
                  {topCalls.map((call, i) => (
                    <TopCallRow key={i} call={call} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Badges ── */}
          {earnedBadgeIds.size > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <SectionLabel>
                  Badges earned
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60">
                    {earnedBadgeIds.size} / {BADGE_DISPLAY_ORDER.length}
                  </span>
                </SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BADGE_DISPLAY_ORDER.filter((id) => earnedBadgeIds.has(id)).map((id) => {
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
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Recent predictions ── */}
          {recentPredictions.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <SectionLabel>
                  Recent predictions
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60">
                    last {recentPredictions.length}
                  </span>
                </SectionLabel>
                <div className="space-y-2">
                  {recentPredictions.map((p, i) => (
                    <PredictionRow key={i} prediction={p} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── CTA ── */}
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
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
          >
            Browse Markets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
      {children}
    </p>
  )
}

// Third-person aspirational empty state for a public profile that has zero
// predictions. Same triad (Streak / Specialty / Leaderboard) as the private
// EmptyProfileHero on /profile — but phrased as observation, not instruction.
// The page-level "Make your own predictions" CTA already serves the viewer,
// so this hero stays presentational on purpose.
function EmptyPublicProfileHero({ displayName }: { displayName: string }) {
  const firstName = displayName.split(/\s+/)[0] || displayName
  return (
    <Card className="mb-6 border-primary/25 bg-gradient-to-br from-primary/[0.06] via-transparent to-amber-500/[0.04] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <CardContent className="pt-6 pb-6">
        {/* Headline */}
        <div className="text-center mb-5">
          <span className="text-3xl block mb-2 leading-none" aria-hidden>✨</span>
          <h2 className="text-lg font-bold mb-1.5">
            Every top predictor starts with a first call.
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Once {firstName} makes their first prediction, their streak, specialty,
            and leaderboard climb will build right here.
          </p>
        </div>

        {/* Three pillars — same vocabulary as the private hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <PublicPillar
            emoji="🔥"
            accentClass="text-orange-400"
            title="Streak"
            body="Builds day by day from the first prediction."
          />
          <PublicPillar
            emoji="🪙"
            accentClass="text-amber-400"
            title="Specialty"
            body="Earned after 3 correct calls in any one category."
          />
          <PublicPillar
            emoji="🏆"
            accentClass="text-primary"
            title="Leaderboard"
            body="Appears from the very first correct call."
          />
        </div>
      </CardContent>
    </Card>
  )
}

function PublicPillar({
  emoji,
  accentClass,
  title,
  body,
}: {
  emoji: string
  accentClass: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3.5 text-center">
      <span className="text-xl block mb-1 leading-none" aria-hidden>{emoji}</span>
      <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${accentClass}`}>
        {title}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">{body}</p>
    </div>
  )
}

function CategoryAccuracySection({ stats }: { stats: CategoryStat[] }) {
  const best = stats[0]

  return (
    <div className="space-y-1">
      {/* Best category callout */}
      {best && best.pct >= 50 && (() => {
        const cat = PT_CATEGORIES.find((c) => c.id === best.catId)
        if (!cat) return null
        return (
          <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/15">
            <span className="text-xl leading-none">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">
                Best at {cat.label}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {best.correct}/{best.total} resolved predictions
              </p>
            </div>
            <span className="text-xl font-bold text-primary shrink-0">{best.pct}%</span>
          </div>
        )
      })()}

      {/* Per-category bars */}
      <div className="space-y-3">
        {stats.map(({ catId, total, correct, pct }) => {
          const cat = PT_CATEGORIES.find((c) => c.id === catId)
          if (!cat) return null
          return (
            <div key={catId}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="leading-none">{cat.emoji}</span>
                  <span className="font-medium text-sm">{cat.label}</span>
                </span>
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  pct >= 60 ? "text-primary" : pct >= 40 ? "text-foreground" : "text-destructive/80"
                )}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    pct >= 60 ? "bg-primary" : pct >= 40 ? "bg-foreground/40" : "bg-destructive/50"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {correct}/{total} resolved
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TopCallRow({ call }: { call: TopCall }) {
  const crowd = call.prediction === "YES" ? call.probAtTime : 100 - call.probAtTime
  const cat = call.marketTitle // no category in TopCall — just title

  return (
    <div className="flex items-start gap-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15 px-3 py-2.5">
      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-snug text-foreground line-clamp-2">{cat}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            call.prediction === "YES"
              ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive"
          )}>
            {call.prediction}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {crowd}% crowd · Called It 💡
          </span>
        </div>
      </div>
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

  const cat = p.category ? PT_CATEGORIES.find((c) => c.id === p.category) : null

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
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            p.prediction === "YES"
              ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive"
          )}>
            {p.prediction}
          </span>
          {cat && (
            <span className="text-[10px] text-muted-foreground">
              {cat.emoji} {cat.label}
            </span>
          )}
          {isContrarian && (
            <span className="text-[10px] text-orange-400 font-semibold">contrarian 🎲</span>
          )}
          {p.resolved && p.outcome && (
            <span className="text-[10px] text-muted-foreground">
              → {p.outcome}
            </span>
          )}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo}</span>
    </div>
  )
}

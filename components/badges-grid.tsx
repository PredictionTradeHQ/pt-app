"use client"

import { useGamification } from "@/stores/gamification"
import { BadgeCard } from "@/components/badge-card"
import { BADGE_DEFINITIONS, BADGE_DISPLAY_ORDER } from "@/lib/badges"
import { cn } from "@/lib/utils"

interface BadgesGridProps {
  compact?: boolean
  className?: string
}

export function BadgesGrid({ compact = false, className }: BadgesGridProps) {
  const { badges } = useGamification()

  const earnedMap = new Map(badges.map((b) => [b.id, b.earnedAt]))
  const earnedCount = earnedMap.size
  const totalCount = BADGE_DISPLAY_ORDER.length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Badges
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {earnedCount} / {totalCount} earned
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid */}
      {compact ? (
        // Compact: small tiles, many per row
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {BADGE_DISPLAY_ORDER.map((id) => {
            const def = BADGE_DEFINITIONS[id]
            if (!def) return null
            const earnedAt = earnedMap.get(id)
            return (
              <BadgeCard
                key={id}
                badge={def}
                earned={!!earnedAt}
                earnedAt={earnedAt}
                size="sm"
              />
            )
          })}
        </div>
      ) : (
        // Full: cards grid
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGE_DISPLAY_ORDER.map((id) => {
            const def = BADGE_DEFINITIONS[id]
            if (!def) return null
            const earnedAt = earnedMap.get(id)
            return (
              <BadgeCard
                key={id}
                badge={def}
                earned={!!earnedAt}
                earnedAt={earnedAt}
                size="md"
              />
            )
          })}
        </div>
      )}

      {earnedCount === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Make predictions to earn badges.
        </p>
      )}
    </div>
  )
}

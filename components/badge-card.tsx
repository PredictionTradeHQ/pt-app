"use client"

import { cn } from "@/lib/utils"
import { type BadgeDefinition, RARITY_COLORS, RARITY_LABELS } from "@/lib/badges"

interface BadgeCardProps {
  badge: BadgeDefinition
  earned?: boolean
  earnedAt?: string
  size?: "sm" | "md"
  className?: string
}

export function BadgeCard({
  badge,
  earned = false,
  earnedAt,
  size = "md",
  className,
}: BadgeCardProps) {
  const color = earned ? RARITY_COLORS[badge.rarity] : undefined
  const label = RARITY_LABELS[badge.rarity]

  const earnedDate = earnedAt
    ? new Date(earnedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null

  if (size === "sm") {
    return (
      <div
        className={cn(
          "group relative flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all",
          earned
            ? "bg-card border border-border/80 hover:border-primary/30"
            : "bg-muted/20 border border-border/30 opacity-40",
          className
        )}
        title={earned ? `${badge.name}: ${badge.description}` : `Locked: ${badge.description}`}
      >
        <span className={cn("text-xl leading-none", !earned && "grayscale")}>
          {badge.emoji}
        </span>
        <p className="text-[10px] font-semibold text-center leading-tight line-clamp-1">
          {badge.name}
        </p>
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <span className="text-[10px] text-muted-foreground/60">🔒</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-4 transition-all",
        earned
          ? "bg-card border-border/80 hover:border-primary/20"
          : "bg-muted/10 border-border/30 opacity-50",
        className
      )}
    >
      {/* Emoji + rarity dot */}
      <div className="flex items-start justify-between mb-3">
        <span className={cn("text-3xl leading-none", !earned && "grayscale opacity-60")}>
          {badge.emoji}
        </span>
        {earned && color && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: color + "20", color }}
          >
            {label}
          </span>
        )}
        {!earned && (
          <span className="text-[10px] text-muted-foreground/50 font-medium">Locked</span>
        )}
      </div>

      <p
        className={cn(
          "text-sm font-bold mb-1",
          earned ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {badge.name}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug flex-1">
        {badge.description}
      </p>

      {earned && earnedDate && (
        <p className="text-[10px] text-muted-foreground/60 mt-2 pt-2 border-t border-border/50">
          Earned {earnedDate}
        </p>
      )}
    </div>
  )
}

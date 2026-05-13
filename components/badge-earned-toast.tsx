"use client"

import { useEffect, useState } from "react"
import { getBadge, RARITY_COLORS } from "@/lib/badges"
import { cn } from "@/lib/utils"

interface BadgeEarnedToastProps {
  badgeIds: string[]
  onDismiss: () => void
}

export function BadgeEarnedToast({ badgeIds, onDismiss }: BadgeEarnedToastProps) {
  const [visible, setVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (badgeIds.length === 0) return
    setCurrentIndex(0)
    setVisible(true)
  }, [badgeIds])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      if (currentIndex < badgeIds.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        setVisible(false)
        onDismiss()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [visible, currentIndex, badgeIds.length, onDismiss])

  if (!visible || badgeIds.length === 0) return null

  const badgeId = badgeIds[currentIndex]
  const badge = getBadge(badgeId)
  if (!badge) return null

  const color = RARITY_COLORS[badge.rarity]

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl shadow-black/40 backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          borderColor: color + "40",
        }}
      >
        {/* Glow dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: color }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: color }}
          />
        </span>

        <span className="text-2xl leading-none">{badge.emoji}</span>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
            Badge Earned
          </p>
          <p className="text-sm font-bold text-foreground leading-tight">{badge.name}</p>
          <p className="text-[11px] text-muted-foreground">{badge.description}</p>
        </div>

        {badgeIds.length > 1 && (
          <span className="text-[10px] text-muted-foreground ml-1 shrink-0">
            {currentIndex + 1}/{badgeIds.length}
          </span>
        )}
      </div>
    </div>
  )
}

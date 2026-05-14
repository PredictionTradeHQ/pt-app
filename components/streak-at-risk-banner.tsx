"use client"

import { useState, useMemo } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGamification } from "@/stores/gamification"

interface Props {
  className?: string
}

export function StreakAtRiskBanner({ className }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const { currentStreak, lastPredictionDate } = useGamification()

  const predictedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return lastPredictionDate === today
  }, [lastPredictionDate])

  if (currentStreak < 2 || predictedToday || dismissed) return null

  const isUrgent = currentStreak >= 7

  return (
    <div className={cn(
      "border-b",
      isUrgent
        ? "bg-orange-500/8 border-orange-500/20"
        : "bg-amber-500/6 border-amber-500/15",
      className
    )}>
      <div className="container mx-auto px-4 md:px-8 py-2.5 flex items-center gap-3">
        <span className={cn("text-base shrink-0", isUrgent && "animate-bounce")}>🔥</span>
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn(
            "text-sm font-bold",
            isUrgent ? "text-orange-400" : "text-amber-400"
          )}>
            {currentStreak}-day streak at risk!
          </span>
          <span className="text-sm text-muted-foreground">
            Make a prediction today to keep it alive.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

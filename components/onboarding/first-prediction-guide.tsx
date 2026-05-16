"use client"

import { useEffect, useState } from "react"
import { ArrowRight, X } from "lucide-react"
import { useGamification } from "@/stores/gamification"

// localStorage gate. Bump the version when the copy or shape changes meaningfully
// so previously-dismissed users see the refreshed nudge once.
const DISMISSED_KEY = "pt-first-call-v2"

export function FirstPredictionGuide() {
  const totalPredictions = useGamification((s) => s.totalPredictions)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(DISMISSED_KEY)
    if (!done && totalPredictions === 0) setVisible(true)
  }, [totalPredictions])

  // Auto-dismiss the moment the first prediction lands.
  useEffect(() => {
    if (totalPredictions >= 1 && visible) setVisible(false)
  }, [totalPredictions, visible])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="mb-4 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-transparent to-amber-500/[0.05] p-4 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Headline */}
      <div className="text-center mb-4">
        <span className="text-2xl block mb-1.5 leading-none" aria-hidden>🎯</span>
        <p className="text-base font-bold leading-tight">Make your first call.</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-md mx-auto leading-snug">
          Start your streak, earn your specialty, and appear on the leaderboard from your very first prediction.
        </p>
      </div>

      {/* Triad — same vocabulary as the empty-state heroes, OG cards, and share copy */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Pillar emoji="🔥" accentClass="text-orange-400" title="Streak" />
        <Pillar emoji="🪙" accentClass="text-amber-400" title="Specialty" />
        <Pillar emoji="🏆" accentClass="text-primary"   title="Leaderboard" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          Virtual only. Your reputation is real.
        </p>
        <button
          onClick={dismiss}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          Explore markets
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function Pillar({
  emoji,
  accentClass,
  title,
}: {
  emoji: string
  accentClass: string
  title: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-2.5 text-center">
      <span className="text-lg block mb-1 leading-none" aria-hidden>{emoji}</span>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${accentClass}`}>
        {title}
      </p>
    </div>
  )
}

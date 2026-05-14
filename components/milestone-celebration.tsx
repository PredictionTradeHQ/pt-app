"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  streak: number
  open: boolean
  onClose: () => void
  username: string
}

const CONFETTI_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#84CC16", "#F97316",
]

const CONFETTI_COUNT = 18

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        const left = Math.round((i / CONFETTI_COUNT) * 100)
        const delay = (i * 0.12).toFixed(2)
        const size = i % 3 === 0 ? 10 : i % 3 === 1 ? 7 : 5
        const duration = (1.6 + (i % 5) * 0.2).toFixed(1)
        return (
          <div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left: left + "%",
              width: size,
              height: size,
              background: color,
              animation: `confetti-fall ${duration}s ${delay}s ease-in forwards,
                           confetti-sway ${duration}s ${delay}s ease-in-out infinite`,
            }}
          />
        )
      })}
    </div>
  )
}

const MILESTONE_COPY: Record<number, { emoji: string; headline: string; sub: string }> = {
  3:  { emoji: "🔥", headline: "3-Day Streak!",  sub: "You're building momentum." },
  7:  { emoji: "⚡", headline: "7-Day Streak!",  sub: "One full week of predictions." },
  30: { emoji: "🏆", headline: "30-Day Streak!", sub: "You're a prediction machine." },
}

export function MilestoneCelebration({ streak, open, onClose, username }: Props) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 2600)
      return () => clearTimeout(t)
    }
  }, [open])

  const copy = MILESTONE_COPY[streak] ?? {
    emoji: "🔥",
    headline: `${streak}-Day Streak!`,
    sub: "Keep predicting every day.",
  }

  const tweetText = `${copy.emoji} ${copy.headline} on @PredictionTrade — I've predicted ${streak} days in a row. Can you beat me? predictiontrade.online`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs gap-0 overflow-hidden border-amber-500/30 bg-card p-0">
        <DialogTitle className="sr-only">Streak Milestone</DialogTitle>

        {/* Confetti layer */}
        <div className="relative">
          {showConfetti && <Confetti />}

          <div className="p-6 text-center relative">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge strip */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4">
              🏅 Milestone Unlocked
            </div>

            {/* Big emoji + streak */}
            <div className="mb-3">
              <span className="text-7xl leading-none block mb-2">{copy.emoji}</span>
              <p className="text-4xl font-black text-amber-400">{streak}</p>
              <p className="text-lg font-bold text-foreground">day streak</p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">{copy.sub}</p>

            {/* Share CTA */}
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl",
                "bg-sky-500/10 border border-sky-500/30 text-sky-400",
                "text-sm font-semibold hover:bg-sky-500/20 transition-colors"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Share on X
            </a>

            <button
              onClick={onClose}
              className="mt-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Keep predicting →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

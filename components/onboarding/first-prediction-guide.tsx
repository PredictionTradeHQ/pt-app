"use client"

import { useEffect, useState } from "react"
import { X, Target, Repeat2, Calendar } from "lucide-react"
import { useGamification } from "@/stores/gamification"

const DISMISSED_KEY = "pt-onboarding-v1"

const STEPS = [
  {
    icon: Target,
    title: "Find a market",
    desc: "Browse below. Pick a topic you have an opinion on.",
  },
  {
    icon: Repeat2,
    title: "Tap YES or NO",
    desc: "One tap places your prediction. No money involved.",
  },
  {
    icon: Calendar,
    title: "Come back tomorrow",
    desc: "Every daily prediction builds your streak and reputation.",
  },
]

export function FirstPredictionGuide() {
  const totalPredictions = useGamification((s) => s.totalPredictions)
  // Start as dismissed to avoid flash — reveal after mount check
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(DISMISSED_KEY)
    if (!done && totalPredictions === 0) setVisible(true)
  }, [totalPredictions])

  // Auto-dismiss the moment the first prediction lands
  useEffect(() => {
    if (totalPredictions >= 1 && visible) setVisible(false)
  }, [totalPredictions, visible])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 relative animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Close guide"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70 mb-3">
        🎯 How it works
      </p>

      <div className="flex gap-3">
        {STEPS.map((step, i) => (
          <div key={i} className="flex-1 text-center">
            {/* Step number + icon */}
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
              <step.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">
              {step.title}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug hidden sm:block">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: compact description of current step */}
      <p className="text-[11px] text-muted-foreground text-center mt-3 sm:hidden">
        Browse markets below, tap YES or NO, and come back tomorrow.
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground">No real money. Just your reputation.</p>
        <button
          onClick={dismiss}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Got it →
        </button>
      </div>
    </div>
  )
}

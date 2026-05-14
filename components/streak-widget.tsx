"use client"

import { useGamification } from "@/stores/gamification"
import { cn } from "@/lib/utils"

interface StreakWidgetProps {
  variant?: "sidebar" | "profile" | "compact"
  className?: string
}

export function StreakWidget({ variant = "sidebar", className }: StreakWidgetProps) {
  const { currentStreak, bestStreak, lastPredictionDate } = useGamification()

  const today = new Date().toISOString().split("T")[0]
  const predictedToday = lastPredictionDate === today

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold",
          currentStreak > 0 ? "text-orange-400" : "text-muted-foreground",
          className
        )}
      >
        🔥 {currentStreak}
      </span>
    )
  }

  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2.5",
          currentStreak > 0
            ? "bg-orange-500/8 border border-orange-500/20"
            : "bg-muted/30 border border-border/50",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">
            {currentStreak > 0 ? "🔥" : "⬜"}
          </span>
          <div>
            <p
              className={cn(
                "text-xs font-bold leading-none",
                currentStreak > 0 ? "text-orange-400" : "text-muted-foreground"
              )}
            >
              {currentStreak > 0
                ? `${currentStreak}-day streak`
                : "Start your streak"}
            </p>
            {predictedToday && currentStreak > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ✓ Predicted today
              </p>
            )}
            {!predictedToday && currentStreak > 0 && (
              <p className="text-[10px] text-orange-500/70 mt-0.5">
                Predict today to continue
              </p>
            )}
            {currentStreak === 0 && (
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                Predict once a day to build it 🔥
              </p>
            )}
          </div>
        </div>
        {bestStreak > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground leading-none">Best</p>
            <p className="text-xs font-bold text-foreground">{bestStreak}d</p>
          </div>
        )}
      </div>
    )
  }

  // profile variant — larger card
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        currentStreak > 0
          ? "border-orange-500/25 bg-orange-500/5"
          : "border-border bg-muted/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Prediction Streak
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl leading-none">
              {currentStreak > 0 ? "🔥" : "⬜"}
            </span>
            <div>
              <p
                className={cn(
                  "text-3xl font-black leading-none",
                  currentStreak > 0 ? "text-orange-400" : "text-muted-foreground"
                )}
              >
                {currentStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentStreak === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Best streak</p>
          <p className="text-2xl font-black text-foreground">{bestStreak}d</p>
        </div>
      </div>

      {/* Day dots — last 7 */}
      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: 7 }).map((_, i) => {
          // i=0 is 6 days ago, i=6 is today
          const daysAgo = 6 - i
          const date = new Date(Date.now() - daysAgo * 86_400_000)
            .toISOString()
            .split("T")[0]
          const isToday = daysAgo === 0
          const active = lastPredictionDate
            ? date <= lastPredictionDate &&
              date >
                new Date(
                  Date.parse(lastPredictionDate) -
                    (currentStreak - 1) * 86_400_000
                )
                  .toISOString()
                  .split("T")[0]
            : false
          return (
            <div
              key={i}
              title={date}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                active
                  ? "bg-orange-400"
                  : isToday && !predictedToday
                  ? "bg-orange-500/25 border border-orange-500/40"
                  : "bg-muted/40"
              )}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">6 days ago</span>
        <span className="text-[10px] text-muted-foreground">Today</span>
      </div>

      {!predictedToday && (
        <p className="text-xs text-orange-500/80 font-medium mt-3">
          {currentStreak > 0
            ? "⚠ Make a prediction today to keep your streak!"
            : "Predict once a day to build a streak. Top forecasters have 30+ day streaks 🔥"}
        </p>
      )}
    </div>
  )
}

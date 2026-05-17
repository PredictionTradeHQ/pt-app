"use client"

import { CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { PT_CATEGORIES } from "@/lib/categories"
import type { PredictionRecord } from "@/stores/gamification"

interface PredictionHistoryProps {
  predictions: PredictionRecord[]
  limit?: number
  className?: string
  /** IDs of predictions that resolved correctly during the current session.
   * Session-only by design — not persisted; resets on refresh. */
  newlyCorrectIds?: Set<string>
}

export function PredictionHistory({
  predictions,
  limit = 10,
  className,
  newlyCorrectIds,
}: PredictionHistoryProps) {
  const displayed = predictions.slice(0, limit)

  if (displayed.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">
        No predictions yet. Make your first prediction in{" "}
        <a href="/markets" className="text-primary hover:underline">
          Markets
        </a>
        .
      </p>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {displayed.map((pred) => {
        const category = PT_CATEGORIES.find((c) => c.id === pred.category)
        const isYes = pred.prediction === "YES"

        // Determine status
        const status: "correct" | "incorrect" | "pending" = pred.resolved
          ? pred.correct
            ? "correct"
            : "incorrect"
          : "pending"

        const isNewlyCorrect = status === "correct" && (newlyCorrectIds?.has(pred.id) ?? false)

        const statusIcon =
          status === "correct" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : status === "incorrect" ? (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          )

        const date = new Date(pred.createdAt)
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

        const isContrarianBet =
          (isYes && pred.probAtTime < 20) || (!isYes && 100 - pred.probAtTime < 20)

        return (
          <div
            key={pred.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm",
              status === "correct"
                ? isNewlyCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "border-emerald-500/20 bg-emerald-500/5"
                : status === "incorrect"
                ? "border-red-500/20 bg-red-500/5"
                : "border-border bg-muted/20"
            )}
          >
            {statusIcon}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-snug">
                {category && (
                  <span className="mr-1">{category.emoji}</span>
                )}
                {pred.marketTitle}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    isYes
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-red-500/15 text-red-500"
                  )}
                >
                  {pred.prediction}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  YES was {pred.probAtTime}% · ${pred.amount}
                </span>
                {isContrarianBet && (
                  <span className="text-[10px] font-bold text-amber-400">🎲 contrarian</span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[11px] text-muted-foreground">{dateStr}</p>
              {pred.resolved && (
                <p
                  className={cn(
                    "text-[10px] font-bold",
                    pred.correct ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {pred.correct
                    ? (isNewlyCorrect ? "✓ Just called" : "✓ Correct")
                    : "✗ Wrong"}
                </p>
              )}
              {!pred.resolved && (
                <p className="text-[10px] text-muted-foreground/60">pending</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

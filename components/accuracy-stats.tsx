"use client"

import { Target, TrendingUp, Lightbulb, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccuracyStatsProps {
  totalPredictions: number
  resolvedCount: number
  correctCount: number
  calledItCount: number
  className?: string
}

export function AccuracyStats({
  totalPredictions,
  resolvedCount,
  correctCount,
  calledItCount,
  className,
}: AccuracyStatsProps) {
  const accuracyPct =
    resolvedCount >= 5 ? Math.round((correctCount / resolvedCount) * 100) : null

  const accuracyColor =
    accuracyPct === null
      ? "text-muted-foreground"
      : accuracyPct >= 70
      ? "text-emerald-500"
      : accuracyPct >= 55
      ? "text-amber-500"
      : "text-red-500"

  const stats = [
    {
      icon: Target,
      label: "Accuracy",
      value: accuracyPct !== null ? `${accuracyPct}%` : "—",
      sub:
        resolvedCount > 0
          ? `${correctCount}/${resolvedCount} resolved`
          : resolvedCount === 0
          ? "No resolved markets yet"
          : `${resolvedCount} resolved`,
      valueClass: accuracyColor,
      available: true,
    },
    {
      icon: Clock,
      label: "Predictions",
      value: String(totalPredictions),
      sub: resolvedCount > 0 ? `${resolvedCount} resolved` : "Pending resolution",
      valueClass: "text-foreground",
      available: true,
    },
    {
      icon: Lightbulb,
      label: "Called It",
      value: calledItCount > 0 ? String(calledItCount) : "0",
      sub: "Won vs <20% odds",
      valueClass: calledItCount > 0 ? "text-amber-400" : "text-muted-foreground",
      available: true,
    },
    {
      icon: TrendingUp,
      label: "Pending",
      value: String(totalPredictions - resolvedCount),
      sub: "Awaiting resolution",
      valueClass: "text-muted-foreground",
      available: true,
    },
  ]

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border"
        >
          <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
          <p className={cn("text-xl font-black leading-none mb-0.5", stat.valueClass)}>
            {stat.value}
          </p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            {stat.label}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.sub}</p>
        </div>
      ))}
    </div>
  )
}

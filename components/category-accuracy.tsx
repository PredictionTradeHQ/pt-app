"use client"

import { useMemo } from "react"
import { PT_CATEGORIES } from "@/lib/categories"
import type { PredictionRecord } from "@/stores/gamification"
import { cn } from "@/lib/utils"

interface Props {
  predictions: PredictionRecord[]
  isEs?: boolean
}

const MIN_RESOLVED = 3

export function CategoryAccuracy({ predictions, isEs }: Props) {
  const stats = useMemo(() => {
    const byCategory = new Map<string, { total: number; correct: number }>()

    for (const p of predictions) {
      if (!p.resolved || p.correct === undefined) continue
      const entry = byCategory.get(p.category) ?? { total: 0, correct: 0 }
      entry.total++
      if (p.correct) entry.correct++
      byCategory.set(p.category, entry)
    }

    return Array.from(byCategory.entries())
      .filter(([, s]) => s.total >= MIN_RESOLVED)
      .map(([catId, s]) => ({
        catId,
        total: s.total,
        correct: s.correct,
        pct: Math.round((s.correct / s.total) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [predictions])

  if (stats.length === 0) return null

  const best = stats[0]

  return (
    <div>
      {/* Best category callout */}
      {best && best.pct >= 50 && (() => {
        const cat = PT_CATEGORIES.find((c) => c.id === best.catId)
        if (!cat) return null
        return (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/8 border border-primary/15">
            <span className="text-lg">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">
                {isEs ? "Mejor categoría" : "Best category"}: {cat.label}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {best.pct}% {isEs ? "precisión" : "accuracy"} · {best.correct}/{best.total} {isEs ? "resueltos" : "resolved"}
              </p>
            </div>
            <span className="text-xl font-bold text-primary shrink-0">{best.pct}%</span>
          </div>
        )
      })()}

      {/* Per-category bars */}
      <div className="space-y-3">
        {stats.map(({ catId, total, correct, pct }) => {
          const cat = PT_CATEGORIES.find((c) => c.id === catId)
          if (!cat) return null
          return (
            <div key={catId}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-sm">
                  <span>{cat.emoji}</span>
                  <span className="font-medium">{cat.label}</span>
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  pct >= 60 ? "text-primary" : pct >= 40 ? "text-foreground" : "text-destructive"
                )}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    pct >= 60 ? "bg-primary" : pct >= 40 ? "bg-foreground/40" : "bg-destructive/60"
                  )}
                  style={{ width: pct + "%" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {correct}/{total} {isEs ? "predicciones resueltas" : "resolved predictions"}
              </p>
            </div>
          )
        })}
      </div>

      {stats.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">
          {isEs
            ? `Necesitas al menos ${MIN_RESOLVED} predicciones resueltas por categoría.`
            : `Need at least ${MIN_RESOLVED} resolved predictions per category.`}
        </p>
      )}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import type { PTCategory } from "@/lib/categories"

interface PredictionCardProps {
  title: string
  yesPercent: number
  category: PTCategory
  prediction?: "YES" | "NO"
  className?: string
  compact?: boolean
}

export function PredictionCard({
  title,
  yesPercent,
  category,
  prediction,
  className,
  compact = false,
}: PredictionCardProps) {
  const noPercent = 100 - yesPercent

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B]",
        compact ? "p-5" : "p-8",
        className
      )}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at -10% -10%, ${category.color}18 0%, transparent 55%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: PT logo + category */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black text-white"
              style={{ background: category.color }}
            >
              PT
            </div>
            <span className="text-[13px] font-semibold text-white/60">
              Prediction Trade
            </span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{
              background: category.color + "22",
              color: category.color,
              border: `1px solid ${category.color}40`,
            }}
          >
            {category.emoji} {category.label}
          </span>
        </div>

        {/* User prediction pill */}
        {prediction && (
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold",
              prediction === "YES"
                ? "border-emerald-500/40 text-emerald-400"
                : "border-red-500/40 text-red-400"
            )}
            style={{
              background:
                prediction === "YES"
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(239,68,68,0.12)",
            }}
          >
            <span>{prediction === "YES" ? "✅" : "❌"}</span>
            <span>I say {prediction}</span>
          </div>
        )}

        {/* Label */}
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
          Market
        </p>

        {/* Title */}
        <h2
          className={cn(
            "font-extrabold leading-snug text-white",
            compact ? "mb-5 line-clamp-2 text-[15px]" : "mb-6 line-clamp-3 text-xl"
          )}
        >
          {title}
        </h2>

        {/* Probability boxes */}
        <div className="mb-3.5 grid grid-cols-2 gap-2.5">
          <div
            className="rounded-xl border p-3 text-center"
            style={{
              background: category.color + "15",
              borderColor: category.color + "40",
            }}
          >
            <div
              className={cn("font-black leading-none", compact ? "text-2xl" : "text-3xl")}
              style={{ color: category.color }}
            >
              {yesPercent}%
            </div>
            <div className="mt-1 text-[10px] font-semibold text-white/45">YES</div>
          </div>

          <div className="rounded-xl border border-red-500/35 bg-red-500/10 p-3 text-center">
            <div
              className={cn(
                "font-black leading-none text-red-400",
                compact ? "text-2xl" : "text-3xl"
              )}
            >
              {noPercent}%
            </div>
            <div className="mt-1 text-[10px] font-semibold text-white/45">NO</div>
          </div>
        </div>

        {/* Bar */}
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="flex h-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${yesPercent}%`, background: category.color }}
            />
            <div className="h-full flex-1 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/25">predictiontrade.online</span>
          <span className="text-[10px] text-white/25">Virtual · Demo · Educational</span>
        </div>
      </div>
    </div>
  )
}

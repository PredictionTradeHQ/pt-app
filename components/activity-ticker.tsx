"use client"

import { cn } from "@/lib/utils"

export interface TickerTrade {
  id: number
  user: string
  market: string
  outcome: "YES" | "NO"
  amount: number
}

interface Props {
  trades: TickerTrade[]
  className?: string
}

export function ActivityTicker({ trades, className }: Props) {
  if (trades.length === 0) return null

  // Duplicate for seamless loop
  const items = [...trades, ...trades]

  return (
    <div className={cn("relative overflow-hidden border-b border-border/40 bg-muted/20 py-2", className)}>
      <div className="flex items-center">
        {/* Static "LIVE" pill */}
        <div className="shrink-0 flex items-center gap-1.5 pl-4 pr-3 border-r border-border/40 mr-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live</span>
        </div>

        {/* Scrolling content */}
        <div className="overflow-hidden flex-1">
          <div className="flex gap-0 animate-ticker">
            {items.map((trade, i) => (
              <span
                key={`${trade.id}-${i}`}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground shrink-0 pr-8"
              >
                <span className="font-semibold text-foreground">{trade.user}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  trade.outcome === "YES"
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive"
                )}>
                  {trade.outcome}
                </span>
                <span className="text-muted-foreground/70 truncate" style={{ maxWidth: 160 }}>
                  {trade.market}
                </span>
                <span className="text-muted-foreground/30 font-bold">·</span>
                <span className="text-muted-foreground/50">${trade.amount}</span>
                <span className="text-muted-foreground/20 mx-2">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

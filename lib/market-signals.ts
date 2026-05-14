// Rule-based market intelligence — zero external API cost
// Computed purely from Polymarket data: price, volume, endDate, isNew

export type SignalId =
  | "closing-urgent"
  | "closing-today"
  | "closing-soon"
  | "moving-fast"
  | "hot"
  | "tossup"
  | "consensus-yes"
  | "consensus-no"
  | "new"

export interface Signal {
  id: SignalId
  label: string
  icon: string
  className: string
}

export type TimeUrgency = "normal" | "soon" | "today" | "urgent"

export interface MarketSignals {
  primarySignal: Signal | null
  communityLabel: string
  timeUrgency: TimeUrgency
}

// Signal definitions — className = full Tailwind badge classes
const SIGNALS: Record<SignalId, Signal> = {
  "closing-urgent": {
    id: "closing-urgent",
    label: "Closing soon",
    icon: "⏰",
    className:
      "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  "closing-today": {
    id: "closing-today",
    label: "Closes today",
    icon: "⏰",
    className:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  "moving-fast": {
    id: "moving-fast",
    label: "Moving fast",
    icon: "🔥",
    className:
      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  },
  "hot": {
    id: "hot",
    label: "Hot",
    icon: "🔥",
    className:
      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  },
  "tossup": {
    id: "tossup",
    label: "Toss-up",
    icon: "⚖️",
    className:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  "consensus-yes": {
    id: "consensus-yes",
    label: "Strong YES",
    icon: "✅",
    className:
      "bg-primary/10 text-primary border border-primary/25",
  },
  "consensus-no": {
    id: "consensus-no",
    label: "Strong NO",
    icon: "❌",
    className:
      "bg-destructive/10 text-destructive border border-destructive/25",
  },
  "closing-soon": {
    id: "closing-soon",
    label: "Closing soon",
    icon: "⏳",
    className:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  },
  "new": {
    id: "new",
    label: "New",
    icon: "✨",
    className:
      "bg-primary/10 text-primary border border-primary/25",
  },
}

function hoursUntilClose(endDate: string | null): number | null {
  if (!endDate) return null
  const ms = new Date(endDate).getTime() - Date.now()
  if (ms <= 0) return 0
  return ms / (1000 * 60 * 60)
}

function communityLabel(yesPct: number): string {
  if (yesPct >= 87) return `${yesPct}% say YES`
  if (yesPct >= 72) return `Leaning YES · ${yesPct}%`
  if (yesPct >= 57) return `Slight YES lean`
  if (yesPct >= 44) return "Community split"
  if (yesPct >= 29) return `Slight NO lean`
  if (yesPct >= 14) return `Leaning NO · ${100 - yesPct}%`
  return `${100 - yesPct}% say NO`
}

export function computeMarketSignals(
  yesPrice: number,
  volume: number,
  volume24hr: number,
  endDate: string | null,
  isNew: boolean,
): MarketSignals {
  const yesPct = Math.round(yesPrice * 100)
  const hours = hoursUntilClose(endDate)

  // Time urgency
  let timeUrgency: TimeUrgency = "normal"
  if (hours !== null) {
    if (hours <= 3) timeUrgency = "urgent"
    else if (hours <= 24) timeUrgency = "today"
    else if (hours <= 48) timeUrgency = "soon"
  }

  // Signal priority: lowest index wins
  const candidates: Array<{ priority: number; id: SignalId }> = []

  if (hours !== null && hours <= 3)
    candidates.push({ priority: 0, id: "closing-urgent" })
  if (hours !== null && hours > 3 && hours <= 24)
    candidates.push({ priority: 1, id: "closing-today" })

  // Moving fast: 24h volume > 15% of total volume AND volume24hr > 20k
  if (volume > 0 && volume24hr / volume > 0.15 && volume24hr > 20_000)
    candidates.push({ priority: 2, id: "moving-fast" })

  if (yesPct >= 44 && yesPct <= 56)
    candidates.push({ priority: 3, id: "tossup" })

  if (yesPct >= 87)
    candidates.push({ priority: 4, id: "consensus-yes" })
  if (yesPct <= 13)
    candidates.push({ priority: 4, id: "consensus-no" })

  if (hours !== null && hours > 24 && hours <= 48)
    candidates.push({ priority: 5, id: "closing-soon" })

  if (volume24hr > 50_000)
    candidates.push({ priority: 6, id: "hot" })

  if (isNew)
    candidates.push({ priority: 7, id: "new" })

  candidates.sort((a, b) => a.priority - b.priority)

  const primarySignal = candidates.length > 0 ? SIGNALS[candidates[0].id] : null

  return {
    primarySignal,
    communityLabel: communityLabel(yesPct),
    timeUrgency,
  }
}

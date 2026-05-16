"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { generateShareCopy, type CategoryRef } from "@/lib/share-copy"
import { cn } from "@/lib/utils"

// X bird icon (inline SVG)
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// WhatsApp icon (inline SVG)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export interface ClimbInfo {
  previousRank: number
  currentRank: number
  accuracyPct?: number | null
  username?: string
  /** Optional specialty category — added to share copy when present. */
  topCategory?: CategoryRef | null
}

interface Props {
  climb: ClimbInfo | null
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 7000

export function LeaderboardClimbToast({ climb, onDismiss }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!climb) return
    timerRef.current = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [climb, onDismiss])

  if (!climb) return null

  const moved = climb.previousRank - climb.currentRank
  const copy = generateShareCopy("leaderboard-climb", {
    username: climb.username ?? "You",
    previousRank: climb.previousRank,
    currentRank: climb.currentRank,
    accuracyPct: climb.accuracyPct,
    topCategory: climb.topCategory ?? undefined,
  })

  const tweetUrl    = `https://x.com/intent/tweet?text=${encodeURIComponent(copy.x)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(copy.whatsapp)}`

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
        "w-[calc(100vw-2rem)] max-w-sm",
        "bg-card border border-primary/30 rounded-2xl shadow-2xl",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none">🚀</span>
            <div>
              <p className="text-sm font-bold leading-tight">
                You climbed {moved} spot{moved !== 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                #{climb.previousRank} → #{climb.currentRank} on the leaderboard
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share row */}
        <div className="flex gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <XIcon className="w-3.5 h-3.5" />
            Share
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <button
            onClick={onDismiss}
            className="flex-1 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { CheckCircle2, Share2, Link2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PredictionRecord } from "@/stores/gamification"

interface Props {
  prediction: PredictionRecord
  username: string
  accuracyPct?: number | null
  onClose: () => void
}

export function CalledItModal({ prediction, username, accuracyPct, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const profileUrl = `https://predictiontrade.online/profile/${username}`

  const isContrarian =
    (prediction.prediction === "YES" && prediction.probAtTime < 20) ||
    (prediction.prediction === "NO" && 100 - prediction.probAtTime < 20)

  const shareText = [
    `🎯 Called it on @PredictionTrade!`,
    `"${prediction.marketTitle.slice(0, 80)}${prediction.marketTitle.length > 80 ? "…" : ""}"`,
    `I said ${prediction.prediction} — and I was right${isContrarian ? " (contrarian call 🎲)" : ""}!`,
    accuracyPct !== null && accuracyPct !== undefined ? `My accuracy: ${accuracyPct}%` : "",
    profileUrl,
  ]
    .filter(Boolean)
    .join("\n")

  const tweetUrl =
    "https://x.com/intent/tweet?text=" + encodeURIComponent(shareText)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + headline */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">You called it!</h2>
          {isContrarian && (
            <p className="text-xs text-orange-400 font-semibold mt-1">Contrarian call 🎲 — less than 20% agreed with you</p>
          )}
        </div>

        {/* Market card */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 mb-5">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Market</p>
          <p className="text-sm font-semibold leading-snug line-clamp-3 mb-3">
            {prediction.marketTitle}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-0.5">Your prediction</p>
              <span className={cn(
                "inline-flex text-xs font-bold px-2 py-0.5 rounded",
                prediction.prediction === "YES"
                  ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive"
              )}>
                {prediction.prediction}
              </span>
            </div>
            <div className="text-muted-foreground/40 text-lg">→</div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-0.5">Resolved</p>
              <span className={cn(
                "inline-flex text-xs font-bold px-2 py-0.5 rounded",
                prediction.outcome === "YES"
                  ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive"
              )}>
                {prediction.outcome} ✓
              </span>
            </div>
            {accuracyPct !== null && accuracyPct !== undefined && (
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-0.5">Accuracy</p>
                <span className="text-sm font-bold text-primary">{accuracyPct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex flex-col gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share on X
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-primary" /><span className="text-primary">Copied!</span></>
            ) : (
              <><Link2 className="w-4 h-4" />Copy profile link</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Your prediction record lives at predictiontrade.online/profile/{username}
        </p>
      </div>
    </div>
  )
}

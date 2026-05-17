"use client"

import { useState } from "react"
import { CheckCircle2, Check, X, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  generateShareCopy,
  categoryRefById,
  type CategoryRef,
} from "@/lib/share-copy"
import { useLanguage } from "@/contexts/language-context"
import type { PredictionRecord } from "@/stores/gamification"

// X bird icon (inline SVG — no external dep)
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

interface Props {
  prediction: PredictionRecord
  username: string
  accuracyPct?: number | null
  /** Optional: user's specialty category. Lets share copy say "67% in Crypto 🪙". */
  topCategory?: CategoryRef | null
  /** Number of OTHER correct calls in the same resolution batch (excludes the one shown). */
  extraCount?: number
  onClose: () => void
}

export function CalledItModal({ prediction, username, accuracyPct, topCategory, extraCount, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const { language } = useLanguage()
  const isEs = language === "es"

  const profileUrl = `https://predictiontrade.online/profile/${username}`

  const isContrarian =
    (prediction.prediction === "YES" && prediction.probAtTime < 20) ||
    (prediction.prediction === "NO" && 100 - prediction.probAtTime < 20)

  const marketCategory = categoryRefById(prediction.category)

  const copy = generateShareCopy("called-it", {
    username,
    marketTitle: prediction.marketTitle,
    prediction: prediction.prediction,
    isContrarian,
    accuracyPct,
    marketCategory: marketCategory ?? undefined,
    topCategory: topCategory ?? undefined,
  })

  const tweetUrl     = `https://x.com/intent/tweet?text=${encodeURIComponent(copy.x)}`
  const whatsappUrl  = `https://wa.me/?text=${encodeURIComponent(copy.whatsapp)}`

  // OG preview — mirrors what gets rendered when someone visits the share URL.
  // Built with the same identity params that drive share-copy, so the visual
  // preview the user sees matches the artifact the platform will publish.
  const ogParams = new URLSearchParams({
    username,
    m: prediction.marketTitle,
    p: prediction.prediction,
  })
  if (prediction.category) ogParams.set("c", prediction.category)
  if (isContrarian) ogParams.set("cont", "1")
  if (typeof accuracyPct === "number") ogParams.set("a", String(accuracyPct))
  const ogPreviewUrl = `/api/og/called-it?${ogParams.toString()}`

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(copy.text + "\n" + profileUrl)
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
          <div className="relative mb-3">
            {/* Arrival ring — 1-shot ping ~700ms, then settles invisible (forwards) */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              style={{ animation: "ping 700ms cubic-bezier(0, 0, 0.2, 1) 1 forwards" }}
            />
            <div className="relative w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold">
            {isEs ? "¡Lo predijiste!" : "You called it!"}
          </h2>
          {isContrarian && (
            <p className="text-xs text-orange-400 font-semibold mt-1">
              {isEs
                ? "Predicción contrarian 🎲 — menos del 20% estuvo de acuerdo"
                : "Contrarian call 🎲 — less than 20% agreed with you"}
            </p>
          )}
          {extraCount !== undefined && extraCount > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
              {isEs
                ? `+${extraCount} ${extraCount === 1 ? "predicción más acertada" : "predicciones más acertadas"} hoy`
                : `+${extraCount} more correct call${extraCount === 1 ? "" : "s"} today`}
            </p>
          )}
        </div>

        {/* Market card */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 mb-5">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
            {isEs ? "Mercado" : "Market"}
          </p>
          <p className="text-sm font-semibold leading-snug line-clamp-3 mb-3">
            {prediction.marketTitle}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-0.5">
                {isEs ? "Tu predicción" : "Your prediction"}
              </p>
              <span
                className={cn(
                  "inline-flex text-xs font-bold px-2 py-0.5 rounded",
                  prediction.prediction === "YES"
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {prediction.prediction}
              </span>
            </div>
            <div className="text-muted-foreground/40 text-lg">→</div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-0.5">
                {isEs ? "Resuelto" : "Resolved"}
              </p>
              <span
                className={cn(
                  "inline-flex text-xs font-bold px-2 py-0.5 rounded",
                  prediction.outcome === "YES"
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {prediction.outcome} ✓
              </span>
            </div>
            {accuracyPct !== null && accuracyPct !== undefined && (
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  {isEs ? "Precisión" : "Accuracy"}
                </p>
                <span className="text-sm font-bold text-primary">{accuracyPct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* OG share preview — user sees the card before committing to share */}
        <div className="mb-4 space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            {isEs ? "Vista previa al compartir" : "Share preview"}
          </p>
          <div className="aspect-[1200/630] overflow-hidden rounded-xl border border-border bg-muted/30">
            <img
              src={ogPreviewUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        {/* Share buttons — X primary, then WhatsApp + Copy */}
        <div className="flex flex-col gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <XIcon className="w-4 h-4" />
            {isEs ? "Compartir en X" : "Share on X"}
          </a>

          <div className="flex gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/20 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-primary" /><span className="text-primary">{isEs ? "¡Copiado!" : "Copied!"}</span></>
              ) : (
                <><Copy className="w-4 h-4" />{isEs ? "Copiar texto" : "Copy text"}</>
              )}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          {isEs ? "Tu historial vive en" : "Your record lives at"} predictiontrade.online/profile/{username}
        </p>
      </div>
    </div>
  )
}

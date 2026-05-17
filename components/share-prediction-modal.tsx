"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { PredictionCard } from "@/components/prediction-card"
import { detectPTCategory } from "@/lib/categories"
import { Share2, ExternalLink, Link2, Download, Check, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface SharePredictionModalProps {
  open: boolean
  onClose: () => void
  marketTitle: string
  yesPercent: number
  marketCategory?: string
  prediction?: "YES" | "NO"
}

export function SharePredictionModal({
  open,
  onClose,
  marketTitle,
  yesPercent,
  marketCategory,
  prediction,
}: SharePredictionModalProps) {
  const [copied, setCopied] = useState(false)
  const { language } = useLanguage()
  const isEs = language === "es"

  const category = detectPTCategory(marketTitle, marketCategory)

  const shareText = prediction
    ? `I'm predicting ${prediction} on: "${marketTitle}" — ${yesPercent}% community says YES. Make your call → predictiontrade.online`
    : `"${marketTitle}" — ${yesPercent}% say YES. What's your prediction? → predictiontrade.online`

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  const ogParams = new URLSearchParams({
    title: marketTitle,
    yes: String(yesPercent),
    category: category.label,
    emoji: category.emoji,
    color: category.color,
    ...(prediction ? { prediction } : {}),
  })
  const imageUrl = `/api/og/market?${ogParams.toString()}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("https://predictiontrade.online/markets")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md gap-0 overflow-hidden border-border bg-card p-0">
        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <DialogTitle className="text-[15px] font-bold">
                {isEs ? "Compartir esta predicción" : "Share this prediction"}
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={isEs ? "Cerrar" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Card preview */}
          <PredictionCard
            title={marketTitle}
            yesPercent={yesPercent}
            category={category}
            prediction={prediction}
            compact
            className="mb-5"
          />

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Share to X */}
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-3.5 transition-all hover:bg-muted"
            >
              <ExternalLink className="h-5 w-5 text-sky-400 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-semibold text-muted-foreground">
                {isEs ? "Publicar en X" : "Post on X"}
              </span>
            </a>

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="group flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-3.5 transition-all hover:bg-muted"
            >
              {copied ? (
                <Check className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              ) : (
                <Link2 className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
              )}
              <span className="text-[11px] font-semibold text-muted-foreground">
                {copied
                  ? (isEs ? "¡Copiado!" : "Copied!")
                  : (isEs ? "Copiar enlace" : "Copy Link")}
              </span>
            </button>

            {/* Download card */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-3.5 transition-all hover:bg-muted"
            >
              <Download className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-semibold text-muted-foreground">
                {isEs ? "Descargar" : "Download"}
              </span>
            </a>
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground/50">
            {isEs
              ? "Plataforma virtual gratuita · Fondos no reales"
              : "Free virtual platform · No real funds"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

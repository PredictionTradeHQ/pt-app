"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Share2, ExternalLink, Link2, Download, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { RARITY_COLORS } from "@/lib/badges"
import { useLanguage } from "@/contexts/language-context"

export type AchievementType = "streak" | "badge"

interface StreakAchievement {
  type: "streak"
  streak: number
  bestStreak: number
  totalPredictions: number
  username: string
}

interface BadgeAchievement {
  type: "badge"
  badgeId: string
  badgeName: string
  badgeEmoji: string
  badgeRarity: "common" | "uncommon" | "rare" | "legendary"
  username: string
}

type Achievement = StreakAchievement | BadgeAchievement

interface ShareAchievementModalProps {
  open: boolean
  onClose: () => void
  achievement: Achievement | null
  profileUrl?: string  // e.g. "https://predictiontrade.online/profile/alex-m"
}

export function ShareAchievementModal({ open, onClose, achievement, profileUrl }: ShareAchievementModalProps) {
  const [copied, setCopied] = useState(false)
  const { language } = useLanguage()
  const isEs = language === "es"

  if (!achievement) return null

  const isStreak = achievement.type === "streak"
  const color = isStreak
    ? "#F59E0B"
    : RARITY_COLORS[(achievement as BadgeAchievement).badgeRarity]

  const tweetText = isStreak
    ? `🔥 ${(achievement as StreakAchievement).streak}-day prediction streak on @PredictionTrade — can you beat it? predictiontrade.online`
    : `Just unlocked ${(achievement as BadgeAchievement).badgeEmoji} "${(achievement as BadgeAchievement).badgeName}" on @PredictionTrade! predictiontrade.online`

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  const ogUrl = isStreak
    ? `/api/og/streak?username=${encodeURIComponent(achievement.username)}&streak=${(achievement as StreakAchievement).streak}&best=${(achievement as StreakAchievement).bestStreak}&total=${(achievement as StreakAchievement).totalPredictions}`
    : `/api/og/badge?id=${(achievement as BadgeAchievement).badgeId}&username=${encodeURIComponent(achievement.username)}`

  const handleCopy = async () => {
    const url = profileUrl ?? "https://predictiontrade.online/leaderboard"
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden border-border bg-card p-0">
        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <DialogTitle className="text-[15px] font-bold">
                {isEs ? "Compartir logro" : "Share achievement"}
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Achievement preview card */}
          <div
            className="rounded-2xl mb-5 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}15, ${color}06)`,
              border: `1.5px solid ${color}35`,
            }}
          >
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              {isStreak ? (
                <>
                  <span className="text-6xl mb-3">🔥</span>
                  <p
                    className="text-5xl font-black leading-none mb-1"
                    style={{ color }}
                  >
                    {(achievement as StreakAchievement).streak}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {isEs ? "días de racha" : "day streak"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isEs ? "Mejor" : "Best"}: {(achievement as StreakAchievement).bestStreak}d ·{" "}
                    {(achievement as StreakAchievement).totalPredictions} {isEs ? "predicciones" : "predictions"}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-6xl mb-3">{(achievement as BadgeAchievement).badgeEmoji}</span>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color }}
                  >
                    {isEs ? "Insignia ganada" : "Badge Earned"}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {(achievement as BadgeAchievement).badgeName}
                  </p>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2"
                    style={{ background: color + "20", color, border: `1px solid ${color}40` }}
                  >
                    {(achievement as BadgeAchievement).badgeRarity.charAt(0).toUpperCase() +
                      (achievement as BadgeAchievement).badgeRarity.slice(1)}
                  </span>
                </>
              )}
            </div>

            {/* PT branding strip */}
            <div
              className="flex items-center justify-between px-4 py-2 text-[10px] font-semibold"
              style={{ background: color + "12", borderTop: `1px solid ${color}20` }}
            >
              <span style={{ color: color + "cc" }}>🎯 Prediction Trade</span>
              <span className="text-muted-foreground">predictiontrade.online</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-3.5 hover:bg-muted transition-all"
            >
              <ExternalLink className="h-5 w-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-muted-foreground">
                {isEs ? "Publicar en X" : "Post on X"}
              </span>
            </a>

            <button
              onClick={handleCopy}
              className="group flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-3.5 hover:bg-muted transition-all"
            >
              {copied ? (
                <Check className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              ) : (
                <Link2 className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[11px] font-semibold text-muted-foreground">
                {copied
                  ? (isEs ? "¡Copiado!" : "Copied!")
                  : (isEs ? "Copiar enlace" : "Copy Link")}
              </span>
            </button>

            <a
              href={ogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-3.5 hover:bg-muted transition-all"
            >
              <Download className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-muted-foreground">
                {isEs ? "Descargar" : "Download"}
              </span>
            </a>
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground/40">
            {isEs
              ? "Plataforma virtual gratuita · Fondos no reales"
              : "Free virtual platform · No real funds"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

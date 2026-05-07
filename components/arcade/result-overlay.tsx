"use client";

import { useEffect, useState } from "react";
import { ArcadeResult, RANKS, getRank } from "@/stores/arcade-game";
import { Share2, ArrowUp, ArrowDown } from "lucide-react";

interface ResultOverlayProps {
  result: ArcadeResult;
  streak: number;
  countdown: number;
  resultDuration: number;
  isEs: boolean;
  rankPoints: number;
}

export function ResultOverlay({ result, streak, countdown, resultDuration, isEs, rankPoints }: ResultOverlayProps) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); return () => setShow(false); }, []);

  const { won, profitPct, xpGained, rpChange, multiplier, tip,
          beatPercent, vsOpponent, rankedUp, prevRank } = result;

  const progress = Math.max(0, 1 - countdown / resultDuration);
  const rank = getRank(rankPoints);
  const prevRankData = RANKS.find(r => r.id === prevRank);

  const handleShare = () => {
    const text = won
      ? `⚡ ${profitPct.toFixed(1)}% profit in 7 seconds on @PredictionTrade! I beat ${beatPercent}% of players. Try to beat me → predictiontrade.online/play`
      : `💀 Lost ${Math.abs(profitPct).toFixed(1)}% but going again! Prediction Flash is insane → predictiontrade.online/play`;
    navigator.share?.({ text }) ?? navigator.clipboard?.writeText(text);
  };

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: won
          ? "radial-gradient(ellipse at 50% 40%, rgba(0,255,136,0.2) 0%, rgba(0,0,0,0.98) 65%)"
          : "radial-gradient(ellipse at 50% 40%, rgba(255,51,102,0.2) 0%, rgba(0,0,0,0.98) 65%)",
        animation: show ? "fadeIn 0.12s ease-out" : undefined,
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-4">

        {/* Main result */}
        <div className="text-center" style={{ animation: "popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <div
            className="text-[80px] md:text-[96px] font-black leading-none tabular-nums"
            style={{
              color: won ? "#00ff88" : "#ff3366",
              textShadow: won
                ? "0 0 50px rgba(0,255,136,0.9), 0 0 100px rgba(0,255,136,0.4)"
                : "0 0 50px rgba(255,51,102,0.9), 0 0 100px rgba(255,51,102,0.4)",
            }}
          >
            {won ? "+" : ""}{profitPct.toFixed(1)}%
          </div>
          <div className="text-4xl mt-1">{won ? "🚀" : "💀"}</div>
        </div>

        {/* Streak badge */}
        {streak > 1 && (
          <div
            className="flex items-center gap-2 px-5 py-2 rounded-full font-black text-lg"
            style={{
              background: "rgba(255,184,0,0.12)",
              border: "2px solid rgba(255,184,0,0.5)",
              color: "#ffb800",
              textShadow: "0 0 16px rgba(255,184,0,0.7)",
              animation: "bounceIn 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.08s both",
            }}
          >
            🔥 {streak}× STREAK
            {multiplier > 1 && <span className="text-sm opacity-70">{multiplier}×XP</span>}
          </div>
        )}

        {/* VS Opponent result */}
        {vsOpponent && (
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              animation: "slideUp 0.25s ease-out 0.1s both",
            }}
          >
            <div className="flex">
              {/* You */}
              <div className="flex-1 flex flex-col items-center py-3 px-2">
                <div className="text-xs text-white/30 mb-1">{isEs ? "TÚ" : "YOU"}</div>
                <div className={`text-lg font-black ${won ? "text-emerald-400" : "text-red-400"}`}>
                  {won ? "+" : ""}{profitPct.toFixed(1)}%
                </div>
                <div className="text-xs mt-0.5" style={{ color: won ? "#00ff88" : "#ff3366" }}>
                  {won ? (isEs ? "✓ GANASTE" : "✓ WIN") : (isEs ? "✗ PERDISTE" : "✗ LOSE")}
                </div>
              </div>

              {/* VS divider */}
              <div className="flex items-center px-3">
                <div className="text-sm font-black text-white/30">VS</div>
              </div>

              {/* Opponent */}
              <div className="flex-1 flex flex-col items-center py-3 px-2">
                <div className="text-xs text-white/30 mb-0.5">{vsOpponent.emoji} {vsOpponent.name}</div>
                <div className={`text-lg font-black ${vsOpponent.won ? "text-emerald-400" : "text-red-400"}`}>
                  {vsOpponent.profitPct !== null
                    ? `${vsOpponent.profitPct >= 0 ? "+" : ""}${vsOpponent.profitPct.toFixed(1)}%`
                    : "—"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: vsOpponent.won ? "#00ff88" : "#ff3366" }}>
                  {vsOpponent.won ? (isEs ? "✓ GANÓ" : "✓ WIN") : (isEs ? "✗ PERDIÓ" : "✗ LOSE")}
                </div>
              </div>
            </div>

            {/* 1v1 verdict */}
            <div
              className="text-center py-2 text-sm font-black"
              style={{
                background: won && !vsOpponent.won
                  ? "rgba(0,255,136,0.1)"
                  : !won && vsOpponent.won
                    ? "rgba(255,51,102,0.1)"
                    : "rgba(255,255,255,0.04)",
                color: won && !vsOpponent.won ? "#00ff88" : !won && vsOpponent.won ? "#ff3366" : "#888",
              }}
            >
              {won && !vsOpponent.won && (isEs ? "⚔️ ¡Venciste el duelo!" : "⚔️ You won the duel!")}
              {!won && vsOpponent.won && (isEs ? "⚔️ Oponente ganó este" : "⚔️ Opponent won this one")}
              {won === vsOpponent.won && (isEs ? "⚔️ Empate — ¡revanche!" : "⚔️ Draw — rematch!")}
            </div>
          </div>
        )}

        {/* RP change */}
        {rpChange !== 0 && (
          <div
            className="flex items-center gap-2 text-sm font-bold"
            style={{
              color: rpChange > 0 ? "#ffd700" : "#888",
              animation: "slideUp 0.3s ease-out 0.15s both",
            }}
          >
            {rpChange > 0 ? `+${rpChange} RP` : `${rpChange} RP`}
            {rankedUp && prevRankData && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-black"
                style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700" }}
              >
                🏆 RANK UP!
              </span>
            )}
          </div>
        )}

        {/* XP + Beat% row */}
        <div
          className="flex gap-4 text-xs"
          style={{ animation: "slideUp 0.3s ease-out 0.18s both" }}
        >
          <span style={{ color: "rgba(0,200,255,0.7)" }}>+{xpGained} XP</span>
          {won && (
            <span style={{ color: "rgba(0,255,136,0.6)" }}>
              {isEs ? `Superaste al ${beatPercent}%` : `Beat ${beatPercent}% of players`}
            </span>
          )}
        </div>

        {/* Academy tip */}
        <div
          className="w-full rounded-xl px-4 py-3 text-xs"
          style={{
            background: "rgba(0,200,255,0.06)",
            border: "1px solid rgba(0,200,255,0.12)",
            color: "rgba(0,200,255,0.7)",
            animation: "slideUp 0.3s ease-out 0.22s both",
          }}
        >
          {tip}
        </div>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
            animation: "slideUp 0.3s ease-out 0.26s both",
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          {isEs ? "Compartir resultado" : "Share result"}
        </button>
      </div>

      {/* Auto-replay bar */}
      <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full transition-none"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${won ? "#00ff88" : "#ff3366"}, ${won ? "#00ccff" : "#ff6600"})`,
            boxShadow: `0 0 8px ${won ? "#00ff88" : "#ff3366"}`,
          }}
        />
      </div>
    </div>
  );
}

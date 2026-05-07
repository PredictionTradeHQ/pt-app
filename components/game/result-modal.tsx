"use client";

import { GameResult } from "@/stores/game";
import { Button } from "@/components/ui/button";
import { RotateCcw, Share2, LogIn, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface ResultModalProps {
  result: GameResult;
  streak: number;
  savedToDb: boolean | null;
  isLoggedIn: boolean;
  onPlayAgain: () => void;
}

export function ResultModal({ result, streak, savedToDb, isLoggedIn, onPlayAgain }: ResultModalProps) {
  const { language } = useLanguage();
  const isEs = language === "es";
  const { won, profitPct, entryPrice, exitPrice, position } = result;

  const handleShare = () => {
    const text = won
      ? `🏆 I just made ${profitPct.toFixed(1)}% on PredictionTrade! Can you beat me? predictiontrade.online/play`
      : `📉 Lost ${Math.abs(profitPct).toFixed(1)}% this round on PredictionTrade. Rematch! predictiontrade.online/play`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">

        <div className={`h-1.5 w-full ${won ? "bg-emerald-500" : "bg-red-500"}`} />

        <div className="p-6 text-center space-y-4">

          {/* Icon + result */}
          <div>
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl
              ${won ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
              {won ? "🏆" : "📉"}
            </div>
            <h2 className="text-2xl font-black">
              {won
                ? (isEs ? "¡Ganaste!" : "You Won!")
                : (isEs ? "¡Inténtalo de nuevo!" : "Try Again!")}
            </h2>
            <p className={`text-4xl font-black mt-1 ${won ? "text-emerald-400" : "text-red-400"}`}>
              {won ? "+" : ""}{profitPct.toFixed(2)}%
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: isEs ? "Entrada" : "Entry", val: entryPrice.toFixed(2) },
              { label: isEs ? "Salida"  : "Exit",  val: exitPrice.toFixed(2) },
              { label: isEs ? "Posición" : "Position", val: position === "buy" ? "📈 BUY" : "📉 SELL" },
            ].map((s) => (
              <div key={s.label} className="bg-background/60 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-sm font-bold">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Streak */}
          {streak > 1 && (
            <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2">
              <span className="text-xl">🔥</span>
              <span className="text-amber-400 font-bold text-sm">
                {streak}x {isEs ? "racha ganadora" : "win streak"}!
              </span>
            </div>
          )}

          {/* Save status */}
          {isLoggedIn ? (
            <div className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
              ${savedToDb === null
                ? "bg-muted/30 text-muted-foreground"
                : savedToDb
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {savedToDb === null && <span className="w-3 h-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />}
              {savedToDb === true && <CheckCircle2 className="w-4 h-4" />}
              {savedToDb === false && <XCircle className="w-4 h-4" />}
              <span>
                {savedToDb === null
                  ? (isEs ? "Guardando resultado..." : "Saving result...")
                  : savedToDb
                    ? (isEs ? "Resultado guardado en tu perfil" : "Result saved to your profile")
                    : (isEs ? "No se pudo guardar" : "Could not save result")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-left">
              <LogIn className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground flex-1">
                {isEs
                  ? "Inicia sesión para guardar tus resultados y subir en el ranking."
                  : "Sign in to save your results and climb the leaderboard."}
              </p>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/auth/login">{isEs ? "Entrar" : "Sign in"}</Link>
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button onClick={onPlayAgain} className="flex-1 gap-2 font-bold" size="lg">
              <RotateCcw className="w-4 h-4" />
              {isEs ? "Jugar de nuevo" : "Play Again"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare} className="px-4">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

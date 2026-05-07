"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { TrendingUp, TrendingDown, Zap, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PriceChart } from "./price-chart";
import { Timer } from "./timer";
import { ResultModal } from "./result-modal";
import { Leaderboard } from "./leaderboard";
import { useGameStore, GameMode } from "@/stores/game";
import { useLanguage } from "@/contexts/language-context";
import { createClient } from "@/lib/supabase/client";

const MODES: { value: GameMode; label: string }[] = [
  { value: "30s",  label: "30s" },
  { value: "60s",  label: "1 min" },
  { value: "3min", label: "3 min" },
];

const MODE_DURATION: Record<GameMode, number> = { "30s": 30, "60s": 60, "3min": 180 };

export function GameScreen() {
  const { language } = useLanguage();
  const isEs = language === "es";

  const [authUser, setAuthUser] = useState<{ id: string; email?: string; display_name?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const {
    phase, mode, price, priceHistory, entryPrice, position,
    timeLeft, result, streak, totalGames, wins, achievements,
    setMode, startGame, placePosition, tickPrice, tickTimer,
    endGame, resetGame, loadUserStats, setSavedToDb, savedToDb,
  } = useGameStore();

  const priceRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load auth user
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUser({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0],
        });
      }
      setAuthLoading(false);
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split("@")[0],
        });
      } else {
        setAuthUser(null);
        setStatsLoaded(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user's persistent stats from Supabase
  useEffect(() => {
    if (!authUser || statsLoaded) return;
    const supabase = createClient();
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from("game_leaderboard")
          .select("games_played, wins_count, total_profit, best_streak")
          .eq("user_id", authUser.id)
          .single();
        if (data) {
          loadUserStats({
            totalGames: data.games_played ?? 0,
            wins: data.wins_count ?? 0,
            totalProfit: data.total_profit ?? 0,
            bestStreak: data.best_streak ?? 0,
          });
        }
      } catch { /* first time user, no stats yet */ }
      setStatsLoaded(true);
    };
    fetchStats();
  }, [authUser, statsLoaded, loadUserStats]);

  // Save result to Supabase when game ends
  useEffect(() => {
    if (phase !== "result" || !result || !authUser) return;
    const save = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("game_results").insert([{
          user_id: authUser.id,
          profit: result.profit,
          profit_pct: result.profitPct,
          position: result.position,
          entry_price: result.entryPrice,
          exit_price: result.exitPrice,
          duration: result.duration,
          won: result.won,
        }]);
        setSavedToDb(!error);
      } catch {
        setSavedToDb(false);
      }
    };
    save();
  }, [phase, result, authUser, setSavedToDb]);

  // Price tick every 500ms
  useEffect(() => {
    if (phase === "playing" || phase === "waiting") {
      priceRef.current = setInterval(tickPrice, 500);
    }
    return () => { if (priceRef.current) clearInterval(priceRef.current); };
  }, [phase, tickPrice]);

  // Timer tick every second
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(tickTimer, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, tickTimer]);

  const handlePlayAgain = useCallback(() => resetGame(), [resetGame]);

  const priceChange = entryPrice ? price - entryPrice : 0;
  const priceChangePct = entryPrice ? (priceChange / entryPrice) * 100 : 0;
  const isWinning = entryPrice
    ? (position === "buy" ? price > entryPrice : price < entryPrice)
    : null;

  const unlockedBadges = achievements.filter((a) => a.unlocked);
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">
              {isEs ? "⚡ Juego de Predicción" : "⚡ Prediction Game"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEs
                ? "¿Subirá o bajará el precio? Predice y gana."
                : "Will the price go up or down? Predict and win."}
            </p>
          </div>

          {/* User chip */}
          {!authLoading && (
            authUser ? (
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shrink-0">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  {authUser.display_name?.charAt(0) ?? "U"}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold leading-none">{authUser.display_name}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">✓ {isEs ? "Resultados guardados" : "Results saved"}</p>
                </div>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4" />
                  {isEs ? "Iniciar sesión" : "Sign in to save"}
                </Link>
              </Button>
            )
          )}
        </div>

        {/* ── User stats banner (logged in) ── */}
        {authUser && totalGames > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: isEs ? "Partidas" : "Games", val: totalGames },
              { label: isEs ? "Victorias" : "Wins", val: wins, color: "text-emerald-400" },
              { label: isEs ? "Aciertos" : "Win Rate", val: `${winRate}%`, color: winRate >= 50 ? "text-emerald-400" : "text-red-400" },
              { label: isEs ? "Racha" : "Streak", val: `🔥 ${streak}x` },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className={`text-lg font-black ${s.color ?? ""}`}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Achievements unlocked ── */}
        {unlockedBadges.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {unlockedBadges.map((a) => (
              <div
                key={a.id}
                title={a.label}
                className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold"
              >
                {a.emoji} {a.label}
              </div>
            ))}
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Game Panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Mode selector */}
            {phase === "idle" && (
              <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4">
                {/* Not logged in nudge */}
                {!authUser && !authLoading && (
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-left">
                    <User className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {isEs ? "Juega como invitado o inicia sesión" : "Playing as guest"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isEs
                          ? "Inicia sesión para guardar tus resultados y aparecer en el ranking."
                          : "Sign in to save results and appear on the leaderboard."}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/auth/login">{isEs ? "Entrar" : "Sign in"}</Link>
                    </Button>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">
                    {isEs ? "Selecciona la duración" : "Select duration"}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {MODES.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                          mode === m.value
                            ? "bg-primary text-primary-foreground border-primary scale-105"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button size="lg" onClick={startGame} className="w-full font-bold text-base gap-2">
                  <Zap className="w-5 h-5" />
                  {isEs ? "¡Comenzar!" : "Start Game!"}
                </Button>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: "👀", text: isEs ? "Observa el precio" : "Watch the price" },
                    { icon: "📈", text: isEs ? "Predice la dirección" : "Predict direction" },
                    { icon: "💰", text: isEs ? "¡Sube en el ranking!" : "Climb the leaderboard!" },
                  ].map((s) => (
                    <div key={s.text} className="bg-background/40 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <p className="text-xs text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart */}
            {(phase === "playing" || phase === "waiting" || phase === "result") && (
              <div className="bg-card border border-border rounded-2xl p-4 space-y-4">

                {entryPrice && phase === "playing" && (
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold
                    ${isWinning
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    <span>{isWinning ? (isEs ? "✅ Ganando" : "✅ Winning") : (isEs ? "❌ Perdiendo" : "❌ Losing")}</span>
                    <span>{priceChangePct >= 0 ? "+" : ""}{priceChangePct.toFixed(2)}%</span>
                  </div>
                )}

                <div className="h-56 md:h-64">
                  <PriceChart
                    data={priceHistory}
                    entryPrice={entryPrice}
                    position={position}
                    currentPrice={price}
                  />
                </div>

                <div className="flex items-center gap-4">
                  {phase === "playing" && (
                    <div className="w-24 shrink-0">
                      <Timer timeLeft={timeLeft} total={MODE_DURATION[mode]} />
                    </div>
                  )}

                  <div className="flex-1">
                    {phase === "waiting" && (
                      <div className="space-y-3">
                        <p className="text-sm text-center text-muted-foreground font-medium">
                          {isEs ? "¿Hacia dónde irá el precio?" : "Where will the price go?"}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => placePosition("buy")}
                            className="flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base
                              bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400
                              hover:bg-emerald-500/25 hover:border-emerald-500 hover:scale-105 transition-all"
                          >
                            <TrendingUp className="w-5 h-5" />
                            {isEs ? "SUBIR" : "BUY UP"}
                          </button>
                          <button
                            onClick={() => placePosition("sell")}
                            className="flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base
                              bg-red-500/15 border-2 border-red-500/30 text-red-400
                              hover:bg-red-500/25 hover:border-red-500 hover:scale-105 transition-all"
                          >
                            <TrendingDown className="w-5 h-5" />
                            {isEs ? "BAJAR" : "SELL DOWN"}
                          </button>
                        </div>
                      </div>
                    )}

                    {phase === "playing" && position && (
                      <div className={`text-center py-4 rounded-xl border-2 font-black text-lg
                        ${position === "buy"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {position === "buy"
                          ? (isEs ? "📈 Apostaste SUBIR" : "📈 You bet UP")
                          : (isEs ? "📉 Apostaste BAJAR" : "📉 You bet DOWN")}
                        <div className="text-sm font-normal text-muted-foreground mt-1">
                          {isEs ? `Entrada: ${entryPrice?.toFixed(2)}` : `Entry: ${entryPrice?.toFixed(2)}`}
                        </div>
                      </div>
                    )}

                    {phase === "result" && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        {isEs ? "Ronda finalizada" : "Round complete"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Achievements */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {isEs ? "Logros" : "Achievements"}
              </h3>
              <div className="space-y-2">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all
                      ${a.unlocked
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-background/30 border border-border text-muted-foreground/40"}`}
                  >
                    <span className="text-base">{a.emoji}</span>
                    <span className="font-semibold">{a.label}</span>
                    {a.unlocked && <span className="ml-auto">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard currentUserId={authUser?.id} />
          </div>
        </div>
      </div>

      {/* Result modal */}
      {phase === "result" && result && (
        <ResultModal
          result={result}
          streak={streak}
          savedToDb={savedToDb}
          isLoggedIn={!!authUser}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

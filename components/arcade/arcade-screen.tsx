"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Zap, LogIn, Swords, Trophy, Shield } from "lucide-react";
import {
  useArcadeStore, getRank, getMultiplier,
  DECIDE_SECS, RESOLVE_SECS, RESULT_SECS, SEARCH_SECS,
  type GameMode,
} from "@/stores/arcade-game";
import { Sparkline } from "./sparkline";
import { ResultOverlay } from "./result-overlay";
import { RankedBadge } from "./ranked-badge";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/language-context";

const MODE_CFG: Record<GameMode, { icon: any; labelEn: string; labelEs: string; descEn: string; descEs: string; color: string }> = {
  solo:   { icon: Zap,    labelEn: "Solo",   labelEs: "Solo",   descEn: "Practice & grind XP",          descEs: "Practica y sube de nivel",     color: "#00ff88" },
  ranked: { icon: Shield, labelEn: "Ranked", labelEs: "Ranked", descEn: "Compete for rank points",       descEs: "Compite por puntos de rango",   color: "#00ccff" },
  vs:     { icon: Swords, labelEn: "1 vs 1", labelEs: "1 vs 1", descEn: "Challenge another player",      descEs: "Desafía a otro jugador",        color: "#ff00ff" },
};

export function ArcadeScreen() {
  const { language } = useLanguage();
  const isEs = language === "es";
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const [authUser, setAuthUser] = useState<{ id: string; display_name?: string } | null>(null);
  const [prevPx, setPrevPx] = useState(50);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  const {
    phase, gameMode, price, priceHistory, move, entryPrice, countdown,
    streak, sessionGames, result, xp, level, levelProgress,
    rankPoints, allTimeGames, allTimeWins, dailyChallenge, vsOpponent,
    selectMode, startRound, placeMove, tick, resetToReady,
  } = useArcadeStore();

  // Auth
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthUser({ id: user.id, display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] });
    });
  }, []);

  // Save result to Supabase
  useEffect(() => {
    if (phase !== "result" || !result || !authUser) return;
    createClient().from("game_results").insert([{
      user_id: authUser.id,
      profit: result.profitPct / 100,
      profit_pct: result.profitPct,
      position: result.move === "up" ? "buy" : "sell",
      entry_price: result.entryPrice,
      exit_price: result.exitPrice,
      duration: "30s",
      won: result.won,
    }]);
  }, [phase, result, authUser]);

  // Price flash
  useEffect(() => {
    if (price !== prevPx) {
      setFlash(price > prevPx ? "up" : "down");
      setPrevPx(price);
      const t = setTimeout(() => setFlash(null), 180);
      return () => clearTimeout(t);
    }
  }, [price, prevPx]);

  // Tick
  useEffect(() => {
    if (phase === "ready") return;
    tickRef.current = setInterval(tick, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase, tick]);

  const doStart = useCallback(() => startRound(), [startRound]);
  const doUp   = useCallback(() => placeMove("up"),   [placeMove]);
  const doDown = useCallback(() => placeMove("down"),  [placeMove]);

  const rank = getRank(rankPoints);
  const multiplier = getMultiplier(streak);
  const pnl = entryPrice && move
    ? (move === "up" ? (price - entryPrice) / entryPrice : (entryPrice - price) / entryPrice) * 100
    : null;
  const isWinning = pnl !== null ? pnl > 0 : null;
  const winRate = allTimeGames > 0 ? Math.round((allTimeWins / allTimeGames) * 100) : 0;

  const phaseDuration = phase === "deciding" ? DECIDE_SECS
    : phase === "resolving" ? RESOLVE_SECS
    : phase === "searching" ? SEARCH_SECS : RESULT_SECS;
  const countdownPct = countdown / phaseDuration;

  return (
    <>
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn     { from{transform:scale(0.55);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes bounceIn  { from{transform:scale(0.4);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes glowPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.97)} }
        @keyframes searchBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes priceFlashUp   { 0%{color:#00ff88;transform:scale(1.06)} 100%{color:inherit;transform:scale(1)} }
        @keyframes priceFlashDown { 0%{color:#ff3366;transform:scale(1.06)} 100%{color:inherit;transform:scale(1)} }
        .tap-btn { -webkit-tap-highlight-color:transparent; user-select:none; touch-action:manipulation; }
        .tap-btn:active { transform:scale(0.91) !important; }
      `}</style>

      <div className="fixed inset-0 flex flex-col select-none overflow-hidden" style={{ background: "#000" }}>

        {/* ── TOP HUD ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 z-10 shrink-0">

          {/* Left: logo + session count */}
          <div className="flex items-center gap-2.5">
            <button onClick={resetToReady} className="flex items-center gap-1.5">
              <img src="/images/logo.png" alt="PT" className="w-5 h-5" />
              <span className="text-[11px] font-black" style={{ color: "rgba(255,255,255,0.4)" }}>PREDICT</span>
            </button>
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
              #{sessionGames}
            </div>
          </div>

          {/* Center: streak */}
          {streak > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black"
              style={{
                background: "rgba(255,184,0,0.1)",
                border: "1px solid rgba(255,184,0,0.35)",
                color: "#ffb800",
                textShadow: "0 0 12px rgba(255,184,0,0.5)",
                animation: "glowPulse 1.8s ease-in-out infinite",
              }}
            >
              🔥 {streak}×
              {multiplier > 1 && <span className="text-[9px] font-semibold opacity-70">{multiplier}×XP</span>}
            </div>
          )}

          {/* Right: rank + user */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-xs font-black" style={{ color: rank.color, textShadow: `0 0 10px ${rank.color}60` }}>
                {rank.icon} {rank.label}
              </div>
              <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{rankPoints} RP</div>
            </div>
            {authUser ? (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black uppercase"
                style={{ background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}40` }}>
                {authUser.display_name?.charAt(0)}
              </div>
            ) : (
              <Link href="/auth/login"><LogIn className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} /></Link>
            )}
          </div>
        </div>

        {/* ── XP + RANK BARS ── */}
        <div className="px-4 pb-1 space-y-1 shrink-0">
          <div className="flex gap-2 text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            <span>XP {xp}</span><span>·</span><span>LV{level}</span>
          </div>
          <div className="h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${levelProgress * 100}%`, background: "linear-gradient(90deg,#00ff88,#00ccff)", boxShadow: "0 0 6px #00ff88" }} />
          </div>
        </div>

        {/* Daily challenge strip */}
        {dailyChallenge && !dailyChallenge.completed && (
          <div className="px-4 pb-1 shrink-0">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px]"
              style={{ background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.12)", color: "rgba(0,200,255,0.6)" }}>
              <span>🎯 {isEs ? dailyChallenge.labelEs : dailyChallenge.label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(dailyChallenge.progress / dailyChallenge.target) * 100}%`,
                    background: "#00ccff",
                  }} />
                </div>
                <span>{dailyChallenge.progress}/{dailyChallenge.target}</span>
              </div>
            </div>
          </div>
        )}
        {dailyChallenge?.completed && (
          <div className="px-4 pb-1 shrink-0">
            <div className="text-center text-[10px] py-1 rounded-lg" style={{ background: "rgba(0,255,136,0.06)", color: "rgba(0,255,136,0.5)" }}>
              ✓ {isEs ? "Desafío completado!" : "Daily challenge done!"}
            </div>
          </div>
        )}

        {/* ── MAIN AREA ── */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-4 min-h-0">

          {/* ───── READY ───── */}
          {phase === "ready" && (
            <div className="w-full max-w-xs flex flex-col items-center gap-5" style={{ animation: "fadeIn 0.3s ease-out" }}>

              {/* Stats row */}
              <div className="flex gap-5 justify-center">
                {[
                  { label: isEs ? "Partidas" : "Games",    val: allTimeGames },
                  { label: isEs ? "Aciertos" : "Win Rate", val: `${winRate}%` },
                  { label: "Rank",                          val: `${rank.icon}${rank.label}` },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-base font-black text-white">{s.val}</div>
                    <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <RankedBadge rp={rankPoints} showProgress size="lg" />

              {/* Mode selector */}
              <div className="w-full space-y-2">
                <p className="text-[10px] text-center font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {isEs ? "MODO DE JUEGO" : "GAME MODE"}
                </p>
                {(["solo", "ranked", "vs"] as GameMode[]).map(m => {
                  const cfg = MODE_CFG[m];
                  const Icon = cfg.icon;
                  const active = gameMode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => selectMode(m)}
                      className="tap-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: active ? `${cfg.color}14` : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${active ? cfg.color + "50" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: active ? cfg.color : "rgba(255,255,255,0.3)" }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black" style={{ color: active ? cfg.color : "rgba(255,255,255,0.5)" }}>
                          {isEs ? cfg.labelEs : cfg.labelEn}
                        </div>
                        <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                          {isEs ? cfg.descEs : cfg.descEn}
                        </div>
                      </div>
                      {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />}
                    </button>
                  );
                })}
              </div>

              {/* START */}
              <button
                onClick={doStart}
                className="tap-btn w-full py-4 rounded-2xl text-lg font-black text-black"
                style={{
                  background: `linear-gradient(135deg, ${MODE_CFG[gameMode].color}, #009966)`,
                  boxShadow: `0 0 30px ${MODE_CFG[gameMode].color}50, 0 8px 24px rgba(0,0,0,0.5)`,
                }}
              >
                {gameMode === "vs" ? (isEs ? "⚔️ BUSCAR RIVAL" : "⚔️ FIND RIVAL")
                  : gameMode === "ranked" ? (isEs ? "🏆 JUGAR RANKED" : "🏆 PLAY RANKED")
                  : (isEs ? "⚡ JUGAR" : "⚡ PLAY")}
              </button>

              {!authUser && (
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <Link href="/auth/login" style={{ color: "rgba(0,255,136,0.4)" }}>
                    {isEs ? "Inicia sesión" : "Sign in"}
                  </Link>{" "}{isEs ? "para guardar progreso" : "to save progress"}
                </p>
              )}
            </div>
          )}

          {/* ───── SEARCHING (1v1) ───── */}
          {phase === "searching" && vsOpponent && (
            <div className="text-center flex flex-col items-center gap-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
              <div className="text-4xl" style={{ animation: "searchBounce 0.8s ease-in-out infinite" }}>🔍</div>
              <div>
                <p className="text-lg font-black text-white">{isEs ? "Buscando rival..." : "Searching..."}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {isEs ? "Conectando con jugadores online" : "Connecting to online players"}
                </p>
              </div>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: "#00ccff", animation: `glowPulse 1s ease-in-out ${i * 0.25}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {/* ───── DECIDING + RESOLVING ───── */}
          {(phase === "deciding" || phase === "resolving") && (
            <div className="w-full max-w-sm flex flex-col items-center gap-3">

              {/* Opponent strip (1v1) */}
              {vsOpponent && phase === "deciding" && (
                <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,0,255,0.06)", border: "1px solid rgba(255,0,255,0.2)" }}>
                  <span className="text-xl">{vsOpponent.emoji}</span>
                  <div className="flex-1">
                    <div className="text-xs font-black" style={{ color: "#ff00ff" }}>{vsOpponent.name}</div>
                    <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {getRank(0).icon} {vsOpponent.rank.charAt(0).toUpperCase() + vsOpponent.rank.slice(1)}
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold" style={{ color: "rgba(255,0,255,0.5)" }}>
                    {isEs ? "decidiendo..." : "deciding..."}
                  </div>
                </div>
              )}

              {/* Countdown + phase label */}
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" strokeLinecap="round"
                      stroke={phase === "deciding" ? "#00ccff" : (isWinning ? "#00ff88" : "#ff3366")}
                      strokeDasharray="276"
                      strokeDashoffset={`${276 * (1 - countdownPct)}`}
                      style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-white tabular-nums">{Math.ceil(countdown)}</span>
                  </div>
                </div>
                <div>
                  {phase === "deciding" && !move && (
                    <p className="text-sm font-black" style={{ color: "#00ccff" }}>{isEs ? "DECIDE →" : "DECIDE →"}</p>
                  )}
                  {phase === "deciding" && move && (
                    <p className="text-sm font-black" style={{ color: "#ffb800" }}>{isEs ? "¡Bloqueado!" : "Locked!"}</p>
                  )}
                  {phase === "resolving" && (
                    <div>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{isEs ? "Posición" : "Position"}</p>
                      <p className="text-sm font-black" style={{ color: move === "up" ? "#00ff88" : "#ff3366" }}>
                        {move === "up" ? "📈 LONG" : "📉 SHORT"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-center">
                <div
                  className="font-black leading-none tabular-nums"
                  style={{
                    fontSize: "clamp(60px,15vw,88px)",
                    color: pnl !== null ? (isWinning ? "#00ff88" : "#ff3366") : "#ffffff",
                    textShadow: pnl !== null
                      ? `0 0 30px ${isWinning ? "rgba(0,255,136,0.6)" : "rgba(255,51,102,0.6)"}`
                      : "none",
                    animation: flash ? `priceFlash${flash === "up" ? "Up" : "Down"} 0.18s ease-out` : undefined,
                  }}
                >
                  {price.toFixed(2)}
                </div>
                {pnl !== null && (
                  <div className="text-2xl font-black mt-1 tabular-nums"
                    style={{ color: isWinning ? "#00ff88" : "#ff3366", animation: "slideUp 0.12s ease-out" }}>
                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
                  </div>
                )}
              </div>

              {/* Sparkline */}
              <div className="w-full">
                <Sparkline data={priceHistory} entryPrice={entryPrice} move={move} width={320} height={64} />
              </div>

              {entryPrice && (
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {isEs ? "Entrada" : "Entry"}: <span style={{ color: "rgba(255,255,255,0.5)" }}>{entryPrice.toFixed(2)}</span>
                  <span style={{ color: "#fbbf2460" }}> — {isEs ? "línea amarilla" : "yellow line"}</span>
                </p>
              )}
            </div>
          )}

          {/* ───── RESULT ───── */}
          {phase === "result" && result && (
            <ResultOverlay
              result={result} streak={streak}
              countdown={countdown} resultDuration={RESULT_SECS}
              isEs={isEs} rankPoints={rankPoints}
            />
          )}
        </div>

        {/* ── ACTION BUTTONS ── */}
        {(phase === "deciding" || phase === "resolving") && (
          <div className="px-4 pb-6 pt-2 shrink-0">
            {phase === "deciding" && !move ? (
              <div className="grid grid-cols-2 gap-3">
                {([
                  { fn: doUp,   label: isEs ? "SUBE" : "UP",   icon: ArrowUp,   color: "#00ff88" },
                  { fn: doDown, label: isEs ? "BAJA" : "DOWN", icon: ArrowDown, color: "#ff3366" },
                ] as const).map(({ fn, label, icon: Icon, color }) => (
                  <button key={label} onClick={fn}
                    className="tap-btn flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl font-black text-xl"
                    style={{
                      background: `${color}14`,
                      border: `2px solid ${color}45`,
                      color,
                      boxShadow: `0 0 20px ${color}25`,
                    }}>
                    <Icon className="w-8 h-8" strokeWidth={3} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            ) : phase === "deciding" && move ? (
              <div className="flex items-center justify-center py-4 rounded-2xl text-base font-black"
                style={{
                  background: move === "up" ? "rgba(0,255,136,0.07)" : "rgba(255,51,102,0.07)",
                  border: `1.5px solid ${move === "up" ? "rgba(0,255,136,0.3)" : "rgba(255,51,102,0.3)"}`,
                  color: move === "up" ? "#00ff88" : "#ff3366",
                }}>
                {move === "up" ? "📈 LONG" : "📉 SHORT"} — {isEs ? "esperando resultado..." : "waiting..."}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-3.5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-lg font-black" style={{ color: isWinning ? "#00ff88" : "#ff3366" }}>
                  {isWinning ? "🚀" : "💀"} {pnl !== null ? `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}%` : ""}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{isEs ? "en vivo" : "live"}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom stats on ready */}
        {phase === "ready" && (
          <div className="px-4 pb-4 pt-2 flex justify-between shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { label: "XP", val: xp.toLocaleString() },
              { label: isEs ? "Nivel" : "Level", val: `⭐ ${level}` },
              { label: isEs ? "Victorias" : "Wins", val: allTimeWins },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-sm font-black text-white">{s.val}</div>
                <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.22)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

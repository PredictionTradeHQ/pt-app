"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy, TrendingUp, TrendingDown, BookOpen, Zap,
  BarChart2, Target, Flame, DollarSign, CheckCircle2,
  Clock, ArrowUpRight, Activity, User, Calendar, Wallet,
  ChevronRight, ArrowUp, ArrowDown, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

interface UserStats {
  profile: { id: string; email: string; display_name: string; created_at: string };
  game: { games_played: number; wins_count: number; total_profit: number; best_streak: number } | null;
  recentGames: { profit_pct: number; position: string; won: boolean; duration: string; created_at: string }[];
  demo: { balance: number; starting_balance: number; positions: any[]; activity: any[] } | null;
  academy: { lesson_id: string; level_id: string; completed_at: string }[];
}

const TOTAL_LESSONS = 30;
const LESSONS_PER_LEVEL = 6;

export function DashboardClient() {
  const { language } = useLanguage();
  const isEs = language === "es";
  const [stats, setStats] = useState<UserStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/stats").then((r) => r.json()),
      fetch("/api/wallet").then((r) => r.json()),
    ])
      .then(([s, w]) => {
        setStats(s);
        if (w.balance !== undefined) setWalletBalance(w.balance);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-44 bg-[#0b0e17] animate-pulse rounded-2xl border border-white/5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#0b0e17] animate-pulse rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { profile, game, recentGames, demo, academy } = stats;
  const winRate = game && game.games_played > 0
    ? Math.round((game.wins_count / game.games_played) * 100)
    : 0;

  const demoReturn = demo
    ? ((demo.balance - demo.starting_balance) / demo.starting_balance) * 100
    : 0;

  const completedLessons = academy.length;
  const memberDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000);

  const levelProgress: Record<string, number> = {};
  academy.forEach((a) => { levelProgress[a.level_id] = (levelProgress[a.level_id] ?? 0) + 1; });

  const levelNames = isEs
    ? ["Fundamentos", "Mercados", "Estrategias", "Psicología", "Avanzado"]
    : ["Fundamentals", "Markets", "Strategies", "Psychology", "Advanced"];

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const walletPnl = walletBalance !== null ? walletBalance - 100000 : 0;
  const walletPnlPct = (walletPnl / 100000) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6" style={{ fontFamily: "'SF Pro Display', system-ui, sans-serif" }}>

      {/* ── Broker wallet card ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0f172a 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 0 80px rgba(0,200,255,0.05)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/3 w-64 h-32 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,200,255,0.4) 0%, transparent 70%)" }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
          {/* Left: user + wallet */}
          <div className="flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black uppercase shrink-0"
              style={{ background: "rgba(0,200,255,0.12)", border: "1px solid rgba(0,200,255,0.2)", color: "#00c8ff" }}
            >
              {profile.display_name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {isEs ? "Bienvenido," : "Welcome back,"} {profile.display_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl md:text-4xl font-black tabular-nums" style={{ color: "#fff" }}>
                  {hideBalance
                    ? "••••••••"
                    : walletBalance !== null
                      ? `$${fmt(walletBalance)}`
                      : demo
                        ? `$${fmt(demo.balance)}`
                        : "$100,000.00"}
                </p>
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  className="hover:text-white/60 transition-colors"
                >
                  {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                {isEs ? "Saldo virtual total" : "Total virtual balance"}
              </p>
              {!hideBalance && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: walletPnl >= 0 ? "#00ff88" : "#ff3366" }}
                  >
                    {walletPnl >= 0 ? "+" : ""}${fmt(Math.abs(walletPnl))}
                  </span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: walletPnl >= 0 ? "rgba(0,255,136,0.12)" : "rgba(255,51,102,0.12)",
                      color: walletPnl >= 0 ? "#00ff88" : "#ff3366",
                    }}
                  >
                    {walletPnl >= 0 ? "+" : ""}{walletPnlPct.toFixed(2)}%
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {isEs ? "vs inicial $100,000" : "vs initial $100,000"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: quick actions */}
          <div className="flex gap-3">
            <Button asChild size="sm" className="gap-2 h-9 font-semibold" style={{ background: "#00c8ff", color: "#000" }}>
              <Link href="/demo"><BarChart2 className="w-4 h-4" />{isEs ? "Trade" : "Trade"}</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2 h-9" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
              <Link href="/play"><Zap className="w-4 h-4" />{isEs ? "Jugar" : "Play"}</Link>
            </Button>
          </div>
        </div>

        {/* Bottom strip: quick stats */}
        <div
          className="mt-6 pt-5 grid grid-cols-2 md:grid-cols-4 gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            {
              label: isEs ? "Win rate" : "Win rate",
              val: `${winRate}%`,
              sub: `${game?.games_played ?? 0} ${isEs ? "partidas" : "games"}`,
              color: "#00ff88",
            },
            {
              label: isEs ? "Mejor racha" : "Best streak",
              val: `🔥 ${game?.best_streak ?? 0}x`,
              sub: `${game?.wins_count ?? 0} ${isEs ? "victorias" : "wins"}`,
              color: "#ffb800",
            },
            {
              label: isEs ? "Demo P&L" : "Demo P&L",
              val: `${demoReturn >= 0 ? "+" : ""}${demoReturn.toFixed(2)}%`,
              sub: `$${demo ? fmt(demo.balance) : "100,000.00"}`,
              color: demoReturn >= 0 ? "#00ff88" : "#ff3366",
            },
            {
              label: isEs ? "Academia" : "Academy",
              val: `${completedLessons}/${TOTAL_LESSONS}`,
              sub: `${Math.round((completedLessons / TOTAL_LESSONS) * 100)}% ${isEs ? "completo" : "complete"}`,
              color: "#00c8ff",
            },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
              <p className="text-lg font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column panel ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Recent games */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#0b0e17", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: "#00c8ff" }} />
              <span className="text-sm font-bold text-white">{isEs ? "Últimas partidas" : "Recent games"}</span>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Link href="/play">{isEs ? "Jugar →" : "Play →"}</Link>
            </Button>
          </div>

          {recentGames.length === 0 ? (
            <div className="py-14 text-center">
              <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.12)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                {isEs ? "Aún no has jugado" : "No games yet"}
              </p>
              <Button asChild size="sm" className="mt-4 gap-2" style={{ background: "#00c8ff", color: "#000" }}>
                <Link href="/play"><Zap className="w-4 h-4" />{isEs ? "¡Empezar!" : "Start playing!"}</Link>
              </Button>
            </div>
          ) : (
            <div>
              {recentGames.slice(0, 8).map((g, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: i < recentGames.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: g.won ? "rgba(0,255,136,0.1)" : "rgba(255,51,102,0.1)",
                    }}
                  >
                    {g.position === "buy"
                      ? <ArrowUp className="w-4 h-4" style={{ color: g.won ? "#00ff88" : "#ff3366" }} />
                      : <ArrowDown className="w-4 h-4" style={{ color: g.won ? "#00ff88" : "#ff3366" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {g.position === "buy" ? "LONG" : "SHORT"}
                      <span className="ml-1.5 text-xs font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>{g.duration}</span>
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                      <Clock className="w-3 h-3" />
                      {new Date(g.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-black tabular-nums" style={{ color: g.won ? "#00ff88" : "#ff3366" }}>
                    {g.profit_pct >= 0 ? "+" : ""}{g.profit_pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academy progress */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#0b0e17", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" style={{ color: "#00c8ff" }} />
              <span className="text-sm font-bold text-white">{isEs ? "Progreso Academia" : "Academy Progress"}</span>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Link href="/academy">{isEs ? "Continuar →" : "Continue →"}</Link>
            </Button>
          </div>

          <div className="p-5 space-y-5">
            {/* Overall bar */}
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span>{isEs ? "Progreso total" : "Overall progress"}</span>
                <span>{completedLessons}/{TOTAL_LESSONS}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(completedLessons / TOTAL_LESSONS) * 100}%`,
                    background: "linear-gradient(90deg, #00c8ff, #00ff88)",
                    boxShadow: "0 0 8px rgba(0,200,255,0.5)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {levelNames.map((name, idx) => {
                const levelId = `level-${idx + 1}`;
                const done = levelProgress[levelId] ?? 0;
                const pct = Math.min((done / LESSONS_PER_LEVEL) * 100, 100);
                const finished = done >= LESSONS_PER_LEVEL;
                return (
                  <div key={levelId}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 font-medium text-white/70">
                        {finished && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#00ff88" }} />}
                        L{idx + 1} · {name}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>{done}/{LESSONS_PER_LEVEL}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: finished
                            ? "linear-gradient(90deg, #00ff88, #00c8ff)"
                            : "rgba(0,200,255,0.5)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Demo portfolio ── */}
      {demo && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "#0b0e17", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4" style={{ color: "#00c8ff" }} />
            <span className="text-sm font-bold text-white">{isEs ? "Demo Trading Portfolio" : "Demo Trading Portfolio"}</span>
            <Button asChild variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Link href="/demo">{isEs ? "Abrir terminal →" : "Open terminal →"}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: isEs ? "Balance" : "Balance",
                val: `$${fmt(demo.balance)}`,
                color: demo.balance >= demo.starting_balance ? "#00ff88" : "#ff3366",
              },
              {
                label: isEs ? "P&L Total" : "Total P&L",
                val: `${demoReturn >= 0 ? "+" : ""}${demoReturn.toFixed(2)}%`,
                color: demoReturn >= 0 ? "#00ff88" : "#ff3366",
              },
              {
                label: isEs ? "Posiciones abiertas" : "Open positions",
                val: String(demo.positions?.length ?? 0),
                color: "#fff",
              },
              {
                label: isEs ? "Operaciones" : "Total trades",
                val: String(demo.activity?.length ?? 0),
                color: "#fff",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                <p className="text-lg font-black tabular-nums" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick nav ── */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {[
          { href: "/play",    label: "⚡ " + (isEs ? "Juego"    : "Play Game"),   bg: "#1a1f2e" },
          { href: "/demo",    label: "📊 " + (isEs ? "Trading"  : "Demo Trade"),  bg: "#1a1f2e" },
          { href: "/academy", label: "📚 " + (isEs ? "Academia" : "Academy"),     bg: "#1a1f2e" },
          { href: "/markets", label: "🌍 " + (isEs ? "Mercados" : "Markets"),     bg: "#1a1f2e" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:brightness-125"
            style={{ background: l.bg, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

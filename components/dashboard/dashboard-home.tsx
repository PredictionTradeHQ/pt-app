"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Zap,
  Trophy,
  Activity as ActivityIcon,
  Wallet,
  Target,
  Eye,
  EyeOff,
  ArrowRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Stats = {
  profile?: { display_name?: string; email?: string };
  game?: {
    games_played?: number;
    wins_count?: number;
    total_profit?: number;
    best_streak?: number;
  } | null;
  recentGames?: Array<{
    profit_pct: number;
    won: boolean;
    duration: number | null;
    created_at: string;
  }>;
  demo?: { balance?: number } | null;
  academy?: Array<{ lesson_id: string; level_id: string; completed_at: string }>;
};

type LeaderEntry = {
  id: string;
  display_name: string;
  profit: number;
  games_played: number;
  best_streak: number;
};

export function DashboardHome() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEs = language === "es";
  const [hideBalance, setHideBalance] = useState(false);

  const { data: stats } = useSWR<Stats>("/api/user/stats", fetcher, {
    refreshInterval: 30000,
  });
  const { data: walletData } = useSWR<{ balance: number }>("/api/wallet", fetcher);
  const { data: leaders } = useSWR<LeaderEntry[]>(
    "/api/game/leaderboard?sort=profit&period=all",
    fetcher,
    { refreshInterval: 60000 }
  );

  const balance = walletData?.balance ?? stats?.demo?.balance ?? 100000;
  const startingBalance = 100000;
  const pnl = balance - startingBalance;
  const pnlPct = (pnl / startingBalance) * 100;

  const gamesPlayed = stats?.game?.games_played ?? 0;
  const winsCount = stats?.game?.wins_count ?? 0;
  const winRate = gamesPlayed > 0 ? (winsCount / gamesPlayed) * 100 : 0;
  const bestStreak = stats?.game?.best_streak ?? 0;
  const recentGames = stats?.recentGames ?? [];
  const academyDone = stats?.academy?.length ?? 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (isEs) {
      if (h < 12) return "Buenos días";
      if (h < 19) return "Buenas tardes";
      return "Buenas noches";
    }
    if (h < 12) return "Good morning";
    if (h < 19) return "Good afternoon";
    return "Good evening";
  })();

  const displayName = user?.display_name || stats?.profile?.display_name || "Trader";

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {greeting}, <span className="text-primary">{displayName}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEs
            ? "Aquí tienes tu actividad y oportunidades del día."
            : "Here's your activity and opportunities today."}
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Balance card (big) */}
        <Card className="md:col-span-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="w-4 h-4" />
                {isEs ? "Balance virtual" : "Virtual balance"}
              </div>
              <button
                onClick={() => setHideBalance((v) => !v)}
                className="text-muted-foreground hover:text-foreground"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              {hideBalance
                ? "••••••"
                : `$${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "font-medium",
                  pnl >= 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {pnl >= 0 ? "+" : ""}
                {hideBalance ? "•••" : `$${pnl.toFixed(2)}`} ({pnl >= 0 ? "+" : ""}
                {pnlPct.toFixed(2)}%)
              </span>
              <span className="text-muted-foreground">
                {isEs ? "vs inicial $100K" : "vs $100K starting"}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild size="sm" className="gap-2">
                <Link href="/markets">
                  <TrendingUp className="w-4 h-4" />
                  {isEs ? "Operar ahora" : "Start trading"}
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/play">
                  <Zap className="w-4 h-4" />
                  {isEs ? "Jugar Flash" : "Play Flash"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Win rate card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Target className="w-4 h-4" />
              {isEs ? "Win rate" : "Win rate"}
            </div>
            <p className="text-3xl font-bold mb-1">
              {gamesPlayed > 0 ? `${winRate.toFixed(0)}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {gamesPlayed > 0
                ? `${winsCount} / ${gamesPlayed} ${isEs ? "partidas" : "games"}`
                : isEs
                ? "Aún sin partidas"
                : "No games yet"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-muted-foreground">
                {isEs ? "Mejor racha:" : "Best streak:"}
              </span>
              <span className="font-medium">{bestStreak}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <QuickAction
          href="/markets"
          icon={TrendingUp}
          label={isEs ? "Mercados" : "Markets"}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <QuickAction
          href="/play"
          icon={Zap}
          label={isEs ? "Juego" : "Game"}
          color="text-yellow-500"
          bg="bg-yellow-500/10"
        />
        <QuickAction
          href="/academy"
          icon={Trophy}
          label={isEs ? "Academia" : "Academy"}
          color="text-blue-500"
          bg="bg-blue-500/10"
          extra={`${academyDone} ${isEs ? "lecciones" : "lessons"}`}
        />
        <QuickAction
          href="/leaderboard"
          icon={Trophy}
          label={isEs ? "Ranking" : "Leaderboard"}
          color="text-primary"
          bg="bg-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-primary" />
                {isEs ? "Actividad reciente" : "Recent activity"}
              </h2>
              <Link
                href="/activity"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {isEs ? "Ver todo" : "View all"}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentGames.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isEs
                  ? "Juega tu primera partida o haz tu primera operación."
                  : "Play your first game or place your first trade."}
              </div>
            ) : (
              <ul className="space-y-2">
                {recentGames.slice(0, 5).map((g, i) => {
                  const profitPct = (g.profit_pct * 100).toFixed(2);
                  const positive = g.profit_pct >= 0;
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          Prediction Flash{" "}
                          <span
                            className={cn(
                              "text-xs ml-1",
                              g.won ? "text-green-500" : "text-muted-foreground"
                            )}
                          >
                            {g.won ? "WIN" : "LOSS"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(g.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          positive ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {positive ? "+" : ""}
                        {profitPct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Top players */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                {isEs ? "Top traders" : "Top traders"}
              </h2>
              <Link
                href="/leaderboard"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {isEs ? "Ver ranking" : "Full ranking"}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {!leaders || leaders.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isEs ? "Aún sin ranking." : "No ranking yet."}
              </div>
            ) : (
              <ul className="space-y-2">
                {leaders.slice(0, 5).map((l, i) => {
                  const profit = (l.profit * 100).toFixed(2);
                  const positive = l.profit >= 0;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  return (
                    <li
                      key={l.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                          i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {medal ?? i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{l.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.games_played} {isEs ? "partidas" : "games"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          positive ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {positive ? "+" : ""}
                        {profit}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
  bg,
  extra,
}: {
  href: string;
  icon: typeof TrendingUp;
  label: string;
  color: string;
  bg: string;
  extra?: string;
}) {
  return (
    <Link
      href={href}
      className="group p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg, color)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold group-hover:text-primary transition-colors">{label}</p>
      {extra && <p className="text-xs text-muted-foreground mt-1">{extra}</p>}
    </Link>
  );
}

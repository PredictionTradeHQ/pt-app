"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

type LeaderboardEntry = {
  id: string;
  display_name: string;
  profit: number;
  games_played: number;
  best_streak: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function LeaderboardClient() {
  const { language } = useLanguage();
  const isEs = language === "es";
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("profit");

  const periods = [
    { value: "all", label: isEs ? "Histórico" : "All time" },
    { value: "weekly", label: isEs ? "Esta semana" : "This week" },
    { value: "daily", label: isEs ? "Hoy" : "Today" },
  ];

  const sorts = [
    { value: "profit", label: isEs ? "Mejor rendimiento" : "Top profit", icon: TrendingUp },
    { value: "streak", label: isEs ? "Mejor racha" : "Best streak", icon: Flame },
  ];

  const { data, isLoading, error } = useSWR<LeaderboardEntry[]>(
    `/api/game/leaderboard?sort=${sort}&period=${period}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const entries = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
        <div className="w-px bg-border mx-1" />
        {sorts.map((s) => (
          <Button
            key={s.value}
            variant={sort === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSort(s.value)}
            className="gap-2"
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            {isEs
              ? "No se pudo cargar el ranking. Inténtalo de nuevo más tarde."
              : "Could not load leaderboard. Please try again later."}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {isEs
                ? "Aún no hay jugadores en este periodo. Sé el primero en escalar el ranking."
                : "No players yet for this period. Be the first to climb the ranks."}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && entries.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {entries.map((entry, i) => (
                <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} sort={sort} isEs={isEs} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LeaderboardRow({
  entry,
  rank,
  sort,
  isEs,
}: {
  entry: LeaderboardEntry;
  rank: number;
  sort: string;
  isEs: boolean;
}) {
  const isTop3 = rank <= 3;
  const profitPct = (entry.profit * 100).toFixed(2);
  const profitPositive = entry.profit >= 0;

  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0",
          isTop3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {medal ? <span className="text-xl">{medal}</span> : <span>{rank}</span>}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{entry.display_name}</p>
        <p className="text-xs text-muted-foreground">
          {entry.games_played}{" "}
          {isEs
            ? entry.games_played === 1
              ? "partida"
              : "partidas"
            : entry.games_played === 1
            ? "game"
            : "games"}
        </p>
      </div>

      <div className="text-right">
        {sort === "streak" ? (
          <div>
            <p className="font-bold text-lg flex items-center gap-1 justify-end">
              <Flame className="w-4 h-4 text-orange-500" />
              {entry.best_streak}
            </p>
            <p
              className={cn(
                "text-xs",
                profitPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {profitPositive ? "+" : ""}
              {profitPct}%
            </p>
          </div>
        ) : (
          <div>
            <p
              className={cn(
                "font-bold text-lg",
                profitPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {profitPositive ? "+" : ""}
              {profitPct}%
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Flame className="w-3 h-3" />
              {entry.best_streak} {isEs ? "racha" : "streak"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

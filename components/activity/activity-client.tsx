"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Activity as ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

type GameResult = {
  id: string;
  profit_pct: number;
  position: string | null;
  won: boolean;
  duration: number | null;
  created_at: string;
};

type Trade = {
  type?: string;
  market?: string;
  outcome?: string;
  amount?: number;
  price?: number;
  timestamp?: string | number;
};

export function ActivityClient({
  games,
  trades,
}: {
  games: GameResult[];
  trades: Trade[];
}) {
  const { language } = useLanguage();
  const isEs = language === "es";
  const [tab, setTab] = useState<"all" | "games" | "trades">("all");

  const allItems = [
    ...games.map((g) => ({
      kind: "game" as const,
      timestamp: g.created_at,
      data: g,
    })),
    ...trades.map((t) => ({
      kind: "trade" as const,
      timestamp:
        typeof t.timestamp === "number"
          ? new Date(t.timestamp).toISOString()
          : t.timestamp ?? new Date().toISOString(),
      data: t,
    })),
  ].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filtered =
    tab === "all"
      ? allItems
      : tab === "games"
      ? allItems.filter((i) => i.kind === "game")
      : allItems.filter((i) => i.kind === "trade");

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isEs ? "Actividad" : "Activity"}
        </h1>
        <p className="text-muted-foreground">
          {isEs
            ? "Tu historial completo en la plataforma."
            : "Your full history across the platform."}
        </p>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={tab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("all")}
        >
          {isEs ? "Todo" : "All"} ({allItems.length})
        </Button>
        <Button
          variant={tab === "games" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("games")}
          className="gap-2"
        >
          <Zap className="w-4 h-4" />
          {isEs ? "Partidas" : "Games"} ({games.length})
        </Button>
        <Button
          variant={tab === "trades" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("trades")}
          className="gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {isEs ? "Operaciones" : "Trades"} ({trades.length})
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <ActivityIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {isEs
                ? "Aún sin actividad. Haz tu primera predicción o juega una partida para construir tu historial."
                : "No activity yet. Make your first call or play a game to build your history."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((item, i) => (
                <ActivityRow key={`${item.kind}-${i}`} item={item} isEs={isEs} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function ActivityRow({
  item,
  isEs,
}: {
  item:
    | { kind: "game"; timestamp: string; data: GameResult }
    | { kind: "trade"; timestamp: string; data: Trade };
  isEs: boolean;
}) {
  const date = new Date(item.timestamp);
  const dateStr = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (item.kind === "game") {
    const g = item.data;
    const profitPct = (g.profit_pct * 100).toFixed(2);
    const positive = g.profit_pct >= 0;
    return (
      <div className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">
            Prediction Flash{" "}
            <span
              className={cn(
                "text-xs ml-2",
                g.won ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {g.won ? (isEs ? "GANÓ" : "WIN") : isEs ? "PERDIÓ" : "LOSS"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {g.position ? `${isEs ? "Posición" : "Position"}: ${g.position} · ` : ""}
            {dateStr} · {timeStr}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "font-bold",
              positive ? "text-green-500" : "text-red-500"
            )}
          >
            {positive ? "+" : ""}
            {profitPct}%
          </p>
        </div>
      </div>
    );
  }

  const t = item.data;
  const amount = typeof t.amount === "number" ? t.amount : 0;
  return (
    <div className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {t.type === "sell" ? (isEs ? "Vendiste" : "Sold") : isEs ? "Compraste" : "Bought"}{" "}
          <span className="text-muted-foreground">{t.outcome ?? "—"}</span>
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {t.market ?? (isEs ? "Mercado" : "Market")} · {dateStr} · {timeStr}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">${amount.toLocaleString()}</p>
        {typeof t.price === "number" && (
          <p className="text-xs text-muted-foreground">
            @ {(t.price * 100).toFixed(1)}¢
          </p>
        )}
      </div>
    </div>
  );
}

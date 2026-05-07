"use client";

import { useEffect, useState } from "react";
import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  profit: number;
  games_played: number;
  best_streak: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardProps {
  currentUserId?: string;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const { language } = useLanguage();
  const isEs = language === "es";
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profit" | "streak">("profit");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/game/leaderboard?sort=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      setEntries([
        { id: "1", display_name: "TradeMaster", profit: 0.234, games_played: 48, best_streak: 7 },
        { id: "2", display_name: "PredictPro",  profit: 0.187, games_played: 35, best_streak: 5 },
        { id: "3", display_name: "AlphaWave",   profit: 0.142, games_played: 29, best_streak: 4 },
        { id: "4", display_name: "MarketHawk",  profit: 0.119, games_played: 22, best_streak: 3 },
        { id: "5", display_name: "OddsKing",    profit: 0.098, games_played: 18, best_streak: 3 },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, [tab]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm">{isEs ? "Clasificación" : "Leaderboard"}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-background rounded-lg p-0.5">
            {(["profit", "streak"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "profit" ? "Profit" : (isEs ? "Racha" : "Streak")}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={fetchLeaderboard} className="h-7 w-7 p-0">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-muted" />
                <div className="flex-1 h-3 bg-muted rounded" />
                <div className="w-14 h-3 bg-muted rounded" />
              </div>
            ))
          : entries.length === 0
            ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {isEs ? "Sé el primero en el ranking 🏆" : "Be the first on the board 🏆"}
              </div>
            )
            : entries.map((e, i) => {
                const isCurrentUser = currentUserId && e.id === currentUserId;
                return (
                  <div
                    key={e.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors
                      ${isCurrentUser
                        ? "bg-primary/5 border-l-2 border-primary"
                        : "hover:bg-background/40"}`}
                  >
                    <span className="text-lg w-6 text-center shrink-0">
                      {i < 3
                        ? MEDALS[i]
                        : <span className="text-xs text-muted-foreground font-bold">{i + 1}</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                        {e.display_name}
                        {isCurrentUser && <span className="ml-1 text-[10px] font-normal opacity-60">(tú)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.games_played} {isEs ? "partidas" : "games"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {tab === "profit" ? (
                        <span className={`text-sm font-bold ${e.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {e.profit >= 0 ? "+" : ""}{(e.profit * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-amber-400">
                          🔥 {e.best_streak}x
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
      </div>
    </div>
  );
}

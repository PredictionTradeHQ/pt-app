"use client";

import { useLanguage } from "@/contexts/language-context";
import { ForecastersLeaderboard } from "./forecasters-leaderboard";

export function LeaderboardPageClient() {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isEs ? "Ranking" : "Leaderboard"}
        </h1>
        <p className="text-muted-foreground">
          {isEs
            ? "Los mejores predictores por racha, precisión e insignias."
            : "Top forecasters ranked by streak, accuracy, and badges."}
        </p>
      </div>

      <ForecastersLeaderboard isEs={isEs} />
    </main>
  );
}

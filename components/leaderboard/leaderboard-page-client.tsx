"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { LeaderboardClient } from "./leaderboard-client";
import { ForecastersLeaderboard } from "./forecasters-leaderboard";
import { cn } from "@/lib/utils";
import { Zap, Users } from "lucide-react";

type MainTab = "forecasters" | "flash"

export function LeaderboardPageClient() {
  const { language } = useLanguage();
  const isEs = language === "es";
  const [mainTab, setMainTab] = useState<MainTab>("forecasters");

  const tabs: { key: MainTab; label: string; labelEs: string; icon: React.ElementType; desc: string; descEs: string }[] = [
    {
      key: "forecasters",
      label: "Forecasters",
      labelEs: "Predictores",
      icon: Users,
      desc: "Ranked by streaks, accuracy & badges",
      descEs: "Por rachas, precisión e insignias",
    },
    {
      key: "flash",
      label: "Flash Players",
      labelEs: "Flash Players",
      icon: Zap,
      desc: "Prediction Flash game scores",
      descEs: "Puntuaciones del juego Flash",
    },
  ];

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

      {/* Main tab switcher */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMainTab(tab.key)}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
              mainTab === tab.key
                ? "border-primary/50 bg-primary/8"
                : "border-border bg-card/50 hover:border-border/80"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                mainTab === tab.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
            </div>
            <div>
              <p className={cn("font-semibold text-sm", mainTab === tab.key && "text-primary")}>
                {isEs ? tab.labelEs : tab.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEs ? tab.descEs : tab.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      {mainTab === "forecasters" ? (
        <ForecastersLeaderboard isEs={isEs} />
      ) : (
        <LeaderboardClient />
      )}
    </main>
  );
}

import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";

export const metadata: Metadata = {
  title: "Leaderboard — PredictionTrade",
  description: "Top traders ranked by performance.",
};

export default function LeaderboardPage() {
  return (
    <AppShell>
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top traders ranked by performance in Prediction Flash.
          </p>
        </div>
        <LeaderboardClient />
      </main>
    </AppShell>
  );
}

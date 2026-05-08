import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { LeaderboardPageClient } from "@/components/leaderboard/leaderboard-page-client";

export const metadata: Metadata = {
  title: "Leaderboard — PredictionTrade",
  description: "Top traders ranked by performance.",
};

export default function LeaderboardPage() {
  return (
    <AppShell>
      <LeaderboardPageClient />
    </AppShell>
  );
}

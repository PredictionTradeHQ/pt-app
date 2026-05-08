import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";

export const metadata: Metadata = {
  title: "Leaderboard — PredictionTrade",
  description:
    "See the top traders on PredictionTrade. Live rankings by profit and best streak.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top traders ranked by performance in Prediction Flash.
          </p>
        </div>
        <LeaderboardClient />
      </main>
      <Footer />
    </div>
  );
}

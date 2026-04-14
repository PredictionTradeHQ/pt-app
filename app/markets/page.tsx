import { Metadata } from "next";
import { MarketsApp } from "@/components/markets-app";

export const metadata: Metadata = {
  title: "Live Prediction Markets - Real-Time Odds | Polymarket",
  description: "Explore live prediction markets from Polymarket with real-time WebSocket updates. Track odds on politics, crypto, sports, and world events. Practice paper trading with virtual funds.",
  keywords: ["prediction markets", "Polymarket", "real-time odds", "live pricing", "WebSocket", "event contracts", "political betting", "crypto predictions"],
  openGraph: {
    title: "Live Prediction Markets with Real-Time Updates | Prediction Trade",
    description: "Explore live prediction markets from Polymarket with real-time price updates.",
  },
};

export default function MarketsPage() {
  return <MarketsApp />;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paper Trading - Practice Polymarket Trading Risk-Free",
  description: "Start paper trading on Polymarket with $10,000 virtual funds. Practice prediction market trading without risking real money. Real-time prices and live market data.",
  keywords: ["paper trading", "Polymarket practice", "virtual trading", "risk-free trading", "prediction market demo", "trading simulator"],
  openGraph: {
    title: "Paper Trading Simulator | Prediction Trade",
    description: "Practice Polymarket trading with $10,000 virtual funds. Real-time prices, zero risk.",
  },
};

export default function PredictLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Academy } from "@/components/academy";

export const metadata: Metadata = {
  title: "Prediction Markets Academy - Learn Trading Strategies",
  description: "Free educational resources on prediction markets. Learn how Polymarket works, understand AMMs, probability calculations, and master trading strategies for event contracts.",
  keywords: ["prediction market education", "Polymarket tutorial", "AMM explained", "trading strategies", "probability trading", "how prediction markets work"],
  openGraph: {
    title: "Prediction Markets Academy | Learn to Trade",
    description: "Free educational resources on prediction markets and trading strategies.",
  },
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Academy />
      </main>
      <Footer />
    </div>
  );
}

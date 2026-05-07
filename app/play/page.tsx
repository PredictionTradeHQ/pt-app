import { Metadata } from "next";
import { ArcadeScreen } from "@/components/arcade/arcade-screen";

export const metadata: Metadata = {
  title: "⚡ Prediction Flash — PredictionTrade",
  description: "Ultra-fast ranked prediction game. 7 seconds. One tap. Rise from Bronze to Master.",
  openGraph: {
    title: "⚡ Prediction Flash | PredictionTrade",
    description: "Solo · Ranked · 1v1. The fastest trading game on the internet.",
    images: [{ url: "/images/logo.png" }],
  },
};

export default function PlayPage() {
  return <ArcadeScreen />;
}

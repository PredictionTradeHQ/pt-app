import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { ArcadeScreen } from "@/components/arcade/arcade-screen";

export const metadata: Metadata = {
  title: "Prediction Flash — PredictionTrade",
  description: "A quick-tap reaction sidequest. Real forecasting lives on /markets.",
  openGraph: {
    title: "Prediction Flash | PredictionTrade",
    description: "Quick reaction sidequest on PredictionTrade. Real forecasting lives on /markets.",
    images: [{ url: "/images/logo.png" }],
  },
};

export default function PlayPage() {
  return (
    <AppShell requireAuth={false}>
      <ArcadeScreen />
    </AppShell>
  );
}

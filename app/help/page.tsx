import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { HelpClient } from "@/components/help/help-client";

export const metadata: Metadata = {
  title: "Help — PredictionTrade",
  description:
    "Get started with PredictionTrade. Make public predictions on real Polymarket events, build your forecaster track record, and learn how the platform works.",
};

export default function HelpPage() {
  return (
    <AppShell requireAuth={false}>
      <HelpClient />
    </AppShell>
  );
}

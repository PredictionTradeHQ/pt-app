import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { HelpClient } from "@/components/help/help-client";

export const metadata: Metadata = {
  title: "Help — PredictionTrade",
  description:
    "Get started with PredictionTrade. Learn how to use the simulator, paper trade with $100,000 virtual funds, and master prediction markets.",
};

export default function HelpPage() {
  return (
    <AppShell requireAuth={false}>
      <HelpClient />
    </AppShell>
  );
}

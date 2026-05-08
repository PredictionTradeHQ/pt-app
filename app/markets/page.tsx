import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { MarketsApp } from "@/components/markets-app";

export const metadata: Metadata = {
  title: "Markets — PredictionTrade",
  description: "Live prediction markets from Polymarket. Practice trading with $100,000 virtual funds.",
};

export default function MarketsPage() {
  return (
    <AppShell requireAuth={false}>
      <MarketsApp />
    </AppShell>
  );
}

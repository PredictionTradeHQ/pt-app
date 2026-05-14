import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { MarketsApp } from "@/components/markets-app";

export const metadata: Metadata = {
  title: "Markets — PredictionTrade",
  description: "Live prediction markets from Polymarket. Practice trading with $100,000 virtual funds.",
};

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>
}) {
  const params = await searchParams;
  return (
    <AppShell requireAuth={false}>
      <MarketsApp isNewUser={params.new === "1"} />
    </AppShell>
  );
}

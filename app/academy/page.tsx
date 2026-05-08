import { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { Academy } from "@/components/academy";

export const metadata: Metadata = {
  title: "Academy — PredictionTrade",
  description: "Free lessons on prediction markets and trading strategies.",
};

export default function AcademyPage() {
  return (
    <AppShell>
      <Academy />
    </AppShell>
  );
}

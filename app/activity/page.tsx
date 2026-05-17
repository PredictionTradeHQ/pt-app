import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell/app-shell";
import { ActivityClient } from "@/components/activity/activity-client";

export const metadata: Metadata = {
  title: "Activity — PredictionTrade",
  description: "Your full prediction history on PredictionTrade.",
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/activity");
  }

  const { data: demoRow } = await supabase
    .from("demo_portfolios")
    .select("activity")
    .eq("user_id", user.id)
    .single();

  const trades = (demoRow?.activity as any[] | null) ?? [];

  return (
    <AppShell>
      <ActivityClient trades={trades} />
    </AppShell>
  );
}

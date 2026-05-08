import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell/app-shell";
import { ActivityClient } from "@/components/activity/activity-client";

export const metadata: Metadata = {
  title: "Activity — PredictionTrade",
  description: "Your full trading and game history on PredictionTrade.",
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/activity");
  }

  const [gamesRes, demoRes] = await Promise.all([
    supabase
      .from("game_results")
      .select("id, profit_pct, position, won, duration, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("demo_portfolios")
      .select("activity")
      .eq("user_id", user.id)
      .single(),
  ]);

  const games = gamesRes.data ?? [];
  const trades = (demoRes.data?.activity as any[] | null) ?? [];

  return (
    <AppShell>
      <ActivityClient games={games} trades={trades} />
    </AppShell>
  );
}

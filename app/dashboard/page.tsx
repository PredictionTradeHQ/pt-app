import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — PredictionTrade",
  description: "Your unified activity dashboard: game stats, demo trading, and academy progress.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <DashboardClient />
      </main>
      <Footer />
    </div>
  );
}

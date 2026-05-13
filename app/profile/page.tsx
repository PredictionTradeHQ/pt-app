import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell/app-shell";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
  title: "Profile — PredictionTrade",
  description: "Manage your PredictionTrade account.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const displayName =
    user.user_metadata?.display_name || user.email?.split("@")[0] || "Trader";
  const createdAt = user.created_at ?? null;

  return (
    <AppShell>
      <ProfileClient
        userId={user.id}
        displayName={displayName}
        email={user.email ?? ""}
        createdAt={createdAt}
      />
    </AppShell>
  );
}

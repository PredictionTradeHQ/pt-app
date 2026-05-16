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

  // Fetch avatar from profiles. Wrapped because migration 005 may not be
  // applied yet at the moment of deploy — in that window the SELECT errors
  // and we fall through to null (initials render).
  let avatarUrl: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    avatarUrl = profile?.avatar_url ?? null;
  } catch {
    avatarUrl = null;
  }

  return (
    <AppShell>
      <ProfileClient
        userId={user.id}
        displayName={displayName}
        email={user.email ?? ""}
        createdAt={createdAt}
        avatarUrl={avatarUrl}
      />
    </AppShell>
  );
}

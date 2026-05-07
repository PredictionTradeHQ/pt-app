import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(null, { status: 401 });

    const [gameRes, demoRes, academyRes] = await Promise.all([
      supabase
        .from("game_leaderboard")
        .select("games_played, wins_count, total_profit, best_streak")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("demo_portfolios")
        .select("balance, starting_balance, positions, activity")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("academy_progress")
        .select("lesson_id, level_id, completed_at")
        .eq("user_id", user.id),
    ]);

    const recentGamesRes = await supabase
      .from("game_results")
      .select("profit_pct, position, won, duration, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0],
        created_at: user.created_at,
      },
      game: gameRes.data ?? null,
      recentGames: recentGamesRes.data ?? [],
      demo: demoRes.data ?? null,
      academy: academyRes.data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

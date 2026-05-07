import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MOCK = [
  { id: "1", display_name: "TradeMaster99", profit: 0.234, games_played: 48, best_streak: 7 },
  { id: "2", display_name: "CryptoHawk",    profit: 0.187, games_played: 35, best_streak: 5 },
  { id: "3", display_name: "AlphaWolf",     profit: 0.142, games_played: 29, best_streak: 4 },
  { id: "4", display_name: "MarketSage",    profit: 0.119, games_played: 22, best_streak: 3 },
  { id: "5", display_name: "BullRunner",    profit: 0.098, games_played: 18, best_streak: 3 },
];

export async function GET(req: NextRequest) {
  const sort   = req.nextUrl.searchParams.get("sort")   ?? "profit";
  const period = req.nextUrl.searchParams.get("period") ?? "all"; // all | daily | weekly

  try {
    const supabase = await createClient();

    if (period === "all") {
      // Use the materialized view for all-time
      const orderCol = sort === "streak" ? "best_streak" : "total_profit";
      const { data, error } = await supabase
        .from("game_leaderboard")
        .select("user_id, display_name, games_played, wins_count, best_streak, total_profit")
        .order(orderCol, { ascending: false })
        .limit(20);
      if (error) throw error;
      return NextResponse.json((data ?? []).map((r) => ({
        id: r.user_id,
        display_name: r.display_name ?? "Anonymous",
        profit: r.total_profit ?? 0,
        games_played: r.games_played ?? 0,
        best_streak: r.best_streak ?? 0,
      })));
    }

    // For daily/weekly, query game_results directly with date filter
    const now = new Date();
    let since: Date;
    if (period === "daily") {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // start of today
    } else {
      // weekly: last 7 days
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const { data: rows, error } = await supabase
      .from("game_results")
      .select("user_id, profit, won, created_at")
      .gte("created_at", since.toISOString());

    if (error) throw error;

    // Aggregate by user
    const map: Record<string, { profit: number; games: number; wins: number }> = {};
    for (const r of (rows ?? [])) {
      if (!map[r.user_id]) map[r.user_id] = { profit: 0, games: 0, wins: 0 };
      map[r.user_id].profit += r.profit ?? 0;
      map[r.user_id].games  += 1;
      map[r.user_id].wins   += r.won ? 1 : 0;
    }

    // Get display names for found users
    const userIds = Object.keys(map);
    if (userIds.length === 0) return NextResponse.json([]);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    const nameMap: Record<string, string> = {};
    for (const p of (profiles ?? [])) nameMap[p.id] = p.display_name ?? "Anonymous";

    const result = userIds
      .map((uid) => ({
        id: uid,
        display_name: nameMap[uid] ?? "Anonymous",
        profit: map[uid].profit,
        games_played: map[uid].games,
        best_streak: 0, // not calculated for period
      }))
      .sort((a, b) => sort === "streak" ? b.best_streak - a.best_streak : b.profit - a.profit)
      .slice(0, 20);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(MOCK);
  }
}

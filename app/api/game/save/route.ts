import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profit, profit_pct, position, entry_price, exit_price, duration, won } = body;

    const { error } = await supabase.from("game_results").insert([{
      user_id: user.id,
      profit,
      profit_pct,
      position,
      entry_price,
      exit_price,
      duration,
      won,
    }]);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

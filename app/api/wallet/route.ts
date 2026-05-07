import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("wallets")
    .select("balance, updated_at")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // auto-create
    const { data: inserted } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, balance: 100000 })
      .select("balance, updated_at")
      .single();
    return NextResponse.json({ balance: 100000, updated_at: inserted?.updated_at });
  }
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ balance: Number(data.balance), updated_at: data.updated_at });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { balance } = await req.json();
  if (typeof balance !== "number") return NextResponse.json({ error: "Invalid balance" }, { status: 400 });

  const { error } = await supabase
    .from("wallets")
    .upsert({ user_id: user.id, balance, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ success: true, balance });
}

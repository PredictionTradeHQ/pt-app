import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 200 });

    const { data, error } = await supabase
      .from("academy_progress")
      .select("lesson_id, level_id, completed_at")
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { lesson_id, level_id } = await req.json();
    if (!lesson_id || !level_id) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const { error } = await supabase.from("academy_progress").upsert(
      { user_id: user.id, lesson_id, level_id },
      { onConflict: "user_id,lesson_id" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { lesson_id } = await req.json();
    const { error } = await supabase
      .from("academy_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lesson_id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

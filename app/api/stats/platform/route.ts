import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Revalidate every 5 minutes — no need for real-time accuracy here
export const revalidate = 300

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("public_leaderboard")
      .select("total_predictions")

    if (error || !data) {
      return NextResponse.json({ forecasters: 0, totalPredictions: 0 })
    }

    const forecasters = data.length
    const totalPredictions = data.reduce(
      (sum, row) => sum + (row.total_predictions ?? 0),
      0
    )

    return NextResponse.json({ forecasters, totalPredictions })
  } catch {
    return NextResponse.json({ forecasters: 0, totalPredictions: 0 })
  }
}

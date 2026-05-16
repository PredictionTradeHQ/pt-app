import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Force dynamic — prevents ISR caching a 404 if Supabase is unavailable at build time
export const dynamic = "force-dynamic"

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

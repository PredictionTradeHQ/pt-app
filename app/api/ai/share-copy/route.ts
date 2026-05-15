import { NextRequest, NextResponse } from "next/server"
import {
  generateShareCopy,
  type ShareType,
  type ShareData,
  type CalledItData,
  type StreakMilestoneData,
  type LeaderboardClimbData,
} from "@/lib/share-copy"

function dispatch(type: ShareType, data: ShareData) {
  if (type === "called-it")        return generateShareCopy("called-it", data as CalledItData)
  if (type === "streak-milestone") return generateShareCopy("streak-milestone", data as StreakMilestoneData)
  return generateShareCopy("leaderboard-climb", data as LeaderboardClimbData)
}

// Phase 4g activation point:
// When ANTHROPIC_API_KEY is set in Vercel env, this route upgrades to Claude-generated copy.
// Components call this endpoint and receive the same ShareCopy shape regardless of source.
// Local template fallback ensures zero downtime and zero cost during the pre-AI phase.

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { type, data } = (await req.json()) as { type: ShareType; data: ShareData }

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 })
    }

    // ── Phase 4g: Claude API upgrade ─────────────────────────────────────────
    // Uncomment and implement when ANTHROPIC_API_KEY is available:
    //
    // if (process.env.ANTHROPIC_API_KEY) {
    //   const Anthropic = (await import("@anthropic-ai/sdk")).default
    //   const client = new Anthropic()
    //   const toneGuide = "..." // load from PT-TONE-GUIDE summary
    //   const message = await client.messages.create({
    //     model: "claude-sonnet-4-6",
    //     max_tokens: 300,
    //     system: toneGuide,
    //     messages: [{ role: "user", content: JSON.stringify({ type, data }) }],
    //   })
    //   const raw = message.content[0].type === "text" ? message.content[0].text : ""
    //   return NextResponse.json(JSON.parse(raw))
    // }
    // ─────────────────────────────────────────────────────────────────────────

    const copy = dispatch(type, data)
    return NextResponse.json(copy)
  } catch {
    return NextResponse.json({ error: "Failed to generate copy" }, { status: 500 })
  }
}

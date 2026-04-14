import { NextRequest, NextResponse } from "next/server";
import { pmsClient } from "@/lib/pms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;

    // Fetch real-time odds from PMS API
    const odds = await pmsClient.getOdds(marketId);

    if (odds) {
      return NextResponse.json(odds);
    }

    // Fallback: fetch market data and derive odds
    const market = await pmsClient.getMarket(marketId);

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    // Transform market outcomes to odds format
    const outcomes = market.outcomes?.map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      price: outcome.price,
      probability: outcome.probability,
      change24h: 0, // Not available without historical data
    })) || [];

    return NextResponse.json({
      marketId,
      outcomes,
      lastUpdate: Date.now(),
      spread: 0.02, // Default spread
    });
  } catch (error) {
    console.error("[PMS] Error fetching odds:", error);
    return NextResponse.json(
      { error: "Failed to fetch odds" },
      { status: 500 }
    );
  }
}

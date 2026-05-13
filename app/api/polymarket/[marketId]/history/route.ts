import { NextRequest, NextResponse } from "next/server";

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

export interface PriceHistory {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    console.log(`[v0] Fetching price history for market: ${marketId}`);

    // Try to fetch from Polymarket history endpoint
    // Note: Polymarket may not have a direct history endpoint, so we'll return sample data
    // In production, you'd connect to a database or data aggregation service
    const response = await fetch(`${GAMMA_API_BASE}/markets/${marketId}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    const market = await response.json();

    // Generate mock historical data based on current prices
    // In production, this would come from a real historical data source
    const now = Math.floor(Date.now() / 1000);
    const history: PriceHistory[] = [];

    // Generate 24 data points (one per hour for 24 hours)
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - i * 3600; // 1 hour intervals
      
      // Create some realistic-looking price variations
      const baseYes = parseFloat(market.outcomePrices?.[0] || "0.5");
      const baseNo = parseFloat(market.outcomePrices?.[1] || "0.5");
      
      // Add some random walk-like variation
      const variation = Math.sin(i / 5) * 0.05 + (Math.random() - 0.5) * 0.02;
      const yesPrice = Math.max(0.01, Math.min(0.99, baseYes + variation));
      const noPrice = Math.max(0.01, Math.min(0.99, baseNo - variation));

      history.push({
        timestamp,
        yesPrice,
        noPrice,
        volume: market.volumeNum || 0,
      });
    }

    return NextResponse.json({
      marketId,
      history,
      totalVolume: market.volumeNum || 0,
    });
  } catch (error) {
    console.error("[v0] Error fetching market history:", error);
    return NextResponse.json(
      { error: "Failed to fetch market history" },
      { status: 500 }
    );
  }
}

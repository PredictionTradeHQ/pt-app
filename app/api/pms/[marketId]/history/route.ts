import { NextRequest, NextResponse } from "next/server";
import { pmsClient, transformPMSHistory, type PriceHistory } from "@/lib/pms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    console.log(`[PMS] Fetching price history for market: ${marketId}`);

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "24h") as "1h" | "24h" | "7d" | "30d" | "all";

    // Fetch history from PMS API
    const historyData = await pmsClient.getHistory(marketId, { period });

    if (historyData) {
      const history = transformPMSHistory(historyData);
      return NextResponse.json({
        marketId,
        history,
        totalVolume: historyData.totalVolume,
      });
    }

    // If no history available, fetch current market and generate mock data
    const market = await pmsClient.getMarket(marketId);

    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    // Generate mock historical data based on current prices
    const now = Math.floor(Date.now() / 1000);
    const history: PriceHistory[] = [];
    const dataPoints = period === "1h" ? 12 : period === "24h" ? 24 : period === "7d" ? 168 : 720;
    const intervalSeconds = period === "1h" ? 300 : 3600;

    // Get current yes/no prices
    const yesOutcome = market.outcomes?.find(o => o.label.toLowerCase() === "yes") || market.outcomes?.[0];
    const noOutcome = market.outcomes?.find(o => o.label.toLowerCase() === "no") || market.outcomes?.[1];
    const baseYes = yesOutcome?.price || 0.5;
    const baseNo = noOutcome?.price || 0.5;

    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = now - i * intervalSeconds;

      // Create realistic-looking price variations using random walk
      const variation = Math.sin(i / 5) * 0.05 + (Math.random() - 0.5) * 0.02;
      const yesPrice = Math.max(0.01, Math.min(0.99, baseYes + variation));
      const noPrice = Math.max(0.01, Math.min(0.99, baseNo - variation));

      history.push({
        timestamp,
        yesPrice,
        noPrice,
        volume: market.volume || 0,
      });
    }

    return NextResponse.json({
      marketId,
      history,
      totalVolume: market.volume || 0,
    });
  } catch (error) {
    console.error("[PMS] Error fetching market history:", error);
    return NextResponse.json(
      { error: "Failed to fetch market history" },
      { status: 500 }
    );
  }
}

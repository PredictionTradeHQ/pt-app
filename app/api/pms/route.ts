import { NextResponse } from "next/server";
import {
  pmsClient,
  transformPMSMarket,
  CATEGORIES,
  type TransformedMarket,
} from "@/lib/pms";

// Re-export types for components to use
export type { TransformedMarket } from "@/lib/pms";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "volume";
  const marketId = searchParams.get("id");
  const fetchTags = searchParams.get("tags") === "true";

  try {
    // If requesting tags/categories
    if (fetchTags) {
      const categories = await pmsClient.getCategories();
      return NextResponse.json({
        categories: CATEGORIES,
        tags: categories.length > 0 ? categories : CATEGORIES,
      });
    }

    // If requesting a single market by ID
    if (marketId) {
      const market = await pmsClient.getMarket(marketId);
      if (!market) {
        return NextResponse.json(
          { error: "Market not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(transformPMSMarket(market));
    }

    // Map sortBy to PMS API format
    const sortMapping: Record<string, "volume" | "volume24h" | "liquidity" | "newest" | "ending"> = {
      volume: "volume",
      volume24hr: "volume24h",
      liquidity: "liquidity",
      newest: "newest",
      ending: "ending",
    };

    // Fetch markets list
    const result = await pmsClient.getMarkets({
      limit,
      offset,
      category: category || undefined,
      status: "open",
      sortBy: sortMapping[sortBy] || "volume",
      search: search || undefined,
    });

    // Transform markets to match existing UI interface
    const markets: TransformedMarket[] = result.markets.map(transformPMSMarket);

    // Apply additional client-side search filter if needed
    let filteredMarkets = markets;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMarkets = markets.filter(
        (m) =>
          m.question?.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower)
      );
    }

    // Extract unique categories from returned markets
    const categoriesFound = [
      ...new Set(filteredMarkets.map((m) => m.category).filter(Boolean)),
    ] as string[];

    return NextResponse.json({
      markets: filteredMarkets,
      categories: CATEGORIES,
      categoriesFound,
      total: filteredMarkets.length,
      hasMore: result.hasMore,
      offset,
    });
  } catch (error) {
    console.error("[PMS API] Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}

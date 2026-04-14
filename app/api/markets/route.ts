import { NextRequest, NextResponse } from "next/server";

interface CustomMarket {
  id: string;
  title: string;
  platform?: string;
  outcome?: string;
  url?: string;
  category?: string;
}

const FEATURED_MARKETS_ENV_KEY = "FEATURED_MARKETS_JSON";
const REQUIRED_MARKETS_COUNT = 10;

function parseConfiguredMarkets(): CustomMarket[] {
  const rawMarkets = process.env[FEATURED_MARKETS_ENV_KEY];

  if (!rawMarkets) {
    throw new Error(`Missing ${FEATURED_MARKETS_ENV_KEY}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMarkets);
  } catch {
    throw new Error(`${FEATURED_MARKETS_ENV_KEY} is not valid JSON`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`${FEATURED_MARKETS_ENV_KEY} must be an array`);
  }

  const markets = parsed.map((item, index) => {
    const record = item as Record<string, unknown>;
    const title = String(record.title ?? "").trim();
    if (!title) {
      throw new Error(`Market at index ${index} is missing title`);
    }

    return {
      id: String(record.id ?? index + 1),
      title,
      platform: record.platform ? String(record.platform) : undefined,
      outcome: record.outcome ? String(record.outcome) : undefined,
      url: record.url ? String(record.url) : undefined,
      category: record.category ? String(record.category).toLowerCase() : undefined,
    };
  });

  if (markets.length !== REQUIRED_MARKETS_COUNT) {
    throw new Error(`Expected ${REQUIRED_MARKETS_COUNT} markets, got ${markets.length}`);
  }

  return markets;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const category = searchParams.get("category")?.toLowerCase();
  const search = searchParams.get("search")?.toLowerCase();

  try {
    let markets = parseConfiguredMarkets();

    if (category && category !== "all") {
      markets = markets.filter((market) => (market.category ?? "world") === category);
    }

    if (search) {
      markets = markets.filter((market) =>
        [market.title, market.platform, market.outcome, market.url]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    const paginated = markets.slice(offset, offset + limit);

    return NextResponse.json(
      {
        data: paginated,
        meta: {
          total: markets.length,
          limit,
          offset,
          hasMore: offset + limit < markets.length,
          source: "custom-config",
          generatedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[markets api] Invalid market configuration:", error);
    return NextResponse.json(
      {
        error: "Invalid market configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

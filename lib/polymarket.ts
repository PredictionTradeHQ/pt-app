// Polymarket API client and utilities

export interface PriceHistory {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
}

export interface MarketHistory {
  marketId: string;
  priceHistory: PriceHistory[];
  totalVolume: number;
  averagePrice: number;
}

export interface MarketDetail {
  id: string;
  question: string;
  slug: string;
  image: string | null;
  description: string | null;
  outcomes: string[];
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endDate: string | null;
  createdAt: string | null;
  category: string | null;
  volume24hr: number;
}

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

export async function fetchMarkets(
  params?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    category?: string;
  }
): Promise<{ markets: any[]; categories: string[] }> {
  const searchParams = new URLSearchParams({
    limit: String(params?.limit || 100),
    offset: String(params?.offset || 0),
  });

  if (params?.sortBy === "volume") {
    searchParams.append("order", "volume24hr");
  } else if (params?.sortBy === "liquidity") {
    searchParams.append("order", "liquidity");
  } else if (params?.sortBy === "newest") {
    searchParams.append("order", "createdAt");
  } else if (params?.sortBy === "ending") {
    searchParams.append("order", "endDate");
  }

  try {
    const response = await fetch(
      `${GAMMA_API_BASE}/markets?${searchParams.toString()}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error("Failed to fetch markets");

    const markets = await response.json();
    const categories = [...new Set(markets.map((m: any) => m.category).filter(Boolean))];

    return { markets, categories };
  } catch (error) {
    console.error("[v0] Error fetching markets:", error);
    throw error;
  }
}

export async function fetchMarketById(id: string): Promise<MarketDetail | null> {
  try {
    const response = await fetch(`${GAMMA_API_BASE}/markets/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const market = await response.json();
    return market;
  } catch (error) {
    console.error("[v0] Error fetching market:", error);
    return null;
  }
}

export async function fetchMarketHistory(
  id: string
): Promise<PriceHistory[]> {
  try {
    const response = await fetch(`${GAMMA_API_BASE}/markets/${id}/history`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error("[v0] Error fetching market history:", error);
    return [];
  }
}

export function formatPrice(price: number): string {
  return (price * 100).toFixed(1);
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "No end date";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Ended";
  if (diffDays === 0) return "Ends today";
  if (diffDays === 1) return "Ends tomorrow";
  if (diffDays < 7) return `${diffDays} days left`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateFull(dateString: string | null): string {
  if (!dateString) return "No end date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

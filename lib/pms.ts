// PMS (Prediction Markets Solutions) API client and utilities
// Documentation: https://www.predictionmarkets.market/docs

const PMS_API_BASE = process.env.PMS_API_URL || "https://api.predictionmarkets.market/v1";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PMSMarket {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  image: string | null;
  outcomes: PMSOutcome[];
  status: "open" | "closed" | "resolved";
  closingDate: string | null;
  createdAt: string;
  category: string | null;
  tags: string[];
  volume: number;
  volume24h: number;
  liquidity: number;
  liquidityPool: string;
  featured: boolean;
  tradersCount: number;
  resolutionSource?: string;
}

export interface PMSOutcome {
  id: string;
  label: string;
  price: number;
  probability: number;
}

export interface PMSPriceHistory {
  timestamp: number;
  prices: Record<string, number>;
  volume: number;
}

export interface PMSMarketHistory {
  marketId: string;
  history: PMSPriceHistory[];
  totalVolume: number;
}

export interface PMSOdds {
  marketId: string;
  outcomes: {
    id: string;
    label: string;
    price: number;
    probability: number;
    change24h: number;
  }[];
  lastUpdate: number;
  spread: number;
}

// Transformed market for UI consistency
export interface TransformedMarket {
  id: string;
  question: string | null;
  slug: string | null;
  image: string | null;
  icon: string | null;
  description: string | null;
  outcomes: string[];
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endDate: string | null;
  category: string | null;
  isNew: boolean;
  featured: boolean;
  volume24hr: number;
  assetIds: string[];
  conditionId: string | null;
  tradersCount: number;
}

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

// ─── API Client ──────────────────────────────────────────────────────────────

class PMSClient {
  private apiKey: string | null;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PMS_API_KEY || null;
    this.baseUrl = PMS_API_BASE;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PMS API Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // Fetch all markets with optional filters
  async getMarkets(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: "open" | "closed" | "resolved";
    sortBy?: "volume" | "volume24h" | "liquidity" | "newest" | "ending";
    search?: string;
    featured?: boolean;
  }): Promise<{ markets: PMSMarket[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    if (params?.category && params.category !== "all") {
      searchParams.set("category", params.category);
    }
    if (params?.status) searchParams.set("status", params.status);
    if (params?.sortBy) searchParams.set("sort", params.sortBy);
    if (params?.search) searchParams.set("q", params.search);
    if (params?.featured) searchParams.set("featured", "true");

    const query = searchParams.toString();
    const endpoint = `/markets${query ? `?${query}` : ""}`;

    try {
      return await this.request<{ markets: PMSMarket[]; total: number; hasMore: boolean }>(endpoint, {
        next: { revalidate: 60 },
      });
    } catch (error) {
      console.error("[PMS] Error fetching markets:", error);
      // Return empty response on error
      return { markets: [], total: 0, hasMore: false };
    }
  }

  // Fetch a single market by ID
  async getMarket(id: string): Promise<PMSMarket | null> {
    try {
      return await this.request<PMSMarket>(`/markets/${id}`, {
        next: { revalidate: 30 },
      });
    } catch (error) {
      console.error("[PMS] Error fetching market:", error);
      return null;
    }
  }

  // Fetch real-time odds for a market
  async getOdds(marketId: string): Promise<PMSOdds | null> {
    try {
      return await this.request<PMSOdds>(`/markets/${marketId}/odds`, {
        next: { revalidate: 5 },
      });
    } catch (error) {
      console.error("[PMS] Error fetching odds:", error);
      return null;
    }
  }

  // Fetch price history for a market
  async getHistory(
    marketId: string,
    params?: { period?: "1h" | "24h" | "7d" | "30d" | "all" }
  ): Promise<PMSMarketHistory | null> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.period) searchParams.set("period", params.period);
      
      const query = searchParams.toString();
      const endpoint = `/markets/${marketId}/history${query ? `?${query}` : ""}`;
      
      return await this.request<PMSMarketHistory>(endpoint, {
        next: { revalidate: 300 },
      });
    } catch (error) {
      console.error("[PMS] Error fetching history:", error);
      return null;
    }
  }

  // Fetch available categories
  async getCategories(): Promise<{ id: string; label: string; slug: string; count: number }[]> {
    try {
      return await this.request<{ id: string; label: string; slug: string; count: number }[]>(
        "/categories",
        { next: { revalidate: 300 } }
      );
    } catch (error) {
      console.error("[PMS] Error fetching categories:", error);
      return [];
    }
  }
}

// ─── Singleton Instance ──────────────────────────────────────────────────────

export const pmsClient = new PMSClient();

// ─── Transform Functions ─────────────────────────────────────────────────────

export function transformPMSMarket(market: PMSMarket): TransformedMarket {
  // Extract YES/NO prices from outcomes
  let yesPrice = 0.5;
  let noPrice = 0.5;
  const outcomeLabels: string[] = [];
  const assetIds: string[] = [];

  if (market.outcomes && market.outcomes.length >= 2) {
    // Find YES outcome (usually first or labeled "Yes")
    const yesOutcome = market.outcomes.find(
      (o) => o.label.toLowerCase() === "yes"
    ) || market.outcomes[0];
    
    // Find NO outcome (usually second or labeled "No")
    const noOutcome = market.outcomes.find(
      (o) => o.label.toLowerCase() === "no"
    ) || market.outcomes[1];

    if (yesOutcome) {
      yesPrice = yesOutcome.price || yesOutcome.probability || 0.5;
      outcomeLabels.push(yesOutcome.label);
      assetIds.push(yesOutcome.id);
    }
    
    if (noOutcome) {
      noPrice = noOutcome.price || noOutcome.probability || 0.5;
      outcomeLabels.push(noOutcome.label);
      assetIds.push(noOutcome.id);
    }
  }

  // Ensure prices add up to ~1 (allowing for spread)
  if (yesPrice + noPrice > 1.1) {
    const total = yesPrice + noPrice;
    yesPrice = yesPrice / total;
    noPrice = noPrice / total;
  }

  // Determine if market is new (created within last 7 days)
  const isNew = market.createdAt
    ? Date.now() - new Date(market.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  // Classify category if not provided
  const category = market.category || classifyMarketCategory(market);

  return {
    id: market.id,
    question: market.title,
    slug: market.slug,
    image: market.image,
    icon: market.image,
    description: market.description,
    outcomes: outcomeLabels.length > 0 ? outcomeLabels : ["Yes", "No"],
    yesPrice,
    noPrice,
    volume: market.volume || 0,
    liquidity: market.liquidity || 0,
    endDate: market.closingDate,
    category,
    isNew,
    featured: market.featured || false,
    volume24hr: market.volume24h || 0,
    assetIds,
    conditionId: market.id,
    tradersCount: market.tradersCount || 0,
  };
}

export function transformPMSHistory(history: PMSMarketHistory): PriceHistory[] {
  if (!history.history || history.history.length === 0) {
    return [];
  }

  return history.history.map((h) => {
    const prices = h.prices || {};
    const priceValues = Object.values(prices);
    
    // Assume first price is YES, second is NO
    const yesPrice = priceValues[0] || 0.5;
    const noPrice = priceValues[1] || 1 - yesPrice;

    return {
      timestamp: h.timestamp,
      yesPrice,
      noPrice,
      volume: h.volume || 0,
    };
  });
}

// ─── Category Classification ─────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  politics: [
    "trump", "biden", "election", "president", "congress", "senate", "house",
    "republican", "democrat", "gop", "vote", "ballot", "governor", "mayor",
    "political", "policy", "government", "white house", "supreme court",
    "impeach", "legislation", "electoral", "primary", "candidate", "poll",
    "desantis", "newsom", "obama", "clinton", "pelosi", "mcconnell", "rfk",
    "kennedy", "haley", "pence", "vance", "kamala", "harris", "gavin"
  ],
  crypto: [
    "bitcoin", "btc", "ethereum", "eth", "crypto", "blockchain", "token",
    "solana", "sol", "dogecoin", "doge", "xrp", "ripple", "cardano", "ada",
    "defi", "nft", "web3", "binance", "coinbase", "ftx", "exchange", "mining",
    "halving", "stablecoin", "usdt", "usdc", "altcoin", "memecoin", "shiba"
  ],
  sports: [
    "nfl", "nba", "mlb", "nhl", "soccer", "football", "basketball", "baseball",
    "hockey", "tennis", "golf", "mma", "ufc", "boxing", "f1", "formula",
    "olympics", "world cup", "super bowl", "playoffs", "championship",
    "mvp", "draft", "trade", "lebron", "messi", "ronaldo", "mahomes"
  ],
  entertainment: [
    "movie", "film", "oscar", "grammy", "emmy", "golden globe", "academy",
    "netflix", "disney", "streaming", "album", "song", "artist", "celebrity",
    "taylor swift", "beyonce", "drake", "kardashian", "kanye", "ye",
    "hollywood", "box office", "marvel", "dc", "star wars"
  ],
  business: [
    "stock", "market", "s&p", "nasdaq", "dow jones", "fed", "interest rate",
    "inflation", "gdp", "economy", "recession", "earnings", "ipo", "merger",
    "acquisition", "ceo", "apple", "google", "amazon", "microsoft", "meta",
    "tesla", "nvidia", "openai", "startup", "venture", "investment"
  ],
  tech: [
    "ai", "artificial intelligence", "chatgpt", "gpt", "llm", "machine learning",
    "openai", "anthropic", "google ai", "gemini", "claude", "tech", "silicon valley",
    "software", "hardware", "chip", "semiconductor", "intel", "amd", "nvidia gpu",
    "iphone", "android", "app", "social media", "twitter", "x.com", "elon musk"
  ],
  science: [
    "nasa", "space", "mars", "moon", "rocket", "satellite", "asteroid",
    "climate", "global warming", "carbon", "renewable", "solar", "wind energy",
    "research", "study", "scientific", "discovery", "breakthrough",
    "vaccine", "virus", "pandemic", "covid", "health", "medical", "fda"
  ],
  world: [
    "ukraine", "russia", "china", "taiwan", "nato", "eu", "european",
    "war", "conflict", "military", "troops", "invasion", "sanctions",
    "nuclear", "missile", "defense", "diplomat", "treaty", "alliance",
    "middle east", "israel", "gaza", "iran", "saudi", "oil", "opec"
  ],
};

function classifyMarketCategory(market: PMSMarket): string {
  const textToSearch = [
    market.title || "",
    market.description || "",
    market.slug || "",
    ...(market.tags || []),
  ].join(" ").toLowerCase();

  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (textToSearch.includes(keyword.toLowerCase())) {
        scores[category] += keyword.length > 5 ? 2 : 1;
      }
    }
  }

  let bestCategory = "world";
  let bestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

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

// ─── Predefined Categories ───────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "all", label: "All", slug: "all" },
  { id: "politics", label: "Politics", slug: "politics" },
  { id: "sports", label: "Sports", slug: "sports" },
  { id: "crypto", label: "Crypto", slug: "crypto" },
  { id: "entertainment", label: "Pop Culture", slug: "entertainment" },
  { id: "business", label: "Business", slug: "business" },
  { id: "science", label: "Science", slug: "science" },
  { id: "tech", label: "Tech", slug: "tech" },
  { id: "world", label: "World", slug: "world" },
];

// ─── WebSocket Configuration ─────────────────────────────────────────────────

export const PMS_WS_URL = process.env.PMS_WS_URL || "wss://ws.predictionmarkets.market/v1/stream";

export interface PMSWebSocketMessage {
  type: "price_update" | "trade" | "book" | "heartbeat";
  marketId: string;
  data: {
    outcomeId?: string;
    price?: number;
    probability?: number;
    bestBid?: number;
    bestAsk?: number;
    spread?: number;
    size?: number;
    side?: "buy" | "sell";
    timestamp: number;
  };
}

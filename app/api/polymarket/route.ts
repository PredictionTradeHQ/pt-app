import { NextResponse } from "next/server";

interface CustomConfiguredMarket {
  id: string;
  title: string;
  platform?: string;
  outcome?: string;
  url?: string;
  category?: string;
}

const FEATURED_MARKETS_ENV_KEY = "FEATURED_MARKETS_JSON";
const REQUIRED_MARKETS_COUNT = 10;

export interface PolymarketMarket {
  id: string;
  question: string | null;
  conditionId: string;
  slug: string | null;
  image: string | null;
  icon: string | null;
  description: string | null;
  outcomes: string | null;
  outcomePrices: string | null;
  volume: string | null;
  volumeNum: number | null;
  liquidity: string | null;
  liquidityNum: number | null;
  endDate: string | null;
  startDate: string | null;
  category: string | null;
  active: boolean | null;
  closed: boolean | null;
  new: boolean | null;
  featured: boolean | null;
  volume24hr: number | null;
  // Token IDs for WebSocket subscriptions
  clobTokenIds: string | null;
}

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
  // Asset IDs for WebSocket subscriptions (YES token, NO token)
  assetIds: string[];
  conditionId: string | null;
}

function transformMarket(market: PolymarketMarket): TransformedMarket {
  let yesPrice = 0.5;
  let noPrice = 0.5;

  if (market.outcomePrices) {
    try {
      const prices = JSON.parse(market.outcomePrices);
      if (prices.length >= 2) {
        yesPrice = parseFloat(prices[0]) || 0.5;
        noPrice = parseFloat(prices[1]) || 0.5;
      }
    } catch {
      // Keep defaults
    }
  }

  let outcomes = ["Yes", "No"];
  if (market.outcomes) {
    try {
      outcomes = JSON.parse(market.outcomes);
    } catch {
      // Keep defaults
    }
  }

  // Parse asset IDs (CLOB token IDs) for WebSocket subscriptions
  let assetIds: string[] = [];
  if (market.clobTokenIds) {
    try {
      assetIds = JSON.parse(market.clobTokenIds);
    } catch {
      // Keep empty
    }
  }

  // Use intelligent category classification
  const classifiedCategory = classifyMarket(market);

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    image: market.image,
    icon: market.icon,
    description: market.description,
    outcomes,
    yesPrice,
    noPrice,
    volume: market.volumeNum || 0,
    liquidity: market.liquidityNum || 0,
    endDate: market.endDate,
    category: classifiedCategory,
    isNew: market.new || false,
    featured: market.featured || false,
    volume24hr: market.volume24hr || 0,
    assetIds,
    conditionId: market.conditionId || null,
  };
}

function parseConfiguredMarkets(): CustomConfiguredMarket[] | null {
  const raw = process.env[FEATURED_MARKETS_ENV_KEY];
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
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

function customMarketToTransformedMarket(market: CustomConfiguredMarket): TransformedMarket {
  const primaryOutcome = market.outcome ?? "Yes";
  const secondaryOutcome = primaryOutcome.toLowerCase() === "yes" ? "No" : "Other";

  return {
    id: market.id,
    question: market.title,
    slug: null,
    image: null,
    icon: null,
    description: market.platform ? `Source: ${market.platform}${market.url ? ` (${market.url})` : ""}` : null,
    outcomes: [primaryOutcome, secondaryOutcome],
    yesPrice: 0.5,
    noPrice: 0.5,
    volume: 0,
    liquidity: 0,
    endDate: null,
    category: market.category || "world",
    isNew: false,
    featured: true,
    volume24hr: 0,
    assetIds: [],
    conditionId: null,
  };
}

// Predefined categories matching Polymarket
const CATEGORIES = [
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

// Keywords for intelligent category classification
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
    "halving", "stablecoin", "usdt", "usdc", "altcoin", "memecoin", "shiba",
    "polygon", "matic", "avalanche", "avax", "arbitrum", "optimism", "layer 2",
    "spot etf", "bitcoin etf", "crypto etf", "satoshi", "whale"
  ],
  sports: [
    "nfl", "nba", "mlb", "nhl", "soccer", "football", "basketball", "baseball",
    "hockey", "tennis", "golf", "mma", "ufc", "boxing", "f1", "formula",
    "olympics", "world cup", "super bowl", "playoffs", "championship",
    "mvp", "draft", "trade", "lebron", "messi", "ronaldo", "mahomes",
    "lakers", "celtics", "yankees", "cowboys", "chiefs", "warriors",
    "premier league", "la liga", "champions league", "wimbledon", "masters",
    "march madness", "ncaa", "college football"
  ],
  entertainment: [
    "movie", "film", "oscar", "grammy", "emmy", "golden globe", "academy",
    "netflix", "disney", "streaming", "album", "song", "artist", "celebrity",
    "taylor swift", "beyonce", "drake", "kardashian", "kanye", "ye",
    "hollywood", "box office", "marvel", "dc", "star wars", "game of thrones",
    "stranger things", "squid game", "reality tv", "bachelor", "survivor",
    "american idol", "snl", "late night", "podcast", "youtube", "tiktok",
    "influencer", "viral", "trending", "billboard", "grammy", "mtv"
  ],
  business: [
    "stock", "market", "s&p", "nasdaq", "dow jones", "fed", "interest rate",
    "inflation", "gdp", "economy", "recession", "earnings", "ipo", "merger",
    "acquisition", "ceo", "apple", "google", "amazon", "microsoft", "meta",
    "tesla", "nvidia", "openai", "startup", "venture", "investment",
    "wall street", "hedge fund", "retail", "sales", "revenue", "profit",
    "layoff", "hire", "unemployment", "jobs report", "fomc", "powell",
    "yellen", "treasury", "bond", "yield"
  ],
  tech: [
    "ai", "artificial intelligence", "chatgpt", "gpt", "llm", "machine learning",
    "openai", "anthropic", "google ai", "gemini", "claude", "tech", "silicon valley",
    "software", "hardware", "chip", "semiconductor", "intel", "amd", "nvidia gpu",
    "iphone", "android", "app", "social media", "twitter", "x.com", "elon musk",
    "zuckerberg", "tim cook", "sundar", "satya", "sam altman", "robot",
    "automation", "spacex", "neuralink", "self-driving", "autonomous", "vr", "ar",
    "metaverse", "quantum", "cybersecurity", "hack", "data breach"
  ],
  science: [
    "nasa", "space", "mars", "moon", "rocket", "satellite", "asteroid",
    "climate", "global warming", "carbon", "renewable", "solar", "wind energy",
    "research", "study", "scientific", "discovery", "breakthrough",
    "vaccine", "virus", "pandemic", "covid", "health", "medical", "fda",
    "drug", "treatment", "cure", "cancer", "disease", "hospital",
    "biology", "physics", "chemistry", "experiment", "laboratory"
  ],
  world: [
    "ukraine", "russia", "china", "taiwan", "nato", "eu", "european",
    "war", "conflict", "military", "troops", "invasion", "sanctions",
    "nuclear", "missile", "defense", "diplomat", "treaty", "alliance",
    "middle east", "israel", "gaza", "iran", "saudi", "oil", "opec",
    "india", "pakistan", "north korea", "kim jong", "xi jinping", "putin",
    "zelensky", "macron", "uk", "brexit", "immigration", "border", "refugee"
  ],
};

// Function to classify market based on keywords
function classifyMarket(market: PolymarketMarket): string {
  // If category already exists and is valid, use it
  if (market.category) {
    const normalizedCategory = market.category.toLowerCase();
    const validCategories = CATEGORIES.map(c => c.id);
    if (validCategories.includes(normalizedCategory)) {
      return normalizedCategory;
    }
    // Map some common category variations
    if (normalizedCategory.includes("politic")) return "politics";
    if (normalizedCategory.includes("sport")) return "sports";
    if (normalizedCategory.includes("crypt") || normalizedCategory.includes("bitcoin")) return "crypto";
    if (normalizedCategory.includes("entertain") || normalizedCategory.includes("pop")) return "entertainment";
    if (normalizedCategory.includes("business") || normalizedCategory.includes("finance") || normalizedCategory.includes("econ")) return "business";
    if (normalizedCategory.includes("tech") || normalizedCategory.includes("ai")) return "tech";
    if (normalizedCategory.includes("science") || normalizedCategory.includes("health")) return "science";
  }

  // Build text to search from question and description
  const textToSearch = [
    market.question || "",
    market.description || "",
    market.slug || "",
  ].join(" ").toLowerCase();

  // Score each category based on keyword matches
  const scores: Record<string, number> = {};
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (textToSearch.includes(keyword.toLowerCase())) {
        // Give more weight to exact matches and longer keywords
        scores[category] += keyword.length > 5 ? 2 : 1;
      }
    }
  }

  // Find category with highest score
  let bestCategory = "world"; // Default fallback
  let bestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "100";
  const offset = searchParams.get("offset") || "0";
  const closed = searchParams.get("closed") || "false";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "volume";
  const marketId = searchParams.get("id");
  const fetchTags = searchParams.get("tags") === "true";

  try {
    const configuredMarkets = parseConfiguredMarkets();

    if (configuredMarkets) {
      let markets = configuredMarkets.map(customMarketToTransformedMarket);

      if (marketId) {
        const market = markets.find((m) => m.id === marketId);
        if (!market) {
          return NextResponse.json({ error: "Market not found" }, { status: 404 });
        }
        return NextResponse.json(market);
      }

      if (fetchTags) {
        return NextResponse.json({
          categories: CATEGORIES,
          tags: [],
        });
      }

      if (category && category !== "all") {
        markets = markets.filter((m) => m.category === category.toLowerCase());
      }

      if (search) {
        const searchLower = search.toLowerCase();
        markets = markets.filter(
          (m) =>
            m.question?.toLowerCase().includes(searchLower) ||
            m.description?.toLowerCase().includes(searchLower)
        );
      }

      const offsetNum = parseInt(offset, 10) || 0;
      const limitNum = parseInt(limit, 10) || 10;
      const paginatedMarkets = markets.slice(offsetNum, offsetNum + limitNum);

      return NextResponse.json({
        markets: paginatedMarkets,
        categories: CATEGORIES,
        categoriesFound: [...new Set(markets.map((m) => m.category).filter(Boolean))],
        total: markets.length,
        hasMore: offsetNum + limitNum < markets.length,
        offset: offsetNum,
      });
    }

    // If requesting tags/categories
    if (fetchTags) {
      const tagsUrl = "https://gamma-api.polymarket.com/tags?_limit=50";
      const tagsRes = await fetch(tagsUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      });
      
      if (tagsRes.ok) {
        const tags = await tagsRes.json();
        return NextResponse.json({ 
          categories: CATEGORIES,
          tags: tags.map((t: any) => ({ id: t.id, label: t.label, slug: t.slug }))
        });
      }
      return NextResponse.json({ categories: CATEGORIES, tags: [] });
    }

    // If requesting a single market by ID
    if (marketId) {
      const url = `https://gamma-api.polymarket.com/markets/${marketId}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      });

      if (!response.ok) {
        throw new Error(`Market not found: ${response.status}`);
      }

      const market: PolymarketMarket = await response.json();
      return NextResponse.json(transformMarket(market));
    }

    // Fetch markets list with better parameters
    const url = new URL("https://gamma-api.polymarket.com/markets");
    url.searchParams.set("limit", limit);
    url.searchParams.set("offset", offset);
    url.searchParams.set("closed", closed);
    url.searchParams.set("active", "true");

    // Set ordering based on sortBy
    switch (sortBy) {
      case "newest":
        url.searchParams.set("order", "startDate");
        url.searchParams.set("ascending", "false");
        break;
      case "ending":
        url.searchParams.set("order", "endDate");
        url.searchParams.set("ascending", "true");
        break;
      case "liquidity":
        url.searchParams.set("order", "liquidityNum");
        url.searchParams.set("ascending", "false");
        break;
      case "volume24hr":
        url.searchParams.set("order", "volume24hr");
        url.searchParams.set("ascending", "false");
        break;
      default: // volume
        url.searchParams.set("order", "volumeNum");
        url.searchParams.set("ascending", "false");
    }

    // Add tag/category filter if specified
    if (category && category !== "all") {
      // Try to match category to a tag_slug
      url.searchParams.set("tag_slug", category.toLowerCase());
    }

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data: PolymarketMarket[] = await response.json();

    // Filter and transform the data
    let markets = data
      .filter((market) => market.question && market.active && !market.closed)
      .map(transformMarket);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      markets = markets.filter(
        (m) =>
          m.question?.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower)
      );
    }

    // Extract unique categories from returned markets
    const categoriesFound = [
      ...new Set(data.map((m) => m.category).filter(Boolean)),
    ] as string[];

    return NextResponse.json({
      markets,
      categories: CATEGORIES,
      categoriesFound,
      total: markets.length,
      hasMore: data.length === parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching Polymarket data:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}

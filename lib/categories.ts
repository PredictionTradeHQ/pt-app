export interface PTCategory {
  id: string
  label: string
  emoji: string
  color: string
  tw: {
    bg: string
    text: string
    border: string
  }
  keywords: string[]
}

export const PT_CATEGORIES: PTCategory[] = [
  {
    id: "ai-tech",
    label: "AI & Tech",
    emoji: "🤖",
    color: "#6366F1",
    tw: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" },
    keywords: [
      "ai", "tech", "technology", "nvidia", "openai", "apple", "google", "microsoft",
      "meta", "software", "artificial intelligence", "gpt", "model", "chip",
      "semiconductor", "anthropic", "gemini", "llm", "claude", "robotics", "automation",
    ],
  },
  {
    id: "crypto",
    label: "Crypto",
    emoji: "₿",
    color: "#F59E0B",
    tw: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    keywords: [
      "crypto", "bitcoin", "ethereum", "defi", "blockchain", "btc", "eth",
      "solana", "nft", "web3", "token", "wallet", "stablecoin", "altcoin",
      "mining", "dex", "celsius", "binance", "coinbase", "ripple", "xrp",
    ],
  },
  {
    id: "sports",
    label: "Sports",
    emoji: "⚽",
    color: "#10B981",
    tw: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    keywords: [
      "sports", "nba", "nfl", "soccer", "football", "basketball", "tennis",
      "mlb", "nhl", "formula", "f1", "ufc", "olympics", "championship",
      "league", "cup", "match", "player", "team", "fifa", "uefa",
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    color: "#8B5CF6",
    tw: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30" },
    keywords: [
      "gaming", "esports", "gta", "playstation", "xbox", "nintendo", "steam",
      "twitch", "dota", "valorant", "fortnite", "cs2", "minecraft", "console",
      "pc gaming", "streamer", "riot", "activision", "blizzard", "epic games",
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    emoji: "🎬",
    color: "#EC4899",
    tw: { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/30" },
    keywords: [
      "entertainment", "oscars", "grammys", "emmy", "box office", "movie", "film",
      "tv", "netflix", "disney", "spotify", "music", "celebrity", "awards",
      "hollywood", "series", "show", "album", "actor", "singer", "taylor swift",
    ],
  },
  {
    id: "internet-culture",
    label: "Internet",
    emoji: "🌐",
    color: "#06B6D4",
    tw: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
    keywords: [
      "internet", "social media", "youtube", "tiktok", "twitter", "instagram",
      "reddit", "meme", "viral", "creator", "influencer", "mrbeast", "podcast",
      "substack", "subscribers", "followers", "views",
    ],
  },
  {
    id: "global-news",
    label: "Global News",
    emoji: "📰",
    color: "#94A3B8",
    tw: { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },
    keywords: [
      "politics", "election", "president", "government", "economy", "fed",
      "inflation", "geopolitics", "china", "russia", "nato", "policy",
      "war", "trade", "tariff", "recession", "gdp", "interest rate",
    ],
  },
]

export const CATEGORY_TABS = [
  { id: "all", label: "All", emoji: "✦" },
  ...PT_CATEGORIES.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji })),
]

export function detectPTCategory(title: string, polymarketCategory?: string | null): PTCategory {
  const text = ((title ?? "") + " " + (polymarketCategory ?? "")).toLowerCase()
  for (const cat of PT_CATEGORIES) {
    if (cat.keywords.some((kw) => text.includes(kw))) {
      return cat
    }
  }
  return PT_CATEGORIES[PT_CATEGORIES.length - 1]
}

export function getCategoryById(id: string): PTCategory {
  return PT_CATEGORIES.find((c) => c.id === id) ?? PT_CATEGORIES[PT_CATEGORIES.length - 1]
}

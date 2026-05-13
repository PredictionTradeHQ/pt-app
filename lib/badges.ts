export type BadgeRarity = "common" | "uncommon" | "rare" | "legendary"

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  rarity: BadgeRarity
  category?: string // pt category id for category-specific badges
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  first_prediction: {
    id: "first_prediction",
    name: "First Blood",
    description: "Made your first prediction",
    emoji: "🩸",
    rarity: "common",
  },
  streak_3: {
    id: "streak_3",
    name: "On a Roll",
    description: "Predicted 3 days in a row",
    emoji: "🔥",
    rarity: "common",
  },
  streak_7: {
    id: "streak_7",
    name: "Hot Streak",
    description: "Predicted 7 days in a row",
    emoji: "⚡",
    rarity: "uncommon",
  },
  streak_30: {
    id: "streak_30",
    name: "Streak Legend",
    description: "Predicted 30 days in a row",
    emoji: "👑",
    rarity: "legendary",
  },
  ai_forecaster: {
    id: "ai_forecaster",
    name: "AI Forecaster",
    description: "5 predictions in AI & Tech",
    emoji: "🤖",
    rarity: "uncommon",
    category: "ai-tech",
  },
  crypto_predictor: {
    id: "crypto_predictor",
    name: "Crypto Predictor",
    description: "5 predictions in Crypto",
    emoji: "₿",
    rarity: "uncommon",
    category: "crypto",
  },
  sports_oracle: {
    id: "sports_oracle",
    name: "Sports Oracle",
    description: "5 predictions in Sports",
    emoji: "🏆",
    rarity: "uncommon",
    category: "sports",
  },
  gaming_analyst: {
    id: "gaming_analyst",
    name: "Gaming Analyst",
    description: "5 predictions in Gaming",
    emoji: "🎮",
    rarity: "uncommon",
    category: "gaming",
  },
  trend_hunter: {
    id: "trend_hunter",
    name: "Trend Hunter",
    description: "5 predictions in Internet Culture",
    emoji: "🌐",
    rarity: "uncommon",
    category: "internet-culture",
  },
  culture_analyst: {
    id: "culture_analyst",
    name: "Culture Analyst",
    description: "5 predictions in Entertainment",
    emoji: "🎬",
    rarity: "uncommon",
    category: "entertainment",
  },
  market_explorer: {
    id: "market_explorer",
    name: "Market Explorer",
    description: "Predicted in 3+ different categories",
    emoji: "🗺️",
    rarity: "uncommon",
  },
  early_adopter: {
    id: "early_adopter",
    name: "Early Adopter",
    description: "One of PT's first predictors",
    emoji: "⭐",
    rarity: "rare",
  },
  prolific: {
    id: "prolific",
    name: "Prolific",
    description: "Made 25 total predictions",
    emoji: "📊",
    rarity: "rare",
  },
}

// Ordered list for display (earned first, then by rarity)
export const BADGE_DISPLAY_ORDER = [
  "first_prediction",
  "streak_3",
  "streak_7",
  "streak_30",
  "early_adopter",
  "market_explorer",
  "prolific",
  "ai_forecaster",
  "crypto_predictor",
  "sports_oracle",
  "gaming_analyst",
  "trend_hunter",
  "culture_analyst",
]

// Maps a PT category id → badge id
export const CATEGORY_BADGE_MAP: Record<string, string> = {
  "ai-tech": "ai_forecaster",
  crypto: "crypto_predictor",
  sports: "sports_oracle",
  gaming: "gaming_analyst",
  "internet-culture": "trend_hunter",
  entertainment: "culture_analyst",
}

export const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "#94A3B8",
  uncommon: "#10B981",
  rare: "#6366F1",
  legendary: "#F59E0B",
}

export const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
}

export function getBadge(id: string): BadgeDefinition | null {
  return BADGE_DEFINITIONS[id] ?? null
}

export interface DemoUser {
  id: string
  username: string
  displayName: string
  currentStreak: number
  bestStreak: number
  totalPredictions: number
  accuracy: number // 0-100
  badgeCount: number
  badgeIds: string[]
  favoriteCategory: string
  favoriteCategoryEmoji: string
  joinedMonthYear: string
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "d1",
    username: "alex-m",
    displayName: "Alex M.",
    currentStreak: 42,
    bestStreak: 42,
    totalPredictions: 87,
    accuracy: 67,
    badgeCount: 6,
    badgeIds: ["first_prediction", "streak_3", "streak_7", "crypto_predictor", "early_adopter", "market_explorer"],
    favoriteCategory: "Crypto",
    favoriteCategoryEmoji: "₿",
    joinedMonthYear: "Jan 2025",
  },
  {
    id: "d2",
    username: "sarah-t",
    displayName: "Sarah T.",
    currentStreak: 28,
    bestStreak: 35,
    totalPredictions: 124,
    accuracy: 71,
    badgeCount: 7,
    badgeIds: ["first_prediction", "streak_3", "streak_7", "ai_forecaster", "early_adopter", "prolific", "market_explorer"],
    favoriteCategory: "AI & Tech",
    favoriteCategoryEmoji: "🤖",
    joinedMonthYear: "Feb 2025",
  },
  {
    id: "d3",
    username: "mike-r",
    displayName: "Mike R.",
    currentStreak: 18,
    bestStreak: 28,
    totalPredictions: 63,
    accuracy: 58,
    badgeCount: 5,
    badgeIds: ["first_prediction", "streak_3", "streak_7", "sports_oracle", "early_adopter"],
    favoriteCategory: "Sports",
    favoriteCategoryEmoji: "🏆",
    joinedMonthYear: "Mar 2025",
  },
  {
    id: "d4",
    username: "luna-k",
    displayName: "Luna K.",
    currentStreak: 14,
    bestStreak: 21,
    totalPredictions: 142,
    accuracy: 62,
    badgeCount: 8,
    badgeIds: ["first_prediction", "streak_3", "streak_7", "ai_forecaster", "crypto_predictor", "early_adopter", "prolific", "market_explorer"],
    favoriteCategory: "AI & Tech",
    favoriteCategoryEmoji: "🤖",
    joinedMonthYear: "Jan 2025",
  },
  {
    id: "d5",
    username: "david-c",
    displayName: "David C.",
    currentStreak: 11,
    bestStreak: 18,
    totalPredictions: 49,
    accuracy: 55,
    badgeCount: 4,
    badgeIds: ["first_prediction", "streak_3", "crypto_predictor", "market_explorer"],
    favoriteCategory: "Crypto",
    favoriteCategoryEmoji: "₿",
    joinedMonthYear: "Apr 2025",
  },
  {
    id: "d6",
    username: "priya-s",
    displayName: "Priya S.",
    currentStreak: 9,
    bestStreak: 15,
    totalPredictions: 98,
    accuracy: 60,
    badgeCount: 5,
    badgeIds: ["first_prediction", "streak_3", "culture_analyst", "early_adopter", "prolific"],
    favoriteCategory: "Entertainment",
    favoriteCategoryEmoji: "🎬",
    joinedMonthYear: "Mar 2025",
  },
  {
    id: "d7",
    username: "james-w",
    displayName: "James W.",
    currentStreak: 7,
    bestStreak: 12,
    totalPredictions: 76,
    accuracy: 53,
    badgeCount: 4,
    badgeIds: ["first_prediction", "streak_3", "streak_7", "gaming_analyst"],
    favoriteCategory: "Gaming",
    favoriteCategoryEmoji: "🎮",
    joinedMonthYear: "Feb 2025",
  },
  {
    id: "d8",
    username: "ana-g",
    displayName: "Ana G.",
    currentStreak: 6,
    bestStreak: 14,
    totalPredictions: 55,
    accuracy: 65,
    badgeCount: 5,
    badgeIds: ["first_prediction", "streak_3", "trend_hunter", "early_adopter", "market_explorer"],
    favoriteCategory: "Internet Culture",
    favoriteCategoryEmoji: "🌐",
    joinedMonthYear: "Jan 2025",
  },
  {
    id: "d9",
    username: "tom-b",
    displayName: "Tom B.",
    currentStreak: 4,
    bestStreak: 9,
    totalPredictions: 31,
    accuracy: 68,
    badgeCount: 3,
    badgeIds: ["first_prediction", "streak_3", "sports_oracle"],
    favoriteCategory: "Sports",
    favoriteCategoryEmoji: "🏆",
    joinedMonthYear: "May 2025",
  },
  {
    id: "d10",
    username: "nina-f",
    displayName: "Nina F.",
    currentStreak: 3,
    bestStreak: 11,
    totalPredictions: 44,
    accuracy: 57,
    badgeCount: 4,
    badgeIds: ["first_prediction", "streak_3", "ai_forecaster", "market_explorer"],
    favoriteCategory: "AI & Tech",
    favoriteCategoryEmoji: "🤖",
    joinedMonthYear: "Apr 2025",
  },
  {
    id: "d11",
    username: "leo-m",
    displayName: "Leo M.",
    currentStreak: 2,
    bestStreak: 7,
    totalPredictions: 28,
    accuracy: 50,
    badgeCount: 3,
    badgeIds: ["first_prediction", "streak_3", "gaming_analyst"],
    favoriteCategory: "Gaming",
    favoriteCategoryEmoji: "🎮",
    joinedMonthYear: "May 2025",
  },
  {
    id: "d12",
    username: "yuki-t",
    displayName: "Yuki T.",
    currentStreak: 1,
    bestStreak: 6,
    totalPredictions: 39,
    accuracy: 61,
    badgeCount: 5,
    badgeIds: ["first_prediction", "streak_3", "crypto_predictor", "early_adopter", "market_explorer"],
    favoriteCategory: "Crypto",
    favoriteCategoryEmoji: "₿",
    joinedMonthYear: "Mar 2025",
  },
]

export function getDemoUser(username: string): DemoUser | null {
  return DEMO_USERS.find((u) => u.username === username) ?? null
}

/** Maps DemoUser.favoriteCategory (display label) to PT category id. */
const DEMO_LABEL_TO_ID: Record<string, string> = {
  "AI & Tech": "ai-tech",
  "Crypto": "crypto",
  "Sports": "sports",
  "Gaming": "gaming",
  "Entertainment": "entertainment",
  "Internet Culture": "internet-culture",
  "Global News": "global-news",
}

export function demoCategoryIdFromLabel(label: string): string | undefined {
  return DEMO_LABEL_TO_ID[label]
}

export type LeaderboardSortKey = "streak" | "accuracy" | "badges" | "activity"

export function getSortedLeaderboard(sort: LeaderboardSortKey): DemoUser[] {
  const sorted = [...DEMO_USERS]
  switch (sort) {
    case "streak":
      return sorted.sort((a, b) => b.currentStreak - a.currentStreak || b.bestStreak - a.bestStreak)
    case "accuracy":
      return sorted.sort((a, b) => b.accuracy - a.accuracy)
    case "badges":
      return sorted.sort((a, b) => b.badgeCount - a.badgeCount || b.totalPredictions - a.totalPredictions)
    case "activity":
      return sorted.sort((a, b) => b.totalPredictions - a.totalPredictions)
  }
}

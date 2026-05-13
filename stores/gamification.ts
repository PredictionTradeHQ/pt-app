import { create } from "zustand"
import { persist } from "zustand/middleware"
import { CATEGORY_BADGE_MAP, BADGE_DEFINITIONS } from "@/lib/badges"

export interface EarnedBadge {
  id: string
  earnedAt: string // ISO date string
}

interface GamificationState {
  // Streak
  currentStreak: number
  bestStreak: number
  lastPredictionDate: string | null // "YYYY-MM-DD"

  // Predictions
  totalPredictions: number
  categoryPredictions: Record<string, number> // { "ai-tech": 5, "crypto": 2 }

  // Badges
  badges: EarnedBadge[]

  // Actions
  recordPrediction: (categoryId: string) => {
    streakChanged: boolean
    streakIncreased: boolean
    newBadgeIds: string[]
    currentStreak: number
  }
  reset: () => void
}

function todayUTC(): string {
  return new Date().toISOString().split("T")[0]
}

function yesterdayUTC(): string {
  return new Date(Date.now() - 86_400_000).toISOString().split("T")[0]
}

function computeNewStreak(
  lastDate: string | null,
  current: number
): { next: number; changed: boolean; increased: boolean } {
  const today = todayUTC()
  if (lastDate === today) {
    return { next: current, changed: false, increased: false }
  }
  if (lastDate === yesterdayUTC()) {
    return { next: current + 1, changed: true, increased: true }
  }
  // Gap — reset
  return { next: 1, changed: current !== 1, increased: false }
}

function resolveNewBadges(
  existingBadgeIds: Set<string>,
  totalPredictions: number,
  categoryPredictions: Record<string, number>,
  bestStreak: number
): string[] {
  const earned: string[] = []

  const check = (id: string, condition: boolean) => {
    if (condition && !existingBadgeIds.has(id) && BADGE_DEFINITIONS[id]) {
      earned.push(id)
    }
  }

  check("first_prediction", totalPredictions >= 1)
  check("prolific", totalPredictions >= 25)
  check("streak_3", bestStreak >= 3)
  check("streak_7", bestStreak >= 7)
  check("streak_30", bestStreak >= 30)
  check("early_adopter", totalPredictions >= 1) // every early user gets this

  // Category badges — 5 predictions in a category
  for (const [catId, count] of Object.entries(categoryPredictions)) {
    const badgeId = CATEGORY_BADGE_MAP[catId]
    if (badgeId) check(badgeId, count >= 5)
  }

  // Market explorer — predicted in 3+ categories
  const activeCats = Object.values(categoryPredictions).filter((n) => n > 0).length
  check("market_explorer", activeCats >= 3)

  return earned
}

const INITIAL: Omit<GamificationState, "recordPrediction" | "reset"> = {
  currentStreak: 0,
  bestStreak: 0,
  lastPredictionDate: null,
  totalPredictions: 0,
  categoryPredictions: {},
  badges: [],
}

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      recordPrediction(categoryId) {
        const state = get()
        const { next, changed, increased } = computeNewStreak(
          state.lastPredictionDate,
          state.currentStreak
        )

        // If already predicted today, still count category but don't re-award badges
        const alreadyToday = state.lastPredictionDate === todayUTC()

        const newTotal = state.totalPredictions + 1
        const newCategoryPredictions = {
          ...state.categoryPredictions,
          [categoryId]: (state.categoryPredictions[categoryId] ?? 0) + 1,
        }
        const newBest = Math.max(state.bestStreak, next)

        const existingIds = new Set(state.badges.map((b) => b.id))
        const newBadgeIds = alreadyToday
          ? []
          : resolveNewBadges(existingIds, newTotal, newCategoryPredictions, newBest)

        const now = new Date().toISOString()
        const newBadges: EarnedBadge[] = newBadgeIds.map((id) => ({
          id,
          earnedAt: now,
        }))

        set({
          currentStreak: next,
          bestStreak: newBest,
          lastPredictionDate: todayUTC(),
          totalPredictions: newTotal,
          categoryPredictions: newCategoryPredictions,
          badges: [...state.badges, ...newBadges],
        })

        return {
          streakChanged: changed,
          streakIncreased: increased,
          newBadgeIds,
          currentStreak: next,
        }
      },

      reset() {
        set(INITIAL)
      },
    }),
    {
      name: "pt-gamification",
      version: 1,
    }
  )
)

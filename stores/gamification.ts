import { create } from "zustand"
import { persist } from "zustand/middleware"
import { CATEGORY_BADGE_MAP, BADGE_DEFINITIONS } from "@/lib/badges"

export interface EarnedBadge {
  id: string
  earnedAt: string // ISO date string
}

export interface PredictionRecord {
  id: string             // marketId (one record per market per direction)
  marketId: string
  marketTitle: string
  category: string       // PT category id
  prediction: "YES" | "NO"
  probAtTime: number     // 0-100 (YES probability at time of bet)
  amount: number
  createdAt: string      // ISO timestamp
  resolved: boolean
  outcome?: "YES" | "NO" // market resolution result
  correct?: boolean      // prediction === outcome
}

interface PredictionDetails {
  marketId: string
  marketTitle: string
  probAtTime: number     // 0-100 YES probability
  prediction: "YES" | "NO"
  amount: number
}

interface GamificationState {
  // Streak
  currentStreak: number
  bestStreak: number
  lastPredictionDate: string | null // "YYYY-MM-DD"

  // Predictions
  totalPredictions: number
  categoryPredictions: Record<string, number> // { "ai-tech": 5, "crypto": 2 }

  // Prediction records (for accuracy tracking)
  predictions: PredictionRecord[]
  resolvedCount: number
  correctCount: number
  calledItCount: number  // correct when your side had <20% probability

  // Badges
  badges: EarnedBadge[]

  // Actions
  recordPrediction: (
    categoryId: string,
    details?: PredictionDetails
  ) => {
    streakChanged: boolean
    streakIncreased: boolean
    newBadgeIds: string[]
    currentStreak: number
  }
  checkResolutions: () => Promise<string[]>  // returns newly earned badge ids
  reset: () => void
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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
  return { next: 1, changed: current !== 1, increased: false }
}

function resolveNewBadges(
  existingBadgeIds: Set<string>,
  totalPredictions: number,
  categoryPredictions: Record<string, number>,
  bestStreak: number,
  predictions: PredictionRecord[],
  resolvedCount: number,
  correctCount: number,
  calledItCount: number
): string[] {
  const earned: string[] = []

  const check = (id: string, condition: boolean) => {
    if (condition && !existingBadgeIds.has(id) && BADGE_DEFINITIONS[id]) {
      earned.push(id)
    }
  }

  // Streak badges
  check("first_prediction", totalPredictions >= 1)
  check("streak_3", bestStreak >= 3)
  check("streak_7", bestStreak >= 7)
  check("streak_30", bestStreak >= 30)
  check("early_adopter", totalPredictions >= 1)

  // Prediction count badges
  check("prolific", totalPredictions >= 25)

  // Category badges — 5 predictions in a category
  for (const [catId, count] of Object.entries(categoryPredictions)) {
    const badgeId = CATEGORY_BADGE_MAP[catId]
    if (badgeId) check(badgeId, count >= 5)
  }

  // Cross-category exploration
  const activeCats = Object.values(categoryPredictions).filter((n) => n > 0).length
  check("market_explorer", activeCats >= 3)

  // Contrarian badge — predicted when your side had <20% probability
  const contrarian = predictions.some(
    (p) =>
      (p.prediction === "YES" && p.probAtTime < 20) ||
      (p.prediction === "NO" && 100 - p.probAtTime < 20)
  )
  check("contrarian", contrarian)

  // Accuracy-based badges (requires resolved predictions)
  if (resolvedCount >= 10) {
    check("sharp", correctCount / resolvedCount >= 0.7)
  }

  // Called It — correct prediction when your side had <20% probability
  check("called_it", calledItCount >= 1)

  return earned
}

// ─── Initial state ─────────────────────────────────────────────────────────────

const INITIAL: Omit<GamificationState, "recordPrediction" | "checkResolutions" | "reset"> = {
  currentStreak: 0,
  bestStreak: 0,
  lastPredictionDate: null,
  totalPredictions: 0,
  categoryPredictions: {},
  predictions: [],
  resolvedCount: 0,
  correctCount: 0,
  calledItCount: 0,
  badges: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      recordPrediction(categoryId, details) {
        const state = get()
        const { next, changed, increased } = computeNewStreak(
          state.lastPredictionDate,
          state.currentStreak
        )

        const alreadyToday = state.lastPredictionDate === todayUTC()
        const newTotal = state.totalPredictions + 1
        const newCategoryPredictions = {
          ...state.categoryPredictions,
          [categoryId]: (state.categoryPredictions[categoryId] ?? 0) + 1,
        }
        const newBest = Math.max(state.bestStreak, next)

        // Build prediction record if details provided and not already tracking this market
        let newPredictions = state.predictions
        if (details) {
          const alreadyTracked = state.predictions.some(
            (p) => p.marketId === details.marketId && p.prediction === details.prediction
          )
          if (!alreadyTracked) {
            const record: PredictionRecord = {
              id: `${details.marketId}-${details.prediction}-${Date.now()}`,
              marketId: details.marketId,
              marketTitle: details.marketTitle,
              category: categoryId,
              prediction: details.prediction,
              probAtTime: details.probAtTime,
              amount: details.amount,
              createdAt: new Date().toISOString(),
              resolved: false,
            }
            // Keep last 200 predictions max
            newPredictions = [record, ...state.predictions].slice(0, 200)
          }
        }

        const existingIds = new Set(state.badges.map((b) => b.id))
        const newBadgeIds = alreadyToday
          ? []
          : resolveNewBadges(
              existingIds,
              newTotal,
              newCategoryPredictions,
              newBest,
              newPredictions,
              state.resolvedCount,
              state.correctCount,
              state.calledItCount
            )

        const now = new Date().toISOString()
        const newBadges: EarnedBadge[] = newBadgeIds.map((id) => ({ id, earnedAt: now }))

        set({
          currentStreak: next,
          bestStreak: newBest,
          lastPredictionDate: todayUTC(),
          totalPredictions: newTotal,
          categoryPredictions: newCategoryPredictions,
          predictions: newPredictions,
          badges: [...state.badges, ...newBadges],
        })

        return { streakChanged: changed, streakIncreased: increased, newBadgeIds, currentStreak: next }
      },

      async checkResolutions() {
        const state = get()
        const unresolved = state.predictions.filter((p) => !p.resolved)
        if (unresolved.length === 0) return []

        // Check up to 5 at a time to avoid hammering the API
        const toCheck = unresolved.slice(0, 5)
        const resolutions: { marketId: string; outcome: "YES" | "NO" }[] = []

        await Promise.all(
          toCheck.map(async (pred) => {
            try {
              const res = await fetch(
                `https://gamma-api.polymarket.com/markets/${pred.marketId}`,
                { cache: "no-store" }
              )
              if (!res.ok) return
              const data = await res.json()

              // A market is resolved when closed=true and one outcome price is ~1.0
              if (data.closed && data.outcomePrices) {
                const prices: string[] = JSON.parse(data.outcomePrices)
                const yesPrice = parseFloat(prices[0] ?? "0")
                if (yesPrice >= 0.99) {
                  resolutions.push({ marketId: pred.marketId, outcome: "YES" })
                } else if (yesPrice <= 0.01) {
                  resolutions.push({ marketId: pred.marketId, outcome: "NO" })
                }
              }
            } catch {
              // Ignore per-market errors — network or parse failures
            }
          })
        )

        if (resolutions.length === 0) return []

        // Apply resolutions to prediction records
        const updatedPredictions = state.predictions.map((p) => {
          const resolution = resolutions.find((r) => r.marketId === p.marketId && !p.resolved)
          if (!resolution) return p
          const correct = p.prediction === resolution.outcome
          return { ...p, resolved: true, outcome: resolution.outcome, correct }
        })

        // Recompute aggregate accuracy stats
        const resolvedPreds = updatedPredictions.filter((p) => p.resolved)
        const correctPreds = resolvedPreds.filter((p) => p.correct)
        const calledItPreds = correctPreds.filter(
          (p) =>
            (p.prediction === "YES" && p.probAtTime < 20) ||
            (p.prediction === "NO" && 100 - p.probAtTime < 20)
        )

        const newResolvedCount = resolvedPreds.length
        const newCorrectCount = correctPreds.length
        const newCalledItCount = calledItPreds.length

        // Check for newly unlocked accuracy-based badges
        const existingIds = new Set(state.badges.map((b) => b.id))
        const newBadgeIds: string[] = []

        if (
          !existingIds.has("sharp") &&
          newResolvedCount >= 10 &&
          newCorrectCount / newResolvedCount >= 0.7 &&
          BADGE_DEFINITIONS["sharp"]
        ) {
          newBadgeIds.push("sharp")
        }
        if (!existingIds.has("called_it") && newCalledItCount >= 1 && BADGE_DEFINITIONS["called_it"]) {
          newBadgeIds.push("called_it")
        }

        const now = new Date().toISOString()
        const newBadges: EarnedBadge[] = newBadgeIds.map((id) => ({ id, earnedAt: now }))

        set({
          predictions: updatedPredictions,
          resolvedCount: newResolvedCount,
          correctCount: newCorrectCount,
          calledItCount: newCalledItCount,
          badges: [...state.badges, ...newBadges],
        })

        return newBadgeIds
      },

      reset() {
        set(INITIAL)
      },
    }),
    {
      name: "pt-gamification",
      version: 2,
      migrate(persistedState: unknown, version: number) {
        // v1 → v2: add prediction records and accuracy fields
        if (version === 1) {
          const s = persistedState as Record<string, unknown>
          return {
            ...s,
            predictions: [],
            resolvedCount: 0,
            correctCount: 0,
            calledItCount: 0,
          }
        }
        return persistedState
      },
    }
  )
)

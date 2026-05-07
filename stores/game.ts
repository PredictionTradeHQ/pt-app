import { create } from "zustand";

export type GameMode = "30s" | "60s" | "3min";
export type Position = "buy" | "sell" | null;
export type GamePhase = "idle" | "waiting" | "playing" | "result";

export interface PricePoint {
  time: number;
  value: number;
}

export interface GameResult {
  profit: number;
  profitPct: number;
  entryPrice: number;
  exitPrice: number;
  position: "buy" | "sell";
  won: boolean;
  duration: GameMode;
}

export interface Achievement {
  id: string;
  label: string;
  emoji: string;
  unlocked: boolean;
}

interface GameStore {
  mode: GameMode;
  setMode: (m: GameMode) => void;

  phase: GamePhase;
  price: number;
  priceHistory: PricePoint[];
  entryPrice: number | null;
  position: Position;
  timeLeft: number;
  result: GameResult | null;
  streak: number;
  totalGames: number;
  wins: number;
  totalProfit: number;
  achievements: Achievement[];
  savedToDb: boolean | null; // null=not attempted, true=ok, false=error

  startGame: () => void;
  placePosition: (pos: "buy" | "sell") => void;
  tickPrice: () => void;
  tickTimer: () => void;
  endGame: () => void;
  resetGame: () => void;
  loadUserStats: (stats: { totalGames: number; wins: number; totalProfit: number; bestStreak: number }) => void;
  setSavedToDb: (v: boolean) => void;
}

const DURATIONS: Record<GameMode, number> = { "30s": 30, "60s": 60, "3min": 180 };
const VOLATILITY = 0.8;

function initialAchievements(): Achievement[] {
  return [
    { id: "first_win",  label: "First Win",      emoji: "🏆", unlocked: false },
    { id: "streak_3",   label: "3x Streak",       emoji: "🔥", unlocked: false },
    { id: "streak_5",   label: "5x Streak",       emoji: "⚡",  unlocked: false },
    { id: "big_profit", label: "10%+ Profit",     emoji: "💰", unlocked: false },
    { id: "survivor",   label: "10 Games Played", emoji: "🎯", unlocked: false },
    { id: "contrarian", label: "Sell & Win",      emoji: "📉", unlocked: false },
  ];
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: "60s",
  setMode: (m) => set({ mode: m }),

  phase: "idle",
  price: 50,
  priceHistory: [{ time: Date.now(), value: 50 }],
  entryPrice: null,
  position: null,
  timeLeft: 60,
  result: null,
  streak: 0,
  totalGames: 0,
  wins: 0,
  totalProfit: 0,
  achievements: initialAchievements(),
  savedToDb: null,

  loadUserStats: ({ totalGames, wins, totalProfit, bestStreak }) => {
    const ach = get().achievements.map((a) => {
      if (a.unlocked) return a;
      if (a.id === "first_win" && wins >= 1) return { ...a, unlocked: true };
      if (a.id === "streak_3" && bestStreak >= 3) return { ...a, unlocked: true };
      if (a.id === "streak_5" && bestStreak >= 5) return { ...a, unlocked: true };
      if (a.id === "survivor" && totalGames >= 10) return { ...a, unlocked: true };
      return a;
    });
    set({ totalGames, wins, totalProfit, streak: bestStreak, achievements: ach });
  },

  setSavedToDb: (v) => set({ savedToDb: v }),

  startGame: () => {
    const { mode } = get();
    const startPrice = 40 + Math.random() * 20;
    set({
      phase: "waiting",
      price: startPrice,
      priceHistory: [{ time: Date.now(), value: startPrice }],
      entryPrice: null,
      position: null,
      timeLeft: DURATIONS[mode],
      result: null,
      savedToDb: null,
    });
  },

  placePosition: (pos) => {
    const { phase, price } = get();
    if (phase !== "waiting" && phase !== "playing") return;
    set({ position: pos, entryPrice: price, phase: "playing" });
  },

  tickPrice: () => {
    const { phase, price, priceHistory } = get();
    if (phase !== "playing" && phase !== "waiting") return;
    const delta = (Math.random() - 0.5) * VOLATILITY * 2;
    const next = Math.max(5, Math.min(95, price + delta));
    set({
      price: next,
      priceHistory: [...priceHistory.slice(-120), { time: Date.now(), value: next }],
    });
  },

  tickTimer: () => {
    const { phase, timeLeft } = get();
    if (phase !== "playing") return;
    if (timeLeft <= 1) {
      get().endGame();
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  endGame: () => {
    const { entryPrice, price, position, streak, totalGames, wins, totalProfit, achievements } = get();
    if (!entryPrice || !position) return;

    const rawProfit =
      position === "buy"
        ? (price - entryPrice) / entryPrice
        : (entryPrice - price) / entryPrice;

    const profitPct = rawProfit * 100;
    const won = rawProfit > 0;
    const newStreak = won ? streak + 1 : 0;
    const newTotal = totalGames + 1;
    const newWins = wins + (won ? 1 : 0);
    const newTotalProfit = totalProfit + rawProfit;

    const result: GameResult = {
      profit: rawProfit,
      profitPct,
      entryPrice,
      exitPrice: price,
      position,
      won,
      duration: get().mode,
    };

    const updated = achievements.map((a) => {
      if (a.unlocked) return a;
      if (a.id === "first_win" && won) return { ...a, unlocked: true };
      if (a.id === "streak_3" && newStreak >= 3) return { ...a, unlocked: true };
      if (a.id === "streak_5" && newStreak >= 5) return { ...a, unlocked: true };
      if (a.id === "big_profit" && profitPct >= 10) return { ...a, unlocked: true };
      if (a.id === "survivor" && newTotal >= 10) return { ...a, unlocked: true };
      if (a.id === "contrarian" && position === "sell" && won) return { ...a, unlocked: true };
      return a;
    });

    set({
      phase: "result",
      result,
      streak: newStreak,
      totalGames: newTotal,
      wins: newWins,
      totalProfit: newTotalProfit,
      achievements: updated,
    });
  },

  resetGame: () => {
    const { mode } = get();
    set({
      phase: "idle",
      price: 50,
      priceHistory: [{ time: Date.now(), value: 50 }],
      entryPrice: null,
      position: null,
      timeLeft: DURATIONS[mode],
      result: null,
      savedToDb: null,
    });
  },
}));

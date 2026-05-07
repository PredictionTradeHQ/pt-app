import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ArcadePhase = "ready" | "searching" | "deciding" | "resolving" | "result";
export type ArcadeMove = "up" | "down" | null;
export type GameMode = "solo" | "ranked" | "vs";

export const RANKS = [
  { id: "bronze", label: "Bronze", icon: "🥉", color: "#cd7f32", minRP: 0 },
  { id: "silver", label: "Silver", icon: "🥈", color: "#c0c0c0", minRP: 500 },
  { id: "gold",   label: "Gold",   icon: "🥇", color: "#ffd700", minRP: 1000 },
  { id: "elite",  label: "Elite",  icon: "💎", color: "#00ccff", minRP: 2000 },
  { id: "master", label: "Master", icon: "👑", color: "#ff00ff", minRP: 4000 },
] as const;

export type RankId = typeof RANKS[number]["id"];

export function getRank(rp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (rp >= r.minRP) rank = r; }
  return rank;
}

export function getRankProgress(rp: number) {
  const cur = getRank(rp);
  const idx = RANKS.findIndex(r => r.id === cur.id);
  if (idx >= RANKS.length - 1) return 1;
  const next = RANKS[idx + 1];
  return (rp - cur.minRP) / (next.minRP - cur.minRP);
}

const BOTS = [
  { name: "TradeMaster99", rank: "gold"   as RankId, emoji: "🦅" },
  { name: "CryptoHawk",    rank: "silver" as RankId, emoji: "🦊" },
  { name: "AlphaWolf",     rank: "elite"  as RankId, emoji: "🐺" },
  { name: "MarketSage",    rank: "bronze" as RankId, emoji: "🦉" },
  { name: "BullRunner",    rank: "gold"   as RankId, emoji: "🐂" },
  { name: "NeonTrader",    rank: "silver" as RankId, emoji: "⚡" },
  { name: "PredictKing",   rank: "master" as RankId, emoji: "👑" },
  { name: "FlashPro",      rank: "elite"  as RankId, emoji: "💎" },
];

const WIN_TIPS = [
  "📈 Momentum trading — you rode the trend correctly!",
  "🎯 Perfect timing. Early entries maximize profit.",
  "💡 Prediction markets reward pattern recognition.",
  "🔥 Trending assets keep moving. Trust momentum.",
  "⚡ Fast decisions often beat overthinking.",
  "📊 The trend was your friend this round!",
];
const LOSS_TIPS = [
  "💡 Price reversals happen — don't FOMO into entries.",
  "📊 Low volume often signals trend weakness.",
  "🧘 Even pros lose 40% of trades. Stay consistent.",
  "⚡ Markets are random short-term — play the odds.",
  "🔄 Contrarian plays can flip the result. Study reversals.",
  "📉 Late entries are risky — wait for the setup.",
];

export interface PricePoint { t: number; v: number; }

export interface VsOpponent {
  name: string;
  rank: RankId;
  emoji: string;
  move: ArcadeMove;
  profitPct: number | null;
  won: boolean | null;
}

export interface ArcadeResult {
  move: "up" | "down";
  entryPrice: number;
  exitPrice: number;
  profitPct: number;
  won: boolean;
  decidedInMs: number;
  xpGained: number;
  rpChange: number;
  multiplier: number;
  tip: string;
  beatPercent: number;
  vsOpponent: VsOpponent | null;
  rankedUp: boolean;
  prevRank: RankId;
}

export interface DailyChallenge {
  id: string; label: string; labelEs: string; target: number; progress: number; completed: boolean;
}

const LEVEL_XP = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000, 13000];
export function getLevel(xp: number) {
  let lv = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) { if (xp >= LEVEL_XP[i]) lv = i + 1; else break; }
  return Math.min(lv, LEVEL_XP.length);
}
export function getLevelProgress(xp: number) {
  const lv = getLevel(xp);
  if (lv >= LEVEL_XP.length) return 1;
  const prev = LEVEL_XP[lv - 1], next = LEVEL_XP[lv];
  return (xp - prev) / (next - prev);
}
export function getMultiplier(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 7)  return 3;
  if (streak >= 5)  return 2;
  if (streak >= 3)  return 1.5;
  return 1;
}
function beatPct(profitPct: number) {
  return Math.max(1, Math.min(99, Math.round(50 + (profitPct / 8) * 48)));
}
function getDailyChallenge(): DailyChallenge {
  const seed = new Date().toDateString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const challenges = [
    { id: "streak3", label: "Get a 3× Streak", labelEs: "Consigue racha ×3", target: 3 },
    { id: "streak5", label: "Get a 5× Streak", labelEs: "Consigue racha ×5", target: 5 },
    { id: "win5",    label: "Win 5 rounds",     labelEs: "Gana 5 rondas",     target: 5 },
    { id: "win10",   label: "Win 10 rounds",    labelEs: "Gana 10 rondas",    target: 10 },
    { id: "play15",  label: "Play 15 rounds",   labelEs: "Juega 15 rondas",   target: 15 },
    { id: "vs3",     label: "Win 3 duels",      labelEs: "Gana 3 duelos",     target: 3 },
  ];
  const c = challenges[seed % challenges.length];
  return { ...c, progress: 0, completed: false };
}

const DECIDE_SECS = 3;
const RESOLVE_SECS = 7;
const RESULT_SECS = 2.5;
const SEARCH_SECS = 1.5;

interface Store {
  // Persistent
  xp: number; level: number; levelProgress: number;
  rankPoints: number;
  allTimeGames: number; allTimeWins: number;
  dailyChallenge: DailyChallenge; challengeDate: string;

  // Session (reset on page reload)
  phase: ArcadePhase;
  gameMode: GameMode;
  price: number;
  priceHistory: PricePoint[];
  move: ArcadeMove;
  entryPrice: number | null;
  decideStart: number | null;
  countdown: number;
  streak: number;
  sessionGames: number;
  result: ArcadeResult | null;
  vsOpponent: VsOpponent | null;

  // Actions
  selectMode: (m: GameMode) => void;
  startRound: () => void;
  placeMove: (m: "up" | "down") => void;
  tick: () => void;
  resetToReady: () => void;
}

export const useArcadeStore = create<Store>()(
  persist(
    (set, get) => ({
      xp: 0, level: 1, levelProgress: 0, rankPoints: 0,
      allTimeGames: 0, allTimeWins: 0,
      dailyChallenge: getDailyChallenge(), challengeDate: "",

      phase: "ready", gameMode: "solo",
      price: 50, priceHistory: [], move: null,
      entryPrice: null, decideStart: null,
      countdown: DECIDE_SECS, streak: 0, sessionGames: 0,
      result: null, vsOpponent: null,

      selectMode: (m) => set({ gameMode: m }),

      startRound: () => {
        const { gameMode } = get();
        const today = new Date().toDateString();
        const dc = get().challengeDate !== today ? getDailyChallenge() : get().dailyChallenge;
        const sp = 40 + Math.random() * 20;

        if (gameMode === "vs") {
          // Pick a random bot opponent
          const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
          set({
            phase: "searching",
            vsOpponent: { ...bot, move: null, profitPct: null, won: null },
            price: sp, priceHistory: [{ t: Date.now(), v: sp }],
            countdown: SEARCH_SECS, move: null, entryPrice: null,
            decideStart: null, result: null, dailyChallenge: dc, challengeDate: today,
          });
        } else {
          set({
            phase: "deciding", vsOpponent: null,
            price: sp, priceHistory: [{ t: Date.now(), v: sp }],
            countdown: DECIDE_SECS, move: null, entryPrice: null,
            decideStart: Date.now(), result: null,
            dailyChallenge: dc, challengeDate: today,
          });
        }
      },

      placeMove: (m) => {
        const { phase, price, decideStart } = get();
        if (phase !== "deciding") return;
        set({ move: m, entryPrice: price, decideStart: decideStart ?? Date.now() });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
      },

      tick: () => {
        const s = get();
        if (s.phase === "ready") return;

        const now = Date.now();
        const shouldTick = s.priceHistory.length === 0 ||
          now - s.priceHistory[s.priceHistory.length - 1].t >= 280;

        let np = s.price, nh = s.priceHistory;
        if (shouldTick && (s.phase === "deciding" || s.phase === "resolving")) {
          const bias = s.phase === "resolving" && s.move
            ? (s.move === "up" ? 0.06 : -0.06) : 0;
          const delta = (Math.random() - 0.5 + bias) * 1.0;
          np = Math.max(5, Math.min(95, s.price + delta));
          nh = [...s.priceHistory.slice(-80), { t: now, v: np }];
        }

        const nc = s.countdown - 0.1;

        // ── SEARCHING → DECIDING ──
        if (s.phase === "searching") {
          if (nc <= 0) {
            set({ phase: "deciding", countdown: DECIDE_SECS, decideStart: Date.now(), price: np, priceHistory: nh });
          } else {
            set({ countdown: nc, price: np, priceHistory: nh });
          }
          return;
        }

        // ── DECIDING → RESOLVING ──
        if (s.phase === "deciding") {
          if (nc <= 0) {
            const finalMove = s.move ?? (Math.random() > 0.5 ? "up" : "down");
            set({ phase: "resolving", move: finalMove, entryPrice: np, countdown: RESOLVE_SECS, price: np, priceHistory: nh });
          } else {
            set({ countdown: nc, price: np, priceHistory: nh });
          }
          return;
        }

        // ── RESOLVING → RESULT ──
        if (s.phase === "resolving") {
          if (nc <= 0) {
            const exit = np;
            const entry = s.entryPrice ?? np;
            const raw = s.move === "up"
              ? (exit - entry) / entry
              : (entry - exit) / entry;
            const profPct = raw * 100;
            const won = raw > 0;
            const newStreak = won ? s.streak + 1 : 0;
            const mult = getMultiplier(s.streak);
            const decidedMs = s.decideStart ? Math.max(0, (Date.now() - s.decideStart) - RESOLVE_SECS * 1000) : 3000;

            const xpGained = Math.round((won ? 20 : 5) * mult + (decidedMs < 1000 && won ? 10 : 0));
            const newXP = s.xp + xpGained;

            // RP change
            let rpChange = 0;
            if (s.gameMode === "ranked") rpChange = won ? Math.round(20 * mult) : -10;
            if (s.gameMode === "vs")     rpChange = won ? Math.round(30 * mult) : -15;
            if (s.gameMode === "solo")   rpChange = won ? 5 : 0;
            const prevRP = s.rankPoints;
            const newRP = Math.max(0, prevRP + rpChange);
            const prevRankId = getRank(prevRP).id;
            const newRankId  = getRank(newRP).id;
            const rankIdx = RANKS.findIndex(r => r.id);
            const rankUp = RANKS.findIndex(r => r.id === newRankId) > RANKS.findIndex(r => r.id === prevRankId);

            // Simulated opponent result
            let vsOpp = s.vsOpponent ? { ...s.vsOpponent } : null;
            if (vsOpp) {
              const oppWon = Math.random() < 0.48; // slightly favor player
              const oppMove: "up" | "down" = Math.random() > 0.5 ? "up" : "down";
              const oppPnl = oppWon ? 1 + Math.random() * 5 : -(1 + Math.random() * 4);
              vsOpp = { ...vsOpp, move: oppMove, profitPct: oppPnl, won: oppWon };
            }

            // Daily challenge update
            let dc = { ...s.dailyChallenge };
            if (!dc.completed) {
              if (dc.id === "streak3" && newStreak >= 3) dc = { ...dc, progress: 3, completed: true };
              else if (dc.id === "streak5" && newStreak >= 5) dc = { ...dc, progress: 5, completed: true };
              else if (dc.id === "win5" && won) { dc = { ...dc, progress: Math.min(dc.progress + 1, 5) }; if (dc.progress >= 5) dc.completed = true; }
              else if (dc.id === "win10" && won) { dc = { ...dc, progress: Math.min(dc.progress + 1, 10) }; if (dc.progress >= 10) dc.completed = true; }
              else if (dc.id === "play15") { dc = { ...dc, progress: Math.min(dc.progress + 1, 15) }; if (dc.progress >= 15) dc.completed = true; }
              else if (dc.id === "vs3" && s.gameMode === "vs" && won) { dc = { ...dc, progress: Math.min(dc.progress + 1, 3) }; if (dc.progress >= 3) dc.completed = true; }
            }

            const tips = won ? WIN_TIPS : LOSS_TIPS;
            const tip = tips[Math.floor(Math.random() * tips.length)];

            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(won ? [40, 20, 40] : [80]);
            }

            set({
              phase: "result", price: exit, priceHistory: nh, countdown: RESULT_SECS,
              streak: newStreak, sessionGames: s.sessionGames + 1,
              allTimeGames: s.allTimeGames + 1, allTimeWins: s.allTimeWins + (won ? 1 : 0),
              xp: newXP, level: getLevel(newXP), levelProgress: getLevelProgress(newXP),
              rankPoints: newRP, dailyChallenge: dc, vsOpponent: vsOpp,
              result: {
                move: s.move as "up" | "down", entryPrice: entry, exitPrice: exit,
                profitPct: profPct, won, decidedInMs: decidedMs,
                xpGained, rpChange, multiplier: mult, tip,
                beatPercent: beatPct(profPct),
                vsOpponent: vsOpp,
                rankedUp: rankUp, prevRank: prevRankId as RankId,
              },
            });
          } else {
            set({ countdown: nc, price: np, priceHistory: nh });
          }
          return;
        }

        // ── RESULT → auto next round ──
        if (s.phase === "result") {
          if (nc <= 0) get().startRound();
          else set({ countdown: nc });
        }
      },

      resetToReady: () => set({ phase: "ready", streak: 0, sessionGames: 0, result: null, vsOpponent: null }),
    }),
    {
      name: "arcade-v2",
      partialize: (s) => ({
        xp: s.xp, level: s.level, levelProgress: s.levelProgress,
        rankPoints: s.rankPoints,
        allTimeGames: s.allTimeGames, allTimeWins: s.allTimeWins,
        dailyChallenge: s.dailyChallenge, challengeDate: s.challengeDate,
      }),
    }
  )
);

export { RESULT_SECS, DECIDE_SECS, RESOLVE_SECS, SEARCH_SECS };

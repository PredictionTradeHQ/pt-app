"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Flame,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  Trophy,
  BarChart2,
  ChevronRight,
  Share2,
} from "lucide-react";
import { detectPTCategory, CATEGORY_TABS } from "@/lib/categories";
import { SharePredictionModal } from "@/components/share-prediction-modal";
import { useGamification } from "@/stores/gamification";
import { StreakWidget } from "@/components/streak-widget";
import { BadgeEarnedToast } from "@/components/badge-earned-toast";
import { cn } from "@/lib/utils";
import { MarketDetailModal } from "@/components/market-detail-modal";
import { Sparkline, generateMockHistory } from "@/components/sparkline";
import { useRealtimePrices } from "@/contexts/realtime-prices-context";
import { useAuth } from "@/contexts/auth-context";
import { RealtimeStatus } from "@/components/realtime-status";
import { PricePulse, LiveIndicator } from "@/components/price-pulse";
import type { TransformedMarket } from "@/app/api/polymarket/route";
import { useLanguage } from "@/contexts/language-context";

// Shape that MarketDetailModal expects
interface Market {
  id: string;
  title: string;
  category: string;
  volume: string;
  liquidity: string;
  endDate: string;
  yesPrice: number;
  noPrice: number;
  change: number;
  traders: number;
  image: string;
  trending: boolean;
  isNew: boolean;
  description: string;
  priceHistory: number[];
  // Asset IDs for WebSocket subscriptions
  assetIds: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatVolume(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

function formatTraders(n: number): string {
  if (n >= 1000) return (Math.floor(n / 100) / 10) + "k";
  return String(n);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (days < 0) return "Ended";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 30) return days + "d";
  if (days < 365) return Math.floor(days / 30) + "mo";
  return Math.floor(days / 365) + "y";
}

function toMarket(m: TransformedMarket, i: number): Market {
  const change = parseFloat((((m.yesPrice - 0.5) * 20) + (i % 3 === 0 ? 1.5 : -0.8)).toFixed(1));
  return {
    id: m.id,
    title: m.question || "—",
    category: m.category || "General",
    volume: formatVolume(m.volume),
    liquidity: formatVolume(m.liquidity),
    endDate: formatDate(m.endDate),
    yesPrice: m.yesPrice,
    noPrice: m.noPrice,
    change,
    traders: Math.max(1, Math.floor(m.volume / 180)),
    image: m.image || "",
    trending: m.volume24hr > 50000,
    isNew: m.isNew,
    description: m.description || m.question || "",
    priceHistory: generateMockHistory(m.yesPrice, 20),
    assetIds: m.assetIds || [],
  };
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      {/* Category badge skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-20 bg-muted/60 rounded-full animate-pulse" />
        <div className="h-5 w-12 bg-muted/40 rounded-full animate-pulse" />
      </div>
      
      {/* Title skeleton - two lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted/70 rounded w-full animate-pulse" style={{ animationDelay: '50ms' }} />
        <div className="h-4 bg-muted/50 rounded w-4/5 animate-pulse" style={{ animationDelay: '100ms' }} />
      </div>
      
      {/* Probability bar skeleton */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <div className="h-6 w-14 bg-primary/20 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-6 w-14 bg-muted/40 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
        </div>
      </div>
      
      {/* Quick bet amount selector skeleton */}
      <div className="flex gap-1 mb-2">
        <div className="h-6 flex-1 bg-muted/40 rounded animate-pulse" style={{ animationDelay: '250ms' }} />
        <div className="h-6 flex-1 bg-muted/50 rounded animate-pulse" style={{ animationDelay: '275ms' }} />
        <div className="h-6 flex-1 bg-muted/40 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      
      {/* Buy buttons skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-8 flex-1 bg-primary/20 rounded-lg animate-pulse" style={{ animationDelay: '325ms' }} />
        <div className="h-8 flex-1 bg-muted/50 rounded-lg animate-pulse" style={{ animationDelay: '350ms' }} />
      </div>
      
      {/* Stats skeleton */}
      <div className="flex justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-muted/40 rounded animate-pulse" style={{ animationDelay: '375ms' }} />
          <div className="h-3 w-12 bg-muted/50 rounded animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-muted/40 rounded animate-pulse" style={{ animationDelay: '425ms' }} />
          <div className="h-3 w-10 bg-muted/50 rounded animate-pulse" style={{ animationDelay: '450ms' }} />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-muted/40 rounded animate-pulse" style={{ animationDelay: '475ms' }} />
          <div className="h-3 w-8 bg-muted/50 rounded animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── MarketCard ──────────────────────────────────────────────────────────────

function MarketCard({
  market,
  onClick,
  onShare,
  onQuickBet,
  balance,
  selectedAmount,
  onAmountChange,
  realtimeYesPrice,
  realtimeNoPrice,
  realtimePriceHistory,
  isLive,
  labels,
}: {
  market: Market;
  onClick: () => void;
  onShare?: (market: Market) => void;
  onQuickBet?: (outcome: "YES" | "NO", amount: number) => void;
  balance?: number;
  selectedAmount?: number;
  onAmountChange?: (amount: number) => void;
  realtimeYesPrice?: number;
  realtimeNoPrice?: number;
  realtimePriceHistory?: number[];
  isLive?: boolean;
  labels: {
    yes: string;
    no: string;
    buyYes: string;
    buyNo: string;
    probability: string;
    live: string;
    hot: string;
    newest: string;
  };
}) {
  const quickBetAmount = selectedAmount || 50;
  
  // Use real-time prices if available, otherwise fallback to market data
  const yesPrice = realtimeYesPrice ?? market.yesPrice;
  const noPrice = realtimeNoPrice ?? market.noPrice;
  const priceHistory = realtimePriceHistory ?? market.priceHistory;
  
  // Calculate price change from history
  const priceChange = useMemo(() => {
    if (priceHistory.length < 2) return market.change;
    const first = priceHistory[0];
    const last = priceHistory[priceHistory.length - 1];
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  }, [priceHistory, market.change]);
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl border bg-card hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer",
        isLive ? "border-primary/30" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* PT category badge */}
          {(() => {
            const ptCat = detectPTCategory(market.title, market.category);
            return (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ background: ptCat.color + "20", color: ptCat.color }}
              >
                {ptCat.emoji} {ptCat.label}
              </span>
            );
          })()}
          {isLive && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1 text-xs shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              {labels.live}
            </Badge>
          )}
          {market.trending && (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-0 gap-1 text-xs shrink-0">
              <Flame className="w-3 h-3" />{labels.hot}
            </Badge>
          )}
          {market.isNew && !isLive && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1 text-xs shrink-0">
              <Zap className="w-3 h-3" />{labels.newest}
            </Badge>
          )}
        </div>
        <span className={cn(
          "flex items-center gap-1 text-xs font-medium shrink-0 transition-colors",
          priceChange >= 0 ? "text-primary" : "text-destructive"
        )}>
          {priceChange >= 0
            ? <ArrowUpRight className="w-3 h-3" />
            : <ArrowDownRight className="w-3 h-3" />}
          {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(1)}%
        </span>
      </div>

      <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
        {market.title}
      </h3>

      {/* Sparkline Chart */}
      <div className="mb-3 flex items-center justify-between">
        <Sparkline 
          data={priceHistory} 
          width={90} 
          height={26}
          showTrend={false}
        />
        <div className="text-right">
          <div className={cn(
            "text-base font-bold text-primary transition-all",
            isLive && "tabular-nums"
          )}>
            <PricePulse 
              price={yesPrice * 100}
              showPulse={isLive}
            >
              {(yesPrice * 100).toFixed(0)}%
            </PricePulse>
          </div>
          <div className="text-[10px] text-muted-foreground">{labels.probability}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-primary font-medium tabular-nums">
            {labels.yes} <PricePulse price={yesPrice * 100} showPulse={isLive}>{(yesPrice * 100).toFixed(0)}</PricePulse>c
          </span>
          <span className="text-destructive font-medium tabular-nums">
            {labels.no} <PricePulse price={noPrice * 100} showPulse={isLive}>{(noPrice * 100).toFixed(0)}</PricePulse>c
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: (yesPrice * 100) + "%" }} 
          />
          <div 
            className="h-full bg-destructive transition-all duration-300" 
            style={{ width: (noPrice * 100) + "%" }} 
          />
        </div>
      </div>

      {/* Quick bet amount selector */}
      {onQuickBet && onAmountChange && (
        <div className="flex gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
          {[25, 50, 100].map((amt) => (
            <button
              key={amt}
              type="button"
              className={cn(
                "flex-1 py-1 text-xs rounded transition-all",
                quickBetAmount === amt 
                  ? "bg-primary/20 text-primary font-semibold" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onAmountChange(amt);
              }}
            >
              ${amt}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 mb-4">
        <button
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
            balance !== undefined && quickBetAmount > balance
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={(e) => { 
            e.stopPropagation(); 
            if (onQuickBet && balance !== undefined && quickBetAmount <= balance) {
              onQuickBet("YES", quickBetAmount);
            } else {
              onClick();
            }
          }}
        >
          {labels.buyYes}
        </button>
        <button
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
            balance !== undefined && quickBetAmount > balance
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          )}
          onClick={(e) => { 
            e.stopPropagation();
            if (onQuickBet && balance !== undefined && quickBetAmount <= balance) {
              onQuickBet("NO", quickBetAmount);
            } else {
              onClick();
            }
          }}
        >
          {labels.buyNo}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formatTraders(market.traders)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {market.endDate}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{market.volume}</span>
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(market);
              }}
              className="ml-1 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
              title="Share this market"
            >
              <Share2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

// PT category tabs — imported from lib/categories

const SORT_OPTIONS = [
  { value: "volume", label: "Volume" },
  { value: "volume24hr", label: "24h Volume" },
  { value: "liquidity", label: "Liquidity" },
  { value: "newest", label: "Newest" },
  { value: "ending", label: "Ending Soon" },
];

// ─── Main component ───────────────────────────────────────────────────────────

// Recent trade interface
interface RecentTrade {
  id: number;
  user: string;
  market: string;
  outcome: "YES" | "NO";
  amount: number;
  timestamp: Date;
}

// User position on a market
interface UserPosition {
  marketId: string;
  marketTitle: string;
  outcome: "YES" | "NO";
  amount: number;
  price: number; // price at time of bet (0-1)
  shares: number;
  timestamp: Date;
  currentPrice: number; // for P&L calc
}

// Bet confirmation state
interface BetConfirmation {
  market: Market;
  outcome: "YES" | "NO";
  amount: number;
}

// Generate random trades for activity simulation
const generateRandomTrades = (marketTitles: string[]): RecentTrade[] => {
  const users = ["Alex M.", "Sarah K.", "John D.", "Emily R.", "Mike P.", "Lisa T.", "David W.", "Anna S."];
  const trades: RecentTrade[] = [];
  
  for (let i = 0; i < 6; i++) {
    trades.push({
      id: i,
      user: users[Math.floor(Math.random() * users.length)],
      market: marketTitles[Math.floor(Math.random() * marketTitles.length)] || "Market",
      outcome: Math.random() > 0.5 ? "YES" : "NO",
      amount: Math.floor(Math.random() * 500) + 10,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
    });
  }
  
  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export function MarketsApp() {
  const { t, language } = useLanguage();
  const viewerLabel = language === "es" ? "Tu" : "You";
  const [mounted, setMounted] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("volume24hr");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  
  // Auth (drives whether trading state is persisted)
  const { user: authUser } = useAuth();

  // Trading panel state (hydrated from API for logged-in users)
  const [balance, setBalance] = useState(100000);
  const [hydrated, setHydrated] = useState(false);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [userPositions, setUserPositions] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 });
  const [userBets, setUserBets] = useState<UserPosition[]>([]);
  const [totalBets, setTotalBets] = useState(0);
  const [selectedBetAmount, setSelectedBetAmount] = useState(50);
  const [betConfirmation, setBetConfirmation] = useState<BetConfirmation | null>(null);
  const [betSuccess, setBetSuccess] = useState<{ outcome: string; amount: number } | null>(null);
  const [shareTarget, setShareTarget] = useState<{ market: Market; prediction?: "YES" | "NO" } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);

  // Gamification store (Zustand persist — survives refreshes)
  const { recordPrediction } = useGamification();
  const [activeTab, setActiveTab] = useState<"activity" | "positions">("activity");

  // Hydrate persistent balance + positions when user is logged in
  useEffect(() => {
    if (!authUser) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [walletRes, portfolioRes] = await Promise.all([
          fetch("/api/wallet", { cache: "no-store" }),
          fetch("/api/demo-portfolio", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (walletRes.ok) {
          const w = await walletRes.json();
          if (typeof w.balance === "number") setBalance(w.balance);
        }
        if (portfolioRes.ok) {
          const p = await portfolioRes.json();
          if (p?.data) {
            if (typeof p.data.balance === "number") setBalance(p.data.balance);
            if (Array.isArray(p.data.positions)) {
              const positions = p.data.positions as UserPosition[];
              setUserBets(positions);
              setTotalBets(positions.length);
              const tally = positions.reduce(
                (acc, b) => {
                  const k = String(b.outcome).toLowerCase() as "yes" | "no";
                  acc[k] = (acc[k] ?? 0) + (typeof b.amount === "number" ? b.amount : 0);
                  return acc;
                },
                { yes: 0, no: 0 }
              );
              setUserPositions(tally);
            }
          }
        }
      } catch (e) {
        console.warn("[MarketsApp] hydrate failed:", e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  // Persist updated portfolio (best-effort, only when logged in)
  const persistPortfolio = useCallback(
    async (next: {
      balance: number;
      positions: UserPosition[];
      activityEntry?: { type: string; market: string; outcome: string; amount: number; price: number; timestamp: number };
    }) => {
      if (!authUser) return;
      try {
        await fetch("/api/wallet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ balance: next.balance }),
        });
        const existing = await fetch("/api/demo-portfolio", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        const prevActivity = Array.isArray(existing?.data?.activity) ? existing.data.activity : [];
        const newActivity = next.activityEntry ? [next.activityEntry, ...prevActivity].slice(0, 100) : prevActivity;
        await fetch("/api/demo-portfolio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: next.balance,
            positions: next.positions,
            activity: newActivity,
            startingBalance: 100000,
          }),
        });
      } catch (e) {
        console.warn("[MarketsApp] persist failed:", e);
      }
    },
    [authUser]
  );
  
  // Real-time prices context
  const { 
    prices: realtimePrices, 
    registerMarkets, 
    connectionState,
    updatesPerSecond 
  } = useRealtimePrices();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Client-side category filtering using PT category detection
  const filteredMarkets = useMemo(() => {
    if (activeCategory === "all") return markets;
    return markets.filter(
      (m) => detectPTCategory(m.title, m.category).id === activeCategory
    );
  }, [markets, activeCategory]);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50", sortBy });
      // Category filtering done client-side via PT category detection
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch("/api/polymarket?" + params.toString() + `&_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);

      const json = await res.json();

      // API returns { markets: TransformedMarket[], ... } or a plain array
      const raw: TransformedMarket[] = Array.isArray(json)
        ? json
        : Array.isArray(json.markets)
          ? json.markets
          : [];

      setMarkets(raw.map((m, i) => toMarket(m, i)));

      const now = new Date();
      setLastUpdated(
        String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0")
      );
    } catch (err) {
      console.error("[MarketsApp] fetch error:", err);
      setError(t("noMarketsFound"));
    } finally {
      setLoading(false);
    }
  }, [sortBy, debouncedSearch]);

  useEffect(() => {
    setMounted(true);
    fetchMarkets();
  }, [fetchMarkets]);

  // Register markets for real-time updates when they load
  useEffect(() => {
    if (markets.length === 0) return;
    
    // Filter markets that have valid asset IDs
    const marketsToRegister = markets
      .filter(m => m.assetIds && m.assetIds.length >= 2)
      .map(m => ({
        marketId: m.id,
        assetIds: m.assetIds,
      }));
    
    if (marketsToRegister.length > 0) {
      registerMarkets(marketsToRegister);
    }
  }, [markets, registerMarkets]);

  // Generate initial trades when markets load
  useEffect(() => {
    if (markets.length > 0) {
      const titles = markets.map(m => m.title.slice(0, 40) + (m.title.length > 40 ? "..." : ""));
      setRecentTrades(generateRandomTrades(titles));
    }
  }, [markets]);

  // Simulate new trades periodically
  useEffect(() => {
    if (markets.length === 0) return;
    
    const interval = setInterval(() => {
      const users = ["Alex M.", "Sarah K.", "John D.", "Emily R.", "Mike P.", "Lisa T.", "David W.", "Anna S."];
      const titles = markets.map(m => m.title.slice(0, 40) + (m.title.length > 40 ? "..." : ""));
      const newTrade: RecentTrade = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        market: titles[Math.floor(Math.random() * titles.length)],
        outcome: Math.random() > 0.5 ? "YES" : "NO",
        amount: Math.floor(Math.random() * 500) + 10,
        timestamp: new Date(),
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 5)]);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [markets]);

  // Format time ago helper
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Show bet confirmation modal
  const handleQuickBet = (market: Market, outcome: "YES" | "NO", amount: number) => {
    if (amount > balance) return;
    setBetConfirmation({ market, outcome, amount });
  };

  // Confirm and execute a bet
  const confirmBet = () => {
    if (!betConfirmation) return;
    const { market, outcome, amount } = betConfirmation;
    const price = outcome === "YES" ? market.yesPrice : market.noPrice;
    const shares = price > 0 ? amount / price : 0;

    const newBalance = balance - amount;
    const newPosition: UserPosition = {
      marketId: market.id,
      marketTitle: market.title,
      outcome,
      amount,
      price,
      shares,
      timestamp: new Date(),
      currentPrice: price,
    };
    const newBets = [newPosition, ...userBets];

    setBalance(newBalance);
    setUserPositions(prev => ({
      ...prev,
      [outcome.toLowerCase()]: prev[outcome.toLowerCase() as "yes" | "no"] + amount,
    }));
    setTotalBets(prev => prev + 1);
    setUserBets(newBets);

    const userTrade: RecentTrade = {
      id: Date.now(),
      user: viewerLabel,
      market: market.title.slice(0, 40) + (market.title.length > 40 ? "..." : ""),
      outcome,
      amount,
      timestamp: new Date(),
    };
    setRecentTrades(prev => [userTrade, ...prev.slice(0, 5)]);

    // Record prediction in gamification store (streak + badges)
    const ptCat = detectPTCategory(market.title, market.category);
    const gamResult = recordPrediction(ptCat.id);
    if (gamResult.newBadgeIds.length > 0) {
      setEarnedBadgeIds(gamResult.newBadgeIds);
    }

    setBetConfirmation(null);
    setBetSuccess({ outcome, amount });
    setShareTarget({ market, prediction: outcome });
    setTimeout(() => setBetSuccess(null), 4000);
    setActiveTab("positions");

    void persistPortfolio({
      balance: newBalance,
      positions: newBets,
      activityEntry: {
        type: "buy",
        market: market.title,
        outcome,
        amount,
        price,
        timestamp: Date.now(),
      },
    });
  };

// Show loading state during hydration to prevent mismatch
  if (!mounted) {
  return (
  <div className="min-h-screen bg-background flex items-center justify-center">
  <div className="flex flex-col items-center gap-4">
  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-pulse">
  <span className="text-2xl font-bold text-primary-foreground">PT</span>
  </div>
  <div className="flex flex-col items-center gap-2">
  <div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
  <div className="h-2 w-24 bg-muted/30 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
  </div>
  </div>
  </div>
  );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Balance pill (Header lives in AppShell) */}
      <div className="container mx-auto px-4 md:px-8 pt-6 flex justify-end">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary">${balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Page header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t("poweredBy")}</span>
                <RealtimeStatus 
                  connectionState={connectionState}
                  updatesPerSecond={updatesPerSecond}
                />
              </div>
              <h1 className="text-3xl font-bold mb-1">{t("predictionMarkets")}</h1>
              <p className="text-muted-foreground text-sm">
                {loading ? t("loadingMarkets") : filteredMarkets.length + " " + t("activeMarkets")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchMarkets")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {language === "es"
                      ? o.value === "volume"
                        ? "Volumen"
                        : o.value === "volume24hr"
                        ? "Volumen 24h"
                        : o.value === "liquidity"
                        ? "Liquidez"
                        : o.value === "newest"
                        ? "Más recientes"
                        : "Finalizan pronto"
                      : o.value === "volume"
                      ? "Volume"
                      : o.value === "volume24hr"
                      ? "24h Volume"
                      : o.value === "liquidity"
                      ? "Liquidity"
                      : o.value === "newest"
                      ? "Newest"
                      : "Ending Soon"}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMarkets}
                disabled={loading}
                className="shrink-0"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Category pills — PT categories with emoji */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-all",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-[13px]">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with Trading Panel */}
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Markets Grid */}
          <div className="flex-1">
            {error ? (
              <div className="text-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchMarkets} variant="outline">{t("tryAgain")}</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                  : markets.length === 0
                    ? (
                      <div className="col-span-full text-center py-20 text-muted-foreground">
                        {t("noMarketsFound")}
                      </div>
                    )
: filteredMarkets.map((market) => {
  const rtPrice = realtimePrices.get(market.id);
  return (
    <MarketCard
      key={market.id}
      market={market}
      onClick={() => setSelectedMarket(market)}
      onShare={(m) => { setShareTarget({ market: m }); setShowShareModal(true); }}
      onQuickBet={(outcome, amount) => handleQuickBet(market, outcome, amount)}
      balance={balance}
      selectedAmount={selectedBetAmount}
      onAmountChange={setSelectedBetAmount}
      realtimeYesPrice={rtPrice?.yesPrice}
      realtimeNoPrice={rtPrice?.noPrice}
      realtimePriceHistory={rtPrice?.priceHistory}
      isLive={!!rtPrice}
      labels={{
        yes: t("yes"),
        no: t("no"),
        buyYes: t("buyYes"),
        buyNo: t("buyNo"),
        probability: t("chance"),
        live: "Live",
        hot: "Hot",
        newest: language === "es" ? "Nuevo" : "New",
      }}
    />
  );
})}
              </div>
            )}
          </div>
          
          {/* Trading Control Panel - Sidebar */}
          <div className="lg:w-80 shrink-0 space-y-4">
            {/* Bet success toast */}
            {betSuccess && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-sm font-medium">
                  {t("betPlaced")} ${betSuccess.amount} {t("onOutcome")}{" "}
                  <strong>{betSuccess.outcome === "YES" ? t("yes") : t("no")}</strong>
                </span>
                {shareTarget && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/20 px-2.5 py-1 text-xs font-bold transition-all hover:bg-primary/30"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>
                )}
              </div>
            )}

            {/* Portfolio Summary */}
            <div className="p-5 rounded-xl border border-border bg-card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t("yourPortfolio")}</h3>
                <Badge variant="outline" className="gap-1">
                  <Activity className="w-3 h-3" />
                  Demo
                </Badge>
              </div>

              {/* Balance */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                <p className="text-xs text-muted-foreground mb-1">{t("availableBalance")}</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{balance.toLocaleString()}</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{t("yesWagered")}</p>
                  <p className="font-bold text-primary text-sm">${userPositions.yes.toFixed(0)}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{t("noWagered")}</p>
                  <p className="font-bold text-destructive text-sm">${userPositions.no.toFixed(0)}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Total</p>
                  <p className="font-bold text-foreground text-sm">{totalBets}</p>
                </div>
              </div>

              {/* Streak widget */}
              <StreakWidget variant="sidebar" className="mb-3" />

              {/* Tabs: Activity | Positions */}
              <div className="flex rounded-lg bg-muted/50 p-1 mb-3">
                <button
                  onClick={() => setActiveTab("activity")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                    activeTab === "activity"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Activity className="w-3 h-3" />
                  {t("activity")}
                </button>
                <button
                  onClick={() => setActiveTab("positions")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                    activeTab === "positions"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart2 className="w-3 h-3" />
                  {t("myBets")}
                  {userBets.length > 0 && (
                    <span className="ml-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {userBets.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Activity tab */}
              {activeTab === "activity" && (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">{t("liveMarketActivity")}</span>
                  </div>
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        trade.user === viewerLabel
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "font-medium text-xs",
                          trade.user === viewerLabel ? "text-primary" : "text-foreground"
                        )}>
                          {trade.user}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            trade.outcome === "YES"
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                          )}>
                            {trade.outcome}
                          </span>
                          <span className="font-semibold text-xs">${trade.amount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{trade.market}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(trade.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* My Bets tab */}
              {activeTab === "positions" && (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {userBets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Trophy className="w-8 h-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">{t("noBetsYet")}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {t("noBetsHelp")}
                      </p>
                    </div>
                  ) : (
                    userBets.map((pos, i) => {
                      const pnl = (pos.currentPrice - pos.price) * pos.shares;
                      const pnlPct = pos.price > 0 ? ((pos.currentPrice - pos.price) / pos.price) * 100 : 0;
                      return (
                        <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 text-sm">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs font-medium leading-snug line-clamp-2 flex-1">
                              {pos.marketTitle}
                            </p>
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                              pos.outcome === "YES"
                                ? "bg-primary/20 text-primary"
                                : "bg-destructive/20 text-destructive"
                            )}>
                              {pos.outcome}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                            <div>
                              <p className="mb-0.5">{t("wagered")}</p>
                              <p className="font-semibold text-foreground">${pos.amount}</p>
                            </div>
                            <div>
                              <p className="mb-0.5">Shares</p>
                              <p className="font-semibold text-foreground">{pos.shares.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="mb-0.5">P&amp;L</p>
                              <p className={cn(
                                "font-semibold",
                                pnl >= 0 ? "text-primary" : "text-destructive"
                              )}>
                                {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">
                              @ {(pos.price * 100).toFixed(0)}c
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimeAgo(pos.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bet Confirmation Modal */}
      {betConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-1">{t("confirmBet")}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {betConfirmation.market.title}
            </p>

            {/* Outcome */}
            <div className={cn(
              "flex items-center justify-center gap-2 p-4 rounded-xl mb-4 text-lg font-bold",
              betConfirmation.outcome === "YES"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-destructive/10 text-destructive border border-destructive/30"
            )}>
              {betConfirmation.outcome === "YES"
                ? <CheckCircle className="w-5 h-5" />
                : <XCircle className="w-5 h-5" />}
              {betConfirmation.outcome}
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("amount")}</span>
                <span className="font-semibold">${betConfirmation.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("price")}</span>
                <span className="font-semibold">
                  {betConfirmation.outcome === "YES"
                    ? (betConfirmation.market.yesPrice * 100).toFixed(0)
                    : (betConfirmation.market.noPrice * 100).toFixed(0)}c
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("potentialPayout")}</span>
                <span className="font-semibold text-primary">
                  ${(betConfirmation.outcome === "YES"
                    ? betConfirmation.amount / betConfirmation.market.yesPrice
                    : betConfirmation.amount / betConfirmation.market.noPrice
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">{t("balanceAfter")}</span>
                <span className="font-semibold">${(balance - betConfirmation.amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Amount selector */}
            <div className="flex gap-2 mb-4">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBetConfirmation(prev => prev ? { ...prev, amount: amt } : null)}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded-lg font-medium transition-all",
                    betConfirmation.amount === amt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBetConfirmation(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmBet}
                disabled={betConfirmation.amount > balance}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                  betConfirmation.amount > balance
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : betConfirmation.outcome === "YES"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
              >
                <ChevronRight className="w-4 h-4" />
                Place Bet
              </button>
            </div>
          </div>
        </div>
      )}

      <MarketDetailModal
        market={selectedMarket}
        open={!!selectedMarket}
        onClose={() => setSelectedMarket(null)}
      />

      {/* Share prediction modal */}
      {shareTarget && (
        <SharePredictionModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          marketTitle={shareTarget.market.title}
          yesPercent={Math.round(
            (realtimePrices.get(shareTarget.market.id)?.yesPrice ??
              shareTarget.market.yesPrice) * 100
          )}
          marketCategory={shareTarget.market.category}
          prediction={shareTarget.prediction}
        />
      )}

      {/* Badge earned toast */}
      <BadgeEarnedToast
        badgeIds={earnedBadgeIds}
        onDismiss={() => setEarnedBadgeIds([])}
      />
    </div>
  );
}

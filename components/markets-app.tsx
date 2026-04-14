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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketDetailModal } from "@/components/market-detail-modal";
import { Sparkline, generateMockHistory } from "@/components/sparkline";
import { useRealtimePrices } from "@/contexts/realtime-prices-context";
import { RealtimeStatus } from "@/components/realtime-status";
import { PricePulse, LiveIndicator } from "@/components/price-pulse";
import type { TransformedMarket } from "@/app/api/polymarket/route";

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
    title: m.question || "Untitled Market",
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
  onQuickBet,
  balance,
  selectedAmount,
  onAmountChange,
  realtimeYesPrice,
  realtimeNoPrice,
  realtimePriceHistory,
  isLive,
}: { 
  market: Market; 
  onClick: () => void;
  onQuickBet?: (outcome: "YES" | "NO", amount: number) => void;
  balance?: number;
  selectedAmount?: number;
  onAmountChange?: (amount: number) => void;
  realtimeYesPrice?: number;
  realtimeNoPrice?: number;
  realtimePriceHistory?: number[];
  isLive?: boolean;
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
          <Badge variant="outline" className="text-xs capitalize shrink-0">
            {market.category}
          </Badge>
          {isLive && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1 text-xs shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Live
            </Badge>
          )}
          {market.trending && (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-0 gap-1 text-xs shrink-0">
              <Flame className="w-3 h-3" />Hot
            </Badge>
          )}
          {market.isNew && !isLive && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1 text-xs shrink-0">
              <Zap className="w-3 h-3" />New
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
          <div className="text-[10px] text-muted-foreground">probability</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-primary font-medium tabular-nums">
            Yes <PricePulse price={yesPrice * 100} showPulse={isLive}>{(yesPrice * 100).toFixed(0)}</PricePulse>c
          </span>
          <span className="text-destructive font-medium tabular-nums">
            No <PricePulse price={noPrice * 100} showPulse={isLive}>{(noPrice * 100).toFixed(0)}</PricePulse>c
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
          Buy Yes
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
          Buy No
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
        <span className="font-medium text-foreground">{market.volume}</span>
      </div>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "politics", label: "Politics" },
  { id: "sports", label: "Sports" },
  { id: "crypto", label: "Crypto" },
  { id: "entertainment", label: "Pop Culture" },
  { id: "business", label: "Business" },
  { id: "tech", label: "Tech" },
  { id: "science", label: "Science" },
  { id: "world", label: "World" },
];

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
  
  // Trading panel state
  const [balance, setBalance] = useState(10000);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [userPositions, setUserPositions] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 });
  const [totalBets, setTotalBets] = useState(0);
  const [selectedBetAmount, setSelectedBetAmount] = useState(50);
  
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

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50", sortBy });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch("/api/polymarket?" + params.toString());
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
      setError("Could not load markets from Polymarket. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [sortBy, activeCategory, debouncedSearch]);

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

  // Handle quick bet from market card
  const handleQuickBet = (market: Market, outcome: "YES" | "NO", amount: number) => {
    if (amount > balance) return;
    
    setBalance(prev => prev - amount);
    setUserPositions(prev => ({
      ...prev,
      [outcome.toLowerCase()]: prev[outcome.toLowerCase() as "yes" | "no"] + amount,
    }));
    setTotalBets(prev => prev + 1);
    
    // Add user trade to recent activity
    const userTrade: RecentTrade = {
      id: Date.now(),
      user: "You",
      market: market.title.slice(0, 40) + (market.title.length > 40 ? "..." : ""),
      outcome,
      amount,
      timestamp: new Date(),
    };
    setRecentTrades(prev => [userTrade, ...prev.slice(0, 5)]);
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
      {/* Top Header with Logo and Balance */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="Prediction Trade" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold text-xl">Prediction Trade</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">${balance.toLocaleString()}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Powered by Polymarket</span>
                <RealtimeStatus 
                  connectionState={connectionState}
                  updatesPerSecond={updatesPerSecond}
                />
              </div>
              <h1 className="text-3xl font-bold mb-1">Prediction Markets</h1>
              <p className="text-muted-foreground text-sm">
                {loading ? "Loading markets..." : markets.length + " active markets"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
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
                  <option key={o.value} value={o.value}>{o.label}</option>
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

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
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
                <Button onClick={fetchMarkets} variant="outline">Try Again</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                  : markets.length === 0
                    ? (
                      <div className="col-span-full text-center py-20 text-muted-foreground">
                        No markets found. Try a different category or search.
                      </div>
                    )
: markets.map((market) => {
  const rtPrice = realtimePrices[market.id];
  return (
    <MarketCard
      key={market.id}
      market={market}
      onClick={() => setSelectedMarket(market)}
      onQuickBet={(outcome, amount) => handleQuickBet(market, outcome, amount)}
      balance={balance}
      selectedAmount={selectedBetAmount}
      onAmountChange={setSelectedBetAmount}
      realtimeYesPrice={rtPrice?.yesPrice}
      realtimeNoPrice={rtPrice?.noPrice}
      realtimePriceHistory={rtPrice?.priceHistory}
      isLive={!!rtPrice}
    />
  );
})}
              </div>
            )}
          </div>
          
          {/* Trading Control Panel - Sidebar */}
          <div className="lg:w-80 shrink-0 space-y-4">
            {/* Portfolio Summary */}
            <div className="p-5 rounded-xl border border-border bg-card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Your Portfolio</h3>
                <Badge variant="outline" className="gap-1">
                  <Activity className="w-3 h-3" />
                  Demo
                </Badge>
              </div>
              
              {/* Balance */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{balance.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Positions Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <p className="text-xs text-muted-foreground">YES Bets</p>
                  </div>
                  <p className="font-bold text-primary">${userPositions.yes.toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="w-3 h-3 text-destructive" />
                    <p className="text-xs text-muted-foreground">NO Bets</p>
                  </div>
                  <p className="font-bold text-destructive">${userPositions.no.toFixed(0)}</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground p-2 rounded bg-muted/30">
                <span>Total Bets</span>
                <span className="font-semibold text-foreground">{totalBets}</span>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Live Activity</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      trade.user === "You" ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-medium",
                        trade.user === "You" ? "text-primary" : "text-foreground"
                      )}>
                        {trade.user}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={trade.outcome === "YES" ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                          {trade.outcome}
                        </Badge>
                        <span className="font-semibold">${trade.amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{trade.market}</p>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(trade.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarketDetailModal
        market={selectedMarket}
        open={!!selectedMarket}
        onClose={() => setSelectedMarket(null)}
      />
    </div>
  );
}

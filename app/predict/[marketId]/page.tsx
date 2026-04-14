"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Droplets, RefreshCw, AlertCircle, Wallet, TrendingUp, TrendingDown, Users, Activity } from "lucide-react";
import { MarketHeader } from "@/components/market-header";
import { ProbabilityChart } from "@/components/probability-chart";
import { formatPrice, formatVolume, formatDate, PriceHistory, MarketDetail } from "@/lib/pms";

interface MarketPageProps {
  params: {
    marketId: string;
  };
}

function MarketDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-32 mb-4" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-6 w-2/3 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

// Simulated recent activity
interface RecentTrade {
  id: number;
  user: string;
  outcome: "YES" | "NO";
  amount: number;
  timestamp: Date;
}

const generateRandomTrades = (): RecentTrade[] => {
  const users = ["Alex M.", "Sarah K.", "John D.", "Emily R.", "Mike P.", "Lisa T.", "David W.", "Anna S."];
  const trades: RecentTrade[] = [];
  
  for (let i = 0; i < 8; i++) {
    trades.push({
      id: i,
      user: users[Math.floor(Math.random() * users.length)],
      outcome: Math.random() > 0.5 ? "YES" : "NO",
      amount: Math.floor(Math.random() * 500) + 10,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
    });
  }
  
  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export default function MarketPage({ params }: MarketPageProps) {
  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  
  // Trading panel state
  const [balance, setBalance] = useState(10000);
  const [betAmount, setBetAmount] = useState("");
  const [selectedBet, setSelectedBet] = useState<"YES" | "NO" | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [userPositions, setUserPositions] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 });

  const fetchMarket = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch market details
      const marketRes = await fetch(`/api/pms?id=${params.marketId}`);
      if (!marketRes.ok) throw new Error("Failed to fetch market");
      const marketData: MarketDetail = await marketRes.json();
      setMarket(marketData);

      // Fetch price history
      const historyRes = await fetch(`/api/pms/${params.marketId}/history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setPriceHistory(historyData.history || []);
      }

      setError(null);
    } catch (err) {
      console.error("[v0] Error fetching market:", err);
      setError("Failed to load market details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.marketId]);

  useEffect(() => {
    fetchMarket();
    setRecentTrades(generateRandomTrades());
  }, [fetchMarket]);

  // Simulate new trades periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const users = ["Alex M.", "Sarah K.", "John D.", "Emily R.", "Mike P.", "Lisa T.", "David W.", "Anna S."];
      const newTrade: RecentTrade = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        outcome: Math.random() > 0.5 ? "YES" : "NO",
        amount: Math.floor(Math.random() * 500) + 10,
        timestamp: new Date(),
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 7)]);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle placing a bet
  const handlePlaceBet = (outcome: "YES" | "NO") => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    
    setBalance(prev => prev - amount);
    setUserPositions(prev => ({
      ...prev,
      [outcome.toLowerCase()]: prev[outcome.toLowerCase() as "yes" | "no"] + amount,
    }));
    
    // Add user trade to recent activity
    const userTrade: RecentTrade = {
      id: Date.now(),
      user: "You",
      outcome,
      amount,
      timestamp: new Date(),
    };
    setRecentTrades(prev => [userTrade, ...prev.slice(0, 7)]);
    
    setBetAmount("");
    setSelectedBet(null);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarket(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchMarket]);

  if (loading || !market) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/logo.png" alt="Prediction Trade" width={32} height={32} className="w-8 h-8" />
                <span className="font-bold text-xl hidden sm:inline">Prediction Trade</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link href="/predict">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Markets
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">${balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <MarketDetailSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Prediction Trade" width={32} height={32} className="w-8 h-8" />
              <span className="font-bold text-xl hidden sm:inline">Prediction Trade</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/predict">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Markets
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Market Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/predict">
            <Button>Back to Markets</Button>
          </Link>
        </main>
      </div>
    );
  }

  const yesPrice = market.yesPrice;
  const noPrice = market.noPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Balance */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Prediction Trade" width={32} height={32} className="w-8 h-8" />
              <span className="font-bold text-xl hidden sm:inline">Prediction Trade</span>
            </Link>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <Link href="/predict" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Markets
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">${balance.toLocaleString()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMarket(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Market Header */}
        <MarketHeader market={market} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left side - Chart */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Price Chart</h2>
                <div className="flex gap-2">
                  <Badge
                    variant={selectedOutcome === "YES" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedOutcome("YES")}
                  >
                    YES
                  </Badge>
                  <Badge
                    variant={selectedOutcome === "NO" ? "secondary" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedOutcome("NO")}
                  >
                    NO
                  </Badge>
                </div>
              </div>

              {priceHistory.length > 0 ? (
                <ProbabilityChart data={priceHistory} outcome={selectedOutcome} />
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>No price history available</p>
                </div>
              )}
            </div>

            {/* Current Odds */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="text-sm text-muted-foreground mb-2">YES</div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatPrice(yesPrice)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  ${(yesPrice * 100).toFixed(2)} per share
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="text-sm text-muted-foreground mb-2">NO</div>
                <div className="text-4xl font-bold text-destructive mb-2">
                  {formatPrice(noPrice)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  ${(noPrice * 100).toFixed(2)} per share
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Trading Control Panel */}
          <div className="space-y-6">
            {/* Trading Panel */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Place Your Bet</h3>
                <Badge variant="outline" className="gap-1">
                  <Activity className="w-3 h-3" />
                  Live
                </Badge>
              </div>

              {/* Your Positions */}
              {(userPositions.yes > 0 || userPositions.no > 0) && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-3">Your Positions</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded bg-primary/10">
                      <p className="text-xs text-muted-foreground">YES</p>
                      <p className="font-bold text-primary">${userPositions.yes.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-destructive/10">
                      <p className="text-xs text-muted-foreground">NO</p>
                      <p className="font-bold text-destructive">${userPositions.no.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Outcome Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setSelectedBet("YES")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedBet === "YES"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="font-semibold">YES</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{formatPrice(yesPrice)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">${(yesPrice * 100).toFixed(2)}/share</p>
                </button>
                
                <button
                  onClick={() => setSelectedBet("NO")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedBet === "NO"
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    <span className="font-semibold">NO</span>
                  </div>
                  <div className="text-2xl font-bold text-destructive">{formatPrice(noPrice)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">${(noPrice * 100).toFixed(2)}/share</p>
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Amount to bet</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="pl-9 h-12 text-lg"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(amount.toString())}
                      className="flex-1 text-xs"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Potential Return */}
              {betAmount && selectedBet && (
                <div className="mb-6 p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Potential return if {selectedBet}:</span>
                    <span className="font-semibold text-primary">
                      ${(parseFloat(betAmount) / (selectedBet === "YES" ? yesPrice : noPrice)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Place Bet Button */}
              <Button
                size="lg"
                disabled={!selectedBet || !betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > balance}
                onClick={() => selectedBet && handlePlaceBet(selectedBet)}
                className={`w-full h-14 text-lg font-semibold ${
                  selectedBet === "YES"
                    ? "bg-primary hover:bg-primary/90"
                    : selectedBet === "NO"
                    ? "bg-destructive hover:bg-destructive/90"
                    : ""
                }`}
              >
                {selectedBet ? `Buy ${selectedBet}` : "Select an outcome"}
              </Button>

              {parseFloat(betAmount) > balance && (
                <p className="text-xs text-center text-destructive mt-2">
                  Insufficient balance
                </p>
              )}
            </div>

            {/* Market Stats */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Market Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">24h Volume</span>
                  </div>
                  <span className="font-semibold">{formatVolume(market.volume24hr)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="w-4 h-4" />
                    <span className="text-sm">Liquidity</span>
                  </div>
                  <span className="font-semibold">{formatVolume(market.liquidity)}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Recent Activity</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Live</span>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      trade.user === "You" ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        trade.outcome === "YES" ? "bg-primary" : "bg-destructive"
                      }`} />
                      <span className={trade.user === "You" ? "font-semibold text-primary" : "text-muted-foreground"}>
                        {trade.user}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={trade.outcome === "YES" ? "default" : "secondary"} className="text-xs">
                        {trade.outcome}
                      </Badge>
                      <span className="font-semibold">${trade.amount}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(trade.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Market Details Footer */}
        <div className="grid md:grid-cols-3 gap-4 p-6 rounded-xl border border-border bg-card">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Total Volume</p>
            <p className="text-2xl font-bold">{formatVolume(market.volume)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Market Liquidity</p>
            <p className="text-2xl font-bold">{formatVolume(market.liquidity)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Market Ends</p>
            <p className="text-2xl font-bold">{formatDate(market.endDate)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

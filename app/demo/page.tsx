"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  LogOut,
  Wallet,
  Target,
  Trophy,
  Activity,
  RefreshCw,
  ChevronRight,
  X,
  CheckCircle,
  BarChart2,
  User,
  Loader2,
  Clock3,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import type { TransformedMarket } from "@/app/api/polymarket/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const STARTING_BALANCE = 10000;
const STORAGE_PREFIX = "predictiontrade.demo.portfolio.v2";

interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  shares: number;
  timestamp: string;
}

interface TradeActivity {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: "YES" | "NO";
  amount: number;
  price: number;
  shares: number;
  timestamp: string;
}

interface DemoPortfolio {
  balance: number;
  positions: Position[];
  activity: TradeActivity[];
  startingBalance: number;
}

interface BetTicket {
  market: TransformedMarket;
  outcome: "YES" | "NO";
  amount: number;
}

function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export default function DemoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string; display_name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioHydrated, setPortfolioHydrated] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<"remote" | "local">("remote");

  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [activity, setActivity] = useState<TradeActivity[]>([]);
  const [betConfirmation, setBetConfirmation] = useState<BetTicket | null>(null);
  const [betSuccess, setBetSuccess] = useState<{ outcome: string; amount: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"markets" | "positions" | "activity">("markets");

  const { data: marketsData, error: marketsError, isLoading: marketsLoading, mutate } = useSWR<{
    markets: TransformedMarket[];
    total: number;
  }>("/api/polymarket?limit=24&sortBy=volume24hr", fetcher, {
    refreshInterval: 30000,
  });

  const markets = marketsData?.markets || [];
  const storageKey = user ? `${STORAGE_PREFIX}.${user.id}` : null;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          display_name: authUser.user_metadata?.display_name || authUser.email?.split("@")[0],
        });
      }
      setIsLoading(false);
    };
    checkUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) return;

    const loadPortfolio = async () => {
      try {
        const response = await fetch("/api/demo-portfolio");
        const payload = await response.json();

        if (!response.ok || !payload?.data) {
          if (storageKey) {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const parsed = JSON.parse(raw) as DemoPortfolio;
              setBalance(Number(parsed.balance ?? STARTING_BALANCE));
              setPositions(Array.isArray(parsed.positions) ? parsed.positions : []);
              setActivity(Array.isArray(parsed.activity) ? parsed.activity : []);
            }
          }
          setPersistenceMode("local");
          return;
        }

        const parsed = payload.data as DemoPortfolio;
        setBalance(Number(parsed.balance ?? STARTING_BALANCE));
        setPositions(Array.isArray(parsed.positions) ? parsed.positions : []);
        setActivity(Array.isArray(parsed.activity) ? parsed.activity : []);
        setPersistenceMode("remote");
      } catch (error) {
        console.error("Failed to load persisted portfolio", error);
        if (storageKey) {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw) as DemoPortfolio;
            setBalance(Number(parsed.balance ?? STARTING_BALANCE));
            setPositions(Array.isArray(parsed.positions) ? parsed.positions : []);
            setActivity(Array.isArray(parsed.activity) ? parsed.activity : []);
          }
        }
        setPersistenceMode("local");
      } finally {
        setPortfolioHydrated(true);
      }
    };

    loadPortfolio();
  }, [user, storageKey]);

  useEffect(() => {
    if (!user || !portfolioHydrated) return;

    if (persistenceMode === "local") {
      if (!storageKey) return;
      const payload: DemoPortfolio = {
        balance,
        positions,
        activity,
        startingBalance: STARTING_BALANCE,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSavingPortfolio(true);
      try {
        const response = await fetch("/api/demo-portfolio", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            balance,
            positions,
            activity,
            startingBalance: STARTING_BALANCE,
          }),
        });

        if (!response.ok && storageKey) {
          setPersistenceMode("local");
          const payload: DemoPortfolio = {
            balance,
            positions,
            activity,
            startingBalance: STARTING_BALANCE,
          };
          localStorage.setItem(storageKey, JSON.stringify(payload));
        }
      } catch (error) {
        console.error("Failed to save portfolio", error);
        if (storageKey) {
          setPersistenceMode("local");
          const payload: DemoPortfolio = {
            balance,
            positions,
            activity,
            startingBalance: STARTING_BALANCE,
          };
          localStorage.setItem(storageKey, JSON.stringify(payload));
        }
      } finally {
        setIsSavingPortfolio(false);
      }
    }, 600);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [balance, positions, activity, user, portfolioHydrated, persistenceMode, storageKey]);

  useEffect(() => {
    if (!user) {
      setPortfolioHydrated(true);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const resetDemoPortfolio = () => {
    setBalance(STARTING_BALANCE);
    setPositions([]);
    setActivity([]);
    setBetConfirmation(null);
    setBetSuccess(null);
  };

  const handleQuickBet = (market: TransformedMarket, outcome: "YES" | "NO") => {
    setBetConfirmation({ market, outcome, amount: 50 });
  };

  const getCurrentMarketPrice = (position: Position): number => {
    const market = markets.find((m) => m.id === position.marketId);
    if (!market) return position.entryPrice;
    return position.outcome === "YES" ? market.yesPrice : market.noPrice;
  };

  const confirmBet = () => {
    if (!betConfirmation) return;
    const { market, outcome, amount } = betConfirmation;
    const price = outcome === "YES" ? market.yesPrice : market.noPrice;
    const shares = price > 0 ? amount / price : 0;

    if (amount > balance || amount <= 0) return;

    setBalance((prev) => prev - amount);

    const newPosition: Position = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      marketId: market.id,
      marketTitle: market.question || "Unknown Market",
      outcome,
      amount,
      entryPrice: price,
      shares,
      timestamp: new Date().toISOString(),
    };

    const newActivity: TradeActivity = {
      id: newPosition.id,
      marketId: market.id,
      marketTitle: newPosition.marketTitle,
      outcome,
      amount,
      price,
      shares,
      timestamp: newPosition.timestamp,
    };

    setPositions((prev) => [newPosition, ...prev]);
    setActivity((prev) => [newActivity, ...prev]);

    setBetConfirmation(null);
    setBetSuccess({ outcome, amount });
    setTimeout(() => setBetSuccess(null), 3000);
    setActiveTab("positions");
  };

  const positionsWithMetrics = positions.map((position) => {
    const currentPrice = getCurrentMarketPrice(position);
    const currentValue = position.shares * currentPrice;
    const pnl = currentValue - position.amount;
    return { ...position, currentPrice, currentValue, pnl };
  });

  const investedCapital = positions.reduce((sum, p) => sum + p.amount, 0);
  const openPositionsValue = positionsWithMetrics.reduce((sum, p) => sum + p.currentValue, 0);
  const portfolioValue = balance + openPositionsValue;
  const totalPnl = portfolioValue - STARTING_BALANCE;
  const totalReturnPct = (totalPnl / STARTING_BALANCE) * 100;
  const unrealizedPnl = positionsWithMetrics.reduce((sum, p) => sum + p.pnl, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">PredictTrade Demo Dashboard</h1>
              <p className="text-xs text-muted-foreground">Portfolio persistente y paper trading en tiempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user?.display_name || user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Success toast */}
      {betSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">
            Bet placed: ${betSuccess.amount} on {betSuccess.outcome}
          </span>
        </div>
      )}

      <main className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cash disponible</p>
                  <p className="text-xl font-bold">${balance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Capital invertido</p>
                  <p className="text-xl font-bold">${investedCapital.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  {totalPnl >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">P&L total</p>
                  <p className={cn("text-xl font-bold", totalPnl >= 0 ? "text-green-500" : "text-red-500")}>
                    {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Posiciones abiertas</p>
                  <p className="text-xl font-bold">{positions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Valor del portfolio</p>
                <p className="text-lg font-bold">${portfolioValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">P&L no realizado</p>
                <p className={cn("text-lg font-bold", unrealizedPnl >= 0 ? "text-green-500" : "text-red-500")}>
                  {unrealizedPnl >= 0 ? "+" : ""}{unrealizedPnl.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Retorno total</p>
                <p className={cn("text-lg font-bold", totalReturnPct >= 0 ? "text-green-500" : "text-red-500")}>
                  {totalReturnPct >= 0 ? "+" : ""}{totalReturnPct.toFixed(2)}%
                </p>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetDemoPortfolio} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={activeTab === "markets" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("markets")}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            Mercados
          </Button>
          <Button
            variant={activeTab === "positions" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("positions")}
            className="gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            Posiciones
            {positions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {positions.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "activity" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("activity")}
            className="gap-2"
          >
            <Clock3 className="w-4 h-4" />
            Actividad
            {activity.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activity.length}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => mutate()} className="ml-auto gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          {isSavingPortfolio && (
            <span className="text-xs text-muted-foreground">Guardando cambios...</span>
          )}
          {!isSavingPortfolio && persistenceMode === "local" && (
            <span className="text-xs text-muted-foreground">Guardado local activo</span>
          )}
        </div>

        {/* Markets Tab */}
        {activeTab === "markets" && (
          <div>
            {marketsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : marketsError ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No se pudieron cargar los mercados.</p>
                  <Button variant="outline" className="mt-4" onClick={() => mutate()}>
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {markets.map((market) => (
                  <Card key={market.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-xs shrink-0">
                          {market.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium leading-snug line-clamp-2 mt-2">
                        {market.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {/* Prices */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-primary/5 text-center">
                          <p className="text-[10px] text-muted-foreground mb-0.5">YES</p>
                          <p className="font-bold text-primary">{(market.yesPrice * 100).toFixed(0)}c</p>
                        </div>
                        <div className="p-2 rounded-lg bg-destructive/5 text-center">
                          <p className="text-[10px] text-muted-foreground mb-0.5">NO</p>
                          <p className="font-bold text-destructive">{(market.noPrice * 100).toFixed(0)}c</p>
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>24h Volume</span>
                        <span className="font-medium">${((market.volume24hr || 0) / 1000).toFixed(0)}K</span>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => handleQuickBet(market, "YES")}
                        >
                          Buy YES
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => handleQuickBet(market, "NO")}
                        >
                          Buy NO
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === "positions" && (
          <div>
            {positions.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Aun no tienes posiciones</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Haz tu primera operacion para empezar a construir historial
                  </p>
                  <Button onClick={() => setActiveTab("markets")}>
                    Ver mercados
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {positionsWithMetrics.map((pos) => {
                  return (
                    <Card key={pos.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{pos.marketTitle}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={pos.outcome === "YES" ? "default" : "secondary"}>
                                {pos.outcome}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Entrada {(pos.entryPrice * 100).toFixed(0)}c
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Ahora {(pos.currentPrice * 100).toFixed(0)}c
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold">${pos.currentValue.toFixed(2)}</p>
                            <p className={cn(
                              "text-xs font-medium",
                              pos.pnl >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)} P&L
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(pos.timestamp)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            {activity.length === 0 ? (
              <Card>
                <CardContent className="py-14 text-center">
                  <Clock3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Todavia no hay actividad registrada.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activity.map((trade) => (
                  <Card key={trade.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{trade.marketTitle}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant={trade.outcome === "YES" ? "default" : "secondary"}>
                              {trade.outcome}
                            </Badge>
                            <span>{trade.shares.toFixed(2)} shares</span>
                            <span>@ {(trade.price * 100).toFixed(0)}c</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold">${trade.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(trade.timestamp)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bet Confirmation Modal */}
      {betConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Confirm Bet</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setBetConfirmation(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {betConfirmation.market.question}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Outcome */}
              <div className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl text-lg font-bold",
                betConfirmation.outcome === "YES"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-destructive/10 text-destructive border border-destructive/30"
              )}>
                {betConfirmation.outcome === "YES" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                {betConfirmation.outcome}
              </div>

              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">${betConfirmation.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    {betConfirmation.outcome === "YES"
                      ? (betConfirmation.market.yesPrice * 100).toFixed(0)
                      : (betConfirmation.market.noPrice * 100).toFixed(0)}c
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential payout</span>
                  <span className="font-semibold text-primary">
                    ${(betConfirmation.outcome === "YES"
                      ? betConfirmation.amount / betConfirmation.market.yesPrice
                      : betConfirmation.amount / betConfirmation.market.noPrice
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash restante</span>
                  <span className="font-semibold">${(balance - betConfirmation.amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bet-amount">Monto de la operacion</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="bet-amount"
                    type="number"
                    min={1}
                    step={1}
                    value={betConfirmation.amount}
                    onChange={(e) =>
                      setBetConfirmation((prev) =>
                        prev ? { ...prev, amount: Number(e.target.value || 0) } : null
                      )
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBetConfirmation((prev) => (prev ? { ...prev, amount: amt } : null))}
                    className={cn(
                      "flex-1 py-2 text-xs rounded-lg font-medium transition-all",
                      betConfirmation.amount === amt
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setBetConfirmation(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={confirmBet}
                  disabled={betConfirmation.amount > balance || betConfirmation.amount <= 0}
                >
                  <ChevronRight className="w-4 h-4" />
                  Place Bet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wallet } from 'lucide-react';

interface TransformedMarket {
  id: string;
  question: string | null;
  slug: string | null;
  image: string | null;
  icon: string | null;
  description: string | null;
  outcomes: string[];
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endDate: string | null;
  category: string | null;
  isNew: boolean;
  featured: boolean;
  volume24hr: number;
}

interface TradePosition {
  market: string;
  outcome: string;
  shares: number;
  cost: number;
  timestamp: number;
}

const CATEGORIES = ['All', 'Politics', 'Sports', 'Crypto', 'Pop Culture', 'Business', 'Science', 'Tech'];

function formatVol(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function PredictPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [markets, setMarkets] = useState<TransformedMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState<TransformedMarket | null>(null);
  const [tradeOutcome, setTradeOutcome] = useState(0);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<TradePosition[]>([]);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // Handle mounting and auto-start demo mode
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('trading_session');
      if (stored) {
        const session = JSON.parse(stored);
        setIsLoggedIn(true);
        setBalance(session.balance ?? 10000);
        setPositions(session.positions ?? []);
      } else {
        // Auto-start demo mode for new users - no registration required
        setIsLoggedIn(true);
        localStorage.setItem('trading_session', JSON.stringify({ balance: 10000, positions: [] }));
      }
    } catch {
      // Auto-start on parse error too
      setIsLoggedIn(true);
      localStorage.setItem('trading_session', JSON.stringify({ balance: 10000, positions: [] }));
    }
  }, []);

  // Fetch real Polymarket data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/pms?limit=50&sortBy=volume24hr');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        let list: TransformedMarket[] = [];
        if (Array.isArray(json)) {
          list = json as TransformedMarket[];
        } else if (json && typeof json === 'object' && 'markets' in json && Array.isArray((json as Record<string, unknown>).markets)) {
          list = (json as { markets: TransformedMarket[] }).markets;
        }
        setMarkets(list);
      } catch (err) {
        console.error('[predict] fetch error:', err);
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const handleDemoLogin = () => {
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trading_session', JSON.stringify({ balance: 10000, positions: [] }));
    }
  };

  const handleBuy = () => {
    if (!selectedMarket || tradeAmount > balance) return;
    const p = tradeOutcome === 0 ? selectedMarket.yesPrice : selectedMarket.noPrice;
    const shares = p > 0 ? Math.floor(tradeAmount / p) : 0;
    const newPosition: TradePosition = {
      market: selectedMarket.question ?? 'Unknown',
      outcome: selectedMarket.outcomes[tradeOutcome] ?? (tradeOutcome === 0 ? 'Yes' : 'No'),
      shares,
      cost: tradeAmount,
      timestamp: Date.now(),
    };
    const newBalance = balance - tradeAmount;
    const newPositions = [...positions, newPosition];
    setBalance(newBalance);
    setPositions(newPositions);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trading_session', JSON.stringify({ balance: newBalance, positions: newPositions }));
    }
    setSelectedMarket(null);
  };

  const filteredMarkets = selectedCategory === 'All'
    ? markets
    : markets.filter(m => m.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  const investedAmount = positions.reduce((s, p) => s + p.cost, 0);
  const activePrice = selectedMarket
    ? (tradeOutcome === 0 ? selectedMarket.yesPrice : selectedMarket.noPrice)
    : 0.5;
  const activeShares = activePrice > 0 ? Math.floor(tradeAmount / activePrice) : 0;

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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center px-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">PT</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Prediction Trade</h1>
            <p className="text-muted-foreground">Trade on real-world events with prediction markets</p>
          </div>
          <div className="space-y-3">
            <Button onClick={handleDemoLogin} size="lg" className="w-full">
              Start Demo Trading
            </Button>
            <p className="text-sm text-muted-foreground">Starts with $10,000 in virtual funds</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="Prediction Trade" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold text-xl">Prediction Trade</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">${balance.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Top bar */}
        <section className="border-b border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Prediction Markets</h1>
                <p className="text-muted-foreground">Real markets powered by Polymarket</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 whitespace-nowrap font-medium rounded-full transition-all ${selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {loading ? 'Loading markets...' : `${filteredMarkets.length} markets available`}
            </p>
          </div>
        </section>

        {/* Portfolio panel */}
        {showPortfolio && (
          <section className="border-b border-border/50 bg-card/50">
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-sm">Balance</p>
                  <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Invested</p>
                  <p className="text-2xl font-bold">${investedAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Positions</p>
                  <p className="text-2xl font-bold">{positions.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">P&amp;L</p>
                  <p className="text-2xl font-bold text-primary">+$0.00</p>
                </div>
              </div>
              {positions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Recent Trades</h3>
                  {positions.slice(-5).reverse().map((p, i) => (
                    <div key={i} className="text-sm p-3 bg-muted rounded flex justify-between gap-4">
                      <span className="truncate">{p.market.substring(0, 60)} — {p.outcome}</span>
                      <span className="font-semibold shrink-0">{p.shares} shares</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Markets grid */}
        <section className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5">
                  {/* Category skeleton */}
                  <div className="h-3 bg-muted/60 rounded w-20 mb-3 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />

                  {/* Title skeleton - two lines */}
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-muted/70 rounded w-full animate-pulse" style={{ animationDelay: `${i * 50 + 50}ms` }} />
                    <div className="h-4 bg-muted/50 rounded w-4/5 animate-pulse" style={{ animationDelay: `${i * 50 + 100}ms` }} />
                  </div>

                  {/* Outcome buttons skeleton */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg p-3 bg-primary/10 border border-primary/20 animate-pulse" style={{ animationDelay: `${i * 50 + 150}ms` }}>
                      <div className="h-3 bg-primary/30 rounded w-8 mx-auto mb-2" />
                      <div className="h-5 bg-primary/20 rounded w-12 mx-auto" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted/30 border border-border animate-pulse" style={{ animationDelay: `${i * 50 + 175}ms` }}>
                      <div className="h-3 bg-muted/50 rounded w-8 mx-auto mb-2" />
                      <div className="h-5 bg-muted/40 rounded w-12 mx-auto" />
                    </div>
                  </div>

                  {/* Details button skeleton */}
                  <div className="h-9 bg-muted/40 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50 + 200}ms` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map(market => (
                <div key={market.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all">
                  <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                    {market.category ?? 'Other'}
                  </div>
                  <h3 className="text-base font-semibold mb-4 line-clamp-3 leading-snug">{market.question}</h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => { setSelectedMarket(market); setTradeOutcome(0); }}
                      className="bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg p-2 transition-all"
                    >
                      <div className="text-xs text-muted-foreground font-medium">Yes</div>
                      <div className="text-lg font-bold text-primary">{(market.yesPrice * 100).toFixed(0)}c</div>
                      <div className="text-xs text-muted-foreground">{(market.yesPrice * 100).toFixed(1)}%</div>
                    </button>
                    <button
                      onClick={() => { setSelectedMarket(market); setTradeOutcome(1); }}
                      className="bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg p-2 transition-all"
                    >
                      <div className="text-xs text-muted-foreground font-medium">No</div>
                      <div className="text-lg font-bold text-destructive">{(market.noPrice * 100).toFixed(0)}c</div>
                      <div className="text-xs text-muted-foreground">{(market.noPrice * 100).toFixed(1)}%</div>
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground flex justify-between pt-3 border-t border-border/50">
                    <span>Vol: {formatVol(market.volume)}</span>
                    <span>{market.endDate?.split('T')[0] ?? 'TBD'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button onClick={() => { setSelectedMarket(market); setTradeOutcome(0); }} size="sm">
                      Buy Yes
                    </Button>
                    <Button onClick={() => { setSelectedMarket(market); setTradeOutcome(1); }} variant="outline" size="sm">
                      Buy No
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Trading modal */}
      <Dialog open={!!selectedMarket} onOpenChange={(open) => !open && setSelectedMarket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Place Order</DialogTitle>
          <DialogDescription>Trade on this prediction market with your demo balance.</DialogDescription>

          {selectedMarket && (
            <div className="space-y-6 mt-2">
              <h2 className="text-xl font-bold leading-snug">{selectedMarket.question}</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTradeOutcome(0)}
                  className={`p-4 rounded-lg border transition-all ${tradeOutcome === 0
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted border-border hover:border-primary/50'
                    }`}
                >
                  <div className="text-sm text-muted-foreground mb-1">Yes</div>
                  <div className="text-4xl font-bold text-primary">{(selectedMarket.yesPrice * 100).toFixed(0)}c</div>
                  <div className="text-sm text-muted-foreground">{(selectedMarket.yesPrice * 100).toFixed(1)}% chance</div>
                </button>
                <button
                  onClick={() => setTradeOutcome(1)}
                  className={`p-4 rounded-lg border transition-all ${tradeOutcome === 1
                    ? 'bg-destructive/10 border-destructive'
                    : 'bg-muted border-border hover:border-destructive/50'
                    }`}
                >
                  <div className="text-sm text-muted-foreground mb-1">No</div>
                  <div className="text-4xl font-bold text-destructive">{(selectedMarket.noPrice * 100).toFixed(0)}c</div>
                  <div className="text-sm text-muted-foreground">{(selectedMarket.noPrice * 100).toFixed(1)}% chance</div>
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-3">Amount (USD)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[10, 25, 50].map(amt => (
                    <Button
                      key={amt}
                      variant={tradeAmount === amt ? 'default' : 'outline'}
                      onClick={() => setTradeAmount(amt)}
                      size="sm"
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-full bg-muted border border-border rounded px-3 py-2"
                />
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per share</span>
                  <span className="font-semibold">${activePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-semibold">{activeShares}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Max return</span>
                  <span className="font-semibold text-primary">+${activeShares.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleBuy}
                disabled={tradeAmount > balance}
                className="w-full"
                size="lg"
              >
                {tradeOutcome === 0 ? 'Buy Yes' : 'Buy No'} — ${tradeAmount.toFixed(2)}
              </Button>

              {tradeAmount > balance && (
                <p className="text-sm text-destructive text-center">
                  Insufficient balance. Available: ${balance.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

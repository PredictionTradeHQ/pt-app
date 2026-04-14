"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkline, generateMockHistory } from "@/components/sparkline";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Flame,
  ArrowRight,
  Vote,
  Bitcoin,
  Trophy,
  LineChart as LineChartIcon,
  Cpu,
  Globe,
  FlaskConical,
  Clapperboard,
  Earth,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface MarketWithHistory extends TransformedMarket {
  priceHistory: number[];
}

const CATEGORIES = [
  { id: "all", label: "All", icon: Globe },
  { id: "politics", label: "Politics", icon: Vote },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "business", label: "Business", icon: LineChartIcon },
  { id: "tech", label: "Tech", icon: Cpu },
  { id: "entertainment", label: "Pop Culture", icon: Clapperboard },
  { id: "science", label: "Science", icon: FlaskConical },
  { id: "world", label: "World", icon: Earth },
];

function formatVolume(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
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

function MarketCardWithSparkline({ market }: { market: MarketWithHistory }) {
  const change = useMemo(() => {
    if (market.priceHistory.length < 2) return 0;
    const first = market.priceHistory[0];
    const last = market.priceHistory[market.priceHistory.length - 1];
    return ((last - first) / first) * 100;
  }, [market.priceHistory]);

  return (
    <Link
      href={`/predict?market=${market.id}`}
      className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs capitalize shrink-0">
            {market.category || "General"}
          </Badge>
          {market.volume24hr > 50000 && (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-0 gap-1 text-xs shrink-0">
              <Flame className="w-3 h-3" />Hot
            </Badge>
          )}
        </div>
        <span className={cn(
          "flex items-center gap-1 text-xs font-medium shrink-0",
          change >= 0 ? "text-primary" : "text-destructive"
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
        {market.question || "Untitled Market"}
      </h3>

      {/* Sparkline Chart */}
      <div className="mb-3 flex items-center justify-between">
        <Sparkline 
          data={market.priceHistory} 
          width={100} 
          height={28}
          showTrend={false}
        />
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            {(market.yesPrice * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-muted-foreground">Yes probability</div>
        </div>
      </div>

      {/* Price Bar */}
      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
          <div 
            className="h-full bg-primary transition-all" 
            style={{ width: `${market.yesPrice * 100}%` }} 
          />
          <div 
            className="h-full bg-destructive transition-all" 
            style={{ width: `${market.noPrice * 100}%` }} 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {Math.max(1, Math.floor(market.volume / 180))}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(market.endDate)}
        </span>
        <span className="font-medium text-foreground">{formatVolume(market.volume)}</span>
      </div>
    </Link>
  );
}

export function LiveMarketsPreview() {
  const [markets, setMarkets] = useState<MarketWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        const res = await fetch("/api/pms?limit=12&sortBy=volume24hr");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        
        const raw: TransformedMarket[] = Array.isArray(json)
          ? json
          : Array.isArray(json.markets)
            ? json.markets
            : [];

        // Add mock price history to each market
        const marketsWithHistory: MarketWithHistory[] = raw.map(m => ({
          ...m,
          priceHistory: generateMockHistory(m.yesPrice, 20),
        }));

        setMarkets(marketsWithHistory);
      } catch (err) {
        console.error("Error fetching markets:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, []);

  // Filter markets based on search and category
  const filteredMarkets = useMemo(() => {
    return markets.filter(m => {
      const matchesSearch = !search || 
        m.question?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = activeCategory === "all" || 
        m.category?.toLowerCase().includes(activeCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
  }, [markets, search, activeCategory]);

  return (
    <section id="live-markets" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-primary text-sm font-medium tracking-wider uppercase">Live Data</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Top Markets
            </h2>
            <p className="text-muted-foreground mt-2">
              Real-time prediction market data. Click any market to start trading.
            </p>
          </div>
          <Button asChild className="gap-2 w-fit">
            <Link href="/predict">
              Start Trading
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 whitespace-nowrap font-medium rounded-full transition-all",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Markets Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-16 bg-muted/60 rounded-full" />
                  <div className="h-5 w-10 bg-muted/40 rounded-full" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-muted/70 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-4/5" />
                </div>
                <div className="h-7 bg-muted/30 rounded mb-3" />
                <div className="h-1.5 bg-muted/40 rounded-full mb-3" />
                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-muted/40 rounded" />
                  <div className="h-3 w-10 bg-muted/40 rounded" />
                  <div className="h-3 w-14 bg-muted/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No markets found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMarkets.slice(0, 8).map((market) => (
              <MarketCardWithSparkline key={market.id} market={market} />
            ))}
          </div>
        )}

        {/* View All Link */}
        {!loading && filteredMarkets.length > 8 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/markets">
                View All {filteredMarkets.length} Markets
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

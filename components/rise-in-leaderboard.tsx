"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap, Trophy, Star, Copy, Gift, Clock, Users, Medal } from "lucide-react";
import type { TransformedMarket } from "@/app/api/polymarket/route";

// Static top traders leaderboard with realistic demo data
const TOP_TRADERS = [
  { rank: 1, name: "0xAlpha", avatar: "A", pnl: 48320, winRate: 73, trades: 412, roi: 183, badge: "gold" },
  { rank: 2, name: "PredictKing", avatar: "P", pnl: 31540, winRate: 68, trades: 287, roi: 142, badge: "gold" },
  { rank: 3, name: "CryptoOracle", avatar: "C", pnl: 24800, winRate: 65, trades: 354, roi: 118, badge: "silver" },
  { rank: 4, name: "MarketWizard", avatar: "M", pnl: 19200, winRate: 61, trades: 198, roi: 96, badge: "silver" },
  { rank: 5, name: "EdgeTrader", avatar: "E", pnl: 14750, winRate: 59, trades: 231, roi: 74, badge: "bronze" },
  { rank: 6, name: "ProbabilityPro", avatar: "P", pnl: 11320, winRate: 57, trades: 176, roi: 63, badge: "bronze" },
  { rank: 7, name: "SignalSeeker", avatar: "S", pnl: 8940, winRate: 55, trades: 143, roi: 52, badge: null },
  { rank: 8, name: "DataDriven", avatar: "D", pnl: 6420, winRate: 54, trades: 119, roi: 41, badge: null },
];

const BADGE_STYLES: Record<string, string> = {
  gold: "text-yellow-500 bg-yellow-500/10",
  silver: "text-slate-400 bg-slate-400/10",
  bronze: "text-orange-600 bg-orange-600/10",
};

// Tournament data
const TOURNAMENTS = [
  {
    id: 1,
    title: "April Championship",
    status: "active",
    endsIn: "6 days",
    participants: 847,
    prize: "$500 USDC",
    prizes: ["$250 USDC", "$150 USDC", "$100 USDC"],
    description: "Monthly competition. Top 3 traders by ROI win real USDC.",
  },
  {
    id: 2,
    title: "Crypto Markets Week",
    status: "upcoming",
    startsIn: "3 days",
    participants: 312,
    prize: "$200 USDC",
    prizes: ["$100 USDC", "$60 USDC", "$40 USDC"],
    description: "Focus on crypto-related prediction markets only.",
  },
  {
    id: 3,
    title: "Beginner's League",
    status: "active",
    endsIn: "12 days",
    participants: 1243,
    prize: "Premium Access",
    prizes: ["3 months Premium", "1 month Premium", "2 weeks Premium"],
    description: "Exclusive for new traders. Everyone starts equal.",
  },
];

function TraderRow({ trader }: { trader: typeof TOP_TRADERS[0] }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all group">
      {/* Rank */}
      <div className="w-7 text-center shrink-0">
        {trader.rank <= 3 ? (
          <Trophy className={`w-4 h-4 mx-auto ${BADGE_STYLES[trader.badge!].split(" ")[0]}`} />
        ) : (
          <span className="text-sm font-bold text-muted-foreground/50">{trader.rank}</span>
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {trader.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{trader.name}</p>
          <p className="text-xs text-muted-foreground">{trader.trades} trades</p>
        </div>
      </div>

      {/* Win rate */}
      <div className="hidden sm:block text-center shrink-0 w-16">
        <p className="text-sm font-bold text-primary">{trader.winRate}%</p>
        <p className="text-xs text-muted-foreground">Win rate</p>
      </div>

      {/* ROI */}
      <div className="hidden md:block text-center shrink-0 w-16">
        <p className="text-sm font-bold text-primary">+{trader.roi}%</p>
        <p className="text-xs text-muted-foreground">ROI</p>
      </div>

      {/* PnL */}
      <div className="text-right shrink-0 w-20">
        <p className="text-sm font-bold text-primary">+${(trader.pnl / 1000).toFixed(1)}k</p>
        <p className="text-xs text-muted-foreground">P&L</p>
      </div>

      {/* Copy button */}
      <button
        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all shrink-0"
        onClick={() => {}}
      >
        <Copy className="w-3 h-3" />
        <span className="hidden sm:inline">Follow</span>
      </button>
    </div>
  );
}

function MarketRow({ market, index }: { market: TransformedMarket; index: number }) {
  const yesPercent = (market.yesPrice * 100).toFixed(0);
  const noPercent = (market.noPrice * 100).toFixed(0);
  const volumeStr =
    market.volume >= 1_000_000
      ? `$${(market.volume / 1_000_000).toFixed(1)}M`
      : market.volume >= 1_000
      ? `$${(market.volume / 1_000).toFixed(0)}K`
      : `$${market.volume}`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all group">
      {/* Rank */}
      <span className="text-2xl font-bold text-muted-foreground/40 w-8 text-center shrink-0">
        {index + 1}
      </span>

      {/* Question */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {market.question}
        </p>
        {market.category && (
          <span className="text-xs text-muted-foreground mt-1 block capitalize">
            {market.category}
          </span>
        )}
      </div>

      {/* Yes bar */}
      <div className="hidden sm:flex items-center gap-2 w-48 shrink-0">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${yesPercent}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-primary w-8 text-right">{yesPercent}%</span>
      </div>

      {/* Volume */}
      <span className="hidden md:block text-xs text-muted-foreground w-16 text-right shrink-0">
        {volumeStr}
      </span>

      {/* Buttons */}
      <div className="flex gap-2 shrink-0">
        <button className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
          Yes
        </button>
        <button className="px-3 py-1 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          No
        </button>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 animate-pulse">
      <div className="w-8 h-6 bg-muted rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
      <div className="hidden sm:block w-48 h-2 bg-muted rounded-full" />
      <div className="hidden md:block w-12 h-4 bg-muted rounded" />
      <div className="flex gap-2">
        <div className="w-10 h-6 bg-muted rounded-lg" />
        <div className="w-10 h-6 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export function RiseInLeaderboard() {
  const [markets, setMarkets] = useState<TransformedMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"markets" | "traders" | "tournaments">("tournaments");

  useEffect(() => {
    const fetchTopMarkets = async () => {
      try {
        const res = await fetch("/api/polymarket?limit=8&sortBy=volume");
        const data = await res.json();
        const list: TransformedMarket[] = Array.isArray(data)
          ? data
          : Array.isArray(data.markets)
            ? data.markets
            : [];
        setMarkets(list.slice(0, 8));
        setConnected(true);
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMarkets();
  }, []);

  return (
    <section id="leaderboard" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground tracking-wide">
                Prediction Trade
              </span>
              {connected && (
                <span className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-3">
              Compete & Win
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Win Real Prizes
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed">
              Trade with virtual funds, win real rewards. Monthly tournaments with USDC prizes for top performers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 w-fit" asChild>
              <a href="/markets">
                View All Markets
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-8 border border-border">
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "tournaments"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gift className="w-4 h-4" />
            Tournaments
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">Live</span>
          </button>
          <button
            onClick={() => setActiveTab("markets")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "markets"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Top Markets
          </button>
          <button
            onClick={() => setActiveTab("traders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "traders"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Top Traders
          </button>
        </div>

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && (
          <div className="space-y-4">
            {/* Featured Tournament Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full animate-pulse">
                    LIVE NOW
                  </span>
                  <span className="text-sm text-muted-foreground">Ends in 6 days</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">April Championship</h3>
                <p className="text-muted-foreground mb-4 max-w-lg">
                  Compete with virtual funds. Top 3 traders by ROI win real USDC prizes.
                </p>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold">$500 USDC</span>
                    <span className="text-muted-foreground text-sm">Prize Pool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-bold">847</span>
                    <span className="text-muted-foreground text-sm">Participants</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Medal className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">1st: $250 USDC</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-400/10 border border-slate-400/20">
                    <Medal className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">2nd: $150 USDC</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600/10 border border-orange-600/20">
                    <Medal className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">3rd: $100 USDC</span>
                  </div>
                </div>
                <Button className="gap-2">
                  Join Tournament
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Other Tournaments */}
            <div className="grid md:grid-cols-2 gap-4">
              {TOURNAMENTS.slice(1).map((tournament) => (
                <div
                  key={tournament.id}
                  className="p-5 rounded-xl border border-border bg-card/50 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tournament.status === "active"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tournament.status === "active" ? "Active" : "Upcoming"}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {tournament.status === "active" ? `Ends in ${tournament.endsIn}` : `Starts in ${tournament.startsIn}`}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{tournament.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{tournament.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{tournament.prize}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{tournament.participants}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {tournament.status === "active" ? "Join" : "Register"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-6 p-4 rounded-xl border border-border bg-card/30 flex items-start gap-3">
              <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">How Tournaments Work</p>
                <p className="text-sm text-muted-foreground">
                  Trade with virtual funds during the competition period. Winners are ranked by ROI percentage. 
                  Real prizes are distributed via crypto wallet within 48 hours of tournament end.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Markets Tab */}
        {activeTab === "markets" && (
          <>
            <div className="flex items-center gap-4 px-4 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Market</span>
              <span className="hidden sm:block w-48 text-right pr-8">Probability</span>
              <span className="hidden md:block w-16 text-right">Volume</span>
              <span className="w-24 text-right">Trade</span>
            </div>
            <div className="space-y-3">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : markets.map((market, i) => (
                    <MarketRow key={market.id} market={market} index={i} />
                  ))}
            </div>
          </>
        )}

        {/* Traders Tab */}
        {activeTab === "traders" && (
          <>
            <div className="flex items-center gap-3 px-3 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span className="w-7 text-center">#</span>
              <span className="flex-1">Trader</span>
              <span className="hidden sm:block w-16 text-center">Win Rate</span>
              <span className="hidden md:block w-16 text-center">ROI</span>
              <span className="w-20 text-right">P&L</span>
              <span className="w-16 text-right">Action</span>
            </div>
            <div className="space-y-3">
              {TOP_TRADERS.map((trader) => (
                <TraderRow key={trader.rank} trader={trader} />
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl border border-border bg-card/30 flex items-center gap-3">
              <Star className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                Study how top predictors think. Learn their strategies and apply them to your own predictions.
              </p>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Ready to paper trade?</p>
              <p className="text-muted-foreground text-sm">
                Start with $100,000 virtual and climb the leaderboard.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <a href="/markets">Start Paper Trading</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

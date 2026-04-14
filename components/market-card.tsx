"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, Users, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface MarketCardProps {
  market: Market;
  onClick: () => void;
}

function formatTraders(n: number): string {
  if (n >= 1000) {
    return `${Math.floor(n / 100) / 10}k`;
  }
  return String(n);
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  return (
    <div
      onClick={onClick}
      className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all text-left w-full cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {market.trending && (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-0 gap-1">
              <Flame className="w-3 h-3" />
              Hot
            </Badge>
          )}
          {market.isNew && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1">
              <Zap className="w-3 h-3" />
              New
            </Badge>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            market.change >= 0 ? "text-primary" : "text-destructive"
          )}
        >
          {market.change >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {market.change >= 0 ? "+" : ""}
          {market.change}%
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm leading-snug mb-4 line-clamp-2 group-hover:text-primary transition-colors">
        {market.title}
      </h3>

      {/* Price Bars */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-primary font-medium">Yes {(market.yesPrice * 100).toFixed(0)}¢</span>
          <span className="text-destructive font-medium">No {(market.noPrice * 100).toFixed(0)}¢</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
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

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Buy Yes
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Buy No
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formatTraders(market.traders)}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {market.endDate}
        </div>
        <div className="font-medium text-foreground">{market.volume}</div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp } from "lucide-react";
import { formatPrice, formatVolume } from "@/lib/polymarket";

interface TradingPanelProps {
  outcome: string;
  price: number;
  volume24hr: number;
  liquidity: number;
  isLoading?: boolean;
}

export function TradingPanel({
  outcome,
  price,
  volume24hr,
  liquidity,
  isLoading = false,
}: TradingPanelProps) {
  const isYes = outcome === "YES";
  const color = isYes ? "text-primary" : "text-destructive";
  const bgColor = isYes ? "bg-primary/10" : "bg-destructive/10";
  const hoverColor = isYes
    ? "hover:bg-primary hover:text-primary-foreground"
    : "hover:bg-destructive hover:text-destructive-foreground";

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-6">Trade {outcome}</h3>

      {/* Price display */}
      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-2">Current Price</p>
        <div className={`text-5xl font-bold ${color} mb-1`}>
          {formatPrice(price)}%
        </div>
        <p className="text-xs text-muted-foreground">
          ${(price * 100).toFixed(2)} per share
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">24h Volume</span>
          </div>
          <span className="font-semibold">{formatVolume(volume24hr)}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Liquidity</span>
          </div>
          <span className="font-semibold">{formatVolume(liquidity)}</span>
        </div>
      </div>

      {/* Trading button */}
      <Button
        size="lg"
        disabled={isLoading}
        className={`w-full h-14 text-lg font-semibold gap-2 ${bgColor} ${color} ${hoverColor}`}
      >
        Buy {outcome}
      </Button>

      {/* Info text */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        Connect wallet to place predictions
      </p>
    </div>
  );
}

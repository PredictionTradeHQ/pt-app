"use client";

import { useRealtimePrices } from "@/contexts/realtime-prices-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealtimeStatsProps {
  className?: string;
  compact?: boolean;
}

/**
 * Display real-time statistics about WebSocket connection and market activity
 */
export function RealtimeStats({ className, compact = false }: RealtimeStatsProps) {
  const {
    connectionState,
    updatesPerSecond,
    totalUpdates,
    prices,
    recentTrades,
  } = useRealtimePrices();

  const { isConnected, isConnecting, error, messageCount } = connectionState;

  // Calculate stats
  const trackedMarkets = prices.size;
  const marketsByActivity = Array.from(prices.values())
    .sort((a, b) => b.lastUpdate - a.lastUpdate)
    .slice(0, 5);

  const statusColor = error
    ? "text-destructive"
    : isConnected
      ? "text-primary"
      : isConnecting
        ? "text-yellow-500"
        : "text-muted-foreground";

  const statusText = error
    ? "Error"
    : isConnected
      ? "Connected"
      : isConnecting
        ? "Connecting"
        : "Offline";

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 text-sm",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", statusColor)}>{statusText}</span>
          <span className="text-muted-foreground">{updatesPerSecond}/s</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          {trackedMarkets}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Connection Status */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={cn("w-4 h-4", statusColor)} />
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
          </div>
          <div className={cn("text-2xl font-bold", statusColor)}>
            {statusText}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isConnected ? "Live" : "Offline"}
          </p>
        </Card>

        {/* Updates Per Second */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Activity
            </span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {updatesPerSecond}
            <span className="text-sm text-muted-foreground">/s</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            updates per second
          </p>
        </Card>

        {/* Tracked Markets */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Markets
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-500">
            {trackedMarkets}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            tracked live
          </p>
        </Card>

        {/* Total Updates */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Total
            </span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            {totalUpdates.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            total updates
          </p>
        </Card>
      </div>

      {/* Most Active Markets */}
      {marketsByActivity.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Most Active Markets</h3>
          <div className="space-y-2">
            {marketsByActivity.map((market) => (
              <div
                key={market.marketId}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground truncate">
                    Market {market.marketId.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {(market.yesPrice * 100).toFixed(0)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {((Date.now() - market.lastUpdate) / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Recent Trades</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentTrades.slice(0, 5).map((trade, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground truncate">
                    Asset {trade.assetId.slice(0, 6)}...
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={trade.side === "BUY" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {trade.side}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ${(trade.price * 100).toFixed(0)}c
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Inline compact stats for headers/sidebars
 */
export function RealtimeStatsInline() {
  const { connectionState, updatesPerSecond, prices } = useRealtimePrices();
  const { isConnected } = connectionState;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <span className={cn(
          "inline-block w-2 h-2 rounded-full",
          isConnected ? "bg-primary" : "bg-muted-foreground"
        )} />
        <span>{isConnected ? "Live" : "Offline"}</span>
      </div>
      <span>{updatesPerSecond}/s</span>
      <span>{prices.size} markets</span>
    </div>
  );
}

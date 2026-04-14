"use client";

import { useRealtimePrices } from "@/contexts/realtime-prices-context";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Zap, Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RealtimeStatusProps {
  className?: string;
  showDetails?: boolean;
  connectionState?: any;
  updatesPerSecond?: number;
}

export function RealtimeStatus({ className, showDetails = false, connectionState: externalState, updatesPerSecond: externalUpdatesPerSecond }: RealtimeStatusProps) {
  const contextData = useRealtimePrices();
  const { connectionState, totalUpdates, updatesPerSecond, prices } = externalState ? { connectionState: externalState, totalUpdates: 0, updatesPerSecond: externalUpdatesPerSecond || 0, prices: new Map() } : contextData;
  const { isConnected, isConnecting, error, lastUpdate, messageCount } = connectionState;

  const getStatusColor = () => {
    if (error) return "text-destructive";
    if (isConnected) return "text-primary";
    if (isConnecting) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const getStatusText = () => {
    if (error) return "Error";
    if (isConnected) return "Live";
    if (isConnecting) return "Connecting...";
    return "Offline";
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return "Never";
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 2) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                isConnected ? "bg-primary/10" : "bg-muted",
                className
              )}
            >
              {isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-primary">Live</span>
                </>
              ) : isConnecting ? (
                <>
                  <Wifi className="w-3 h-3 text-yellow-500 animate-pulse" />
                  <span className="text-yellow-500">Connecting</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Offline</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <p className="font-medium">
                {isConnected
                  ? "Real-time WebSocket connected"
                  : "WebSocket disconnected"}
              </p>
              {isConnected && (
                <>
                  <p className="text-muted-foreground">
                    {updatesPerSecond} updates/sec
                  </p>
                  <p className="text-muted-foreground">
                    Tracking {prices.size} markets
                  </p>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        isConnected ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border",
        className
      )}
    >
      <div
        className={cn(
          "p-2 rounded-full",
          isConnected ? "bg-primary/10" : "bg-muted"
        )}
      >
        {isConnected ? (
          <Zap className={cn("w-4 h-4", getStatusColor())} />
        ) : isConnecting ? (
          <Wifi className={cn("w-4 h-4 animate-pulse", getStatusColor())} />
        ) : (
          <WifiOff className={cn("w-4 h-4", getStatusColor())} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", getStatusColor())}>
            {getStatusText()}
          </span>
          {isConnected && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </div>
        {isConnected ? (
          <p className="text-xs text-muted-foreground">
            {updatesPerSecond} updates/sec • {prices.size} markets
          </p>
        ) : error ? (
          <p className="text-xs text-destructive truncate">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isConnecting ? "Establishing connection..." : "Click to reconnect"}
          </p>
        )}
      </div>

      {isConnected && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>{formatLastUpdate()}</span>
        </div>
      )}
    </div>
  );
}

// Compact inline status for headers
export function RealtimeStatusInline({ className }: { className?: string }) {
  const { connectionState, updatesPerSecond } = useRealtimePrices();
  const { isConnected, isConnecting } = connectionState;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        isConnected ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      {isConnected ? (
        <>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          <span>Live</span>
          {updatesPerSecond > 0 && (
            <span className="text-muted-foreground">({updatesPerSecond}/s)</span>
          )}
        </>
      ) : isConnecting ? (
        <>
          <Wifi className="w-3 h-3 animate-pulse text-yellow-500" />
          <span className="text-yellow-500">Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

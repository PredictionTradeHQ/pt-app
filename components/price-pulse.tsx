"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PricePulseProps {
  price: number;
  previousPrice?: number;
  showPulse?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Component that shows a price with an optional pulse animation
 * when the price changes or updates are happening
 */
export function PricePulse({
  price,
  previousPrice,
  showPulse = true,
  className,
  children,
}: PricePulseProps) {
  const [displayPrice, setDisplayPrice] = useState(price);
  const [isChanging, setIsChanging] = useState(false);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (displayPrice !== price) {
      setIsChanging(true);
      
      // Determine direction
      if (price > displayPrice) {
        setPriceDirection("up");
      } else if (price < displayPrice) {
        setPriceDirection("down");
      }

      // Update price after a brief animation
      const timer = setTimeout(() => {
        setDisplayPrice(price);
        setIsChanging(false);
      }, 300);

      // Clear direction after animation
      const clearTimer = setTimeout(() => {
        setPriceDirection(null);
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [price, displayPrice]);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        showPulse && isChanging && "animate-pulse",
        priceDirection === "up" && "text-primary",
        priceDirection === "down" && "text-destructive",
        className
      )}
    >
      {children || displayPrice}
    </div>
  );
}

interface LiveIndicatorProps {
  isLive: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Visual indicator showing live streaming status
 */
export function LiveIndicator({
  isLive,
  className,
  compact = false,
}: LiveIndicatorProps) {
  if (!isLive) return null;

  if (compact) {
    return (
      <span className={cn(
        "relative inline-flex h-2 w-2",
        className
      )}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary",
      className
    )}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <span>Live</span>
    </div>
  );
}

interface UpdatesPerSecondProps {
  value: number;
  className?: string;
}

/**
 * Shows real-time updates per second metric
 */
export function UpdatesPerSecond({
  value,
  className,
}: UpdatesPerSecondProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground",
      className
    )}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-muted-foreground opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-muted-foreground" />
      </span>
      <span>{value}/s</span>
    </div>
  );
}

interface PriceChangeIndicatorProps {
  change: number;
  className?: string;
  showPercent?: boolean;
}

/**
 * Shows price change with directional indicator
 */
export function PriceChangeIndicator({
  change,
  className,
  showPercent = true,
}: PriceChangeIndicatorProps) {
  const isPositive = change >= 0;

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-medium",
      isPositive ? "text-primary" : "text-destructive",
      className
    )}>
      <span>{isPositive ? "▲" : "▼"}</span>
      <span>{Math.abs(change).toFixed(2)}{showPercent ? "%" : ""}</span>
    </span>
  );
}

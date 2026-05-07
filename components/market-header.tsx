"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Droplets, DollarSign, Star } from "lucide-react";
import { MarketDetail, formatDate, formatDateFull, formatVolume } from "@/lib/polymarket";

interface MarketHeaderProps {
  market: MarketDetail;
}

export function MarketHeader({ market }: MarketHeaderProps) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      {/* Back button */}
      <Link href="/markets">
        <Button variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </Button>
      </Link>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {market.category && (
          <Badge variant="outline" className="text-sm">
            {market.category}
          </Badge>
        )}
        <Badge className="bg-primary/10 text-primary border-0">Live</Badge>
      </div>

      {/* Question */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        {market.question}
      </h1>

      {/* Description */}
      {market.description && (
        <p className="text-muted-foreground mb-6 max-w-3xl">{market.description}</p>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Volume</span>
          </div>
          <div className="text-xl font-bold">{formatVolume(market.volume)}</div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Liquidity</span>
          </div>
          <div className="text-xl font-bold">{formatVolume(market.liquidity)}</div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">End Date</span>
          </div>
          <div className="text-sm font-bold">{formatDate(market.endDate)}</div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">24h Volume</span>
          </div>
          <div className="text-xl font-bold">{formatVolume(market.volume24hr)}</div>
        </div>
      </div>
    </div>
  );
}

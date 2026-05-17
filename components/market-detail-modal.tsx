"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Share2,
  Star,
  Info,
  Target,
} from "lucide-react";
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

interface MarketDetailModalProps {
  market: Market | null;
  open: boolean;
  onClose: () => void;
  onBet?: (outcome: "YES" | "NO", amount: number) => void;
  balance?: number;
}

export function MarketDetailModal({ market, open, onClose, onBet, balance }: MarketDetailModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");

  if (!market) return null;

  const price = selectedOutcome === "yes" ? market.yesPrice : market.noPrice;
  const shares = amount ? (parseFloat(amount) / price).toFixed(2) : "0";
  const potentialReturn = amount
    ? ((parseFloat(amount) / price) * (1 - price)).toFixed(2)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{market.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Prediction market details and prediction interface for {market.title}
        </DialogDescription>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {market.category}
                </Badge>
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
                  {market.change}% 24h
                </div>
              </div>
              <DialogTitle className="text-xl font-bold leading-tight">
                {market.title}
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-0">
          {/* Left: Market Info */}
          <div className="md:col-span-3 p-6 border-r border-border">
            {/* Price Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedOutcome("yes")}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  selectedOutcome === "yes"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className="text-sm text-muted-foreground mb-1">Yes</p>
                <p className="text-3xl font-bold text-primary">
                  {(market.yesPrice * 100).toFixed(0)}¢
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(market.yesPrice * 100).toFixed(1)}% chance
                </p>
              </button>
              <button
                onClick={() => setSelectedOutcome("no")}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  selectedOutcome === "no"
                    ? "border-destructive bg-destructive/5"
                    : "border-border hover:border-destructive/50"
                )}
              >
                <p className="text-sm text-muted-foreground mb-1">No</p>
                <p className="text-3xl font-bold text-destructive">
                  {(market.noPrice * 100).toFixed(0)}¢
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(market.noPrice * 100).toFixed(1)}% chance
                </p>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Volume</span>
                </div>
                <p className="font-semibold">{market.volume}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Traders</span>
                </div>
                <p className="font-semibold">{market.traders.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Ends</span>
                </div>
                <p className="font-semibold">{market.endDate}</p>
              </div>
            </div>

            {/* About */}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {market.description}
              </p>
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Resolution Criteria</p>
                    <p className="text-xs text-muted-foreground">
                      This market will be resolved based on official announcements and verified news sources. Resolution will occur within 24 hours of the outcome being determined.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Trade Panel */}
          <div className="md:col-span-2 p-6 bg-muted/30">
            {/* Community Momentum */}
            {(() => {
              const yesPct = Math.round(market.yesPrice * 100)
              const label =
                yesPct >= 87 ? `${yesPct}% say YES` :
                yesPct >= 72 ? `Leaning YES · ${yesPct}%` :
                yesPct >= 57 ? "Slight YES lean" :
                yesPct >= 44 ? "Community split" :
                yesPct >= 29 ? "Slight NO lean" :
                yesPct >= 14 ? `Leaning NO · ${100 - yesPct}%` :
                `${100 - yesPct}% say NO`
              return (
                <div className="mb-5 rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                    Community
                  </p>
                  {/* YES / NO split bar */}
                  <div className="flex rounded-full overflow-hidden h-2 mb-2">
                    <div className="bg-primary transition-all" style={{ width: market.yesPrice * 100 + "%" }} />
                    <div className="bg-destructive transition-all" style={{ width: market.noPrice * 100 + "%" }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] mb-2.5">
                    <span className="text-primary font-semibold">{yesPct}% YES</span>
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-destructive font-semibold">{100 - yesPct}% NO</span>
                  </div>
                  {/* Live traders */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                    </span>
                    <span className="text-green-400 font-semibold">{market.traders.toLocaleString()}</span>
                    <span className="text-muted-foreground">traders in this market</span>
                  </div>
                </div>
              )
            })()}

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Make Prediction</h3>
              {balance !== undefined && (
                <span className="text-xs text-muted-foreground">
                  Available: <span className="font-semibold text-foreground">${balance.toLocaleString()}</span>
                </span>
              )}
            </div>

            {/* Order Type */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={orderType === "market" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setOrderType("market")}
              >
                Market
              </Button>
              <Button
                variant={orderType === "limit" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setOrderType("limit")}
              >
                Limit
              </Button>
            </div>

            {/* Outcome Selection */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedOutcome === "yes" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  selectedOutcome === "yes" && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedOutcome("yes")}
              >
                Yes {(market.yesPrice * 100).toFixed(0)}¢
              </Button>
              <Button
                variant={selectedOutcome === "no" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  selectedOutcome === "no" && "bg-destructive text-destructive-foreground"
                )}
                onClick={() => setSelectedOutcome("no")}
              >
                No {(market.noPrice * 100).toFixed(0)}¢
              </Button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  max={balance}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (balance !== undefined && parseFloat(val) > balance) {
                      setAmount(String(balance));
                    } else {
                      setAmount(val);
                    }
                  }}
                  className={cn(
                    "pl-9",
                    balance !== undefined && parseFloat(amount) > balance && "border-destructive"
                  )}
                />
              </div>
              {balance !== undefined && parseFloat(amount) > balance && (
                <p className="text-xs text-destructive mt-1">Exceeds available balance</p>
              )}
              <div className="flex gap-2 mt-2">
                {["10", "25", "50", "100"].map((val) => {
                  const disabled = balance !== undefined && parseInt(val) > balance;
                  return (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      disabled={disabled}
                      onClick={() => setAmount(val)}
                    >
                      ${val}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 rounded-lg bg-background border border-border mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Shares</span>
                <span className="font-medium">{shares}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Avg Price</span>
                <span className="font-medium">{(price * 100).toFixed(1)}¢</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Return</span>
                <span className="font-medium text-primary">+${potentialReturn}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                (balance !== undefined && parseFloat(amount) > balance)
              }
              onClick={() => {
                const parsed = parseFloat(amount);
                if (!parsed || parsed <= 0) return;
                if (balance !== undefined && parsed > balance) return;
                onBet?.(selectedOutcome === "yes" ? "YES" : "NO", parsed);
                onClose();
              }}
            >
              <Target className="w-4 h-4" />
              Make Prediction
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Virtual funds only — no real money involved
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

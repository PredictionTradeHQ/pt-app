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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Share2,
  Star,
  Info,
  ArrowRight,
  Wallet,
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
}

export function MarketDetailModal({ market, open, onClose }: MarketDetailModalProps) {
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
          Prediction market details and trading interface for {market.title}
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

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">
                  About
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  Comments
                </TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-4">
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
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {["JD", "AK", "MR", "LS", "BT"][i]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Bought {["Yes", "No", "Yes", "Yes", "No"][i]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {["2 min", "5 min", "12 min", "1 hour", "3 hours"][i]} ago
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">
                        ${["150", "500", "75", "1,200", "300"][i]}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="comments" className="mt-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Trade Panel */}
          <div className="md:col-span-2 p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Place Order</h3>

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
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {["10", "25", "50", "100"].map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setAmount(val)}
                  >
                    ${val}
                  </Button>
                ))}
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
            <Button className="w-full gap-2" size="lg">
              <Wallet className="w-4 h-4" />
              Connect Wallet to Trade
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              By trading, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

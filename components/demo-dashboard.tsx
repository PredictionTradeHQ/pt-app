'use client';

import { usePMSMarkets, type Market } from '@/hooks/use-pms-markets';
import { useDemoPortfolio } from '@/stores/demo-portfolio';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function DemoDashboard() {
  const {
    isSimulating,
    balance,
    bets,
    startSimulation,
    stopSimulation,
    placeBet,
    closeBet,
    getTotalValue,
    getTotalPnL,
    getPnLPercentage,
  } = useDemoPortfolio();

  const { markets, isLoading } = usePMSMarkets(isSimulating);
  const [selectedBet, setSelectedBet] = useState<{
    market: Market;
    outcome: 'YES' | 'NO';
    amount: number;
  } | null>(null);
  const [betAmount, setBetAmount] = useState('50');

  if (!isSimulating) {
    return null;
  }

  const totalValue = getTotalValue();
  const pnl = getTotalPnL();
  const pnlPct = getPnLPercentage();

  const handlePlaceBet = (market: Market, outcome: 'YES' | 'NO') => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    const price = outcome === 'YES' ? market.yesPrice : market.noPrice;
    const shares = price > 0 ? amount / price : 0;

    placeBet({
      marketId: market.id,
      marketTitle: market.title,
      outcome,
      amount,
      price,
      shares,
      currentPrice: price,
    });

    setSelectedBet(null);
    setBetAmount('50');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Demo Trading Dashboard</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={stopSimulation}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Balance */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Balance</span>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Available</p>
            </Card>

            {/* Total Value */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <Activity className="w-4 h-4 text-foreground" />
              </div>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Current portfolio</p>
            </Card>

            {/* P&L */}
            <Card className={cn(
              'p-6 border-border',
              pnl >= 0 ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Profit/Loss</span>
                {pnl >= 0
                  ? <TrendingUp className="w-4 h-4 text-primary" />
                  : <TrendingDown className="w-4 h-4 text-destructive" />}
              </div>
              <p className={cn(
                'text-2xl font-bold',
                pnl >= 0 ? 'text-primary' : 'text-destructive'
              )}>
                ${pnl.toFixed(2)}
              </p>
              <p className={cn(
                'text-xs mt-1',
                pnl >= 0 ? 'text-primary/70' : 'text-destructive/70'
              )}>
                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
              </p>
            </Card>

            {/* Active Bets */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Bets</span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{bets.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Open positions</p>
            </Card>
          </div>

          {/* Bet Confirmation Modal */}
          {selectedBet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <Card className="w-full max-w-md p-6 bg-card border-border">
                <h2 className="text-xl font-bold mb-2">{selectedBet.market.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">{selectedBet.market.description}</p>

                {/* Outcome Badge */}
                <div className={cn(
                  'p-4 rounded-lg mb-6 text-center font-bold',
                  selectedBet.outcome === 'YES'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                )}>
                  {selectedBet.outcome === 'YES' ? 'YES' : 'NO'}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">${selectedBet.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Price</span>
                    <span className="font-semibold">
                      {(selectedBet.outcome === 'YES'
                        ? selectedBet.market.yesPrice
                        : selectedBet.market.noPrice) * 100
                      ).toFixed(0)}c
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Shares</span>
                    <span className="font-semibold">
                      {(selectedBet.amount /
                        (selectedBet.outcome === 'YES'
                          ? selectedBet.market.yesPrice
                          : selectedBet.market.noPrice)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Amount Input */}
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Bet amount"
                />

                {/* Quick amounts */}
                <div className="flex gap-2 mb-6">
                  {[25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt.toString())}
                      className="flex-1 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedBet(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={cn(
                      'flex-1 gap-2',
                      selectedBet.outcome === 'YES'
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-destructive hover:bg-destructive/90'
                    )}
                    onClick={() => handlePlaceBet(selectedBet.market, selectedBet.outcome)}
                    disabled={parseFloat(betAmount) > balance}
                  >
                    <Check className="w-4 h-4" />
                    Place Bet
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Markets Grid */}
          <div>
            <h2 className="text-xl font-bold mb-4">Available Markets</h2>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading markets...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {markets.map((market) => (
                  <Card
                    key={market.id}
                    className="p-5 bg-card border-border hover:border-primary/50 transition-colors"
                  >
                    {/* Market header */}
                    <div className="mb-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{market.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {market.description}
                      </p>
                    </div>

                    {/* Category badge */}
                    <Badge variant="outline" className="mb-4 text-xs">
                      {market.category}
                    </Badge>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                        <p className="text-xs text-muted-foreground mb-1">YES</p>
                        <p className="font-bold text-primary">
                          {(market.yesPrice * 100).toFixed(0)}c
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                        <p className="text-xs text-muted-foreground mb-1">NO</p>
                        <p className="font-bold text-destructive">
                          {(market.noPrice * 100).toFixed(0)}c
                        </p>
                      </div>
                    </div>

                    {/* Volume */}
                    <p className="text-xs text-muted-foreground mb-4">
                      24h Volume: ${market.volume24h.toLocaleString()}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 text-primary hover:bg-primary/10"
                        onClick={() =>
                          setSelectedBet({ market, outcome: 'YES', amount: parseFloat(betAmount) })
                        }
                        disabled={balance <= 0}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Yes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setSelectedBet({ market, outcome: 'NO', amount: parseFloat(betAmount) })
                        }
                        disabled={balance <= 0}
                      >
                        <ArrowDownRight className="w-4 h-4" />
                        No
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active Positions */}
          {bets.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">Your Positions</h2>
              <div className="space-y-3">
                {bets.map((bet) => {
                  const pnl = (bet.currentPrice - bet.price) * bet.shares;
                  const pnlPct = ((bet.currentPrice - bet.price) / bet.price) * 100;

                  return (
                    <Card key={bet.id} className="p-4 bg-card border-border flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{bet.marketTitle}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-bold',
                            bet.outcome === 'YES'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-destructive/20 text-destructive'
                          )}>
                            {bet.outcome}
                          </span>
                          <span>Wagered: ${bet.amount.toFixed(2)}</span>
                          <span>Shares: {bet.shares.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className={cn(
                          'font-bold',
                          pnl >= 0 ? 'text-primary' : 'text-destructive'
                        )}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeBet(bet.id)}
                      >
                        Close
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

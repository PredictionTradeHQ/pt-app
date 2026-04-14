"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  usePolymarketWebSocket,
  type PriceUpdate,
  type TradeUpdate,
  type WebSocketState,
} from "@/hooks/use-polymarket-websocket";

// Market price data with real-time updates
export interface MarketPriceData {
  marketId: string;
  assetIds: string[];
  yesPrice: number;
  noPrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  lastTradePrice: number | null;
  lastTradeSize: number | null;
  lastTradeSide: "BUY" | "SELL" | null;
  lastUpdate: number;
  priceHistory: number[]; // Last N prices for sparkline
}

interface RealtimePricesContextValue {
  // Price data by market ID
  prices: Map<string, MarketPriceData>;
  
  // Get price for a specific market
  getPrice: (marketId: string) => MarketPriceData | undefined;
  
  // Register markets to track (call with asset IDs)
  registerMarkets: (markets: Array<{ marketId: string; assetIds: string[] }>) => void;
  
  // Unregister markets
  unregisterMarkets: (marketIds: string[]) => void;
  
  // WebSocket connection state
  connectionState: WebSocketState;
  
  // Recent trades across all markets
  recentTrades: TradeUpdate[];
  
  // Stats
  totalUpdates: number;
  updatesPerSecond: number;
}

const RealtimePricesContext = createContext<RealtimePricesContextValue | null>(
  null
);

// Maximum number of price history points to keep
const MAX_PRICE_HISTORY = 30;

// Maximum number of recent trades to keep
const MAX_RECENT_TRADES = 50;

export function RealtimePricesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Map of market ID -> price data
  const [prices, setPrices] = useState<Map<string, MarketPriceData>>(new Map());
  
  // Recent trades
  const [recentTrades, setRecentTrades] = useState<TradeUpdate[]>([]);
  
  // Stats
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [updatesPerSecond, setUpdatesPerSecond] = useState(0);
  
  // Track asset IDs to market IDs mapping
  const assetToMarketRef = useRef<Map<string, string>>(new Map());
  
  // All asset IDs we're tracking
  const [trackedAssetIds, setTrackedAssetIds] = useState<string[]>([]);
  
  // Updates counter for calculating updates per second
  const updatesCounterRef = useRef(0);

  // Handle price updates from WebSocket
  const handlePriceUpdate = useCallback((update: PriceUpdate) => {
    const marketId = assetToMarketRef.current.get(update.assetId);
    if (!marketId) return;

    updatesCounterRef.current++;
    setTotalUpdates((prev) => prev + 1);

    setPrices((prev) => {
      const existing = prev.get(marketId);
      if (!existing) return prev;

      // Determine if this is a YES or NO asset update based on position in assetIds array
      const isYesAsset = existing.assetIds[0] === update.assetId;
      
      // Calculate new prices
      const newYesPrice = isYesAsset ? update.midPrice : existing.yesPrice;
      const newNoPrice = !isYesAsset ? update.midPrice : existing.noPrice;

      // Update price history
      const newHistory = [...existing.priceHistory, newYesPrice].slice(
        -MAX_PRICE_HISTORY
      );

      const newMap = new Map(prev);
      newMap.set(marketId, {
        ...existing,
        yesPrice: newYesPrice,
        noPrice: newNoPrice,
        bestBid: isYesAsset ? update.bestBid : existing.bestBid,
        bestAsk: isYesAsset ? update.bestAsk : existing.bestAsk,
        spread: isYesAsset ? update.spread : existing.spread,
        lastUpdate: update.timestamp,
        priceHistory: newHistory,
      });

      return newMap;
    });
  }, []);

  // Handle trade updates from WebSocket
  const handleTradeUpdate = useCallback((update: TradeUpdate) => {
    const marketId = assetToMarketRef.current.get(update.assetId);
    if (!marketId) return;

    updatesCounterRef.current++;
    setTotalUpdates((prev) => prev + 1);

    // Update market's last trade info
    setPrices((prev) => {
      const existing = prev.get(marketId);
      if (!existing) return prev;

      const isYesAsset = existing.assetIds[0] === update.assetId;
      const newYesPrice = isYesAsset ? update.price : existing.yesPrice;

      // Update price history with trade price
      const newHistory = [...existing.priceHistory, newYesPrice].slice(
        -MAX_PRICE_HISTORY
      );

      const newMap = new Map(prev);
      newMap.set(marketId, {
        ...existing,
        yesPrice: newYesPrice,
        noPrice: isYesAsset ? 1 - update.price : existing.noPrice,
        lastTradePrice: update.price,
        lastTradeSize: update.size,
        lastTradeSide: update.side,
        lastUpdate: update.timestamp,
        priceHistory: newHistory,
      });

      return newMap;
    });

    // Add to recent trades
    setRecentTrades((prev) => [update, ...prev].slice(0, MAX_RECENT_TRADES));
  }, []);

  // Handle book updates (initial orderbook snapshot)
  const handleBookUpdate = useCallback(
    (
      assetId: string,
      bids: Array<{ price: string; size: string }>,
      asks: Array<{ price: string; size: string }>
    ) => {
      const marketId = assetToMarketRef.current.get(assetId);
      if (!marketId) return;

      const bestBid = bids.length > 0 ? parseFloat(bids[0].price) : 0;
      const bestAsk = asks.length > 0 ? parseFloat(asks[0].price) : 1;
      const midPrice = (bestBid + bestAsk) / 2;

      setPrices((prev) => {
        const existing = prev.get(marketId);
        if (!existing) return prev;

        const isYesAsset = existing.assetIds[0] === assetId;
        const newYesPrice = isYesAsset ? midPrice : existing.yesPrice;

        const newMap = new Map(prev);
        newMap.set(marketId, {
          ...existing,
          yesPrice: newYesPrice,
          noPrice: isYesAsset ? 1 - midPrice : existing.noPrice,
          bestBid: isYesAsset ? bestBid : existing.bestBid,
          bestAsk: isYesAsset ? bestAsk : existing.bestAsk,
          spread: bestAsk - bestBid,
          lastUpdate: Date.now(),
        });

        return newMap;
      });
    },
    []
  );

  // WebSocket connection
  const connectionState = usePolymarketWebSocket({
    assetIds: trackedAssetIds,
    onPriceUpdate: handlePriceUpdate,
    onTradeUpdate: handleTradeUpdate,
    onBookUpdate: handleBookUpdate,
    enabled: trackedAssetIds.length > 0,
  });

  // Calculate updates per second
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatesPerSecond(updatesCounterRef.current);
      updatesCounterRef.current = 0;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Register markets to track
  const registerMarkets = useCallback(
    (markets: Array<{ marketId: string; assetIds: string[] }>) => {
      const newAssetIds: string[] = [];
      const newPrices = new Map(prices);

      for (const market of markets) {
        // Skip if already tracking
        if (prices.has(market.marketId)) continue;

        // Map asset IDs to market ID
        for (const assetId of market.assetIds) {
          assetToMarketRef.current.set(assetId, market.marketId);
          newAssetIds.push(assetId);
        }

        // Initialize price data
        newPrices.set(market.marketId, {
          marketId: market.marketId,
          assetIds: market.assetIds,
          yesPrice: 0.5,
          noPrice: 0.5,
          bestBid: 0,
          bestAsk: 1,
          spread: 1,
          lastTradePrice: null,
          lastTradeSize: null,
          lastTradeSide: null,
          lastUpdate: Date.now(),
          priceHistory: [0.5],
        });
      }

      if (newAssetIds.length > 0) {
        setPrices(newPrices);
        setTrackedAssetIds((prev) => [...prev, ...newAssetIds]);
      }
    },
    [prices]
  );

  // Unregister markets
  const unregisterMarkets = useCallback((marketIds: string[]) => {
    const assetIdsToRemove: string[] = [];

    setPrices((prev) => {
      const newPrices = new Map(prev);

      for (const marketId of marketIds) {
        const data = newPrices.get(marketId);
        if (data) {
          assetIdsToRemove.push(...data.assetIds);
          for (const assetId of data.assetIds) {
            assetToMarketRef.current.delete(assetId);
          }
          newPrices.delete(marketId);
        }
      }

      return newPrices;
    });

    if (assetIdsToRemove.length > 0) {
      setTrackedAssetIds((prev) =>
        prev.filter((id) => !assetIdsToRemove.includes(id))
      );
    }
  }, []);

  // Get price for a specific market
  const getPrice = useCallback(
    (marketId: string) => prices.get(marketId),
    [prices]
  );

  const value: RealtimePricesContextValue = {
    prices,
    getPrice,
    registerMarkets,
    unregisterMarkets,
    connectionState,
    recentTrades,
    totalUpdates,
    updatesPerSecond,
  };

  return (
    <RealtimePricesContext.Provider value={value}>
      {children}
    </RealtimePricesContext.Provider>
  );
}

export function useRealtimePrices() {
  const context = useContext(RealtimePricesContext);
  if (!context) {
    throw new Error(
      "useRealtimePrices must be used within a RealtimePricesProvider"
    );
  }
  return context;
}

// Hook to track specific markets
export function useMarketPrice(marketId: string, assetIds?: string[]) {
  const { getPrice, registerMarkets, unregisterMarkets } = useRealtimePrices();

  useEffect(() => {
    if (assetIds && assetIds.length > 0) {
      registerMarkets([{ marketId, assetIds }]);
    }

    return () => {
      unregisterMarkets([marketId]);
    };
  }, [marketId, assetIds, registerMarkets, unregisterMarkets]);

  return getPrice(marketId);
}

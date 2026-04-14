"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PMS_WS_URL } from "@/lib/pms";

// Heartbeat interval (10 seconds)
const HEARTBEAT_INTERVAL = 10000;

// Reconnection settings
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export interface PriceUpdate {
  assetId: string;
  marketId: string;
  bestBid: number;
  bestAsk: number;
  midPrice: number;
  spread: number;
  timestamp: number;
}

export interface TradeUpdate {
  assetId: string;
  marketId: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
  timestamp: number;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastUpdate: number | null;
  messageCount: number;
}

interface UsePMSWebSocketOptions {
  assetIds: string[];
  onPriceUpdate?: (update: PriceUpdate) => void;
  onTradeUpdate?: (update: TradeUpdate) => void;
  onBookUpdate?: (assetId: string, bids: Array<{ price: string; size: string }>, asks: Array<{ price: string; size: string }>) => void;
  enabled?: boolean;
}

export function usePMSWebSocket({
  assetIds,
  onPriceUpdate,
  onTradeUpdate,
  onBookUpdate,
  enabled = true,
}: UsePMSWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const subscribedAssetsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastUpdate: null,
    messageCount: 0,
  });

  // Clear all intervals and timeouts
  const clearTimers = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Handle pong response
        if (data.type === "pong" || data.type === "heartbeat") {
          return;
        }

        if (!mountedRef.current) return;

        setState((prev) => ({
          ...prev,
          lastUpdate: Date.now(),
          messageCount: prev.messageCount + 1,
        }));

        switch (data.type) {
          case "price_update": {
            const bestBid = parseFloat(data.data?.bestBid) || 0;
            const bestAsk = parseFloat(data.data?.bestAsk) || 0;
            const midPrice = data.data?.price || (bestBid + bestAsk) / 2;
            const spread = parseFloat(data.data?.spread) || bestAsk - bestBid;

            onPriceUpdate?.({
              assetId: data.data?.outcomeId || data.marketId,
              marketId: data.marketId,
              bestBid,
              bestAsk,
              midPrice,
              spread,
              timestamp: data.data?.timestamp || Date.now(),
            });
            break;
          }

          case "trade": {
            onTradeUpdate?.({
              assetId: data.data?.outcomeId || data.marketId,
              marketId: data.marketId,
              price: parseFloat(data.data?.price) || 0,
              size: parseFloat(data.data?.size) || 0,
              side: data.data?.side?.toUpperCase() as "BUY" | "SELL",
              timestamp: data.data?.timestamp || Date.now(),
            });
            break;
          }

          case "book": {
            onBookUpdate?.(
              data.data?.outcomeId || data.marketId,
              data.data?.bids || [],
              data.data?.asks || []
            );
            break;
          }
        }
      } catch {
        // Ignore parse errors for non-JSON messages
      }
    },
    [onPriceUpdate, onTradeUpdate, onBookUpdate]
  );

  // Subscribe to assets
  const subscribe = useCallback((ids: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (ids.length === 0) return;

    const newIds = ids.filter((id) => !subscribedAssetsRef.current.has(id));
    if (newIds.length === 0) return;

    const message = JSON.stringify({
      type: "subscribe",
      channels: ["price_update", "trade"],
      marketIds: newIds,
    });

    wsRef.current.send(message);
    newIds.forEach((id) => subscribedAssetsRef.current.add(id));
  }, []);

  // Unsubscribe from assets
  const unsubscribe = useCallback((ids: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (ids.length === 0) return;

    const existingIds = ids.filter((id) => subscribedAssetsRef.current.has(id));
    if (existingIds.length === 0) return;

    const message = JSON.stringify({
      type: "unsubscribe",
      marketIds: existingIds,
    });

    wsRef.current.send(message);
    existingIds.forEach((id) => subscribedAssetsRef.current.delete(id));
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || assetIds.length === 0) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(PMS_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }

        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));

        // Reset reconnect delay on successful connection
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

        // Start heartbeat
        startHeartbeat();

        // Subscribe to assets
        subscribedAssetsRef.current.clear();
        subscribe(assetIds);
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setState((prev) => ({
          ...prev,
          error: "WebSocket connection error",
        }));
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;

        clearTimers();
        subscribedAssetsRef.current.clear();

        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Attempt to reconnect with exponential backoff
        if (enabled && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              reconnectDelayRef.current = Math.min(
                reconnectDelayRef.current * 2,
                MAX_RECONNECT_DELAY
              );
              connect();
            }
          }, reconnectDelayRef.current);
        }
      };
    } catch {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Failed to create WebSocket connection",
      }));
    }
  }, [enabled, assetIds, handleMessage, subscribe, startHeartbeat, clearTimers]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    subscribedAssetsRef.current.clear();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, [clearTimers]);

  // Effect to connect/disconnect based on enabled state
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && assetIds.length > 0) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Effect to update subscriptions when assetIds change
  useEffect(() => {
    if (!state.isConnected) return;

    const currentIds = new Set(assetIds);
    const subscribedIds = subscribedAssetsRef.current;

    // Find new assets to subscribe
    const toSubscribe = assetIds.filter((id) => !subscribedIds.has(id));

    // Find assets to unsubscribe
    const toUnsubscribe = Array.from(subscribedIds).filter(
      (id) => !currentIds.has(id)
    );

    if (toUnsubscribe.length > 0) {
      unsubscribe(toUnsubscribe);
    }

    if (toSubscribe.length > 0) {
      subscribe(toSubscribe);
    }
  }, [assetIds, state.isConnected, subscribe, unsubscribe]);

  return {
    ...state,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}

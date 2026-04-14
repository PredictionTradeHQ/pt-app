# WebSocket Real-Time Implementation Guide

## Overview

This implementation adds real-time price updates to the Prediction Trade app using Polymarket's WebSocket API. Prices update every 1-2 seconds without page reloads, creating a professional "live trading" experience.

## Architecture

### Components

1. **usePolymarketWebSocket Hook** (`hooks/use-polymarket-websocket.ts`)
   - Manages WebSocket connection to Polymarket
   - Handles automatic reconnection with exponential backoff
   - Sends heartbeat pings every 10 seconds
   - Processes different event types: `best_bid_ask`, `last_trade_price`, `book`, `price_change`

2. **RealtimePricesContext** (`contexts/realtime-prices-context.tsx`)
   - Global state management for all market prices
   - Tracks 30 price points per market for sparkline charts
   - Maps asset IDs to market IDs
   - Provides `registerMarkets` and `unregisterMarkets` methods
   - Calculates updates per second metric

3. **RealtimeStatus Component** (`components/realtime-status.tsx`)
   - Visual indicator of WebSocket connection status
   - Shows updates per second and number of tracked markets
   - Compact inline version for headers
   - Tooltip with detailed connection info

4. **MarketsApp Integration** (`components/markets-app.tsx`)
   - Registers markets for real-time tracking when they load
   - Passes real-time prices to MarketCard component
   - Shows "Live" badge when prices are being updated in real-time
   - Uses tabular-nums for smooth price animation

## How It Works

### 1. Market Registration

When markets are fetched from the API, they include `assetIds` (CLOB token IDs):

```typescript
const marketsToRegister = markets
  .filter(m => m.assetIds && m.assetIds.length >= 2)
  .map(m => ({
    marketId: m.id,
    assetIds: m.assetIds,
  }));

registerMarkets(marketsToRegister);
```

### 2. WebSocket Connection

The hook establishes a connection to `wss://ws-subscriptions-clob.polymarket.com/ws/market`:

```typescript
const message = JSON.stringify({
  assets_ids: assetIds,
  type: "market",
  custom_feature_enabled: true,
});
ws.send(message);
```

### 3. Price Updates

As orders are placed/cancelled, the WebSocket sends updates:

```typescript
{
  "event_type": "best_bid_ask",
  "asset_id": "...",
  "best_bid": "0.45",
  "best_ask": "0.48",
  "spread": "0.03",
  "timestamp": 1712...
}
```

The context updates the market's `yesPrice`/`noPrice` and maintains a 30-point history for the sparkline.

### 4. UI Updates

MarketCard receives real-time prices and updates with smooth transitions:

```typescript
<MarketCard
  realtimeYesPrice={rtPrice?.yesPrice}
  realtimeNoPrice={rtPrice?.noPrice}
  realtimePriceHistory={rtPrice?.priceHistory}
  isLive={!!rtPrice}
/>
```

## Features

- **Real-time Updates**: Prices update every 1-2 seconds (sometimes faster during high activity)
- **Automatic Reconnection**: Exponential backoff (1s → 30s) if connection drops
- **Heartbeat**: Sends "PING" every 10 seconds to keep connection alive
- **Visual Feedback**: 
  - "Live" badge with pulsing dot when connected
  - Updates/sec counter
  - Connection status in header
- **Price History**: 30-point sparkline for each market
- **Trade Tracking**: Recent trades displayed with timestamps
- **Performance**: Efficient batching of asset subscriptions

## Configuration

### WebSocket Endpoint
```typescript
const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";
```

### Heartbeat Interval
```typescript
const HEARTBEAT_INTERVAL = 10000; // 10 seconds
```

### Reconnection Strategy
```typescript
const INITIAL_RECONNECT_DELAY = 1000;      // 1 second
const MAX_RECONNECT_DELAY = 30000;         // 30 seconds
```

### Price History Size
```typescript
const MAX_PRICE_HISTORY = 30;              // Keep 30 price points
```

## Usage in Components

### Global Access
```typescript
const { 
  prices, 
  registerMarkets, 
  connectionState, 
  updatesPerSecond 
} = useRealtimePrices();

// Get specific market price
const marketPrice = prices.get(marketId);
console.log(marketPrice.yesPrice); // 0.52
```

### Individual Market Tracking
```typescript
const marketPrice = useMarketPrice(marketId, assetIds);
if (marketPrice) {
  console.log(`Yes: ${marketPrice.yesPrice * 100}%`);
}
```

## Performance Considerations

1. **Asset ID Batching**: Multiple assets in single subscription message
2. **Efficient Updates**: Only relevant market data updated per message
3. **Limited History**: Only keeps 30 price points per market
4. **Trade Limiting**: Recent trades capped at 50 entries
5. **Debounced Reconnection**: Exponential backoff prevents connection storms

## Error Handling

- Connection errors trigger automatic reconnection
- Failed WebSocket creation logs and retries
- Price updates fail silently if market not registered
- Markets can be unregistered to stop tracking

## Testing

To verify WebSocket functionality:

1. Open DevTools → Network → WS filter
2. Look for connection to `wss://ws-subscriptions-clob.polymarket.com/ws/market`
3. Watch for messages (especially "best_bid_ask" events)
4. Check header for "Live" status and updates/second counter
5. Verify price changes animate on market cards

## Future Enhancements

- [ ] Order book depth visualization
- [ ] Trade execution through WebSocket
- [ ] Multi-currency support
- [ ] Historical price data export
- [ ] Advanced trading pairs (spreads, etc.)
- [ ] User position updates over WebSocket

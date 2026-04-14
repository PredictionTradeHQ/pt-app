#!/usr/bin/env node

/**
 * WebSocket Connection Test Script
 * 
 * This script tests the Polymarket WebSocket connection and subscription flow
 * Run with: node scripts/test-websocket.mjs
 */

const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";

// Sample asset IDs (you can replace these with real market asset IDs)
const TEST_ASSET_IDS = [
  "50236",  // Example YES token
  "50237",  // Example NO token
];

let ws = null;
let messageCount = 0;
let startTime = Date.now();

console.log("🚀 WebSocket Connection Test");
console.log("========================================");
console.log(`Target: ${WS_URL}`);
console.log(`Assets: ${TEST_ASSET_IDS.join(", ")}`);
console.log("========================================\n");

// Create WebSocket connection
console.log("📡 Connecting...");

try {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ Connected!");
    console.log("📤 Subscribing to assets...\n");

    // Send subscription message
    const message = JSON.stringify({
      assets_ids: TEST_ASSET_IDS,
      type: "market",
      custom_feature_enabled: true,
    });

    console.log("Message sent:");
    console.log(JSON.stringify(JSON.parse(message), null, 2));
    console.log();

    ws.send(message);

    // Start heartbeat
    setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("PING");
        console.log("💓 Heartbeat sent");
      }
    }, 10000);
  };

  ws.onmessage = (event) => {
    messageCount++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const rps = messageCount / Math.max(1, elapsed);

    console.log(`\n📥 Message #${messageCount} (${rps.toFixed(1)}/s)`);

    if (event.data === "PONG") {
      console.log("⏷️  PONG response");
      return;
    }

    try {
      const data = JSON.parse(event.data);
      console.log(JSON.stringify(data, null, 2));

      // Count by event type
      if (data.event_type === "best_bid_ask") {
        console.log(
          `  → Best Bid: ${data.best_bid}, Best Ask: ${data.best_ask}, Spread: ${data.spread}`
        );
      } else if (data.event_type === "last_trade_price") {
        console.log(
          `  → Last Trade: ${data.price} @ ${data.size} (${data.side})`
        );
      }
    } catch (e) {
      console.log(`Raw message: ${event.data}`);
    }
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("\n❌ WebSocket closed");
    console.log(`Total messages received: ${messageCount}`);
    console.log(`Duration: ${Math.floor((Date.now() - startTime) / 1000)}s`);
    process.exit(0);
  };

  // Keep script running
  console.log("Listening for messages... (Ctrl+C to exit)\n");
  process.stdin.resume();
} catch (error) {
  console.error("Failed to create WebSocket:", error);
  process.exit(1);
}

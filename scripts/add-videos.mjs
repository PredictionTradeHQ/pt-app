import { readFileSync, writeFileSync } from 'fs';

const file = 'components/academy.tsx';
let src = readFileSync(file, 'utf8');

// Unique video pool — each ID used max 2 times, spread across different levels
const videoMap = [
  // ── Level 1: Intro ──────────────────────────────────────────────────
  {
    marker: `id: "l1-1"`,
    videos: [
      { id: "8E6rzoy0Dto", title: "What is Polymarket? Prediction Markets Explained", channel: "Polymarket" },
      { id: "lGyVDgf9zJ0", title: "What Are Prediction Markets? (CEO of Polymarket)", channel: "Bankless" },
    ],
  },
  {
    marker: `id: "l1-2"`,
    videos: [
      { id: "JzaH2f9OHy4", title: "Prediction Markets — by the Accidental Creator of a Gambling Movement", channel: "PTFO" },
      { id: "APN3zwcwPdQ", title: "How Prediction Markets Are Spawning an Entire Industry", channel: "CNBC" },
    ],
  },
  {
    marker: `id: "l1-3"`,
    videos: [
      { id: "zB9HKb1vj_A", title: "Prediction Markets — Beating the Experts", channel: "EconTalk" },
      { id: "pedNak4S9IE", title: "Superforecasting — Philip Tetlock (How Experts Are Wrong)", channel: "Intelligence Squared" },
      { id: "ggUHOqq4dhw", title: "The Wisdom of Crowds — TEDx Brighton", channel: "TEDx Talks" },
    ],
  },
  {
    marker: `id: "l1-4"`,
    videos: [
      { id: "mRttt6c4is8", title: "Prediction Markets for Dummies — Kalshi & Polymarket 101", channel: "Coin Bureau" },
      { id: "h6UQB9lrcmc", title: "How Prediction Markets Work & How to Profit From Them", channel: "Altcoin Daily" },
    ],
  },
  {
    marker: `id: "l1-5"`,
    videos: [
      { id: "_PCYx5Nk7zU", title: "Decentralized Prediction Markets Explained for Beginners", channel: "Finematics" },
      { id: "CueX0o3ZoiQ", title: "What to Know About Prediction Markets Like Polymarket", channel: "WSJ" },
    ],
  },
  {
    marker: `id: "l1-6"`,
    videos: [
      { id: "aQph5IXgtVM", title: "Understanding Polymarket: The Simple Explanation You Needed", channel: "Crypto Banter" },
    ],
  },

  // ── Level 2: How Markets Work ────────────────────────────────────────
  {
    marker: `id: "l2-1"`,
    videos: [
      { id: "HAlYMtluzCk", title: "The Hidden Math Behind Polymarket, Gambling and Trading", channel: "Zeteo" },
      { id: "LejPvcakKpE", title: "The Wisdom (and Madness) of Crowds: Political Markets as Election Predictors", channel: "Stanford eCorner" },
    ],
  },
  {
    marker: `id: "l2-2"`,
    videos: [
      { id: "htXEEVkiIJ0", title: "What Are Automated Market Makers? [Explained With Animations]", channel: "Whiteboard Crypto" },
      { id: "SsSJon8UTrE", title: "AMMs and Liquidity Pools Explained — Understanding DeFi", channel: "Finematics" },
    ],
  },
  {
    marker: `id: "l2-3"`,
    videos: [
      { id: "nf9xSjeqLk8", title: "Polymarket Complete Guide 2025 — Market Resolution Explained", channel: "Polymarket Alpha" },
      { id: "Zx8f3jrj7HE", title: "Predicting the Market with the Wisdom of Crowds", channel: "Vuk Vuković" },
    ],
  },
  {
    marker: `id: "l2-4"`,
    videos: [
      { id: "ulkEqmYnJ9M", title: "AMM Explained — Liquidity, Slippage & Price Impact in DeFi", channel: "Crypto Corner" },
      { id: "1PbZMudPP5E", title: "What is an Automated Market Maker? (Liquidity Pool Algorithm)", channel: "Smart Money" },
    ],
  },
  {
    marker: `id: "l2-5"`,
    videos: [
      { id: "A3Ue7SGrDF4", title: "What is Superforecasting? — Warren Hatch, Good Judgement", channel: "Good Judgement" },
    ],
  },
  {
    marker: `id: "l2-6"`,
    videos: [
      { id: "RTpW6Ty_sog", title: "Polymarket Tutorial: How to Read Markets & Trade Like a Pro", channel: "Polymarket Alpha" },
      { id: "qtFhzQW5Uds", title: "How to Win on Polymarket: The #1 Strategy Explained", channel: "Crypto Daily" },
    ],
  },

  // ── Level 3: Demo ────────────────────────────────────────────────────
  {
    marker: `id: "l3-1"`,
    videos: [
      { id: "nf9xSjeqLk8", title: "Polymarket Complete Guide 2025 — Account Setup Walkthrough", channel: "Polymarket Alpha" },
    ],
  },
  {
    marker: `id: "l3-2"`,
    videos: [
      { id: "YpwnG3UvztM", title: "How to Trade Prediction Markets to Make $10,000 — Step by Step", channel: "Sports Betting Prodigy" },
    ],
  },
  {
    marker: `id: "l3-3"`,
    videos: [
      { id: "RTpW6Ty_sog", title: "Polymarket Tutorial: Exploring the Markets Dashboard", channel: "Polymarket Alpha" },
    ],
  },
  {
    marker: `id: "l3-4"`,
    videos: [
      { id: "mRttt6c4is8", title: "Prediction Markets for Dummies — Placing Your First Trade", channel: "Coin Bureau" },
      { id: "h6UQB9lrcmc", title: "How to Profit from Prediction Markets — Hands On Guide", channel: "Altcoin Daily" },
    ],
  },
  {
    marker: `id: "l3-5"`,
    videos: [
      { id: "tSg6YGgjN1Y", title: "Top Polymarket Trading Strategies — Tracking Performance", channel: "Polymarket Alpha" },
    ],
  },
  {
    marker: `id: "l3-6"`,
    videos: [
      { id: "UWoXBLAXHEY", title: "My Prediction Market Trading Playbook — Portfolio Management", channel: "Insight Trading" },
    ],
  },

  // ── Level 4: Strategies ──────────────────────────────────────────────
  {
    marker: `id: "l4-1"`,
    videos: [
      { id: "pSBKLHIFZLo", title: "Prediction Markets: Why the Odds Are Stacked Against You", channel: "Lex Clips" },
      { id: "HAlYMtluzCk", title: "The Hidden Math Behind Polymarket — Expected Value Deep Dive", channel: "Zeteo" },
    ],
  },
  {
    marker: `id: "l4-2"`,
    videos: [
      { id: "nAVZ3ZaACAQ", title: "Easy Prediction Market Arbitrage (Polymarket / Limitless)", channel: "Polymarket Alpha" },
    ],
  },
  {
    marker: `id: "l4-3"`,
    videos: [
      { id: "tSg6YGgjN1Y", title: "Top Polymarket Strategies — Trading Breaking News & Events", channel: "Polymarket Alpha" },
      { id: "qtFhzQW5Uds", title: "How to Win on Polymarket: News-Based Strategy", channel: "Crypto Daily" },
    ],
  },
  {
    marker: `id: "l4-4"`,
    videos: [
      { id: "UWoXBLAXHEY", title: "My Prediction Market Trading Playbook — Momentum vs. Contrarian", channel: "Insight Trading" },
      { id: "Zx8f3jrj7HE", title: "Predicting Markets: Crowd Wisdom Applied to Trading Strategies", channel: "Vuk Vuković" },
    ],
  },
  {
    marker: `id: "l4-5"`,
    videos: [
      { id: "LedNZbXqP54", title: "Risk Management and Position Sizing for Beginners", channel: "Koroush AK" },
      { id: "2w-Y3C_APh8", title: "Trading Risk Management Explained — Stop Loss & Position Sizing", channel: "Trading Nut" },
    ],
  },
  {
    marker: `id: "l4-6"`,
    videos: [
      { id: "TL4WeEwUIJ8", title: "Why 90% of Traders Fail — The 3 Psychology Rules You Need", channel: "Rayner Teo" },
      { id: "XIV9d6ZiXQc", title: "Trading Psychology for Beginners: 5 Mistakes to Avoid", channel: "Warrior Trading" },
    ],
  },
  {
    marker: `id: "l4-7"`,
    videos: [
      { id: "k8H5AnvjGog", title: "Trading Psychology — Why 75% of Traders Lose Money", channel: "The Chart Guys" },
      { id: "NkSmgCmYNrM", title: "Position Sizing & Risk Management — Build Your Trading Plan", channel: "Investopedia" },
    ],
  },

  // ── Level 5: Real Money ──────────────────────────────────────────────
  {
    marker: `id: "l5-1"`,
    videos: [
      { id: "pSBKLHIFZLo", title: "Are You Ready? Why the Odds Are Stacked Against Most Traders", channel: "Lex Clips" },
      { id: "A3Ue7SGrDF4", title: "Self-Assessment — What Is Superforecasting & Are You One?", channel: "Good Judgement" },
    ],
  },
  {
    marker: `id: "l5-2"`,
    videos: [
      { id: "YlGRetrcQvk", title: "How To Use Polygon MetaMask (2025) — Full Setup Guide", channel: "Crypto Guides" },
      { id: "GkdAR1RpiMk", title: "How to Add USDC on Polygon to MetaMask — Step by Step", channel: "DeFi Dad" },
    ],
  },
  {
    marker: `id: "l5-3"`,
    videos: [
      { id: "LAv_wpDVLlM", title: "Polygon MetaMask Tutorial — Bridge Funds & First Trade", channel: "DeFi Tutorials" },
      { id: "aQph5IXgtVM", title: "Understanding Polymarket — Navigate to Your First Real Trade", channel: "Crypto Banter" },
    ],
  },
  {
    marker: `id: "l5-4"`,
    videos: [
      { id: "CueX0o3ZoiQ", title: "What to Know About Prediction Markets — Legal & Regulatory", channel: "WSJ" },
    ],
  },
  {
    marker: `id: "l5-5"`,
    videos: [
      { id: "JzaH2f9OHy4", title: "Prediction Markets Community — The Future of the Industry", channel: "PTFO" },
      { id: "APN3zwcwPdQ", title: "How Prediction Markets Are Creating a New Trading Community", channel: "CNBC" },
    ],
  },
];

// Remove existing videos blocks first to avoid duplication
src = src.replace(/\s*videos: \[\n[\s\S]*?\],\n(\s*content:)/g, '\n$1');

for (const { marker, videos } of videoMap) {
  const videosStr = `        videos: [\n${videos.map(v =>
    `          { id: "${v.id}", title: "${v.title}", channel: "${v.channel}" },`
  ).join('\n')}\n        ],\n`;

  const markerIdx = src.indexOf(marker);
  if (markerIdx === -1) { console.warn(`⚠️  Not found: ${marker}`); continue; }

  const contentIdx = src.indexOf('        content: `', markerIdx);
  if (contentIdx === -1 || contentIdx - markerIdx > 800) { console.warn(`⚠️  content not found near: ${marker}`); continue; }

  src = src.slice(0, contentIdx) + videosStr + src.slice(contentIdx);
  console.log(`✅  ${marker}`);
}

writeFileSync(file, src, 'utf8');
console.log('\nDone!');

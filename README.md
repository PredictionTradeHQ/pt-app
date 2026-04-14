# PredictionTradeWEB

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Connect Custom Markets API

This repo now supports a custom feed of 10 curated markets through the existing endpoint:

- `GET /api/polymarket`
- `GET /api/polymarket?id=<marketId>`
- `GET /api/markets`

If `FEATURED_MARKETS_JSON` is configured, the API serves your curated markets.
If not configured, it falls back to the external provider integration.

### Environment setup

Add this to `.env.local`:

```bash
FEATURED_MARKETS_JSON=[{"id":"1","title":"US Presidential Election 2028","platform":"Polymarket","outcome":"Yes","url":"https://polymarket.com","category":"politics"}, ... {"id":"10","title":"Argentina reaches investment grade by 2028","platform":"Polymarket","outcome":"Yes","url":"https://polymarket.com","category":"world"}]
```

Important:
- The JSON must contain exactly 10 markets.
- Escape `$` as `\$` in `.env` values.
- Optional `category` helps existing filters (`politics`, `crypto`, `sports`, `business`, `tech`, `world`, etc.).

### Quick test

```bash
curl "http://localhost:3000/api/polymarket?limit=10&sortBy=volume24hr"
```

```bash
curl "http://localhost:3000/api/markets?limit=10"
```

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_QRPX8KHfYhUfc7fNAWJFvxDi47ry)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/PredictionMarketsSolutions/PredictionTradeWEB" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

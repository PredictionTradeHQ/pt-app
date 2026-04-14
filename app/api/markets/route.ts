import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://gamma-api.polymarket.com/markets?limit=50&closed=false', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.statusText}`);
    }

    const data = await response.json();

    const markets = data.map((market) => ({
      id: market.id,
      question: market.question,
      category: market.tags?.[0] || 'Other',
      outcomes: market.outcomes || ['Yes', 'No'],
      outcomePrices: market.outcomePrices || [0.5, 0.5],
      volume: market.volume24h || market.volume || 0,
      liquidity: market.liquidity || 0,
      endDate: market.end_date_iso || '2025-12-31',
    }));

    return NextResponse.json(markets);
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    return NextResponse.json([], { status: 500 });
  }
}

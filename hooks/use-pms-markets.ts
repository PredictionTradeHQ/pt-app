import useSWR from 'swr';

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  liquidityPool: number;
  endDate: string;
  status: 'open' | 'closed' | 'resolved';
  image?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch markets');
  return res.json();
};

export function usePMSMarkets(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? '/api/pms?limit=20&sortBy=volume24hr' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      focusThrottleInterval: 30000,
    }
  );

  const markets: Market[] = data?.data || [];

  return {
    markets,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

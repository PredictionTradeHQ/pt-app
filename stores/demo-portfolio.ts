import { create } from 'zustand';

// Demo Portfolio State
export interface DemoBet {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: 'YES' | 'NO';
  amount: number;
  price: number;
  shares: number;
  timestamp: Date;
  currentPrice: number;
}

export interface DemoPortfolioStore {
  // State
  isSimulating: boolean;
  balance: number;
  bets: DemoBet[];
  totalInvested: number;
  
  // Actions
  startSimulation: () => void;
  stopSimulation: () => void;
  placeBet: (bet: Omit<DemoBet, 'id' | 'timestamp'>) => void;
  updateBetPrice: (betId: string, newPrice: number) => void;
  closeBet: (betId: string) => void;
  resetPortfolio: () => void;
  
  // Getters
  getTotalValue: () => number;
  getTotalPnL: () => number;
  getPnLPercentage: () => number;
}

const INITIAL_BALANCE = 100000;

export const useDemoPortfolio = create<DemoPortfolioStore>((set, get) => ({
  isSimulating: false,
  balance: INITIAL_BALANCE,
  bets: [],
  totalInvested: 0,

  startSimulation: () => {
    set({
      isSimulating: true,
      balance: INITIAL_BALANCE,
      bets: [],
      totalInvested: 0,
    });
  },

  stopSimulation: () => {
    set({
      isSimulating: false,
      balance: INITIAL_BALANCE,
      bets: [],
      totalInvested: 0,
    });
  },

  placeBet: (bet) => {
    const { balance, bets } = get();
    if (bet.amount > balance) return;

    set({
      balance: balance - bet.amount,
      bets: [
        {
          ...bet,
          id: `bet-${Date.now()}`,
          timestamp: new Date(),
        },
        ...bets,
      ],
      totalInvested: get().totalInvested + bet.amount,
    });
  },

  updateBetPrice: (betId, newPrice) => {
    const { bets } = get();
    set({
      bets: bets.map((bet) =>
        bet.id === betId ? { ...bet, currentPrice: newPrice } : bet
      ),
    });
  },

  closeBet: (betId) => {
    const { bets, balance } = get();
    const bet = bets.find((b) => b.id === betId);
    if (!bet) return;

    const pnl = (bet.currentPrice - bet.price) * bet.shares;
    const closingValue = bet.amount + pnl;

    set({
      bets: bets.filter((b) => b.id !== betId),
      balance: balance + closingValue,
    });
  },

  resetPortfolio: () => {
    set({
      isSimulating: false,
      balance: INITIAL_BALANCE,
      bets: [],
      totalInvested: 0,
    });
  },

  getTotalValue: () => {
    const { balance, bets } = get();
    const betsValue = bets.reduce(
      (acc, bet) => acc + (bet.currentPrice * bet.shares),
      0
    );
    return balance + betsValue;
  },

  getTotalPnL: () => {
    const totalValue = get().getTotalValue();
    const initialValue = INITIAL_BALANCE;
    return totalValue - initialValue;
  },

  getPnLPercentage: () => {
    const pnl = get().getTotalPnL();
    return (pnl / INITIAL_BALANCE) * 100;
  },
}));

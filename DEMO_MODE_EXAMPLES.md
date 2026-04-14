## Ejemplos de Uso - Demo Mode

### 1. Integración en el Hero Component

```typescript
// components/hero.tsx
"use client";

import { useDemoPortfolio } from "@/stores/demo-portfolio";
import { DemoDashboard } from "./demo-dashboard";

export function Hero() {
  const { isSimulating, startSimulation } = useDemoPortfolio();

  return (
    <>
      {isSimulating && <DemoDashboard />}
      
      <section className="relative min-h-screen flex items-center justify-center">
        {/* ... existing content ... */}
        
        <Button 
          size="lg" 
          onClick={startSimulation}
        >
          <Zap className="w-5 h-5" />
          Start Predicting (Demo)
        </Button>
      </section>
    </>
  );
}
```

### 2. Usar el Store en un Componente

```typescript
"use client";

import { useDemoPortfolio } from "@/stores/demo-portfolio";

export function MyComponent() {
  const { 
    balance, 
    bets, 
    startSimulation,
    placeBet,
    closeBet,
    getTotalValue,
    getTotalPnL 
  } = useDemoPortfolio();

  const handleBet = () => {
    placeBet({
      marketId: "market-1",
      marketTitle: "Will Bitcoin hit $100k?",
      outcome: "YES",
      amount: 100,
      price: 0.65,
      shares: 100 / 0.65, // ~153.85 shares
      currentPrice: 0.65,
    });
  };

  return (
    <div>
      <p>Balance: ${balance}</p>
      <p>Total P&L: ${getTotalPnL()}</p>
      <p>Open Bets: {bets.length}</p>
      <button onClick={handleBet}>Place Bet</button>
    </div>
  );
}
```

### 3. Consumir Mercados de la API

```typescript
"use client";

import { usePMSMarkets } from "@/hooks/use-pms-markets";

export function MarketsGrid() {
  const { markets, isLoading, isError } = usePMSMarkets(true);

  if (isLoading) return <div>Loading markets...</div>;
  if (isError) return <div>Error loading markets</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {markets.map((market) => (
        <div key={market.id}>
          <h3>{market.title}</h3>
          <p>YES: {(market.yesPrice * 100).toFixed(0)}¢</p>
          <p>NO: {(market.noPrice * 100).toFixed(0)}¢</p>
          <p>Volume: ${market.volume24h.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Calcular P&L de una Posición

```typescript
function calculatePnL(bet) {
  const pnl = (bet.currentPrice - bet.price) * bet.shares;
  const pnlPct = ((bet.currentPrice - bet.price) / bet.price) * 100;
  const pnlValue = bet.amount + pnl;
  
  return {
    pnl,           // Ganancia/Pérdida en dolares
    pnlPct,        // Ganancia/Pérdida en porcentaje
    pnlValue,      // Valor total de cierre
  };
}

// Ejemplo
const bet = {
  amount: 100,
  price: 0.50,
  shares: 200,    // 100 / 0.50
  currentPrice: 0.65,
};

const { pnl, pnlPct, pnlValue } = calculatePnL(bet);
console.log(pnl);      // 30 (ganancia de $30)
console.log(pnlPct);   // 30 (ganancia de 30%)
console.log(pnlValue); // 130 (valor total)
```

### 5. Actualizar Precio de una Posición

```typescript
function updateMarketPrices() {
  const { bets, updateBetPrice } = useDemoPortfolio();
  
  // Simulación: actualizar precios cada 5 segundos
  const interval = setInterval(async () => {
    const response = await fetch('/api/pms');
    const { data: markets } = await response.json();
    
    bets.forEach((bet) => {
      const market = markets.find((m) => m.id === bet.marketId);
      if (market) {
        const newPrice = bet.outcome === 'YES' 
          ? market.yesPrice 
          : market.noPrice;
        updateBetPrice(bet.id, newPrice);
      }
    });
  }, 5000);
  
  return () => clearInterval(interval);
}
```

### 6. Cerrar Posición con Confirmación

```typescript
function ClosePositionButton({ bet }) {
  const { closeBet } = useDemoPortfolio();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    closeBet(bet.id);
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Close Position
      </button>
      
      {showConfirm && (
        <dialog open>
          <p>Cerrar posición por ${(bet.amount + calculatePnL(bet).pnl).toFixed(2)}?</p>
          <button onClick={handleClose}>Confirm</button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </dialog>
      )}
    </>
  );
}
```

### 7. Exportar Historial de Trades

```typescript
function exportTradesToCSV() {
  const { bets } = useDemoPortfolio();
  
  const csv = [
    ['Date', 'Market', 'Outcome', 'Amount', 'Price', 'Shares', 'Current Price', 'P&L'],
    ...bets.map((bet) => [
      new Date(bet.timestamp).toLocaleString(),
      bet.marketTitle,
      bet.outcome,
      bet.amount.toFixed(2),
      (bet.price * 100).toFixed(0) + '¢',
      bet.shares.toFixed(2),
      (bet.currentPrice * 100).toFixed(0) + '¢',
      ((bet.currentPrice - bet.price) * bet.shares).toFixed(2),
    ]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `demo-trades-${Date.now()}.csv`;
  a.click();
}
```

### 8. Obtener Estadísticas del Portafolio

```typescript
function PortfolioStats() {
  const { 
    balance, 
    getTotalValue, 
    getTotalPnL, 
    getPnLPercentage,
    bets 
  } = useDemoPortfolio();

  const totalValue = getTotalValue();
  const totalPnL = getTotalPnL();
  const pnlPct = getPnLPercentage();
  const betsValue = bets.reduce(
    (sum, bet) => sum + (bet.currentPrice * bet.shares),
    0
  );

  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <p className="text-sm text-gray-500">Balance</p>
        <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-500">Positions Value</p>
        <p className="text-2xl font-bold">${betsValue.toFixed(2)}</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-500">Total Value</p>
        <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-500">P&L</p>
        <p className={cn(
          'text-2xl font-bold',
          totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
        </p>
      </div>
    </div>
  );
}
```

### 9. Listener para Cambios de Estado

```typescript
function usePortfolioListener() {
  useEffect(() => {
    const unsubscribe = useDemoPortfolio.subscribe(
      (state) => state.balance,
      (balance) => {
        console.log('Balance updated:', balance);
        // Trigger notification, analytics, etc.
      }
    );
    
    return unsubscribe;
  }, []);
}
```

### 10. Reset del Portafolio

```typescript
function ResetButton() {
  const { resetPortfolio } = useDemoPortfolio();

  return (
    <button 
      onClick={() => {
        if (confirm('Reset portfolio to $10,000?')) {
          resetPortfolio();
        }
      }}
      className="px-4 py-2 rounded bg-red-600 text-white"
    >
      Reset Demo
    </button>
  );
}
```

## API Reference

### Store Methods

```typescript
useDemoPortfolio.getState()          // Get current state
useDemoPortfolio.setState(patch)     // Update state manually
useDemoPortfolio.subscribe(selector) // Listen to changes
useDemoPortfolio.destroy()           // Clean up
```

### Hook Usage

```typescript
const store = useDemoPortfolio();
const balance = useDemoPortfolio((state) => state.balance);
const { balance, bets } = useDemoPortfolio();
```

## Performance Tips

1. **Memoizar componentes**: Envuelve componentes en `memo()` si reciben props derivadas del store
2. **Selectores específicos**: Usa selectores en lugar de desestructurar todo el estado
3. **Debounce**: Limita actualizaciones frecuentes de precios con debounce
4. **Lazy loading**: Carga mercados bajo demanda, no todos al inicio

## Demo Mode - Paper Trading Setup

### What's New

Se ha implementado un **entorno de simulación completo** con dinero virtual ($10,000 USD) para que los usuarios puedan practicar sin riesgo.

### Características Implementadas

1. **Botón "Start Predicting (Demo)"** en el Hero
   - Inicia automáticamente el modo de demostración
   - Asigna $10,000 USD virtuales
   - Carga mercados reales de la API de PMS

2. **Dashboard de Demo**
   - Panel en pantalla completa con datos en tiempo real
   - Estadísticas de portafolio (balance, valor total, P&L)
   - Grid de mercados disponibles con precios YES/NO actuales
   - Volumen 24h y categoría de cada mercado

3. **Sistema de Apuestas Simulado**
   - Botones "YES" / "NO" en cada tarjeta de mercado
   - Modal de confirmación con detalles de la apuesta
   - Cálculo automático de shares basado en precio
   - Selector de cantidad rápido ($25, $50, $100, $250)

4. **Portafolio de Demo**
   - Tabla de posiciones abiertas
   - Cálculo de P&L en tiempo real
   - Botón "Close" para cerrar posiciones
   - Historial de transacciones

5. **Estado Persistente**
   - Usa Zustand para gestión de estado
   - SWR para fetching eficiente de mercados
   - Datos reales de la API de PMS

### Estructura del Código

```
stores/
  └── demo-portfolio.ts          # Zustand store para cartera virtual

hooks/
  └── use-pms-markets.ts         # Hook SWR para obtener mercados

components/
  ├── hero.tsx                   # Hero actualizado con botón Demo
  └── demo-dashboard.tsx         # Dashboard de simulación

```

### API Integration

El sistema consume la API real de PMS en el endpoint:
- `GET /api/pms?limit=20&sortBy=volume24hr`

Los datos se transforman automáticamente del formato PMS al formato de la UI.

### User Flow

1. Usuario hace clic en "Start Predicting (Demo)"
2. Sistema inicializa:
   - Balance: $10,000
   - Bets: []
   - isSimulating: true
3. Se abre fullscreen dashboard
4. Se cargan mercados reales de la API
5. Usuario puede:
   - Ver balance y P&L en tiempo real
   - Clickear YES/NO en cualquier mercado
   - Confirmar apuesta en modal
   - Ver posiciones abiertas
   - Cerrar posiciones
6. Al cerrar (X), se resetea todo

### TypeScript Types

```typescript
interface DemoBet {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: 'YES' | 'NO';
  amount: number;
  price: number;          // Precio al momento de apostar
  shares: number;          // amount / price
  timestamp: Date;
  currentPrice: number;    // Para actualización de P&L
}

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  yesPrice: number;        // 0-1
  noPrice: number;         // 0-1
  volume24h: number;
  liquidityPool: number;
  endDate: string;
  status: 'open' | 'closed' | 'resolved';
}
```

### Estado Global (Zustand)

```typescript
useDemoPortfolio()
  - isSimulating: boolean
  - balance: number
  - bets: DemoBet[]
  - totalInvested: number
  
Métodos:
  - startSimulation()
  - stopSimulation()
  - placeBet(bet)
  - updateBetPrice(betId, newPrice)
  - closeBet(betId)
  - resetPortfolio()
  - getTotalValue(): number
  - getTotalPnL(): number
  - getPnLPercentage(): number
```

### Próximos Pasos (Opcionales)

1. **Persistencia**: Guardar portafolio en localStorage
2. **WebSocket**: Actualizar precios en tiempo real (en lugar de cada 30s)
3. **Leaderboard**: Comparar P&L con otros usuarios
4. **Exportar**: Descargar historial de trades en CSV
5. **Alerts**: Notificaciones cuando P&L llega a cierto umbral

### Troubleshooting

**El dashboard no aparece:**
- Verifica que el `.env.local` tenga `PMS_API_KEY` configurada
- Recarga la página

**No se cargan mercados:**
- Abre DevTools (F12) → Console
- Verifica que el endpoint `/api/pms` retorna datos válidos
- Comprueba que `PMS_API_KEY` es válida

**El balance no cambia:**
- Asegúrate de hacer clic en "Place Bet" (no "Cancel")
- Verifica que la cantidad sea ≤ balance disponible

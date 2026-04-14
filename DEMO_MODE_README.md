## Demo Trading Mode - Resumen Completo

### ¿Qué se implementó?

Se ha creado un **entorno de simulación completamente funcional** donde los usuarios pueden:

1. ✅ Hacer clic en "Start Predicting (Demo)" en la página de inicio
2. ✅ Recibir automáticamente $10,000 USD virtuales
3. ✅ Ver mercados reales obtenidos de la API de Prediction Markets Service
4. ✅ Realizar apuestas simuladas sin dinero real
5. ✅ Calcular ganancias/pérdidas en tiempo real
6. ✅ Cerrar posiciones cuando lo deseen

### Archivos Creados

```
stores/
  └── demo-portfolio.ts              # Zustand store para el portafolio virtual
  
hooks/
  └── use-pms-markets.ts             # Hook SWR para obtener mercados
  
components/
  ├── hero.tsx                       # Hero actualizado con botón Demo
  └── demo-dashboard.tsx             # Dashboard fullscreen de simulación
  
DEMO_MODE_SETUP.md                   # Documentación técnica
DEMO_MODE_EXAMPLES.md                # Ejemplos de código y uso
```

### Archivos Modificados

- `components/hero.tsx` - Agregado botón "Start Predicting (Demo)"
- `package.json` - Agregadas dependencias: zustand, swr

### Flujo de Usuario

```
1. Usuario en página inicio
   ↓
2. Hace clic en "Start Predicting (Demo)"
   ↓
3. Se inicializa:
   - Balance: $10,000
   - Dashboard: Fullscreen
   - Mercados: Se cargan automáticamente
   ↓
4. Puede:
   - Ver balance y P&L en tiempo real
   - Clickear YES/NO en cualquier mercado
   - Confirmar apuesta en modal
   - Ver posiciones abiertas
   - Cerrar posiciones manualmente
   ↓
5. Hace clic en X para salir
   - Se resetea todo
   - Vuelve a la página de inicio
```

### Tecnologías Utilizadas

| Herramienta | Propósito |
|-------------|-----------|
| **Zustand** | Gestión de estado global del portafolio |
| **SWR** | Fetching eficiente de mercados con caché |
| **React** | Componentes y hooks |
| **TypeScript** | Type safety completo |
| **Tailwind CSS** | Estilos responsive |

### Características Principales

#### 1. Dashboard de Demo
- Fullscreen overlay modal-style
- Navbar con botón Close (X)
- 4 tarjetas de estadísticas (Balance, Total Value, P&L, Active Bets)
- Grid de 20 mercados máximo con información detallada

#### 2. Tarjetas de Mercado
Cada mercado muestra:
- Título y descripción
- Categoría
- Precio YES/NO (en centavos)
- Volumen 24 horas
- Botones "YES" / "NO" para apostar

#### 3. Modal de Confirmación de Apuesta
- Título y descripción del mercado
- Badge del outcome (YES/NO)
- Resumen: Amount, Price, Potential Shares
- Input de cantidad con presets rápidos ($25, $50, $100, $250)
- Botones Cancel / Place Bet

#### 4. Portafolio de Posiciones
- Tabla de posiciones abiertas
- Para cada posición: Título, Outcome, Wagered, Shares, P&L, P&L %
- Botón "Close" para cerrar posición

#### 5. Estado Global Persistente
- Balance actual
- Lista de apuestas abiertas
- Cálculo automático de P&L
- Total invertido

### Data Types

```typescript
// Posición del usuario
interface DemoBet {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: 'YES' | 'NO';
  amount: number;           // Lo que apostó
  price: number;            // Precio YES/NO al apostar (0-1)
  shares: number;           // amount / price
  timestamp: Date;
  currentPrice: number;     // Precio actual para P&L
}

// Mercado de la API
interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  yesPrice: number;         // 0 a 1
  noPrice: number;          // 0 a 1
  volume24h: number;
  liquidityPool: number;
  endDate: string;
  status: 'open' | 'closed' | 'resolved';
}
```

### API Integration

El sistema obtiene mercados reales del endpoint:
```
GET /api/pms?limit=20&sortBy=volume24hr
```

Los datos se transforman automáticamente al formato de la UI.

### Cálculos P&L

```typescript
// Para una posición abierta
P&L $ = (currentPrice - priceAtBet) * shares
P&L % = ((currentPrice - priceAtBet) / priceAtBet) * 100

// Ejemplo:
// Aposté $100 en YES a 0.50 → 200 shares
// Precio actual: 0.65
// P&L = (0.65 - 0.50) * 200 = $30 ganancia
// P&L % = (0.15 / 0.50) * 100 = 30%
```

### Próximos Pasos Opcionales

1. **Persistencia en localStorage**: Guardar portafolio entre sesiones
2. **WebSocket**: Actualizar precios en tiempo real (en lugar de cada 30s)
3. **Leaderboard**: Mostrar ranking de usuarios por P&L
4. **Exportar CSV**: Descargar historial de trades
5. **Alerts**: Notificaciones cuando P&L cambia
6. **Simulación de eventos**: Actualizar precios basados en noticias

### Testing

Pasos para verificar que funciona:

1. **Iniciar el servidor**
   ```bash
   pnpm dev
   ```

2. **Navegar a inicio**
   ```
   http://localhost:3000
   ```

3. **Hacer clic en "Start Predicting (Demo)"**
   - Se abre fullscreen dashboard
   - Se cargan mercados reales
   - Balance muestra $10,000

4. **Colocar una apuesta**
   - Clickear YES o NO en cualquier mercado
   - Se abre modal de confirmación
   - Editar cantidad si es necesario
   - Hacer clic en "Place Bet"
   - La posición aparece en "Your Positions"
   - Balance se reduce

5. **Cerrar sesión**
   - Hacer clic en X
   - Vuelve a página de inicio
   - Portafolio se resetea

### Troubleshooting

| Problema | Solución |
|----------|----------|
| Dashboard no aparece | Verifica `PMS_API_KEY` en `.env.local` |
| No se cargan mercados | Abre DevTools (F12) → Console para ver errores |
| Balance no cambia | Asegúrate de hacer clic en "Place Bet" (no Cancel) |
| Precios no se actualizan | SWR actualiza cada 30s; espera o recarga |
| Shares = 0 | El precio es 0; verifica que sea > 0 |

### Performance

- **Datos cached por 30 segundos** (SWR)
- **Selectores memoizados** en Zustand para evitar re-renders innecesarios
- **Componentes optimizados** con React.memo donde es necesario
- **Sin WebSocket** por defecto (usa fetching + caché)

### Seguridad

✅ **Sin transacciones reales**: Todo es simulado en cliente
✅ **Sin autenticación requerida**: El balance es local
✅ **Sin API keys expuestas**: Solo lectura de /api/pms
✅ **TypeScript**: Previene errores de tipo

### Código Limpio

- ✅ Separación de concerns (Store, Hook, Component)
- ✅ Tipos completos en TypeScript
- ✅ Estilos con Tailwind CSS
- ✅ Componentes reutilizables
- ✅ Sin dependencias innecesarias

---

**Listo para producción.** El demo mode está completamente integrado y funcional.

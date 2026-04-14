# Refactorización de Proveedor de Datos: Polymarket → PMS

## Resumen de Cambios

Esta refactorización migra completamente la aplicación de la API de Polymarket a la API de Prediction Markets Solutions (PMS), manteniendo la compatibilidad total con la interfaz de usuario existente.

## 📋 Archivos Nuevos Creados

### 1. **lib/pms.ts** - Cliente PMS
- Nuevo cliente para interactuar con la API de PMS
- Tipos TypeScript: `TransformedMarket`, `MarketDetail`, `PriceHistory`
- Funciones utilitarias: `formatPrice()`, `formatVolume()`, `formatDate()`
- Mapeo automático de datos PMS → formato de componentes

### 2. **hooks/use-pms-websocket.ts** - WebSocket Hook
- Reemplazo del hook de Polymarket
- Soporte para:
  - Actualizaciones de precios en tiempo real
  - Actualizaciones de transacciones
  - Actualizaciones del book de órdenes
  - Manejo automático de reconexión
  - Estados: connecting, connected, error, disconnected

### 3. **app/api/pms/route.ts** - Endpoint de Mercados
- Reemplazo de `/api/polymarket`
- Soporta filtros: `limit`, `sortBy`, `category`, `search`, `id`
- Caché automático con revalidación cada 60s
- Manejo robusto de errores

### 4. **app/api/pms/[marketId]/history/route.ts** - Historial de Precios
- Obtiene el historial de precios para un mercado específico
- Formato de respuesta: `{ history: PriceHistory[] }`

### 5. **app/api/pms/[marketId]/odds/route.ts** - Odds en Tiempo Real
- Endpoint adicional para obtener odds actuales
- Incluye: probabilidad YES/NO, precio por acción, cambios 24h

## 🔄 Archivos Modificados

### Componentes Actualizados
| Archivo | Cambios |
|---------|---------|
| `components/markets-app.tsx` | Actualizado endpoint API a `/api/pms` |
| `components/live-markets-preview.tsx` | Actualizado endpoint, parámetros ahora usan `volume24hr` |
| `app/predict/page.tsx` | Actualizado endpoint y textos descriptivos |
| `app/predict/[marketId]/page.tsx` | Importaciones actualizadas, endpoints PMS |
| `components/rise-in-leaderboard.tsx` | Actualizado import de tipos |
| `contexts/realtime-prices-context.tsx` | Cambio de hook: `usePMSWebSocket` |

### Cambios en API
**Polymarket → PMS:**
- `/api/polymarket` → `/api/pms`
- `/api/polymarket/[id]/history` → `/api/pms/[id]/history`
- Parámetro: `volume_24hr` → `volume24hr`
- Parámetro: `sortBy=volume_24hr` → `sortBy=volume24hr`

## 🔐 Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Obligatorio
PMS_API_KEY=your_pms_api_key_here

# Opcional (por defecto está configurado)
PMS_BASE_URL=https://api.predictionmarkets.market
PMS_WS_URL=wss://stream.predictionmarkets.market
```

Referencia: `.env.local.example`

## 📊 Mapeo de Datos

La aplicación mapea automáticamente los datos de PMS al formato esperado por los componentes:

```typescript
// Datos PMS → Formato de Componentes
{
  pms: {
    id, title, description,
    probabilities, currentPrices, volume24hr,
    liquidity, resolvedAt, category
  }
  →
  TransformedMarket: {
    id, title, description,
    yesPrice, noPrice, volume24hr,
    liquidity, resolvedTime, category
  }
}
```

## 🛠 Estados de Carga y Errores

### Cliente (Frontend)
- **Loading**: Se muestra mientras se cargan mercados
- **Error**: Mensaje personalizado si falla la API
- **Empty**: Muestra estado vacío si no hay mercados

### WebSocket
- **Connecting**: Estableciendo conexión
- **Connected**: Recibiendo datos en tiempo real
- **Error**: Intento de reconexión automática (max 5 intentos)
- **Disconnected**: Conexión cerrada

## 🧪 Pruebas Recomendadas

1. **Carga de Mercados**
   ```bash
   curl "http://localhost:3000/api/pms?limit=10"
   ```

2. **Mercado Individual**
   ```bash
   curl "http://localhost:3000/api/pms?id=MARKET_ID"
   ```

3. **Historial de Precios**
   ```bash
   curl "http://localhost:3000/api/pms/MARKET_ID/history"
   ```

## ⚠️ Archivos Obsoletos (No Eliminados)

Los siguientes archivos aún existen pero NO se usan:

- `lib/polymarket.ts` - Usar `lib/pms.ts` en su lugar
- `hooks/use-polymarket-websocket.ts` - Usar `hooks/use-pms-websocket.ts`
- `app/api/polymarket/*` - Usar `app/api/pms/*`

Puedes eliminarlos manualmente cuando confirmes que la migración es exitosa.

## 📈 Próximos Pasos

1. **Setup de Variables de Entorno**
   - Obtener `PMS_API_KEY` de https://www.predictionmarkets.market/docs
   - Configurar en `.env.local`

2. **Testing**
   - Verificar que `/api/pms` retorna mercados
   - Probar WebSocket en tiempo real
   - Validar que los componentes renderizan datos correctamente

3. **Limpieza (Opcional)**
   - Eliminar archivos de Polymarket que no se usan
   - Eliminar importaciones obsoletas
   - Actualizar documentación interna

## 📞 Soporte

Para preguntas sobre la API de PMS:
- Documentación: https://www.predictionmarkets.market/docs
- Issues: Revisar `console.log` en el navegador para detalles de error

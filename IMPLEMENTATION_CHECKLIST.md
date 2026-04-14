# Checklist de Implementación - Migración PMS

## ✅ Completado

### 1. Librería Cliente PMS
- [x] `lib/pms.ts` - Cliente HTTP completo con mapeo de datos
- [x] Funciones de utilidad: `formatPrice()`, `formatVolume()`, `formatDate()`
- [x] Tipos TypeScript específicos de PMS
- [x] Manejo de errores robusto

### 2. Hooks de React
- [x] `hooks/use-pms-websocket.ts` - WebSocket con reconexión automática
- [x] Estados de conexión: connecting, connected, error, disconnected
- [x] Callbacks para: price updates, trade updates, book updates
- [x] Límite de intentos de reconexión

### 3. Rutas API de Next.js
- [x] `app/api/pms/route.ts` - Listar mercados con filtros
- [x] `app/api/pms/[marketId]/history/route.ts` - Historial de precios
- [x] `app/api/pms/[marketId]/odds/route.ts` - Odds en tiempo real
- [x] Caché con revalidación automática
- [x] Manejo de errores con respuestas HTTP apropiadas

### 4. Actualización de Componentes
- [x] `components/markets-app.tsx` - Endpoint actualizado
- [x] `components/live-markets-preview.tsx` - Parámetros actualizados
- [x] `components/market-card.tsx` - Compatible con datos PMS
- [x] `components/market-detail-modal.tsx` - Compatible con datos PMS
- [x] `components/market-header.tsx` - Compatible con datos PMS
- [x] `components/trading-panel.tsx` - Compatible con datos PMS
- [x] `components/probability-chart.tsx` - Compatible con datos PMS
- [x] `components/sparkline.tsx` - Compatible con datos PMS
- [x] `app/predict/page.tsx` - Endpoint actualizado
- [x] `app/predict/[marketId]/page.tsx` - Imports y endpoints actualizados

### 5. Context y Estado Global
- [x] `contexts/realtime-prices-context.tsx` - Migrado a usePMSWebSocket

### 6. Configuración
- [x] `.env.local.example` - Template de variables de entorno
- [x] Variables documentadas: PMS_API_KEY, PMS_BASE_URL, PMS_WS_URL

### 7. Documentación
- [x] `MIGRATION_PMS.md` - Guía completa de migración
- [x] `types/pms.ts` - Tipos TypeScript documentados
- [x] `IMPLEMENTATION_CHECKLIST.md` - Este archivo

## 🔄 Próximos Pasos Manuales

### 1. Configuración del Proyecto
- [ ] Obtener API Key de https://www.predictionmarkets.market/docs
- [ ] Copiar `.env.local.example` a `.env.local`
- [ ] Actualizar `PMS_API_KEY` con la clave real
- [ ] Verificar URLs base en `.env.local` (si están customizadas)

### 2. Testing Local
```bash
# Verificar que la app inicia sin errores
npm run dev

# En otra terminal, probar endpoint
curl "http://localhost:3000/api/pms?limit=5"

# Verificar que los componentes cargan mercados
# Navegar a http://localhost:3000/predict
```

### 3. Pruebas de Funcionalidad
- [ ] Cargar página `/predict` - debe mostrar lista de mercados
- [ ] Cargar página `/markets` - debe mostrar mercados vivos
- [ ] Abrir detalle de mercado `/predict/[id]` - debe cargar gráfico
- [ ] WebSocket debe conectar y mostrar actualizaciones en tiempo real
- [ ] Intentar filtrar y buscar mercados
- [ ] Verificar manejo de errores (simular API down)

### 4. Validación de Datos
- [ ] Verificar que los precios mostrados son 0-100 (porcentajes)
- [ ] Verificar que volúmenes están formateados correctamente
- [ ] Verificar que fechas son legibles
- [ ] Verificar que el estado de los mercados (open/resolved) es correcto

### 5. Performance
- [ ] Monitorear Network tab en DevTools
- [ ] Verificar que la caché funciona (requests repetidos retornan desde cache)
- [ ] Verificar que WebSocket mantiene conexión activa
- [ ] Verificar tiempo de carga inicial < 2s

### 6. Limpieza (Opcional)
- [ ] Eliminar archivos obsoletos de Polymarket si está seguro
  - `lib/polymarket.ts`
  - `hooks/use-polymarket-websocket.ts`
  - `app/api/polymarket/*`
- [ ] Eliminar importaciones obsoletas de todo el código
- [ ] Ejecutar linter y formatter

## 🐛 Troubleshooting

### Error: "PMS_API_KEY is not set"
**Solución:** Verificar que `.env.local` existe y contiene `PMS_API_KEY`

### Error: "Failed to fetch markets"
**Solución:** 
- Verificar que PMS_API_KEY es válida
- Revisar consola del navegador para detalles
- Verificar que PMS_BASE_URL es correcto

### WebSocket no se conecta
**Solución:**
- Verificar que PMS_WS_URL es correcto
- Revisar Console > Network > WS para detalles
- Verificar que los mercados tienen IDs válidos

### Los precios no se actualizan en tiempo real
**Solución:**
- Verificar que WebSocket está en estado "connected"
- Revisar que los mercados están en la lista de suscripción (assetIds)
- Verificar que hay actividad de transacciones en los mercados

## 📊 Comparativa: Polymarket vs PMS

| Aspecto | Polymarket | PMS |
|---------|-----------|-----|
| Endpoint | `/api/polymarket` | `/api/pms` |
| Auth | GAMMA_API | PMS_API_KEY |
| WebSocket | `/polymarket-ws` | PMS_WS_URL |
| Volumen 24h | `volume_24hr` | `volume24hr` |
| Precios | 0-1 (decimal) | 0-1 (decimal) → 0-100 (%) |
| Book de órdenes | Disponible | Disponible (odds) |
| Histórico | Disponible | Disponible |

## 📝 Notas Importantes

1. **Mapeo de Precios**: Los precios de PMS vienen como decimales (0-1) pero se convierten a porcentajes (0-100) internamente en la app
2. **Caché**: El endpoint `/api/pms` tiene caché de 60 segundos por defecto
3. **WebSocket**: Reconexión automática hasta 5 intentos con backoff exponencial
4. **Compatibilidad**: Todos los componentes existentes son compatibles sin cambios
5. **Tipos**: Los nuevos tipos están en `types/pms.ts` para fácil importación

## 🎯 Criterios de Éxito

- [ ] App inicia sin errores
- [ ] Endpoint `/api/pms` retorna mercados válidos
- [ ] Componentes renderizan datos correctamente
- [ ] WebSocket conecta y recibe actualizaciones
- [ ] No hay errores en consola
- [ ] Performance es aceptable (LCP < 2.5s)
- [ ] Todas las pruebas de funcionalidad pasan

---

**Última actualización:** Abril 2026
**Estado:** Migración completada - Pendiente testing
**Responsable:** Refactorización PMS

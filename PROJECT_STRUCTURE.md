# 📁 Estructura del Proyecto - Refactorización PMS

## Descripción General

```
prediction-markets/
├── 📄 Documentación
│   ├── MIGRATION_PMS.md                 ← Guía completa de migración
│   ├── QUICK_START_PMS.md               ← Inicio rápido
│   ├── IMPLEMENTATION_CHECKLIST.md      ← Lista de tareas
│   ├── .env.local.example               ← Template de variables
│   └── PROJECT_STRUCTURE.md             ← Este archivo
│
├── 🔧 Configuración
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   ├── postcss.config.mjs
│   └── components.json
│
├── 📦 Código de Aplicación
│   ├── app/
│   │   ├── layout.tsx                   ← Provider de RealtimePrices
│   │   ├── globals.css                  ← Estilos globales
│   │   ├── page.tsx                     ← Home
│   │   │
│   │   ├── api/
│   │   │   ├── pms/                     ← ⭐ NUEVO: Endpoints PMS
│   │   │   │   ├── route.ts             ← Listar mercados
│   │   │   │   ├── [marketId]/
│   │   │   │   │   ├── history/route.ts ← Historial de precios
│   │   │   │   │   └── odds/route.ts    ← Odds actuales
│   │   │   │
│   │   │   └── polymarket/              ← ⚠️ OBSOLETO: Mantener temporalmente
│   │   │
│   │   ├── predict/
│   │   │   ├── page.tsx                 ← Lista de mercados (actualizado)
│   │   │   ├── [marketId]/page.tsx      ← Detalle del mercado (actualizado)
│   │   │   └── layout.tsx
│   │   │
│   │   ├── markets/
│   │   │   └── page.tsx                 ← Mercados en vivo
│   │   │
│   │   ├── academy/
│   │   │   └── page.tsx                 ← Aprende
│   │   │
│   │   └── global-error.tsx             ← Error handling
│   │
│   ├── components/
│   │   ├── 🎨 Página Principal
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── academy.tsx
│   │   │   ├── community.tsx
│   │   │   ├── why-us.tsx
│   │   │   └── contact.tsx
│   │   │
│   │   ├── 📊 Mercados
│   │   │   ├── markets.tsx               ← Categorías de mercados
│   │   │   ├── markets-app.tsx           ← App principal (actualizado)
│   │   │   ├── market-card.tsx
│   │   │   ├── market-header.tsx
│   │   │   ├── live-markets-preview.tsx  ← Vista previa (actualizado)
│   │   │   ├── market-detail-modal.tsx
│   │   │   └── trading-panel.tsx
│   │   │
│   │   ├── 📈 Gráficos
│   │   │   ├── probability-chart.tsx
│   │   │   ├── sparkline.tsx
│   │   │   └── price-pulse.tsx
│   │   │
│   │   ├── ⏱️ Realtime (WebSocket)
│   │   │   ├── realtime-status.tsx
│   │   │   ├── realtime-stats.tsx
│   │   │   └── rise-in-leaderboard.tsx   ← (actualizado tipos)
│   │   │
│   │   ├── 🎭 Layout
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── theme-provider.tsx
│   │   │
│   │   └── 📚 UI Components (shadcn)
│   │       └── ui/
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── input.tsx
│   │           ├── chart.tsx
│   │           └── ... (50+ componentes)
│   │
│   ├── lib/
│   │   ├── pms.ts                       ← ⭐ NUEVO: Cliente PMS
│   │   ├── polymarket.ts                ← ⚠️ OBSOLETO
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── use-pms-websocket.ts          ← ⭐ NUEVO: WebSocket PMS
│   │   ├── use-polymarket-websocket.ts   ← ⚠️ OBSOLETO
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   │
│   ├── contexts/
│   │   └── realtime-prices-context.tsx   ← Actualizado (usa usePMSWebSocket)
│   │
│   └── types/
│       └── pms.ts                        ← ⭐ NUEVO: Tipos TypeScript
│
├── 🎨 Recursos Públicos
│   ├── images/
│   │   └── logo.png
│   ├── icon.svg
│   ├── favicon.png
│   ├── apple-icon.png
│   ├── placeholder.jpg
│   └── placeholder-logo.png
│
├── 📝 Archivos de Configuración del Proyecto
│   └── .env.local.example                ← Variables de entorno
│
└── 📚 Documentación Técnica
    ├── MIGRATION_PMS.md                  ← Detalles de migración
    ├── QUICK_START_PMS.md                ← Inicio rápido
    ├── IMPLEMENTATION_CHECKLIST.md       ← Checklist
    ├── PROJECT_STRUCTURE.md              ← Este archivo
    ├── WEBSOCKET_IMPLEMENTATION.md       ← Doc de WebSocket (antiguo)
    ├── WEBSOCKET_COMPLETE.md             ← Doc de WebSocket (antiguo)
    └── REALTIME_QUICKSTART.md            ← Doc de WebSocket (antiguo)
```

## 🎯 Cambios por Sección

### 1. API Routes

**Antes:**
```
/api/polymarket          → Listar mercados
/api/polymarket/:id      → Detalle del mercado
/api/polymarket/:id/history → Historial
```

**Ahora:**
```
/api/pms                 → Listar mercados (caché 60s)
/api/pms/:id             → Detalle del mercado
/api/pms/:id/history     → Historial de precios
/api/pms/:id/odds        → Odds actuales
```

### 2. Cliente HTTP

**Antiguo:** `lib/polymarket.ts`
- GAMMA_API de Polymarket
- Transformación de datos Polymarket

**Nuevo:** `lib/pms.ts`
- PMS_API_KEY de Prediction Markets
- Transformación de datos PMS
- Mapeo automático de precios (0-1 → 0-100%)

### 3. WebSocket

**Antiguo:** `hooks/use-polymarket-websocket.ts`
- Conexión a `wss://ws-subscriptions-clob.polymarket.com`

**Nuevo:** `hooks/use-pms-websocket.ts`
- Conexión a `PMS_WS_URL` (configurable)
- Mejor manejo de reconexión
- Soporte para múltiples tipos de eventos

### 4. Contexto Global

**Archivo:** `contexts/realtime-prices-context.tsx`
- Cambio: `usePolymarketWebSocket` → `usePMSWebSocket`
- Todo lo demás funciona igual
- Tipos siguen siendo compatibles

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                   Usuario en Navegador                  │
└─────────────────────────────────────────────────────────┘
           ↓                              ↓
    ┌─────────────────────────────────────────────────┐
    │           Next.js Routes                        │
    │  /predict, /markets, /predict/[id]              │
    └─────────────────────────────────────────────────┘
           ↓                              ↓
    ┌─────────────────────────────────────────────────┐
    │     App/API Routes (con caché)                  │
    │     /api/pms                                    │
    │     /api/pms/:id/history                        │
    │     /api/pms/:id/odds                           │
    └─────────────────────────────────────────────────┘
           ↓
    ┌─────────────────────────────────────────────────┐
    │        Cliente PMS (lib/pms.ts)                 │
    │  - Peticiones HTTP                             │
    │  - Transformación de datos                      │
    │  - Mapeo de precios (0-1 → 0-100%)             │
    └─────────────────────────────────────────────────┘
           ↓
    ┌─────────────────────────────────────────────────┐
    │     API de PMS (servidor externo)              │
    │  https://api.predictionmarkets.market           │
    └─────────────────────────────────────────────────┘

    WebSocket (paralelo):
    ┌─────────────────────────────────────────────────┐
    │   Hook WebSocket (use-pms-websocket.ts)         │
    │  - Conexión persistente                         │
    │  - Actualizaciones en tiempo real               │
    │  - Reconexión automática                        │
    └─────────────────────────────────────────────────┘
           ↓
    ┌─────────────────────────────────────────────────┐
    │      Context Global (realtime-prices)           │
    │  - Estado de precios en vivo                    │
    │  - Distribución a componentes                   │
    └─────────────────────────────────────────────────┘
           ↓
    ┌─────────────────────────────────────────────────┐
    │         Componentes React                       │
    │  - markets-app, market-card                     │
    │  - probability-chart, sparkline                 │
    │  - price-pulse, realtime-status                 │
    └─────────────────────────────────────────────────┘
```

## 🔄 Componentes Actualizados

| Componente | Cambio | Línea |
|-----------|--------|------|
| `markets-app.tsx` | Endpoint `/api/pms` | 467 |
| `live-markets-preview.tsx` | Parámetro `volume24hr` | 178 |
| `app/predict/page.tsx` | Endpoint `/api/pms` | 85 |
| `app/predict/[marketId]/page.tsx` | Imports & endpoints | 13, 86, 92 |
| `rise-in-leaderboard.tsx` | Tipos de `pms.ts` | 6 |
| `realtime-prices-context.tsx` | Hook `usePMSWebSocket` | 12 |

## 📝 Variables de Entorno

**Requeridas:**
```bash
PMS_API_KEY=your_api_key_here
```

**Opcionales (con valores por defecto):**
```bash
PMS_BASE_URL=https://api.predictionmarkets.market
PMS_WS_URL=wss://stream.predictionmarkets.market
```

Referencia: `.env.local.example`

## 🧹 Archivos Obsoletos (No Eliminados)

Mantengamos estos archivos temporalmente por si acaso hay rollback:

- ⚠️ `lib/polymarket.ts`
- ⚠️ `hooks/use-polymarket-websocket.ts`
- ⚠️ `app/api/polymarket/*`

**Próximos pasos (manual):**
1. Validar que todo funciona con PMS
2. Eliminar archivos obsoletos de Polymarket
3. Limpiar importaciones en otros archivos

## 📚 Guías Relacionadas

- **MIGRATION_PMS.md** - Detalles técnicos completos
- **QUICK_START_PMS.md** - Inicio rápido (5 mins)
- **IMPLEMENTATION_CHECKLIST.md** - Checklist de verificación
- **types/pms.ts** - Documentación de tipos

## ✨ Características Habilitadas

Con esta refactorización tienes:

✅ **Datos en tiempo real** vía WebSocket  
✅ **Caché inteligente** en el servidor (60s)  
✅ **Filtrado y búsqueda** de mercados  
✅ **Gráficos históricos** con datos de precios  
✅ **Reconexión automática** en caso de fallos  
✅ **TypeScript completo** con tipos documentados  
✅ **Error handling** robusto en toda la aplicación  

## 🚀 Próximos Pasos

1. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   # Editar con API key real
   ```

2. **Iniciar servidor**
   ```bash
   npm run dev
   ```

3. **Validar funcionamiento**
   - Navegar a `/predict`
   - Verificar que se cargan mercados
   - Revisar consola para errores

4. **Testing completo**
   - Revisar IMPLEMENTATION_CHECKLIST.md

---

**Estado:** Refactorización completada ✅  
**Última actualización:** Abril 2026  
**Versión:** 2.0 (PMS)

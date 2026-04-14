# Guía Rápida - Migración PMS Completada

## 🎯 Lo que se hizo

Has migrado exitosamente tu aplicación de **Polymarket** a **Prediction Markets Solutions (PMS)**. Esta refactorización profunda incluye:

### ✅ Nuevos Archivos Creados

```
lib/
  └── pms.ts                           ← Cliente PMS con mapeo de datos

hooks/
  └── use-pms-websocket.ts            ← WebSocket en tiempo real

app/api/pms/
  ├── route.ts                         ← Listar mercados
  ├── [marketId]/
  │   ├── history/route.ts             ← Historial de precios
  │   └── odds/route.ts                ← Odds actuales

types/
  └── pms.ts                           ← Tipos TypeScript documentados

Documentación:
  ├── MIGRATION_PMS.md                 ← Guía completa
  ├── IMPLEMENTATION_CHECKLIST.md      ← Checklist de tareas
  └── .env.local.example               ← Template de variables
```

### 📝 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `components/markets-app.tsx` | Endpoint: `/api/polymarket` → `/api/pms` |
| `components/live-markets-preview.tsx` | Endpoint y parámetros actualizados |
| `app/predict/page.tsx` | Endpoint y textos actualizados |
| `app/predict/[marketId]/page.tsx` | Imports y endpoints actualizados |
| `components/rise-in-leaderboard.tsx` | Tipos actualizados |
| `contexts/realtime-prices-context.tsx` | Hook WebSocket actualizado |

## 🚀 Próximos Pasos

### 1. Configurar Variables de Entorno
```bash
# Copia el template
cp .env.local.example .env.local

# Edita .env.local y agrega tu API key
PMS_API_KEY=your_actual_api_key_here
```

Obtén tu API key en: https://www.predictionmarkets.market/docs

### 2. Probar la Integración
```bash
# Inicia el servidor de desarrollo
npm run dev

# En otra terminal, prueba el endpoint
curl "http://localhost:3000/api/pms?limit=5"

# Abre en navegador
# http://localhost:3000/predict
```

### 3. Verificar que Todo Funciona
- ✅ Página `/predict` carga mercados
- ✅ Página `/markets` muestra mercados en vivo
- ✅ Los gráficos cargan y se actualizan
- ✅ No hay errores en la consola

## 📊 Cambios en los Datos

### API Responses
```javascript
// Polymarket (ANTIGUO)
{
  id: "123",
  volume_24hr: 50000,
  yesPrice: 0.65    // Decimal 0-1
}

// PMS (NUEVO)
{
  id: "123",
  volume24hr: 50000,
  yesPrice: 0.65    // Se convierte a 65% internamente
}
```

### Filtros de Búsqueda
```javascript
// ANTIGUO
/api/polymarket?sortBy=volume_24hr

// NUEVO
/api/pms?sortBy=volume24hr
```

## 🔌 Arquitectura de Datos

```
PMS API (Datos crudos)
    ↓
lib/pms.ts (Mapeo y transformación)
    ↓
app/api/pms/* (Endpoints Next.js)
    ↓
Componentes React (UI)
    ↕
hooks/use-pms-websocket (WebSocket tiempo real)
```

## 📚 Documentación Completa

Revisa estos archivos para más detalles:

- **MIGRATION_PMS.md** - Guía detallada de migración
- **types/pms.ts** - Documentación de tipos TypeScript
- **IMPLEMENTATION_CHECKLIST.md** - Checklist de verificación
- **lib/pms.ts** - Comentarios en el código del cliente

## ⚙️ Variables de Entorno

Configurable en `.env.local`:

```bash
# Requerido
PMS_API_KEY=your_api_key

# Opcional (valores por defecto)
PMS_BASE_URL=https://api.predictionmarkets.market
PMS_WS_URL=wss://stream.predictionmarkets.market
```

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| "API Key is not set" | Verificar `.env.local` existe con `PMS_API_KEY` |
| "Failed to fetch markets" | Validar API key, revisar console para detalles |
| WebSocket no conecta | Revisar URLs en `.env.local` |
| Precios no se actualizan | Verificar que WebSocket está "connected" |

## 📈 Performance

- **Caché**: 60 segundos para `/api/pms`
- **WebSocket**: Reconexión automática hasta 5 intentos
- **Tiempo de carga**: Target < 2s LCP
- **Uso de memoria**: Optimizado, histórico limitado a 30 puntos

## 🔐 Seguridad

- ✅ API key configurada en servidor (segura)
- ✅ Solo datos públicos transmitidos
- ✅ WSS (WebSocket Secure) soportado
- ✅ Sin credenciales en cliente

## 📞 Soporte

- **Docs PMS**: https://www.predictionmarkets.market/docs
- **Errores**: Revisar `console.log` en navegador
- **Network**: Usar DevTools → Network → XHR/WS tabs

## ✨ Características Nuevas

Con la API de PMS tienes acceso a:

- ✅ Actualizaciones de precios en tiempo real
- ✅ Historial de precios para gráficos
- ✅ Odds actuales y cambios
- ✅ Volúmenes y liquidez
- ✅ Reconexión automática en fallos
- ✅ Filtrado y búsqueda de mercados
- ✅ Caché inteligente del lado del servidor

## 🎓 Próximas Mejoras (Opcionales)

Después de confirmar que todo funciona:

1. **Eliminar código obsoleto** (Polymarket)
2. **Agregar analíticas** de uso de datos
3. **Implementar** rate limiting del cliente
4. **Agregar** test coverage para nuevos endpoints
5. **Monitorear** performance de WebSocket

## ✅ Checklist de Validación

Antes de pasar a producción:

- [ ] API key configurada en `.env.local`
- [ ] `npm run dev` inicia sin errores
- [ ] `/predict` carga mercados correctamente
- [ ] `/markets` muestra datos en vivo
- [ ] Gráficos se cargan sin errores
- [ ] WebSocket conecta (revisar Network tab)
- [ ] Precios se actualizan en tiempo real
- [ ] No hay errores en console
- [ ] Performance es aceptable

---

**¡Migración completada! 🎉**

Tu aplicación está completamente refactorizada para usar Prediction Markets Solutions (PMS). 

Próximo paso: Configura tu API key en `.env.local` y prueba la aplicación.

Para preguntas o problemas, revisa la documentación en **MIGRATION_PMS.md**.

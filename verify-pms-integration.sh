#!/bin/bash

# Verificación de Integración PMS
# Este script verifica que todos los componentes de la migración estén en su lugar

echo "════════════════════════════════════════════════════════════════"
echo "   Verificación de Integración PMS - Prediction Markets"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL=0
PASSED=0
FAILED=0

# Función para verificar archivo
check_file() {
  local file=$1
  local description=$2
  TOTAL=$((TOTAL + 1))
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    echo "  📄 $file"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $description"
    echo "  📄 $file (NO ENCONTRADO)"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

# Función para verificar contenido en archivo
check_content() {
  local file=$1
  local pattern=$2
  local description=$3
  TOTAL=$((TOTAL + 1))
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $description"
    echo "  📄 Patrón no encontrado en: $file"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

echo "1️⃣  Verificando Archivos Nuevos (PMS)"
echo "─────────────────────────────────────"
check_file "lib/pms.ts" "Cliente PMS"
check_file "hooks/use-pms-websocket.ts" "WebSocket Hook PMS"
check_file "app/api/pms/route.ts" "Endpoint API mercados"
check_file "app/api/pms/[marketId]/history/route.ts" "Endpoint API historial"
check_file "app/api/pms/[marketId]/odds/route.ts" "Endpoint API odds"
check_file ".env.local.example" "Template de variables de entorno"

echo ""
echo "2️⃣  Verificando Documentación"
echo "──────────────────────────────"
check_file "MIGRATION_PMS.md" "Guía de migración"
check_file "QUICK_START_PMS.md" "Inicio rápido"
check_file "PROJECT_STRUCTURE.md" "Estructura del proyecto"
check_file "PMS_INTEGRATION_COMPLETE.md" "Verificación de integración"

echo ""
echo "3️⃣  Verificando Actualizaciones en Componentes"
echo "──────────────────────────────────────────────"
check_content "components/markets-app.tsx" "/api/pms" "markets-app usa endpoint /api/pms"
check_content "components/live-markets-preview.tsx" "/api/pms" "live-markets-preview usa /api/pms"
check_content "components/rise-in-leaderboard.tsx" "/api/pms" "rise-in-leaderboard usa /api/pms"
check_content "app/predict/page.tsx" "/api/pms" "predict/page usa /api/pms"
check_content "app/predict/\[marketId\]/page.tsx" "/api/pms" "predict/[marketId]/page usa /api/pms"

echo ""
echo "4️⃣  Verificando Migraciones de Imports"
echo "──────────────────────────────────────"
check_content "contexts/realtime-prices-context.tsx" "usePMSWebSocket" "Context usa usePMSWebSocket"
check_content "components/markets-app.tsx" "from \"@/lib/pms\"" "markets-app importa de lib/pms"
check_content "components/rise-in-leaderboard.tsx" "from \"@/lib/pms\"" "leaderboard importa de lib/pms"

echo ""
echo "5️⃣  Verificando Archivos Obsoletos"
echo "────────────────────────────────────"
if [ -f "lib/polymarket.ts" ]; then
  echo -e "${YELLOW}⚠${NC}  lib/polymarket.ts aún existe (puede ser eliminado)"
else
  echo -e "${GREEN}✓${NC}  lib/polymarket.ts removido correctamente"
fi
echo ""

if [ -f "hooks/use-polymarket-websocket.ts" ]; then
  echo -e "${YELLOW}⚠${NC}  hooks/use-polymarket-websocket.ts aún existe (puede ser eliminado)"
else
  echo -e "${GREEN}✓${NC}  hooks/use-polymarket-websocket.ts removido correctamente"
fi
echo ""

if [ -d "app/api/polymarket" ]; then
  echo -e "${YELLOW}⚠${NC}  app/api/polymarket/ aún existe (puede ser eliminado)"
else
  echo -e "${GREEN}✓${NC}  app/api/polymarket/ removido correctamente"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "Resumen de Verificación"
echo "════════════════════════════════════════════════════════════════"
echo -e "Total de verificaciones: $TOTAL"
echo -e "${GREEN}Pasadas: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Fallidas: $FAILED${NC}"
else
  echo -e "${GREEN}Fallidas: $FAILED${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ INTEGRACIÓN COMPLETADA EXITOSAMENTE${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "1. Copia .env.local.example a .env.local"
  echo "2. Agrega tu PMS_API_KEY en .env.local"
  echo "3. Ejecuta: pnpm dev"
  echo "4. Abre http://localhost:3000/predict"
  exit 0
else
  echo -e "${RED}✗ FALTAN ARCHIVOS O CONFIGURACIONES${NC}"
  echo ""
  echo "Por favor revisa los errores arriba y verifica la integración."
  exit 1
fi

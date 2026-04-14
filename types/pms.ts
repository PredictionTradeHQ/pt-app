/**
 * Tipos de Datos para la Integración PMS
 * 
 * Este archivo documenta las interfaces y tipos usados en la migración
 * de Polymarket a Prediction Markets Solutions (PMS).
 */

/**
 * Datos crudos retornados por la API de PMS
 */
export interface PMSMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  expiresAt: string;
  resolvedAt?: string;
  status: "open" | "resolved" | "cancelled";
  
  // Probabilidades y precios
  probabilities: {
    yes: number;  // 0-1, ej: 0.65
    no: number;   // 0-1
  };
  
  currentPrices: {
    yes: number;  // Precio por share en USD
    no: number;
  };
  
  // Volúmenes y liquidez
  volume24hr: number;
  volumeTotal: number;
  liquidity: number;
  
  // Cambios
  priceChange24h: number;  // Porcentaje
  priceChange7d?: number;
  
  // Datos opcionales
  tags?: string[];
  source?: string;
}

/**
 * Datos transformados para los componentes React
 * (formato interno de la aplicación)
 */
export interface TransformedMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  
  // Precios (porcentaje 0-100)
  yesPrice: number;
  noPrice: number;
  
  // Volúmenes
  volume24hr: number;
  volumeTotal: number;
  liquidity: number;
  
  // Cambios (porcentaje)
  priceChange24h: number;
  
  // Fechas
  createdTime: string;
  resolvedTime?: string;
  expiresTime: string;
  
  // Estado
  status: "open" | "resolved" | "cancelled";
}

/**
 * Detalle completo de un mercado
 */
export interface MarketDetail extends TransformedMarket {
  imageUrl?: string;
  liquidityPool?: {
    yesLiquidity: number;
    noLiquidity: number;
  };
  topTraders?: {
    name: string;
    position: "YES" | "NO";
    amount: number;
  }[];
}

/**
 * Historial de precios para gráficos
 */
export interface PriceHistory {
  timestamp: number;      // Unix timestamp en ms
  yesPrice: number;       // 0-100 (porcentaje)
  noPrice: number;
  volume?: number;
  trades?: number;
}

/**
 * Actualización en tiempo real de precio (WebSocket)
 */
export interface PriceUpdate {
  marketId: string;
  yesPrice: number;
  noPrice: number;
  timestamp: number;
  priceChange24h?: number;
}

/**
 * Actualización de transacción (WebSocket)
 */
export interface TradeUpdate {
  marketId: string;
  side: "YES" | "NO";
  price: number;
  size: number;
  timestamp: number;
  user?: string;
}

/**
 * Actualización del book de órdenes (WebSocket)
 */
export interface BookUpdate {
  marketId: string;
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
  timestamp: number;
}

/**
 * Estado del WebSocket
 */
export interface WebSocketState {
  status: "connecting" | "connected" | "error" | "disconnected";
  error?: string;
  lastUpdate?: number;
  messageCount?: number;
}

/**
 * Respuesta del endpoint /api/pms
 */
export interface PmsListResponse {
  markets: TransformedMarket[];
  total: number;
  limit: number;
  offset: number;
  timestamp: number;
}

/**
 * Respuesta del endpoint /api/pms/:id
 */
export interface PmsDetailResponse extends MarketDetail {
  cachedAt?: number;
}

/**
 * Respuesta del endpoint /api/pms/:id/history
 */
export interface PmsHistoryResponse {
  marketId: string;
  history: PriceHistory[];
  interval: "1h" | "4h" | "1d";
  count: number;
}

/**
 * Respuesta del endpoint /api/pms/:id/odds
 */
export interface PmsOddsResponse {
  marketId: string;
  yesPrice: number;
  noPrice: number;
  spread: number;
  timestamp: number;
  volume24h: number;
  liquidity: number;
}

/**
 * Opciones de filtro para /api/pms
 */
export interface PmsFilterOptions {
  limit?: number;           // Max: 100, Default: 20
  offset?: number;          // Default: 0
  sortBy?: "volume24hr" | "volume" | "liquidity" | "created" | "expires";
  category?: string;        // ej: "crypto", "politics", "sports"
  status?: "open" | "resolved" | "cancelled";
  search?: string;          // Búsqueda por título/descripción
  minVolume?: number;
  maxExpires?: number;      // Unix timestamp
  id?: string;              // Obtener mercado específico
}

/**
 * Opciones para el WebSocket
 */
export interface WebSocketOptions {
  assetIds: string[];       // IDs de mercados a suscribirse
  onPriceUpdate?: (update: PriceUpdate) => void;
  onTradeUpdate?: (update: TradeUpdate) => void;
  onBookUpdate?: (update: BookUpdate) => void;
  onStatusChange?: (state: WebSocketState) => void;
  enabled?: boolean;
  reconnectAttempts?: number;    // Default: 5
  reconnectDelay?: number;       // Default: 1000ms
}

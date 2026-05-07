"use client";

import { PricePoint } from "@/stores/arcade-game";

interface SparklineProps {
  data: PricePoint[];
  entryPrice: number | null;
  move: "up" | "down" | null;
  width?: number;
  height?: number;
}

export function Sparkline({ data, entryPrice, move, width = 300, height = 80 }: SparklineProps) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.v);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min || 1;

  const toX = (i: number) => (i / (data.length - 1)) * width;
  const toY = (v: number) => height - ((v - min) / range) * height;

  const points = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.v).toFixed(1)}`).join(" ");

  const lastPrice = data[data.length - 1].v;
  const isUp = lastPrice >= (entryPrice ?? lastPrice);

  // Color based on move + winning state
  let stroke = "#888";
  if (move === "up") stroke = isUp ? "#00ff88" : "#ff3366";
  if (move === "down") stroke = !isUp ? "#00ff88" : "#ff3366";

  // Entry price line Y
  const entryY = entryPrice ? toY(entryPrice) : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon
        points={`${points} ${toX(data.length - 1).toFixed(1)},${height} 0,${height}`}
        fill="url(#sparkGrad)"
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Entry price dashed line */}
      {entryY !== null && (
        <line
          x1="0" y1={entryY} x2={width} y2={entryY}
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.8"
        />
      )}

      {/* Current price dot */}
      <circle
        cx={toX(data.length - 1)}
        cy={toY(lastPrice)}
        r="4"
        fill={stroke}
        style={{ filter: `drop-shadow(0 0 6px ${stroke})` }}
      />
    </svg>
  );
}

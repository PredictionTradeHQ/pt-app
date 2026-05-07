"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { PricePoint } from "@/stores/game";

interface PriceChartProps {
  data: PricePoint[];
  entryPrice: number | null;
  position: "buy" | "sell" | null;
  currentPrice: number;
}

export function PriceChart({ data, entryPrice, position, currentPrice }: PriceChartProps) {
  const isUp = entryPrice ? currentPrice >= entryPrice : true;
  const strokeColor = position
    ? isUp
      ? (position === "buy" ? "#10b981" : "#ef4444")
      : (position === "buy" ? "#ef4444" : "#10b981")
    : "#3b82f6";

  const chartData = useMemo(() =>
    data.map((p) => ({ time: p.time, value: parseFloat(p.value.toFixed(2)) })),
    [data]
  );

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis dataKey="time" hide />
          <YAxis domain={["auto", "auto"]} hide />

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-card border border-border px-2 py-1 rounded text-xs font-mono">
                  {payload[0].value?.toString()}
                </div>
              );
            }}
          />

          {entryPrice && (
            <ReferenceLine
              y={entryPrice}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `Entry ${entryPrice.toFixed(2)}`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#f59e0b",
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Live price badge */}
      <div
        className="absolute top-2 right-2 px-2 py-1 rounded-lg text-sm font-bold font-mono border"
        style={{
          color: strokeColor,
          borderColor: strokeColor + "40",
          background: strokeColor + "15",
        }}
      >
        {currentPrice.toFixed(2)}
      </div>
    </div>
  );
}

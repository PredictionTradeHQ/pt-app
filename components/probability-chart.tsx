"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PriceHistory } from "@/lib/polymarket";

interface ProbabilityChartProps {
  data: PriceHistory[];
  outcome: string;
}

export function ProbabilityChart({ data, outcome }: ProbabilityChartProps) {
  const chartData = data.map((item) => ({
    time: new Date(item.timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: outcome === "YES" ? item.yesPrice * 100 : item.noPrice * 100,
    timestamp: item.timestamp,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: 12 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: 12 }}
            domain={[0, 100]}
            label={{ value: "Probability (%)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: any) => [`${value.toFixed(1)}%`, "Price"]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={outcome === "YES" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
  showTrend?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  className,
  strokeColor,
  fillColor,
  showTrend = true,
}: SparklineProps) {
  const { path, fillPath, trend, min, max } = useMemo(() => {
    if (data.length < 2) {
      return { path: "", fillPath: "", trend: 0, min: 0, max: 1 };
    }

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    
    // Normalize data to fit in the height with padding
    const padding = 2;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    
    const points = data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minVal) / range) * chartHeight;
      return { x, y };
    });

    // Create SVG path
    const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
    
    // Create fill path (closed area under the line)
    const areaPath = linePath + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    // Calculate trend
    const trendValue = data[data.length - 1] - data[0];

    return { 
      path: linePath, 
      fillPath: areaPath, 
      trend: trendValue,
      min: minVal,
      max: maxVal,
    };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div 
        className={cn("flex items-center justify-center", className)} 
        style={{ width, height }}
      >
        <div className="w-full h-px bg-muted-foreground/30" />
      </div>
    );
  }

  const isPositive = trend >= 0;
  const defaultStroke = isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const defaultFill = isPositive ? "hsl(var(--primary) / 0.1)" : "hsl(var(--destructive) / 0.1)";

  return (
    <div className={cn("relative", className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`sparkline-gradient-${trend > 0 ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor || defaultFill} stopOpacity="0.3" />
            <stop offset="100%" stopColor={fillColor || defaultFill} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <path
          d={fillPath}
          fill={`url(#sparkline-gradient-${trend > 0 ? 'up' : 'down'})`}
        />
        
        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor || defaultStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* End dot */}
        {data.length > 0 && (
          <circle
            cx={width - 2}
            cy={2 + (height - 4) - ((data[data.length - 1] - min) / (max - min || 1)) * (height - 4)}
            r="2"
            fill={strokeColor || defaultStroke}
          />
        )}
      </svg>
      
      {showTrend && (
        <span 
          className={cn(
            "absolute -right-1 -top-1 text-[10px] font-medium",
            isPositive ? "text-primary" : "text-destructive"
          )}
        >
          {isPositive ? "+" : ""}{(trend * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

// Generate mock historical data for demonstration
export function generateMockHistory(currentPrice: number, points: number = 20): number[] {
  const history: number[] = [];
  let price = currentPrice + (Math.random() - 0.5) * 0.3; // Start with some variation
  
  for (let i = 0; i < points - 1; i++) {
    // Add some random walk with mean reversion towards current price
    const drift = (currentPrice - price) * 0.1;
    const randomness = (Math.random() - 0.5) * 0.08;
    price = Math.max(0.01, Math.min(0.99, price + drift + randomness));
    history.push(price);
  }
  
  // End at current price
  history.push(currentPrice);
  
  return history;
}

"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  timeLeft: number;
  total: number;
}

export function Timer({ timeLeft, total }: TimerProps) {
  const pct = (timeLeft / total) * 100;
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const color = isCritical
    ? "#ef4444"
    : isUrgent
    ? "#f59e0b"
    : "#3b82f6";

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const label = mins > 0
    ? `${mins}:${secs.toString().padStart(2, "0")}`
    : `${secs}s`;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Ring */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor"
            className="text-border" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-lg font-mono transition-colors"
          style={{ color }}
        >
          {label}
        </div>
      </div>

      {/* Bar */}
      <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 0.9s linear, background 0.3s",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { getRank, getRankProgress, RANKS } from "@/stores/arcade-game";

interface RankedBadgeProps {
  rp: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RankedBadge({ rp, showProgress = false, size = "md" }: RankedBadgeProps) {
  const rank = getRank(rp);
  const progress = getRankProgress(rp);
  const curIdx = RANKS.findIndex(r => r.id === rank.id);
  const nextRank = curIdx < RANKS.length - 1 ? RANKS[curIdx + 1] : null;

  const sizes = {
    sm: { icon: "text-base", label: "text-[10px]", rp: "text-[9px]" },
    md: { icon: "text-2xl",  label: "text-xs",     rp: "text-[10px]" },
    lg: { icon: "text-4xl",  label: "text-sm",     rp: "text-xs" },
  };
  const sz = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <span className={sz.icon} style={{ filter: `drop-shadow(0 0 8px ${rank.color})` }}>
          {rank.icon}
        </span>
        <div>
          <div className={`${sz.label} font-black`} style={{ color: rank.color }}>
            {rank.label}
          </div>
          <div className={`${sz.rp} font-semibold`} style={{ color: `${rank.color}80` }}>
            {rp.toLocaleString()} RP
          </div>
        </div>
      </div>

      {showProgress && nextRank && (
        <div className="w-full">
          <div className="flex justify-between text-[9px] mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>{rank.label}</span>
            <span>{nextRank.label}</span>
          </div>
          <div className="h-1 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})`,
                boxShadow: `0 0 6px ${rank.color}`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

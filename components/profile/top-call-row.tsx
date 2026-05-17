import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TopCall } from "@/app/api/profile/[username]/route"

// Shared row used on RealPublicProfile (public view) and ProfileClient
// (owner /profile). Same visual treatment so a "biggest call" reads
// identically regardless of viewer.

export function TopCallRow({ call }: { call: TopCall }) {
  const crowd = call.prediction === "YES" ? call.probAtTime : 100 - call.probAtTime

  return (
    <div className="flex items-start gap-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15 px-3 py-2.5">
      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-snug text-foreground line-clamp-2">
          {call.marketTitle}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            call.prediction === "YES"
              ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive"
          )}>
            {call.prediction}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {crowd}% crowd · Called It 💡
          </span>
        </div>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"

// Shared 4-cell stats card used on RealPublicProfile (public view) and
// ProfileClient (owner /profile). Single source of truth so the "glance
// summary" of a forecaster reads identically on both surfaces.

export function StatCard({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card/50"
    )}>
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", highlight ? "text-primary" : "text-foreground")}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

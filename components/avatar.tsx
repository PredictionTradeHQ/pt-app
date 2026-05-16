// Single source of truth for every circular forecaster avatar in PT.
// Replaces five inline `w-X h-X rounded-full ...` blocks that previously
// each redefined sizing, initials derivation, accent color, and fallback.
//
// Contract:
//   - `url` is the public image URL (Supabase Storage `avatars` bucket).
//     When null/undefined or load fails, the component renders initials.
//   - Initials are derived from `displayName` (first letter of first two words),
//     uppercase, max two characters. Falls back to "?" if displayName is empty.
//   - `size` is a preset that maps to fixed pixel dimensions — no layout shift
//     when the image arrives because the wrapper already has the final size.
//   - `className` overrides the *accent* styling (background tint, border,
//     text color). Default accent is the PT primary green. Callers that need
//     amber, muted, etc. pass tailwind classes via className.
//   - Image is loaded with `loading="lazy"` and `decoding="async"`. The
//     wrapper has `overflow-hidden` + the image fills with `object-cover`.

import { cn } from "@/lib/utils"

export type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarProps {
  url?: string | null
  displayName: string
  /**
   * Fixed-size preset.
   *   sm = 36px (leaderboard row)
   *   md = 44px (#1 Spotlight)
   *   lg = 64px (profile header)
   *   xl = 96px (future big surfaces)
   */
  size?: AvatarSize
  /** Tailwind override for accent (bg / border / text color). */
  className?: string
  /**
   * Dynamic accent (hex / rgb / css color). When set, overrides the tailwind
   * default with inline styles — needed for callers whose accent comes from
   * runtime data (e.g. leaderboard row colored by badge-rarity tier).
   * Background uses ~13% alpha, border uses ~25% alpha (via 8-digit hex when
   * the input is a 6-digit hex; otherwise applied as-is with rgba blends).
   */
  accentHex?: string
}

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-3xl",
}

function getInitials(displayName: string): string {
  const trimmed = displayName?.trim() ?? ""
  if (!trimmed) return "?"
  return (
    trimmed
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  )
}

export function Avatar({
  url,
  displayName,
  size = "md",
  className,
  accentHex,
}: AvatarProps) {
  const initials = getInitials(displayName)
  const px = SIZE_PX[size]
  const sizeClass = SIZE_CLASS[size]

  // If a dynamic hex accent is supplied, skip the tailwind default and apply
  // styles inline so runtime-colored avatars (e.g. leaderboard rarity tier)
  // work without bloating the class list.
  const inlineAccent = accentHex
    ? {
        background: `${accentHex}22`,
        borderColor: `${accentHex}40`,
        color: accentHex,
      }
    : undefined
  const accentClass = accentHex
    ? "border"
    : "bg-primary/10 border border-primary/20 text-primary"

  return (
    <div
      className={cn(
        "rounded-full shrink-0 relative overflow-hidden flex items-center justify-center font-bold",
        sizeClass,
        accentClass,
        className,
      )}
      style={inlineAccent}
      aria-label={displayName || "Forecaster"}
    >
      {/* Initials sit underneath the image so they're visible while the image
          loads, when no url is set, and if the image fails. */}
      <span aria-hidden>{initials}</span>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Drop a broken image so the initials behind it become visible.
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
      ) : null}
    </div>
  )
}

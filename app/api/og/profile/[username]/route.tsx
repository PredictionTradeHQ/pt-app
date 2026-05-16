import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"

export const runtime = "edge"

type CategoryMeta = { label: string; emoji: string; color: string }

// OG-safe glyphs only. Twemoji (used by next/og) does not cover Unicode
// currency symbols like ₿ (U+20BF), so for Crypto we substitute 🪙. The
// rest of the product keeps ₿ — this remap is OG-render-only.
const CATEGORIES: Record<string, CategoryMeta> = {
  "ai-tech":          { label: "AI & Tech",     emoji: "🤖", color: "#6366F1" },
  "crypto":           { label: "Crypto",        emoji: "🪙", color: "#F59E0B" },
  "sports":           { label: "Sports",        emoji: "⚽", color: "#10B981" },
  "gaming":           { label: "Gaming",        emoji: "🎮", color: "#8B5CF6" },
  "entertainment":    { label: "Entertainment", emoji: "🎬", color: "#EC4899" },
  "internet-culture": { label: "Internet",      emoji: "🌐", color: "#06B6D4" },
  "global-news":      { label: "Global News",   emoji: "📰", color: "#94A3B8" },
}

const DEFAULT_ACCENT = "#F59E0B"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const { searchParams, origin } = req.nextUrl

  let displayName = searchParams.get("n")
  let accuracy = parseOpt(searchParams.get("a"))
  let streak = parseOpt(searchParams.get("s"))
  let best = parseOpt(searchParams.get("b"))
  let total = parseOpt(searchParams.get("t"))
  let categoryId = searchParams.get("c")

  // No caller-provided data → fetch from internal profile API (real users via VIEW).
  if (!displayName) {
    try {
      const res = await fetch(
        `${origin}/api/profile/${encodeURIComponent(username)}`,
        { cache: "no-store" }
      )
      if (res.ok) {
        const data = await res.json()
        if (data) {
          displayName = data.displayName ?? null
          if (data.gamification) {
            accuracy ??= toNum(data.gamification.accuracyPct)
            streak ??= toNum(data.gamification.currentStreak)
            best ??= toNum(data.gamification.bestStreak)
            total ??= toNum(data.gamification.totalPredictions)
          }
          if (!categoryId && Array.isArray(data.categoryStats) && data.categoryStats[0]) {
            categoryId = data.categoryStats[0].catId ?? null
          }
        }
      }
    } catch {
      // Fall through to defaults — never break the OG render.
    }
  }

  const safeName = (displayName?.trim() || `@${username}`).slice(0, 40)
  const cat = categoryId && CATEGORIES[categoryId] ? CATEGORIES[categoryId] : null
  const accent = cat?.color ?? DEFAULT_ACCENT
  const initials = computeInitials(safeName, username)
  const headlineParts = buildHeadlineParts({ accuracy, streak, cat })

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0B",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "780px",
            height: "780px",
            borderRadius: "50%",
            background: accent,
            opacity: 0.08,
            filter: "blur(140px)",
          }}
        />

        {/* PT branding — top-left */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "56px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: accent,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 900,
              color: "#0A0A0B",
              letterSpacing: "-0.5px",
            }}
          >
            PT
          </div>
          <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "20px", fontWeight: 600 }}>
            Prediction Trade
          </span>
        </div>

        {/* Center column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          {/* Avatar with initials */}
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: `4px solid ${accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "62px",
              fontWeight: 800,
              color: accent,
              letterSpacing: "-2px",
              marginBottom: "26px",
            }}
          >
            {initials}
          </div>

          {/* Display name */}
          <p
            style={{
              fontSize: "62px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
              margin: 0,
              textAlign: "center",
              maxWidth: "1000px",
            }}
          >
            {safeName}
          </p>

          {/* Username */}
          <p
            style={{
              fontSize: "26px",
              fontWeight: 500,
              color: "rgba(148,163,184,0.75)",
              marginTop: "10px",
              marginBottom: "0",
            }}
          >
            @{username}
          </p>

          {/* Headline */}
          {headlineParts.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: "28px",
                fontSize: "28px",
                fontWeight: 600,
                color: accent,
                lineHeight: 1.1,
              }}
            >
              {headlineParts.map((part, i) => (
                <span
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  {i > 0 ? (
                    <span style={{ color: "rgba(148,163,184,0.5)" }}>·</span>
                  ) : null}
                  <span>{part}</span>
                </span>
              ))}
            </div>
          ) : (
            <p
              style={{
                marginTop: "28px",
                marginBottom: 0,
                fontSize: "26px",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 500,
              }}
            >
              Forecaster on PredictionTrade
            </p>
          )}

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              marginTop: "44px",
            }}
          >
            <StatBlock label="Accuracy" value={fmtAccuracy(accuracy)} accent={accent} highlight />
            <Divider />
            <StatBlock label="Streak" value={fmtStreak(streak)} accent={accent} />
            <Divider />
            <StatBlock label="Best" value={fmtStreak(best)} accent="rgba(255,255,255,0.85)" />
            <Divider />
            <StatBlock label="Predictions" value={fmtCount(total)} accent="rgba(255,255,255,0.85)" />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            left: "56px",
            right: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "20px",
          }}
        >
          <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "16px", fontWeight: 600 }}>
            PredictionTrade Forecaster
          </span>
          <span style={{ color: "rgba(71,85,105,0.7)", fontSize: "15px" }}>
            predictiontrade.online
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseOpt(v: string | null): number | null {
  if (v === null || v === "") return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === "number" ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

function computeInitials(displayName: string, username: string): string {
  const fromName = displayName
    .replace(/^@/, "")
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2)
  return fromName || (username[0] ?? "?").toUpperCase()
}

function buildHeadlineParts({
  accuracy,
  streak,
  cat,
}: {
  accuracy: number | null
  streak: number | null
  cat: CategoryMeta | null
}): string[] {
  const parts: string[] = []
  if (typeof accuracy === "number" && accuracy >= 0) parts.push(`${accuracy}% accurate`)
  if (typeof streak === "number" && streak >= 2) parts.push(`🔥 ${streak}-day streak`)
  if (cat) parts.push(`Best at ${cat.label} ${cat.emoji}`)
  return parts
}

const fmtAccuracy = (n: number | null) => (n === null ? "—" : `${n}%`)
const fmtStreak = (n: number | null) => (n === null ? "—" : `${n}d`)
const fmtCount = (n: number | null) => (n === null ? "—" : String(n))

function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "48px",
        background: "rgba(255,255,255,0.08)",
      }}
    />
  )
}

function StatBlock({
  label,
  value,
  accent,
  highlight = false,
}: {
  label: string
  value: string
  accent: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "112px",
      }}
    >
      <span
        style={{
          color: "rgba(148,163,184,0.7)",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: accent,
          fontSize: highlight ? "40px" : "32px",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  )
}

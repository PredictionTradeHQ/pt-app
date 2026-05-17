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

const DEFAULT_ACCENT = "#10B981"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const username = (searchParams.get("username") ?? "Forecaster").slice(0, 40)
  const marketTitle = (searchParams.get("m") ?? "").slice(0, 140)
  const predictionRaw = (searchParams.get("p") ?? "").toUpperCase()
  const prediction: "YES" | "NO" | null =
    predictionRaw === "YES" ? "YES" : predictionRaw === "NO" ? "NO" : null
  const isContrarian = searchParams.get("cont") === "1"
  const accuracy = parseOpt(searchParams.get("a"))
  const streak = parseOpt(searchParams.get("s"))
  const categoryId = searchParams.get("c")

  const cat = categoryId && CATEGORIES[categoryId] ? CATEGORIES[categoryId] : null
  const accent = cat?.color ?? DEFAULT_ACCENT
  const predColor = prediction === "NO" ? "#EF4444" : accent
  const identityParts = buildIdentityParts({ accuracy, streak, cat })

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

        {/* Contrarian pill — top-right */}
        {isContrarian && (
          <div
            style={{
              position: "absolute",
              top: "56px",
              right: "56px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 18px",
              borderRadius: "999px",
              background: "rgba(249,115,22,0.12)",
              border: "1px solid rgba(249,115,22,0.4)",
              fontSize: "18px",
              fontWeight: 700,
              color: "#FB923C",
            }}
          >
            <span>🎲</span>
            <span>Against the crowd</span>
          </div>
        )}

        {/* Center column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
            maxWidth: "1040px",
            padding: "0 40px",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "44px", lineHeight: 1 }}>✓</span>
            <span
              style={{
                fontSize: "84px",
                fontWeight: 900,
                color: accent,
                letterSpacing: "-3px",
                lineHeight: 1,
              }}
            >
              CALLED IT
            </span>
          </div>

          {/* Market title */}
          {marketTitle && (
            <p
              style={{
                fontSize: marketTitle.length > 80 ? "30px" : "36px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.25,
                margin: 0,
                marginBottom: "32px",
                textAlign: "center",
                letterSpacing: "-0.5px",
              }}
            >
              &ldquo;{marketTitle}&rdquo;
            </p>
          )}

          {/* Prediction badge */}
          {prediction && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "14px 36px",
                borderRadius: "16px",
                background: `${predColor}18`,
                border: `2px solid ${predColor}55`,
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                I said
              </span>
              <span
                style={{
                  fontSize: "56px",
                  fontWeight: 900,
                  color: predColor,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                }}
              >
                {prediction}
              </span>
            </div>
          )}

          {/* Identity stats row */}
          {identityParts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "26px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.1,
              }}
            >
              {identityParts.map((part, i) => (
                <span
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  {i > 0 ? (
                    <span style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                  ) : null}
                  <span>{part}</span>
                </span>
              ))}
            </div>
          )}
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
          <span style={{ color: "rgba(148,163,184,0.7)", fontSize: "16px", fontWeight: 600 }}>
            @{username}
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

function buildIdentityParts({
  accuracy,
  streak,
  cat,
}: {
  accuracy: number | null
  streak: number | null
  cat: CategoryMeta | null
}): string[] {
  const parts: string[] = []
  if (typeof accuracy === "number" && accuracy >= 0) {
    parts.push(cat ? `${accuracy}% in ${cat.label} ${cat.emoji}` : `${accuracy}% accurate`)
  } else if (cat) {
    parts.push(`Best at ${cat.label} ${cat.emoji}`)
  }
  if (typeof streak === "number" && streak >= 2) {
    parts.push(`🔥 ${streak}-day streak`)
  }
  return parts
}

import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const username = searchParams.get("username") ?? "Predictor"
  const streak = parseInt(searchParams.get("streak") ?? "0", 10)
  const best = parseInt(searchParams.get("best") ?? "0", 10)
  const total = parseInt(searchParams.get("total") ?? "0", 10)

  const color = "#F59E0B"
  const displayStreak = streak > 0 ? streak : best

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
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: color,
            opacity: 0.07,
            filter: "blur(120px)",
          }}
        />

        {/* PT logo top-left */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "56px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: color,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 900,
              color: "#0A0A0B",
              letterSpacing: "-0.5px",
            }}
          >
            PT
          </div>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", fontWeight: 600 }}>
            Prediction Trade
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
          {/* Emoji */}
          <span style={{ fontSize: "100px", lineHeight: 1, marginBottom: "24px" }}>🔥</span>

          {/* Streak number */}
          <div
            style={{
              fontSize: "120px",
              fontWeight: 900,
              color,
              lineHeight: 1,
              marginBottom: "12px",
              letterSpacing: "-4px",
            }}
          >
            {displayStreak}
          </div>

          {/* Label */}
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "36px",
              fontWeight: 700,
              marginBottom: "32px",
              letterSpacing: "-0.5px",
            }}
          >
            {displayStreak === 1 ? "day streak" : "day streak"}
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "48px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                Best streak
              </span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "24px", fontWeight: 800 }}>
                {best} days
              </span>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                Predictions
              </span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "24px", fontWeight: 800 }}>
                {total} total
              </span>
            </div>
          </div>
        </div>

        {/* Username + footer */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "56px",
            right: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "20px",
          }}
        >
          <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "15px", fontWeight: 600 }}>
            @{username}
          </span>
          <span style={{ color: "rgba(71,85,105,0.7)", fontSize: "14px" }}>
            predictiontrade.online
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

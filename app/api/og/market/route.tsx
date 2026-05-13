import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const title = searchParams.get("title") ?? "Prediction Market"
  const yes = Math.min(100, Math.max(0, parseInt(searchParams.get("yes") ?? "50", 10)))
  const no = 100 - yes
  const category = searchParams.get("category") ?? "General"
  const emoji = searchParams.get("emoji") ?? "🎯"
  const prediction = searchParams.get("prediction") ?? ""
  const color = searchParams.get("color") ?? "#10B981"

  const displayTitle = title.length > 120 ? title.slice(0, 117) + "..." : title
  const titleFontSize = title.length > 80 ? 32 : title.length > 50 ? 38 : 44

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0B",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow background */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: color,
            opacity: 0.08,
            filter: "blur(80px)",
          }}
        />

        {/* Header row: PT logo + category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "44px",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                background: color,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              PT
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              Prediction Trade
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: color + "22",
              border: `1.5px solid ${color}50`,
              borderRadius: "100px",
              padding: "10px 20px",
            }}
          >
            <span style={{ fontSize: "18px" }}>{emoji}</span>
            <span style={{ color: color, fontSize: "15px", fontWeight: 700 }}>
              {category}
            </span>
          </div>
        </div>

        {/* Label */}
        <p
          style={{
            color: "rgba(148,163,184,0.8)",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "16px",
            zIndex: 1,
          }}
        >
          MARKET PREDICTION
        </p>

        {/* Title */}
        <h1
          style={{
            color: "#FFFFFF",
            fontSize: `${titleFontSize}px`,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: "40px",
            zIndex: 1,
            maxWidth: "900px",
          }}
        >
          {displayTitle}
        </h1>

        {/* Probability boxes */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "24px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              flex: 1,
              background: color + "18",
              border: `2px solid ${color}45`,
              borderRadius: "18px",
              padding: "24px 36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{ color: color, fontSize: "60px", fontWeight: 900, lineHeight: 1 }}
            >
              {yes}%
            </span>
            <span
              style={{
                color: "rgba(148,163,184,0.8)",
                fontSize: "15px",
                fontWeight: 700,
                marginTop: "8px",
                letterSpacing: "0.1em",
              }}
            >
              YES
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: "rgba(239,68,68,0.12)",
              border: "2px solid rgba(239,68,68,0.35)",
              borderRadius: "18px",
              padding: "24px 36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#EF4444",
                fontSize: "60px",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {no}%
            </span>
            <span
              style={{
                color: "rgba(148,163,184,0.8)",
                fontSize: "15px",
                fontWeight: 700,
                marginTop: "8px",
                letterSpacing: "0.1em",
              }}
            >
              NO
            </span>
          </div>
        </div>

        {/* Probability bar */}
        <div
          style={{
            height: "8px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "100px",
            overflow: "hidden",
            display: "flex",
            marginBottom: "32px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: `${yes}%`,
              background: color,
              borderRadius: "100px 0 0 100px",
            }}
          />
          <div
            style={{
              flex: 1,
              background: "#EF4444",
              borderRadius: "0 100px 100px 0",
            }}
          />
        </div>

        {/* User prediction badge — overlaid top right if present */}
        {prediction && (
          <div
            style={{
              position: "absolute",
              top: "56px",
              right: "64px",
              background:
                prediction === "YES"
                  ? color + "28"
                  : "rgba(239,68,68,0.2)",
              border: `2px solid ${prediction === "YES" ? color : "#EF4444"}`,
              borderRadius: "12px",
              padding: "10px 22px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: "20px" }}>
              {prediction === "YES" ? "✅" : "❌"}
            </span>
            <span
              style={{
                color: prediction === "YES" ? color : "#EF4444",
                fontSize: "17px",
                fontWeight: 800,
              }}
            >
              I say {prediction}
            </span>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            zIndex: 1,
          }}
        >
          <span style={{ color: "rgba(71,85,105,0.9)", fontSize: "14px" }}>
            predictiontrade.online
          </span>
          <span style={{ color: "rgba(71,85,105,0.9)", fontSize: "14px" }}>
            Virtual · Demo · Educational
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

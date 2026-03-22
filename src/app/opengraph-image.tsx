import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fundslip — Your wallet. Your statement. Verifiable by anyone.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle background gradient — barely visible */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(0,52,153,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(133,248,196,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 40,
            }}
          >
            {/* Simplified logo representation */}
            <div
              style={{
                width: 44,
                height: 52,
                borderRadius: 8,
                backgroundColor: "#003499",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Document lines */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ width: 22, height: 2.5, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 2 }} />
                <div style={{ width: 15, height: 2.5, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 2 }} />
                <div style={{ width: 18, height: 2.5, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 2 }} />
              </div>
            </div>
            <span style={{ fontSize: 36, fontWeight: 700, color: "#1d1d1f", letterSpacing: -1 }}>
              Fundslip
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 56, fontWeight: 600, color: "#1d1d1f", letterSpacing: -2, lineHeight: 1.1 }}>
              Your wallet. Your statement.
            </span>
            <span style={{ fontSize: 56, fontWeight: 600, color: "#86868b", letterSpacing: -2, lineHeight: 1.1 }}>
              Verifiable by anyone.
            </span>
          </div>

          {/* Subtitle */}
          <span
            style={{
              fontSize: 20,
              color: "#86868b",
              marginTop: 28,
              letterSpacing: -0.3,
            }}
          >
            Cryptographically signed Ethereum financial statements
          </span>

          {/* Trust indicators */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 32,
              fontSize: 14,
              color: "#86868b",
            }}
          >
            {["Open Source", "No Backend", "Client-Side Only"].map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#85f8c4" }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
            color: "#86868b",
          }}
        >
          <span>fundslip.xyz</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

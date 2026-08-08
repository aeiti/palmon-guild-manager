import { ImageResponse } from "next/og";

// Open Graph card for VOID link unfurls (Discord, etc.). Colocated with /signin
// — the only ungated route — so crawlers can fetch it. Colors mirror the design
// tokens in globals.css. next/og ships a default sans font; we lean on wide
// letter-spacing to echo the mono wordmark rather than bundling a font file.
export const runtime = "edge";
export const alt = "VOID — Guild Manager (Palmon: Survival, server #111)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b12",
          // Violet glow bleeding up from the lower third.
          backgroundImage:
            "radial-gradient(1000px 520px at 50% 118%, rgba(124,92,252,0.34), rgba(11,11,18,0) 62%)",
          color: "#ecebf5",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 12,
            color: "#86849e",
            textTransform: "uppercase",
          }}
        >
          Server #111
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 210,
            fontWeight: 800,
            letterSpacing: 28,
            lineHeight: 1,
            // Nudge to visually center given the wide right-side tracking.
            paddingLeft: 28,
          }}
        >
          VOID
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 40,
            letterSpacing: 8,
            color: "#a78bfa",
            textTransform: "uppercase",
          }}
        >
          Guild Manager
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 24,
            letterSpacing: 3,
            color: "#b4b2cc",
          }}
        >
          Palmon: Survival
        </div>
      </div>
    ),
    { ...size },
  );
}

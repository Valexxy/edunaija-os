import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "EduNaija OS — Nigeria's Sovereign Educational Platform";
    const subject = searchParams.get("subject") || "JAMB UTME 2025";
    const score = searchParams.get("score") || "Score 300+";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#050508",
            padding: "60px 80px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Brand Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "36px" }}>🇳🇬</span>
            <span style={{ fontSize: "32px", fontWeight: "900", color: "#FFFFFF" }}>
              EduNaija <span style={{ color: "#00E676" }}>OS</span>
            </span>
            <div
              style={{
                marginLeft: "20px",
                padding: "6px 16px",
                borderRadius: "999px",
                backgroundColor: "rgba(0, 230, 118, 0.2)",
                border: "1px solid #00E676",
                color: "#00E676",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {subject}
            </div>
          </div>

          {/* Main Title Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: "56px",
                fontWeight: "900",
                color: "#FFFFFF",
                lineHeight: "1.15",
                maxWidth: "1000px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              Answer on WhatsApp or Web to claim +10 Free Study Hearts 🚀
            </div>
          </div>

          {/* Bottom Badge Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#FFD700", fontSize: "22px", fontWeight: "800" }}>
              ⚡ {score}
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "18px" }}>
              edunaija.com • Built for 2.2M Nigerian Scholars
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OpenGraph image: ${e.message}`, { status: 500 });
  }
}

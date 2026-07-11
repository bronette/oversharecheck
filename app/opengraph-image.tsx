import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "OverShare Check — find SharePoint oversharing before Copilot does";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, opacity: 0.9 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              background: "#2563eb",
              borderRadius: 12,
              fontWeight: 800,
            }}
          >
            OS
          </div>
          OverShare Check
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 800,
            marginTop: 40,
            lineHeight: 1.1,
          }}
        >
          <span>Find SharePoint oversharing</span>
          <span>before Copilot does</span>
        </div>
        <div style={{ fontSize: 30, marginTop: 32, opacity: 0.8 }}>
          Anonymous links · org-wide sharing · external guests — a graded report
          in minutes.
        </div>
      </div>
    ),
    size,
  );
}
